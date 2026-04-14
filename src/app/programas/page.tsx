'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Search, BookOpen, Edit, Trash2, ChevronDown, ChevronUp, Target, Save, X, AlertCircle } from 'lucide-react'
import { fetchCatalog, saveCatalogProgram } from '@/lib/services/sheets'
import { useRole } from '@/lib/contexts/RoleContext'
import { ProgramaOCP } from '@/types'

export default function ProgramasCatalogPage() {
    const { role } = useRole()
    const [programas, setProgramas] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [newProgram, setNewProgram] = useState({ nombre: '', descripcion: '', tipo: 'Terapéutico', criterios: [''] })
    const [editingProgram, setEditingProgram] = useState<any>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [expandedProgram, setExpandedProgram] = useState<string | null>(null)
    const [editingOcp, setEditingOcp] = useState<{ id?: string, programa_id: string, numero_ocp: number, criterio: string } | null>(null)

    useEffect(() => {
        fetchProgramas()
    }, [])

    async function fetchProgramas() {
        setLoading(true)
        try {
            const data = await fetchCatalog()
            setProgramas(data || [])
        } catch (error) {
            console.error('Error fetching programas:', error)
        } finally {
            setLoading(false)
        }
    }


    const toggleExpand = (programaNombre: string) => {
        if (expandedProgram === programaNombre) {
            setExpandedProgram(null)
        } else {
            setExpandedProgram(programaNombre)
        }
    }

    async function handleAddProgram(e: React.FormEvent) {
        e.preventDefault()
        if (!newProgram.nombre) return
        
        setIsSaving(true)
        try {
            await saveCatalogProgram(newProgram.nombre, newProgram.criterios)
            setNewProgram({ nombre: '', descripcion: '', tipo: 'Terapéutico', criterios: [''] })
            setShowAddModal(false)
            fetchProgramas()
        } catch (error: any) {
            alert(`Error al guardar: ${error.message}`)
        } finally {
            setIsSaving(false)
        }
    }

    function addCriterioInput() {
        setNewProgram(prev => ({
            ...prev,
            criterios: [...prev.criterios, '']
        }))
    }

    function removeCriterioInput(index: number) {
        setNewProgram(prev => ({
            ...prev,
            criterios: prev.criterios.filter((_, i) => i !== index)
        }))
    }

    function updateCriterioValue(index: number, value: string) {
        setNewProgram(prev => {
            const newCriterios = [...prev.criterios]
            newCriterios[index] = value
            return { ...prev, criterios: newCriterios }
        })
    }

    async function handleDeleteOcp(index: number, prog: any) {
        if (!confirm('¿Eliminar este criterio técnico?')) return
        setIsSaving(true)
        try {
            const nuevosCriterios = prog.criterios.filter((_: any, i: number) => i !== index)
            await saveCatalogProgram(prog.nombre, nuevosCriterios)
            fetchProgramas()
        } catch (error: any) {
            alert(`Error: ${error.message}`)
        } finally {
            setIsSaving(false)
        }
    }

    async function handleSaveOcp() {
        if (!editingOcp || !expandedProgram) return
        setIsSaving(true)
        try {
            const prog = programas.find(p => p.nombre === expandedProgram)
            if (!prog) return

            let nuevosCriterios = [...(prog.criterios || [])]
            if (editingOcp.id !== undefined) {
                // Editando existente (usamos el numero_ocp como indice - 1)
                nuevosCriterios[editingOcp.numero_ocp - 1] = editingOcp.criterio
            } else {
                // Nuevo
                nuevosCriterios.push(editingOcp.criterio)
            }

            await saveCatalogProgram(prog.nombre, nuevosCriterios)
            setEditingOcp(null)
            fetchProgramas()
        } catch (error: any) {
            alert(`Error al guardar: ${error.message}`)
        } finally {
            setIsSaving(false)
        }
    }

    async function handleEditProgram(e: React.FormEvent) {
        e.preventDefault()
        if (!editingProgram) return
        setIsSaving(true)
        try {
            await saveCatalogProgram(editingProgram.nombre, editingProgram.criterios)
            setEditingProgram(null)
            fetchProgramas()
        } catch (error: any) {
            alert(`Error: ${error.message}`)
        } finally {
            setIsSaving(false)
        }
    }

    async function handleDeleteProgram(nombre: string) {
        if (!confirm('¿Estás seguro de que deseas eliminar este programa?')) return
        // Nota: Para eliminarlos de Sheets, podrías implementar una acción 'deleteCatalog'
        alert('La eliminación de programas está restringida en Sheets para evitar pérdida accidental de datos históricos.')
    }

    const filteredProgramas = programas.filter(prog =>
        prog.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (role === 'terapeuta') {
        return (
            <div className="container-mobile py-8 pt-24 text-center">
                <div className="bg-white p-12 rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-100 max-w-lg mx-auto animate-scale-in">
                    <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <AlertCircle size={48} className="text-amber-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Acceso Limitado</h2>
                    <p className="text-slate-500 text-lg leading-relaxed">
                        La gestión del catálogo de programas y criterios técnicos es una función exclusiva para **Supervisoras**.
                    </p>
                    <div className="mt-8 p-4 bg-slate-50 rounded-2xl text-sm text-slate-400 font-medium">
                        Cambia tu rol en el menú lateral para acceder.
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container-mobile py-8 lg:py-12 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-2">
                        <span className="w-8 h-px bg-blue-600"></span>
                        Gestión Técnica
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Catálogo de Programas</h1>
                    <p className="text-slate-500 mt-2 font-medium">Define la estructura y criterios técnicos para cada programa.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary h-14 px-8 rounded-2xl shadow-lg shadow-blue-200 flex items-center gap-2"
                >
                    <Plus size={24} />
                    <span>Nuevo Programa</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-10">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                <input
                    type="text"
                    placeholder="Buscar programa por nombre..."
                    className="input pl-14 h-16 rounded-[20px] text-lg border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="spinner" />
                    <p className="text-slate-400 font-medium animate-pulse">Cargando catálogo...</p>
                </div>
            ) : filteredProgramas.length > 0 ? (
                <div className="space-y-6">
                    {filteredProgramas.map((prog) => {
                        const isExpanded = expandedProgram === prog.nombre

                        return (
                            <div key={prog.id} className={`group bg-white rounded-[32px] border-2 transition-all duration-500 overflow-hidden ${isExpanded ? 'border-blue-500 shadow-2xl shadow-blue-100 ring-8 ring-blue-50/50' : 'border-slate-100 hover:border-slate-200 shadow-sm'}`}>
                                <div className="p-6 md:p-8 flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-6 flex-1 cursor-pointer" onClick={() => toggleExpand(prog.id)}>
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${isExpanded ? 'bg-blue-600 text-white rotate-12 scale-110 shadow-lg shadow-blue-200' : 'bg-blue-50 text-blue-600 group-hover:scale-105'}`}>
                                            <BookOpen size={32} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight break-words">
                                                    {prog.nombre}
                                                </h3>
                                                <span className={`inline-flex w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${prog.tipo === 'Educativo' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {prog.tipo || 'Terapéutico'}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 font-medium line-clamp-1">{prog.descripcion || 'Sin descripción técnica'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="hidden md:flex items-center gap-2 mr-4">
                                            <button
                                                onClick={() => setEditingProgram(prog)}
                                                className="w-11 h-11 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                                                title="Editar Información"
                                            >
                                                <Edit size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProgram(prog.id)}
                                                className="w-11 h-11 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                                                title="Eliminar Programa"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => toggleExpand(prog.nombre)}
                                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isExpanded ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                        >
                                            {isExpanded ? <ChevronUp size={28} /> : <ChevronDown size={28} />}
                                        </button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="bg-slate-50/80 border-t border-slate-100 p-8 md:p-10 animate-slide-up">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600">
                                                    <Target size={24} />
                                                </div>
                                                <h4 className="text-xl font-bold text-slate-800">Criterios Técnicos</h4>
                                            </div>
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-4 py-2 rounded-full border border-slate-200/50">
                                                Progreso: {(prog.criterios || []).length} Criterios definidos
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {(prog.criterios || []).map((criterio: string, index: number) => {
                                                const numero_ocp = index + 1
                                                const isEditing = editingOcp?.numero_ocp === numero_ocp && editingOcp.id === 'temp'

                                                return (
                                                    <div key={index} className={`relative group/item bg-white p-6 rounded-[28px] border-2 transition-all duration-300 ${isEditing ? 'border-blue-500 shadow-2xl scale-105 z-10' : 'border-transparent hover:border-blue-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5'}`}>
                                                        <div className="flex items-center justify-between mb-4">
                                                            <span className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black bg-slate-900 text-white">
                                                                {numero_ocp}
                                                            </span>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => setEditingOcp({
                                                                        id: 'temp',
                                                                        programa_id: prog.nombre,
                                                                        numero_ocp: numero_ocp,
                                                                        criterio: criterio
                                                                    })}
                                                                    className="p-2 rounded-full text-blue-600 bg-blue-50 opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-blue-100"
                                                                >
                                                                    <Edit size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteOcp(index, prog)}
                                                                    className="p-2 rounded-full text-red-600 bg-red-50 opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-red-100"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {isEditing ? (
                                                            <div className="space-y-4">
                                                                <textarea
                                                                    autoFocus
                                                                    className="input text-xs font-bold min-h-[100px] border-slate-100 focus:border-blue-500 bg-slate-50/50"
                                                                    value={editingOcp?.criterio || ''}
                                                                    onChange={e => setEditingOcp(prev => prev ? { ...prev, criterio: e.target.value } : null)}
                                                                />
                                                                <div className="flex gap-2">
                                                                    <button onClick={handleSaveOcp} className="btn btn-primary h-8 px-4 text-xs flex-1 rounded-lg">Guardar</button>
                                                                    <button onClick={() => setEditingOcp(null)} className="btn-outline h-8 px-2 rounded-lg"><X size={14} /></button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm leading-relaxed text-slate-700 font-semibold">{criterio}</p>
                                                        )}
                                                    </div>
                                                )
                                            })}

                                            {/* Add New OCP Card */}
                                            {/* Add New OCP Card */}
                                            {editingOcp && editingOcp.programa_id === prog.nombre && !editingOcp.id ? (
                                                <div className="bg-white rounded-[28px] p-6 shadow-xl border-2 border-blue-500 flex flex-col min-h-[200px] animate-scale-in">
                                                    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black bg-blue-600 text-white mb-3">
                                                        {editingOcp?.numero_ocp}
                                                    </span>
                                                    <textarea
                                                        autoFocus
                                                        className="flex-1 input text-xs font-bold border-slate-100 focus:border-blue-500 bg-slate-50/50 mb-3 resize-none"
                                                        placeholder="Define el criterio (puedes usar varias líneas)..."
                                                        value={editingOcp?.criterio}
                                                        onChange={e => setEditingOcp(prev => prev ? { ...prev, criterio: e.target.value } : null)}
                                                    />
                                                    <div className="flex gap-2">
                                                        <button onClick={handleSaveOcp} className="btn btn-primary h-9 px-4 text-xs flex-1 rounded-xl">Guardar Criterio {editingOcp?.numero_ocp}</button>
                                                        <button onClick={() => setEditingOcp(null)} className="btn-outline h-9 px-3 rounded-xl"><X size={16} /></button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setEditingOcp({
                                                        programa_id: prog.nombre,
                                                        numero_ocp: ((prog.criterios || []).length) + 1,
                                                        criterio: ''
                                                    })}
                                                    className="group relative bg-slate-50 border-2 border-dashed border-slate-200 rounded-[28px] p-6 flex flex-col items-center justify-center gap-4 hover:border-blue-400 hover:bg-blue-50/30 transition-all min-h-[200px]"
                                                >
                                                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-blue-500 group-hover:scale-110 transition-all">
                                                        <Plus size={24} />
                                                    </div>
                                                    <span className="font-bold text-slate-400 group-hover:text-blue-600">Añadir Criterio {(prog.criterios || []).length + 1}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-[40px] text-center py-24 border-4 border-dashed border-slate-100 animate-fade-in shadow-inner">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <BookOpen size={48} className="text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-bold text-xl mb-8">No hay programas técnicos en el catálogo.</p>
                    <button onClick={() => setShowAddModal(true)} className="btn btn-primary h-16 px-10 rounded-2xl shadow-xl shadow-blue-200 active:scale-95 transition-transform text-lg">
                        Crea tu primer programa
                    </button>
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-[32px] md:rounded-[48px] p-6 md:p-12 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] animate-scale-in border border-white/50 overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center gap-4 mb-8 md:mb-10">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 text-white rounded-[18px] md:rounded-[24px] flex items-center justify-center shadow-xl shadow-blue-200">
                                <Plus size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Nuevo Programa</h2>
                                <p className="text-slate-400 font-bold text-[10px] md:text-sm uppercase tracking-widest mt-1">Definición técnica</p>
                            </div>
                        </div>
                        <form onSubmit={handleAddProgram} className="space-y-8">
                            <div>
                                <label className="text-sm font-black text-slate-900 uppercase tracking-widest block mb-3 ml-1">Nombre Técnico *</label>
                                <input
                                    type="text"
                                    required
                                    className="input h-16 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-50 transition-all text-lg font-bold"
                                    value={newProgram.nombre}
                                    onChange={e => setNewProgram({ ...newProgram, nombre: e.target.value })}
                                    placeholder="Ej. Tacto de Emociones"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-black text-slate-900 uppercase tracking-widest block mb-3 ml-1">Descripción / Notas</label>
                                <textarea
                                    className="input min-h-[140px] rounded-3xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-50 transition-all font-medium text-slate-600 py-5"
                                    value={newProgram.descripcion}
                                    onChange={e => setNewProgram({ ...newProgram, descripcion: e.target.value })}
                                    placeholder="Detalla en qué consiste el programa técnica y procedimentalmente..."
                                />
                            </div>
                            <div>
                                <label className="text-sm font-black text-slate-900 uppercase tracking-widest block mb-3 ml-1">Tipo de Programa</label>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setNewProgram({ ...newProgram, tipo: 'Terapéutico' })}
                                        className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all ${newProgram.tipo === 'Terapéutico' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                    >
                                        Terapéutico
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewProgram({ ...newProgram, tipo: 'Educativo' })}
                                        className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all ${newProgram.tipo === 'Educativo' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                    >
                                        Educativo
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-black text-slate-900 uppercase tracking-widest block mb-3 ml-1">Criterios Técnicos *</label>
                                <div className="space-y-3">
                                    {newProgram.criterios.map((criterio, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                required
                                                className="input h-10 md:h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 transition-all text-xs md:text-sm font-semibold flex-1"
                                                value={criterio}
                                                onChange={e => updateCriterioValue(index, e.target.value)}
                                                placeholder={`Criterio ${index + 1}`}
                                            />
                                            {newProgram.criterios.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeCriterioInput(index)}
                                                    className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <X size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))}

                                    ))}
                                    <button
                                        type="button"
                                        onClick={addCriterioInput}
                                        className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 font-bold text-sm flex items-center justify-center gap-2 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all mt-2"
                                    >
                                        <Plus size={18} />
                                        <span>Añadir otro criterio</span>
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="btn-outline flex-1 h-16 rounded-2xl text-lg font-bold border-slate-200 hover:bg-slate-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving || !newProgram.nombre}
                                    className="btn btn-primary flex-1 h-16 rounded-2xl text-lg font-bold shadow-2xl shadow-blue-200 active:scale-95 transition-all"
                                >
                                    {isSaving ? 'Guardando...' : 'Crear Programa'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingProgram && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-[48px] p-10 shadow-2xl animate-scale-in">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                                <Edit size={24} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900">Editar Programa</h2>
                        </div>
                        <form onSubmit={handleEditProgram} className="space-y-6">
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase mb-2 block">Nombre del Programa</label>
                                <input
                                    type="text"
                                    required
                                    className="input bg-slate-50 border-transparent focus:bg-white font-bold"
                                    value={editingProgram.nombre}
                                    onChange={e => setEditingProgram({ ...editingProgram, nombre: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase mb-2 block">Descripción</label>
                                <textarea
                                    className="input min-h-[120px] bg-slate-50 border-transparent focus:bg-white"
                                    value={editingProgram.descripcion || ''}
                                    onChange={e => setEditingProgram({ ...editingProgram, descripcion: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingProgram(null)}
                                    className="btn-outline flex-1 h-14 rounded-xl"
                                >
                                    Cerrar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="btn btn-primary flex-1 h-14 rounded-xl shadow-lg shadow-blue-200"
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
