'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Estudiante, ProgramaActivo, ProgramaOCP, RegistroFormData, Database } from '@/types'
import { SupabaseClient } from '@supabase/supabase-js'
import { ChevronRight, ChevronLeft, User, BookOpen, Target, Calendar, CheckCircle2, TrendingUp, Info, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TerapeutaFlow() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    // Data lists
    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
    const [programasActivos, setProgramasActivos] = useState<ProgramaActivo[]>([])

    // Selection state
    const [selectedEstudiante, setSelectedEstudiante] = useState<string | null>(null)
    const [selectedProgramName, setSelectedProgramName] = useState<string | null>(null) // NEW: For Step 2
    const [selectedPrograma, setSelectedPrograma] = useState<ProgramaActivo | null>(null) // The specific assignment
    const [registroTipo, setRegistroTipo] = useState<'Inicial' | 'Final' | 'Generalización' | null>(null)
    // Removed selectedOcp (it's part of selectedPrograma now)

    // Data entry state
    const [resultado, setResultado] = useState<string>('')
    const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0])

    useEffect(() => {
        fetchInitialData()
    }, [])

    async function fetchInitialData() {
        try {
            setLoading(true)
            const { data: ests } = await supabase.from('estudiantes').select('*').eq('activo', true).order('nombre')
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
            const { data: progs } = await supabase
                .from('vista_programas_activos')
                .select('*')
                .eq('estudiante', nombre)
            setProgramasActivos(progs || [])
        } catch (error) {
            console.error('Error fetching programs:', error)
        } finally {
            setLoading(false)
        }
    }

    // Removed fetchOcpsForPrograma as it's no longer needed with the new flow

    const handleSelectEstudiante = (nombre: string) => {
        setSelectedEstudiante(nombre)
        fetchProgramasForEstudiante(nombre)
        setStep(2)
    }

    // NEW: Handles selection of Program Name (group)
    const handleSelectProgramName = (nombre: string) => {
        setSelectedProgramName(nombre)
        setStep(3)
    }

    // NEW: Handles selection of specific OCP Assignment
    const handleSelectAssignment = (assignment: ProgramaActivo) => {
        setSelectedPrograma(assignment)
        setStep(4)
    }

    const handleSelectTipo = (tipo: 'Inicial' | 'Final' | 'Generalización') => {
        setRegistroTipo(tipo)
        setStep(5)
    }

    // Removed handleSelectOcp as it's no longer needed

    const handleSave = async () => {
        if (!selectedPrograma || !resultado) return

        try {
            setSaving(true)
            const valor = parseFloat(resultado)

            let updateData: any = {}

            if (registroTipo === 'Inicial') {
                updateData = { pre_test: valor }
            } else if (registroTipo === 'Final') {
                // Para el final, usamos la función cerrar_programa o actualizamos post_test
                const { error } = await (supabase.rpc as any)('cerrar_programa', {
                    p_registro_id: (selectedPrograma as any).id,
                    p_fecha_final: fecha,
                    p_post_test: valor
                })
                if (error) throw error
            } else if (registroTipo === 'Generalización') {
                // Lógica de "la siguiente disponible"
                if (selectedPrograma.resultado_g1 === null) {
                    updateData = { fecha_g1: fecha, resultado_g1: valor }
                } else if (selectedPrograma.resultado_g2 === null) {
                    updateData = { fecha_g2: fecha, resultado_g2: valor }
                } else if (selectedPrograma.resultado_g3 === null) {
                    updateData = { fecha_g3: fecha, resultado_g3: valor }
                } else {
                    alert('Todas las generalizaciones (G1, G2, G3) ya han sido registradas para este OCP.')
                    setSaving(false)
                    return
                }
            }

            if (registroTipo !== 'Final') {
                const { error } = await (supabase
                    .from('registros_programas') as any)
                    .update(updateData)
                    .eq('id', (selectedPrograma as any).id)

                if (error) throw error
            }

            // Success! Reset and show dashboard
            alert('Registro guardado exitosamente')
            window.location.reload()

        } catch (error: any) {
            alert(`Error al guardar: ${error.message}`)
        } finally {
            setSaving(false)
        }
    }

    const getNextGeneralizationLabel = () => {
        if (!selectedPrograma) return 'G1'
        if (selectedPrograma.resultado_g1 === null) return 'G1'
        if (selectedPrograma.resultado_g2 === null) return 'G2'
        if (selectedPrograma.resultado_g3 === null) return 'G3'
        return 'Completo'
    }

    return (
        <div className="max-w-4xl mx-auto py-6 px-4">
            {/* Progress Header */}
            <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step === s ? 'bg-blue-600 text-white border-4 border-blue-100' :
                            step > s ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'
                            }`}>
                            {s}
                        </div>
                        {s < 5 && <div className={`w-8 md:w-16 h-1 mx-2 rounded-full ${step > s ? 'bg-green-500' : 'bg-slate-200'}`} />}
                    </div>
                ))}
            </div>

            <div className="card p-6 md:p-10 shadow-xl border-slate-100">

                {/* Step 1: Seleccionar Niño */}
                {step === 1 && (
                    <div className="animate-fade-in">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                <User size={24} />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-slate-900">Seleccionar Niño</h2>
                                <p className="text-slate-500">¿Para quién es el registro?</p>
                            </div>
                        </div>

                        {loading && <div className="spinner mx-auto" />}

                        <div className="mb-6 sticky top-0 bg-white z-10 py-2">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Buscar estudiante..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto max-h-[60vh]">
                            {estudiantes
                                .filter(est => est.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((est) => (
                                    <button
                                        key={est.id}
                                        onClick={() => handleSelectEstudiante(est.nombre)}
                                        className="p-3 text-left border border-slate-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group flex flex-col justify-between h-full shadow-sm hover:shadow-md"
                                    >
                                        <div className="flex items-center justify-between w-full mb-2">
                                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs uppercase">
                                                {est.nombre.substring(0, 2)}
                                            </div>
                                            <div className={`w-2 h-2 rounded-full ${est.activo ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        </div>
                                        <span className="font-bold text-slate-700 text-sm group-hover:text-blue-700 line-clamp-2 leading-tight">
                                            {est.nombre}
                                        </span>
                                    </button>
                                ))}
                            {estudiantes.filter(est => est.nombre.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                                <div className="col-span-full py-8 text-center text-slate-400 italic">
                                    No se encontraron estudiantes
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Seleccionar Programa (Agrupado) */}
                {step === 2 && (
                    <div className="animate-fade-in">
                        <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-6 text-sm font-bold">
                            <ChevronLeft size={16} /> Volver
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Seleccionar Programa</h2>
                                <p className="text-slate-500">Programas activos para {selectedEstudiante}</p>
                            </div>
                        </div>

                        {loading && <div className="spinner mx-auto" />}

                        <div className="space-y-3 mt-8">
                            {programasActivos.length > 0 ? (
                                Array.from(new Set(programasActivos.map(p => p.programa))).map((progNombre) => {
                                    const ocpCount = programasActivos.filter(p => p.programa === progNombre).length
                                    const firstOcc = programasActivos.find(p => p.programa === progNombre)

                                    return (
                                        <button
                                            key={progNombre}
                                            onClick={() => handleSelectProgramName(progNombre)}
                                            className="w-full p-5 text-left border-2 border-slate-100 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group flex items-center justify-between"
                                        >
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700">{progNombre}</h3>
                                                <span className="text-sm text-slate-400 font-medium">{ocpCount} objetivos activos (OCPs)</span>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-emerald-200 flex items-center justify-center transition-colors">
                                                <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-700" />
                                            </div>
                                        </button>
                                    )
                                })
                            ) : (
                                <div className="p-10 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <p className="text-slate-500 font-medium">No hay programas activos para este niño.</p>
                                    <button onClick={() => router.push('/registro')} className="btn btn-primary mt-4">Asignar Nuevo Programa</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 3: Seleccionar OCP (Asignado) */}
                {step === 3 && (
                    <div className="animate-fade-in">
                        <button onClick={() => setStep(2)} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-6 text-sm font-bold">
                            <ChevronLeft size={16} /> Volver
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                                <Target size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Seleccionar Objetivo</h2>
                                <p className="text-slate-500">OCPs activos de <span className="font-bold text-purple-600">{selectedProgramName}</span></p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {programasActivos.filter(p => p.programa === selectedProgramName).map((asignacion) => (
                                <button
                                    key={asignacion.id}
                                    onClick={() => handleSelectAssignment(asignacion)}
                                    className="p-5 text-left border-2 border-slate-100 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition-all group flex items-start gap-4"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm shrink-0">
                                        OCP {asignacion.ocp}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-800 leading-snug group-hover:text-purple-900">{asignacion.criterio}</p>
                                        <div className="flex gap-2 mt-2">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">
                                                Iniciado: {new Date(asignacion.fecha_inicio).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-slate-300 group-hover:text-purple-500 mt-2" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 4: Tipo de Registro */}
                {step === 4 && (
                    <div className="animate-fade-in">
                        <button onClick={() => setStep(3)} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-6 text-sm font-bold">
                            <ChevronLeft size={16} /> Volver
                        </button>

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">Tipo de Registro</h2>
                            <p className="text-slate-500">¿Qué vas a registrar hoy?</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={() => handleSelectTipo('Inicial')}
                                className="p-6 text-left border-2 border-slate-100 rounded-3xl hover:border-blue-500 hover:shadow-lg hover:shadow-blue-100 transition-all flex items-center gap-6 group"
                            >
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Info size={28} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700">Fase Inicial (Pre-test)</h3>
                                    <p className="text-slate-500 text-sm">Prueba inicial para establecer línea base.</p>
                                </div>
                            </button>

                            <button
                                onClick={() => handleSelectTipo('Final')}
                                className="p-6 text-left border-2 border-slate-100 rounded-3xl hover:border-green-500 hover:shadow-lg hover:shadow-green-100 transition-all flex items-center gap-6 group"
                            >
                                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                    <CheckCircle2 size={28} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-green-700">Fase Final (Post-test)</h3>
                                    <p className="text-slate-500 text-sm">Evaluar si se ha logrado el criterio.</p>
                                </div>
                            </button>

                            <button
                                onClick={() => handleSelectTipo('Generalización')}
                                className="p-6 text-left border-2 border-slate-100 rounded-3xl hover:border-amber-500 hover:shadow-lg hover:shadow-amber-100 transition-all flex items-center gap-6 group"
                            >
                                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                    <TrendingUp size={28} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-700">Generalización</h3>
                                    <p className="text-slate-500 text-sm">Sesión de refuerzo ({getNextGeneralizationLabel()}).</p>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
                {/* Step 5: Registro de Datos */}
                {step === 5 && (
                    <div className="animate-fade-in">
                        <button onClick={() => setStep(4)} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-6 text-sm font-bold">
                            <ChevronLeft size={16} /> Volver
                        </button>

                        <div className="mb-10 text-center">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Registrar Resultado</h2>
                            <p className="text-slate-500">
                                {registroTipo} - {selectedEstudiante}
                            </p>
                            {registroTipo === 'Generalización' && (
                                <span className="inline-block mt-2 px-4 py-1 bg-amber-100 text-amber-700 rounded-full font-bold text-sm">
                                    Sesión {getNextGeneralizationLabel()}
                                </span>
                            )}
                        </div>

                        <div className="max-w-md mx-auto space-y-8">
                            <div>
                                <label className="label text-center block mb-4">Porcentaje de Logro (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={resultado}
                                        onChange={(e) => setResultado(e.target.value)}
                                        placeholder="0.0"
                                        className="text-center text-6xl font-black text-slate-400 bg-transparent w-full outline-none placeholder:text-slate-200 no-arrows"
                                    />
                                    <span className="absolute right-[20%] top-1/2 -translate-y-1/2 text-4xl font-bold text-slate-300">
                                        %
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="label block mb-2 font-bold text-slate-700">Fecha del Registro</label>
                                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                    <Calendar className="text-slate-400" />
                                    <input
                                        type="date"
                                        value={fecha}
                                        onChange={(e) => setFecha(e.target.value)}
                                        className="bg-transparent font-bold text-slate-700 outline-none w-full"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={saving || !resultado}
                                className={`w-full py-5 rounded-3xl text-white font-bold text-lg shadow-xl transition-all ${saving ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 active:scale-95'
                                    }`}
                            >
                                {saving ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Guardando...
                                    </div>
                                ) : 'Finalizar Registro'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
