'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Search, User, Trash2, Edit, ClipboardList, X, Check, BookOpen, UserCircle } from 'lucide-react'
import { fetchBaseData, saveStudent, fetchCatalog, saveAssignment, fetchDashboardData, saveSession } from '@/lib/services/sheets'

function getInitials(name: string) {
    if (!name) return '?'
    const parts = name.split(' ').filter(p => p.length > 0)
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0].charAt(0) + (parts[1]?.charAt(0) || '') + (parts[2]?.charAt(0) || ''))
        .toUpperCase()
}

export default function EstudiantesPage() {
    const [estudiantes, setEstudiantes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [newStudent, setNewStudent] = useState({ nombre: '' })
    const [editingStudent, setEditingStudent] = useState<any>(null)
    const [isSaving, setIsSaving] = useState(false)

    // Assignment Logic
    const [managingStudent, setManagingStudent] = useState<any>(null)
    const [activeAssignments, setActiveAssignments] = useState<any[]>([])
    const [availablePrograms, setAvailablePrograms] = useState<any[]>([])
    const [availableOcps, setAvailableOcps] = useState<any[]>([])
    const [selectedProgram, setSelectedProgram] = useState<any>(null)
    const [selectedOcps, setSelectedOcps] = useState<any[]>([])
    const [loadingAssignments, setLoadingAssignments] = useState(false)
    const [selectedOcpsToClose, setSelectedOcpsToClose] = useState<Set<string>>(new Set())

    useEffect(() => {
        fetchEstudiantes()
    }, [])

    async function fetchEstudiantes() {
        setLoading(true)
        try {
            const data = await fetchBaseData()
            // Map array of strings to objects [{id, nombre}]
            const studentList = (data.students || []).map((name: string) => ({ id: name, nombre: name }))
            setEstudiantes(studentList)
        } catch (error) {
            console.error('Error fetching estudiantes:', error)
        } finally {
            setLoading(false)
        }
    }

    async function fetchPrograms() {
        try {
            const data = await fetchCatalog()
            setAvailablePrograms(data || [])
        } catch (error) {
            console.error('Error fetching programs:', error)
        }
    }

    async function fetchOcps(programId: string) {
        // En Sheets, buscamos el programa en la lista disponible
        const prog = availablePrograms.find(p => p.id === programId)
        if (prog && prog.criterios) {
            // Mapeamos los criterios de texto a objetos que el componente espera
            const formattedOcps = prog.criterios.map((c: string, index: number) => ({
                id: `ocp-${index}`,
                numero_ocp: index + 1,
                criterio: c
            }))
            setAvailableOcps(formattedOcps)
        }
    }

    async function fetchAssignments(nombre: string) {
        setLoadingAssignments(true)
        try {
            const data = await fetchDashboardData(nombre)
            const records = data.records || []
            
            // 1. Identificar registros cerrados
            const closedOcps = new Set()
            records.forEach((r: any) => {
                const status = r[4]
                if (status && (status === 'Logrado' || status === 'Finalizado' || status === 'Final')) {
                    const key = `${r[6]}-${r[7]}`
                    closedOcps.add(key)
                }
            })

            // 2. Mapear 'Abiertos' que NO estén en la lista de cerrados
            const mapped = records
                .filter((r: any) => r[4] === 'Abierto' && !closedOcps.has(`${r[6]}-${r[7]}`))
                .map((r: any, i: number) => ({
                    id: `assign-${i}`,
                    estudiante: r[3],
                    programa: r[6],
                    ocp: r[7],
                    criterio: r[7],
                    estado: r[4],
                    fecha_inicio: r[2]
                }))

            // Evitar duplicados si hay varios 'Abierto' para el mismo objetivo
            const uniqueAssignments: any[] = []
            const seenKeys = new Set()
            mapped.forEach((a: any) => {
                const key = `${a.programa}-${a.ocp}`
                if (!seenKeys.has(key)) {
                    seenKeys.add(key)
                    uniqueAssignments.push(a)
                }
            })
            
            setActiveAssignments(uniqueAssignments)
        } catch (error) {
            console.error('Error fetching assignments:', error)
        } finally {
            setLoadingAssignments(false)
        }
    }

    async function openManagePlan(estudiante: any) {
        setManagingStudent(estudiante)
        setSelectedOcpsToClose(new Set())
        fetchPrograms()
        fetchAssignments(estudiante.nombre)
    }

    function toggleOcpSelection(ocpId: string) {
        setSelectedOcpsToClose(prev => {
            const newSet = new Set(prev)
            if (newSet.has(ocpId)) {
                newSet.delete(ocpId)
            } else {
                newSet.add(ocpId)
            }
            return newSet
        })
    }

    async function handleCloseSelectedOcps() {
        if (selectedOcpsToClose.size === 0) {
            alert('Por favor selecciona al menos un objetivo para cerrar.')
            return
        }

        if (!confirm(`¿Estás segura de marcar ${selectedOcpsToClose.size} objetivo(s) como LOGRADO(S)?`)) return

        setIsSaving(true)
        try {
            const guatemalaDate = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Guatemala' })
            
            // En el sistema de Sheets, 'cerrar' significa enviar un registro con tipo 'Final' o actualizar el estado
            // Para simplificar y mantener compatibilidad, enviamos una sesión con tipo 'Final'
            const recordsToClose = Array.from(selectedOcpsToClose).map(id => {
                const assign = activeAssignments.find(a => a.id === id)
                return {
                    idSesion: `CLOSE-${Date.now()}-${id}`,
                    fechaSesion: guatemalaDate,
                    estudiante: managingStudent.nombre,
                    tipoRegistro: 'Final',
                    materia: assign.programa,
                    ocp: assign.ocp,
                    uac: 100, // Marcamos como logrado (100%)
                    uai: 0,
                    nivelAyuda: 'N/A',
                    reforzador: 'N/A',
                    programaReforzamiento: 'N/A'
                }
            })

            await saveSession(recordsToClose)

            // Refresh local state
            fetchAssignments(managingStudent.nombre)
            setSelectedOcpsToClose(new Set()) // Reset selection
            alert('¡Objetivos cerrados exitosamente!')
        } catch (err: any) {
            alert('Error al cerrar objetivos: ' + err.message)
        } finally {
            setIsSaving(false)
        }
    }

    function toggleOcpForAssignment(ocp: any) {
        setSelectedOcps(prev => {
            const exists = prev.find(o => o.id === ocp.id)
            if (exists) {
                return prev.filter(o => o.id !== ocp.id)
            } else {
                return [...prev, ocp]
            }
        })
    }

    async function handleAddAssignment() {
        if (!selectedProgram || selectedOcps.length === 0) return
        setIsSaving(true)
        try {
            // Guardar cada uno
            for (const ocp of selectedOcps) {
                await saveAssignment({
                    estudiante: managingStudent.nombre,
                    programa: selectedProgram.nombre,
                    ocp: ocp.numero_ocp,
                    criterio: ocp.criterio,
                    estado: 'Abierto',
                    fecha_inicio: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Guatemala' })
                })
                
                // Añadir a la vista (optimista)
                const newAssign = {
                    id: Math.random().toString(),
                    estudiante: managingStudent.nombre,
                    programa: selectedProgram.nombre,
                    ocp: ocp.numero_ocp,
                    criterio: ocp.criterio,
                    estado: 'Abierto',
                    fecha_inicio: new Date().toISOString()
                }
                setActiveAssignments(prev => [newAssign, ...prev])
            }

            // Reset selection
            setSelectedProgram(null)
            setSelectedOcps([])
            setAvailableOcps([])

            alert(`¡${selectedOcps.length} asignación(es) guardada(s) exitosamente!`)

        } catch (err: any) {
            alert('Error al asignar: ' + err.message)
        } finally {
            setIsSaving(false)
        }
    }

    async function handleAddStudent(e: React.FormEvent) {
        e.preventDefault()
        setIsSaving(true)
        try {
            await saveStudent(newStudent.nombre)
            setNewStudent({ nombre: '' })
            setShowAddModal(false)
            fetchEstudiantes()
        } catch (error: any) {
            alert(`Error al guardar: ${error.message}`)
        } finally {
            setIsSaving(false)
        }
    }

    async function handleEditStudent(e: React.FormEvent) {
        e.preventDefault()
        if (!editingStudent) return
        setIsSaving(true)
        try {
            // Nota: En Sheets (Code.gs) necesitaremos lógica de actualización por nombre antiguo o ID
            // Por ahora usamos saveStudent que añade/actualiza
            await saveStudent(editingStudent.nombre)
            setEditingStudent(null)
            fetchEstudiantes()
        } catch (error: any) {
            alert(`Error al actualizar: ${error.message}`)
        } finally {
            setIsSaving(false)
        }
    }

    async function handleDeleteStudent(id: string) {
        if (!confirm('¿Estás seguro de que deseas eliminar este estudiante?')) return
        alert('La eliminación de estudiantes está restringida para preservar el historial de registros.')
    }

    const filteredEstudiantes = estudiantes.filter(est =>
        (est.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="container-mobile py-8 pt-8 lg:pt-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-widest mb-2">
                        <span className="w-8 h-px bg-purple-600"></span>
                        Gestión de Alumnos
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Estudiantes</h1>
                    <p className="text-slate-500 mt-2 font-medium">Gestiona expedientes y planes de trabajo personalizados.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary h-14 px-8 rounded-2xl shadow-lg shadow-purple-200 flex items-center gap-2"
                >
                    <Plus size={24} />
                    <span>Nuevo Estudiante</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-10">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                <input
                    type="text"
                    placeholder="Buscar estudiante..."
                    className="input pl-14 h-16 rounded-[20px] text-lg border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-50 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="spinner border-purple-600 border-r-transparent" />
                    <p className="text-slate-400 font-medium animate-pulse">Cargando estudiantes...</p>
                </div>
            ) : filteredEstudiantes.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredEstudiantes.map((est) => (
                        <div key={est.id} className="group bg-white rounded-[32px] p-6 border-2 border-slate-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-slate-50 text-slate-600 group-hover:bg-purple-600 group-hover:text-white rounded-[20px] flex items-center justify-center transition-all duration-500 shadow-sm font-black text-xl">
                                        {getInitials(est.nombre)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-1">{est.nombre}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Activo</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openManagePlan(est)}
                                        className="w-10 h-10 flex items-center justify-center bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-600 hover:text-white transition-all"
                                        title="Gestionar Plan de Trabajo"
                                    >
                                        <ClipboardList size={18} />
                                    </button>
                                    <button
                                        onClick={() => setEditingStudent(est)}
                                        className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                                        title="Editar"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteStudent(est.id)}
                                        className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-[40px] text-center py-24 border-4 border-dashed border-slate-100 animate-fade-in">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <User size={48} className="text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-bold text-xl mb-8">No se encontraron estudiantes.</p>
                </div>
            )}

            {/* Manage Plan Modal */}
            {managingStudent && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-scale-in">
                        {/* Header */}
                        <div className="p-8 pb-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
                                    <ClipboardList size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Plan de Trabajo</h2>
                                    <p className="text-slate-500 font-medium">Asignaciones para <span className="text-purple-600 font-bold">{managingStudent.nombre}</span></p>
                                </div>
                            </div>
                            <button onClick={() => setManagingStudent(null)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="flex flex-col lg:flex-row gap-10">
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            Programas Activos ({activeAssignments.length})
                                        </h3>
                                        {selectedOcpsToClose.size > 0 && (
                                            <button
                                                onClick={handleCloseSelectedOcps}
                                                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-200"
                                            >
                                                <Check size={16} />
                                                Cerrar {selectedOcpsToClose.size} Seleccionado{selectedOcpsToClose.size > 1 ? 's' : ''}
                                            </button>
                                        )}
                                    </div>

                                    {loadingAssignments ? (
                                        <div className="space-y-4">
                                            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-50 rounded-2xl animate-pulse" />)}
                                        </div>
                                    ) : activeAssignments.length > 0 ? (
                                        <div className="space-y-6">
                                            {Array.from(new Set(activeAssignments.map(a => a.programa))).map((progName) => {
                                                const progAssignments = activeAssignments.filter(a => a.programa === progName)

                                                return (
                                                    <div key={progName} className="bg-slate-50/50 rounded-3xl p-5 border border-slate-100">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-purple-600 shadow-sm border border-slate-100">
                                                                    <BookOpen size={20} />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-slate-900 text-lg">{progName}</h4>
                                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{progAssignments.length} Criterios Activos</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3 pl-4 border-l-2 border-slate-200 ml-4">
                                                            {progAssignments.map((assign) => (
                                                                <div key={assign.id} className="p-4 bg-white rounded-2xl border border-slate-100 flex items-start gap-3 shadow-sm">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedOcpsToClose.has(assign.id)}
                                                                        onChange={() => toggleOcpSelection(assign.id)}
                                                                        className="mt-1 w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
                                                                    />
                                                                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                                                        {assign.ocp}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-slate-600 text-sm font-medium leading-snug">{assign.criterio}</p>
                                                                        <div className="mt-2 flex items-center gap-2">
                                                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                                                                                Inicio: {new Date(assign.fecha_inicio).toLocaleDateString()}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                            <p className="text-slate-400 font-medium">No hay programas asignados actualmente.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Right: Assign New */}
                                <div className="w-full lg:w-[380px] bg-slate-50 p-6 rounded-[32px] h-fit sticky top-0">
                                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                                        <Plus size={16} className="text-blue-600" />
                                        Asignar Nuevo
                                    </h3>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Seleccionar Programa</label>
                                            <select
                                                className="input w-full h-12 text-sm font-bold bg-white border-transparent focus:border-blue-500 rounded-xl"
                                                onChange={(e) => {
                                                    const prog = availablePrograms.find(p => p.id === e.target.value)
                                                    setSelectedProgram(prog)
                                                    setSelectedOcps([])
                                                    if (prog) fetchOcps(prog.id)
                                                }}
                                                value={selectedProgram?.id || ''}
                                            >
                                                <option value="">-- Elige un programa --</option>
                                                {availablePrograms.map(p => (
                                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3 ml-1">Seleccionar Criterios ({selectedOcps.length})</label>
                                            {selectedProgram ? (
                                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {availableOcps.map(o => (
                                                        <label 
                                                            key={o.id} 
                                                            className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${selectedOcps.find(so => so.id === o.id) ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                                checked={!!selectedOcps.find(so => so.id === o.id)}
                                                                onChange={() => toggleOcpForAssignment(o)}
                                                            />
                                                            <div className="flex-1">
                                                                <span className="block text-[10px] font-black text-blue-600 mb-0.5 uppercase">Criterio {o.numero_ocp}</span>
                                                                <p className="text-xs font-medium text-slate-700 leading-snug">{o.criterio}</p>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-white">
                                                    <p className="text-xs text-slate-400 font-medium">Elige un programa primero</p>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleAddAssignment}
                                            disabled={!selectedProgram || selectedOcps.length === 0 || isSaving}
                                            className="w-full btn btn-primary h-14 rounded-2xl shadow-lg shadow-blue-200 mt-4 font-bold flex items-center justify-center gap-2"
                                        >
                                            {isSaving ? 'Asignando...' : (
                                                <>
                                                    <Check size={20} />
                                                    Asignar {selectedOcps.length} Criterio{selectedOcps.length !== 1 ? 's' : ''}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="card w-full max-w-md animate-fade-in shadow-2xl rounded-[40px] p-8">
                        <h2 className="text-xl font-bold mb-6 text-slate-900">Nuevo Estudiante</h2>
                        <form onSubmit={handleAddStudent} className="space-y-6">
                            <div>
                                <label className="label">Nombre del Estudiante</label>
                                <input
                                    type="text"
                                    required
                                    className="input bg-slate-50 border-transparent focus:bg-white"
                                    value={newStudent.nombre}
                                    onChange={(e) => setNewStudent({ ...newStudent, nombre: e.target.value })}
                                    placeholder="Ej. Juan Pérez"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="btn btn-outline flex-1 h-12 rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="btn btn-primary flex-1 h-12 rounded-xl"
                                >
                                    {isSaving ? 'Guardando...' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingStudent && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="card w-full max-w-md animate-fade-in shadow-2xl rounded-[40px] p-8">
                        <h2 className="text-xl font-bold mb-6 text-slate-900">Editar Estudiante</h2>
                        <form onSubmit={handleEditStudent} className="space-y-6">
                            <div>
                                <label className="label">Nombre del Estudiante</label>
                                <input
                                    type="text"
                                    required
                                    className="input bg-slate-50 border-transparent focus:bg-white"
                                    value={editingStudent.nombre}
                                    onChange={(e) => setEditingStudent({ ...editingStudent, nombre: e.target.value })}
                                    placeholder="Ej. Juan Pérez"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingStudent(null)}
                                    className="btn btn-outline flex-1 h-12 rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="btn btn-primary flex-1 h-12 rounded-xl"
                                >
                                    {isSaving ? 'Guardando...' : 'Actualizar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    )
}
