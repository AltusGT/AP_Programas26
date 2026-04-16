'use client'

import React, { useState, useEffect } from 'react'
import { fetchBaseData, fetchDashboardData, saveSession } from '@/lib/services/sheets'
import { Estudiante, ProgramaActivo, ProgramaOCP, RegistroFormData, Database } from '@/types'
import { ChevronRight, ChevronLeft, User, BookOpen, Target, Calendar, CheckCircle2, TrendingUp, Info, Search, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TerapeutaFlow({ onAssignNew }: { onAssignNew?: () => void }) {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    // Data lists
    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
    const [programasActivos, setProgramasActivos] = useState<any[]>([])

    // Selection state
    const [selectedEstudiante, setSelectedEstudiante] = useState<string | null>(null)
    const [selectedProgramName, setSelectedProgramName] = useState<string | null>(null)
    const [selectedPrograma, setSelectedPrograma] = useState<any | null>(null)
    const [registroTipo, setRegistroTipo] = useState<'Inicial' | 'Final' | 'Generalización' | null>(null)

    // Data entry state
    const [resultado, setResultado] = useState<string>('')

    // Guatemala Timezone Helper (YYYY-MM-DD)
    const getGuatemalaDate = () => {
        return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Guatemala' })
    }
    const [fecha, setFecha] = useState<string>(getGuatemalaDate())

    useEffect(() => {
        fetchInitialData()
    }, [])

    async function fetchInitialData() {
        try {
            setLoading(true)
            const data = await fetchBaseData()
            const ests = (data.students || []).map((name: string) => ({ id: name, nombre: name }))
            setEstudiantes(ests || [])
        } catch (error) {
            console.error('Error fetching initial data:', error)
        } finally {
            setLoading(false)
        }
    }

    async function fetchProgramasForEstudiante(nombre: string) {
        try {
            setLoading(true)
            // Usamos fetchDashboardData para obtener registros abiertos del alumno
            const data = await fetchDashboardData(nombre)
            const records = data.records || []
            
            // Map to the expected structure in Step 3
            const mapped = records
                .filter((r: any) => Array.isArray(r) && r.length >= 7)
                .map((r: any, i: number) => ({
                    id: i.toString(),
                    id_sesion: r[1],
                    fecha_inicio: r[2],
                    estudiante: r[3],
                    tipo: r[5],
                    programa: r[6],
                    ocp: r[7],      // Número correlativo (Index 7)
                    criterio: r[8], // Texto descriptivo (Index 8)
                    estado: r[4],
                    pre_test: r[9],
                    post_test: r[9],
                    valor: r[9]
                })).filter((r: any) => r.estado === 'Abierto')

            setProgramasActivos(mapped)
        } catch (error) {
            console.error('Error fetching programs:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSelectEstudiante = async (nombre: string) => {
        setSelectedEstudiante(nombre)
        setStep(2)
        await fetchProgramasForEstudiante(nombre)
    }

    const handleSelectProgramName = (nombre: string) => {
        setSelectedProgramName(nombre)
        setStep(3)
    }

    const handleSelectAssignment = (assignment: any) => {
        setSelectedPrograma(assignment)
        setStep(4)
    }

    const handleSelectTipo = (tipo: 'Inicial' | 'Final' | 'Generalización') => {
        setRegistroTipo(tipo)
        // Reset result when changing type
        if (tipo === 'Inicial') setResultado(selectedPrograma?.pre_test?.toString() || '')
        else if (tipo === 'Final') setResultado(selectedPrograma?.post_test?.toString() || '')
        else setResultado('')
        setStep(5)
    }

    const handleSave = async () => {
        if (!selectedPrograma || !resultado) return

        try {
            setSaving(true)
            const valor = parseFloat(resultado)
            
            // En el sistema de Sheets (Code.gs), 'saveSession' espera un array de registros
            const sessionRecord = {
                idSesion: selectedPrograma.id_sesion || `UPDATE-${Date.now()}`,
                fechaSesion: fecha,
                estudiante: selectedEstudiante,
                tipoRegistro: registroTipo,
                materia: selectedPrograma.programa,
                ocp_num: selectedPrograma.ocp,      // Enviamos el número correlativo
                ocp: selectedPrograma.criterio,     // Enviamos el texto descriptivo
                uac: valor,                         // El valor del porcentaje
                uai: 0,
                nivelAyuda: 'N/A',
                reforzador: 'N/A',
                programaReforzamiento: 'N/A'
            }

            await saveSession([sessionRecord])

            alert('¡Registro guardado exitosamente en Sheets!')
            window.location.reload()

        } catch (error: any) {
            console.error('Error saving:', error)
            alert(`Error al guardar en Sheets: ${error.message}`)
        } finally {
            setSaving(false)
        }
    }

    const getNextGeneralizationLabel = () => {
        if (!selectedPrograma) return 'G1'
        if (selectedPrograma.resultado_g1 === null || selectedPrograma.resultado_g1 === undefined) return 'G1'
        if (selectedPrograma.resultado_g2 === null || selectedPrograma.resultado_g2 === undefined) return 'G2'
        if (selectedPrograma.resultado_g3 === null || selectedPrograma.resultado_g3 === undefined) return 'G3'
        return 'Completo'
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 pb-20">
            {/* Progress Header */}
            <div className="flex items-center justify-between mb-12 overflow-x-auto pb-4 no-scrollbar">
                {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="flex items-center shrink-0">
                        <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center font-black transition-all shadow-lg ${step === s ? 'bg-blue-600 text-white scale-110 ring-4 ring-blue-100 shadow-blue-200' :
                            step > s ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                            }`}>
                            {s}
                        </div>
                        {s < 5 && <div className={`w-6 md:w-12 h-1.5 mx-2 rounded-full ${step > s ? 'bg-emerald-500' : 'bg-slate-100'}`} />}
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[40px] p-6 md:p-12 shadow-2xl shadow-slate-200/60 border border-white relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-[100px] -z-10" />

                {/* Step 1: Seleccionar Niño */}
                {step === 1 && (
                    <div className="animate-fade-in">
                        <div className="flex items-center gap-5 mb-10">
                            <div className="w-16 h-16 bg-blue-600 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-blue-100">
                                <User size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Seleccionar Niño</h1>
                                <p className="text-slate-500 font-medium">¿Para quién es el registro hoy?</p>
                            </div>
                        </div>

                        {loading && <div className="flex justify-center py-20"><div className="spinner" /></div>}

                        <div className="mb-8 sticky top-0 bg-white/80 backdrop-blur-md z-10 py-2">
                            <div className="relative">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                                <input
                                    type="text"
                                    placeholder=""
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="input pl-14 h-16 rounded-2xl text-lg font-bold"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
                            {estudiantes
                                .filter(est => est.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((est) => (
                                    <button
                                        key={est.id}
                                        onClick={() => handleSelectEstudiante(est.nombre)}
                                        className="group p-5 text-left bg-slate-50 rounded-3xl hover:bg-blue-600 transition-all flex flex-col items-center justify-center gap-4 border-2 border-transparent hover:border-blue-100 hover:shadow-xl hover:shadow-blue-200/50"
                                    >
                                        <div className="w-16 h-16 bg-white text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm group-hover:scale-110 transition-transform">
                                            {est.nombre.substring(0, 1)}
                                        </div>
                                        <span className="font-bold text-slate-700 text-sm group-hover:text-white text-center leading-tight">
                                            {est.nombre}
                                        </span>
                                    </button>
                                ))}
                            {estudiantes.length === 0 && !loading && (
                                <div className="col-span-full py-20 text-center">
                                    <p className="text-slate-400 font-bold text-lg italic">No se encontraron estudiantes activos.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Seleccionar Programa */}
                {step === 2 && (
                    <div className="animate-fade-in">
                        <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 mb-8 font-black text-sm uppercase tracking-widest transition-colors">
                            <ChevronLeft size={20} /> Volver
                        </button>

                        <div className="flex items-center gap-5 mb-10">
                            <div className="w-16 h-16 bg-emerald-500 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-emerald-100">
                                <BookOpen size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Seleccionar Programa</h1>
                                <p className="text-slate-500 font-medium italic">Asignaciones activas para <span className="text-blue-600 font-bold not-italic">{selectedEstudiante}</span></p>
                            </div>
                        </div>

                        {loading && <div className="flex justify-center py-20"><div className="spinner" /></div>}

                        <div className="space-y-4">
                            {programasActivos.length > 0 ? (
                                Array.from(new Set(programasActivos.map(p => p.programa))).map((progNombre) => {
                                    const ocpCount = programasActivos.filter(p => p.programa === progNombre).length
                                    return (
                                        <button
                                            key={progNombre}
                                            onClick={() => handleSelectProgramName(progNombre)}
                                            className="w-full p-8 text-left bg-slate-50 rounded-[32px] hover:bg-emerald-50 border-2 border-transparent hover:border-emerald-200 transition-all group flex items-center justify-between shadow-sm hover:shadow-xl hover:shadow-emerald-100/50"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-white text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                    <BookOpen size={28} />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-xl text-slate-900 group-hover:text-emerald-700 uppercase tracking-tight">{progNombre}</h3>
                                                    <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">{ocpCount} Criterios Activos</span>
                                                </div>
                                            </div>
                                            <ChevronRight size={28} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                        </button>
                                    )
                                })
                            ) : !loading && (
                                <div className="p-16 text-center bg-slate-50 rounded-[40px] border-4 border-dashed border-slate-200">
                                    <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
                                    <p className="text-slate-500 font-bold text-lg">No hay programas asignados.</p>
                                    <button 
                                        onClick={() => onAssignNew ? onAssignNew() : router.push('/registro')} 
                                        className="btn btn-primary mt-6 h-14 px-8 rounded-2xl"
                                    >
                                        Asignar Nuevo
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 3: Seleccionar OCP */}
                {step === 3 && (
                    <div className="animate-fade-in">
                        <button onClick={() => setStep(2)} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 mb-8 font-black text-sm uppercase tracking-widest transition-colors">
                            <ChevronLeft size={20} /> Volver
                        </button>

                        <div className="flex items-center gap-5 mb-10">
                            <div className="w-16 h-16 bg-purple-600 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-purple-100">
                                <Target size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Seleccionar Criterio</h1>
                                <p className="text-slate-500 font-medium">{selectedProgramName}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {programasActivos.filter(p => p.programa === selectedProgramName).map((asignacion) => (
                                <button
                                    key={asignacion.id}
                                    onClick={() => handleSelectAssignment(asignacion)}
                                    className="p-8 text-left bg-slate-50 rounded-[32px] hover:bg-purple-50 border-2 border-transparent hover:border-purple-200 transition-all group flex items-start gap-6 shadow-sm hover:shadow-xl hover:shadow-purple-100/50"
                                >
                                    <div className="w-14 h-14 bg-white text-purple-700 font-black rounded-2xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform shrink-0">
                                        {asignacion.ocp}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-700 text-lg leading-snug group-hover:text-purple-900 line-clamp-2">{asignacion.criterio}</p>
                                        <div className="flex gap-3 mt-3">
                                            <span className="text-[10px] uppercase font-black text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                                                Iniciado: {new Date(asignacion.fecha_inicio).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-slate-300 group-hover:text-purple-500 mt-4" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 4: Tipo de Registro */}
                {step === 4 && (
                    <div className="animate-fade-in">
                        <button onClick={() => setStep(3)} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 mb-8 font-black text-sm uppercase tracking-widest transition-colors">
                            <ChevronLeft size={20} /> Volver
                        </button>

                        <div className="mb-10">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Fase de Registro</h1>
                            <p className="text-slate-500 font-medium">Selecciona la etapa técnica para este criterio</p>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                            {/* PRE-TEST */}
                            <button
                                onClick={() => handleSelectTipo('Inicial')}
                                className={`p-8 text-left border-[3px] rounded-[40px] transition-all flex items-center gap-8 group ${selectedPrograma?.pre_test !== null ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 bg-slate-50 hover:border-blue-400'}`}
                            >
                                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all shadow-lg ${selectedPrograma?.pre_test !== null ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
                                    <Info size={36} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Fase Inicial</h3>
                                        {selectedPrograma?.pre_test !== null && <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">COMPLETO: {selectedPrograma?.pre_test}%</span>}
                                    </div>
                                    <p className="text-slate-500 font-bold">Registro de Línea Base (Pre-test)</p>
                                </div>
                            </button>

                            {/* POST-TEST */}
                            <button
                                onClick={() => handleSelectTipo('Final')}
                                className="p-8 text-left bg-slate-50 border-[3px] border-slate-100 rounded-[40px] hover:border-emerald-400 transition-all flex items-center gap-8 group"
                            >
                                <div className="w-20 h-20 bg-white text-emerald-600 rounded-3xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-lg">
                                    <CheckCircle2 size={36} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-1">Fase Final</h3>
                                    <p className="text-slate-500 font-bold">Cierre de criterio (Post-test)</p>
                                </div>
                            </button>

                            {/* GENERALIZACION */}
                            <button
                                onClick={() => handleSelectTipo('Generalización')}
                                className="p-8 text-left bg-slate-50 border-[3px] border-slate-100 rounded-[40px] hover:border-amber-400 transition-all flex items-center gap-8 group"
                            >
                                <div className="w-20 h-20 bg-white text-amber-600 rounded-3xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all shadow-lg">
                                    <TrendingUp size={36} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Generalización</h3>
                                        <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-black">PENDIENTE: {getNextGeneralizationLabel()}</span>
                                    </div>
                                    <p className="text-slate-500 font-bold">Pruebas de mantenimiento y transferencia</p>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 5: Registro de Datos */}
                {step === 5 && (
                    <div className="animate-fade-in pb-8">
                        <button onClick={() => setStep(4)} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 mb-8 font-black text-sm uppercase tracking-widest transition-colors">
                            <ChevronLeft size={20} /> Volver
                        </button>

                        <div className="mb-12 text-center">
                            <span className={`inline-block px-6 py-2 rounded-full font-black text-xs uppercase tracking-[0.2em] mb-4 shadow-sm ${registroTipo === 'Inicial' ? 'bg-blue-100 text-blue-700' :
                                registroTipo === 'Final' ? 'bg-emerald-100 text-emerald-700' :
                                    'bg-amber-100 text-amber-700'
                                }`}>
                                {registroTipo === 'Inicial' ? 'Pre-test (Línea Base)' :
                                    registroTipo === 'Final' ? 'Post-test (Cierre)' :
                                        `Generalización ${getNextGeneralizationLabel()}`}
                            </span>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Registrar Puntaje</h1>
                            <p className="text-slate-500 font-bold text-lg max-w-sm mx-auto">
                                Ingresa el nivel de logro para <span className="text-blue-600">{selectedEstudiante}</span>
                            </p>
                        </div>

                        <div className="max-w-md mx-auto space-y-12">
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-slate-50 rounded-[40px] -z-10 group-focus-within:bg-blue-50/50 transition-colors" />
                                <label className="text-center block text-xs font-black text-slate-400 uppercase tracking-widest mb-6 px-10">Porcentaje de Éxito (%)</label>
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="number"
                                        autoFocus
                                        value={resultado}
                                        onChange={(e) => setResultado(e.target.value)}
                                        placeholder="0"
                                        className="text-center text-8xl font-black text-slate-900 bg-transparent w-full outline-none placeholder:text-slate-100 no-arrows"
                                    />
                                    <span className="absolute right-0 text-5xl font-black text-slate-200">%</span>
                                </div>
                                <div className="w-full h-1 bg-slate-100 rounded-full mt-4 overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-700 ${registroTipo === 'Inicial' ? 'bg-blue-600' :
                                            registroTipo === 'Final' ? 'bg-emerald-600' :
                                                'bg-amber-600'
                                            }`}
                                        style={{ width: `${Math.min(100, parseFloat(resultado) || 0)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Fecha de Aplicación</label>
                                <div className="flex items-center gap-5 bg-slate-50 p-6 rounded-3xl border-2 border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all">
                                    <Calendar className="text-slate-400" size={28} />
                                    <input
                                        type="date"
                                        value={fecha}
                                        onChange={(e) => setFecha(e.target.value)}
                                        className="bg-transparent font-black text-xl text-slate-700 outline-none w-full"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={saving || !resultado}
                                className={`w-full py-7 rounded-[32px] text-white font-black text-xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${saving ? 'bg-slate-400 cursor-not-allowed shadow-none' :
                                    registroTipo === 'Inicial' ? 'bg-blue-600 shadow-blue-200 hover:bg-blue-700' :
                                        registroTipo === 'Final' ? 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700' :
                                            'bg-amber-600 shadow-amber-200 hover:bg-amber-700'
                                    }`}
                            >
                                {saving ? (
                                    <>
                                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Procesando...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={28} strokeWidth={2.5} />
                                        <span>Confirmar y Guardar</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
