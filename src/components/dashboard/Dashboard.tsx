'use client'

import React, { useEffect, useState } from 'react'
import { fetchDashboardData } from '@/lib/services/sheets'
import type { MetricasDashboard, ProgramaActivo, Rol } from '@/types'
import MetricsCard from './MetricsCard'
import ProgramsTable from './ProgramsTable'
import { 
    Activity, 
    CheckCircle2, 
    Users, 
    BarChart3, 
    TrendingUp, 
    BookCopy, 
    Calendar, 
    Plus, 
    RefreshCcw,
    LayoutDashboard,
    ClipboardList
} from 'lucide-react'
import { useRole } from '@/lib/contexts/RoleContext'
import TerapeutaFlow from './TerapeutaFlow'
import { ErrorBoundary } from '../ErrorBoundary'

export default function Dashboard() {
    const { role } = useRole()
    const [isMounted, setIsMounted] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<string>('all')
    const [allRecords, setAllRecords] = useState<any[]>([])
    const [programasActivos, setProgramasActivos] = useState<ProgramaActivo[]>([])
    const [metrics, setMetrics] = useState<MetricasDashboard | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'dashboard' | 'flow'>('dashboard')

    useEffect(() => {
        setIsMounted(true)
        fetchDashboardDataFromSheets()
    }, [])

    async function fetchDashboardDataFromSheets() {
        try {
            setLoading(true)
            setError(null)

            const data = await fetchDashboardData()
            
            if (!data) throw new Error('No se recibió respuesta del servidor')
            if (data.error) throw new Error(data.error)

            const records = Array.isArray(data.records) ? data.records : []
            setAllRecords(records)
            
            // Procesar inicialmente
            try {
                processRecords(records, selectedStudent)
            } catch (procErr: any) {
                console.error('Error in initial processRecords:', procErr)
                // No lanzamos aquí para permitir que loading se ponga en false
                setError(`Error procesando datos: ${procErr.message}`)
            }
            
        } catch (err: any) {
            console.error('Error fetching dashboard data:', err)
            setError(err.message || 'Error al cargar los datos del dashboard')
        } finally {
            setLoading(false)
        }
    }

    function processRecords(records: any[], studentFilter: string) {
        if (!records || !Array.isArray(records)) return

        try {
            // Filtrar por estudiante si no es 'all'
            const filteredRecords = studentFilter === 'all' 
                ? records 
                : records.filter(r => Array.isArray(r) && String(r[3] || '') === studentFilter)

            // Agrupar por Estudiante + Programa + OCP
            const groups: Record<string, any> = {}

            filteredRecords.forEach((r: any, i: number) => {
                if (!Array.isArray(r) || r.length < 9) return

                const student = String(r[3] || 'Sin Nombre')
                const programName = String(r[6] || 'Sin Programa')
                const ocp = String(r[7] || '0')
                const key = `${student}-${programName}-${ocp}`

                if (!groups[key]) {
                    groups[key] = {
                        id: `row-${i}-${key}`,
                        estudiante: student,
                        programa: programName,
                        ocp: ocp,
                        criterio: String(r[8] || ''),
                        fecha_inicio: r[2],
                        estado: String(r[4] || 'Abierto'),
                        pre_test: null,
                        post_test: null,
                        resultado_g1: null,
                        resultado_g2: null,
                        resultado_g3: null,
                        promedio_generalizacion: 0
                    }
                }

                const tipo = String(r[5] || '')
                const puntaje = parseFloat(r[9])

                if (!isNaN(puntaje)) {
                    if (tipo === 'Inicial' || tipo === 'Asignación') groups[key].pre_test = puntaje
                    if (tipo === 'Final') {
                        groups[key].post_test = puntaje
                        groups[key].estado = String(r[4] || 'Logrado')
                    }
                    if (tipo === 'Generalización') {
                        if (groups[key].resultado_g1 === null) groups[key].resultado_g1 = puntaje
                        else if (groups[key].resultado_g2 === null) groups[key].resultado_g2 = puntaje
                        else if (groups[key].resultado_g3 === null) groups[key].resultado_g3 = puntaje
                    }
                }

                if (String(r[4]) === 'Logrado') groups[key].estado = 'Logrado'
            })

            const mappedPrograms = Object.values(groups).map(p => {
                const gs = [p.resultado_g1, p.resultado_g2, p.resultado_g3].filter(g => g !== null && !isNaN(g))
                const prom = gs.length > 0 ? gs.reduce((a, b) => a + b, 0) / gs.length : 0
                return { ...p, promedio_generalizacion: prom }
            })

            setProgramasActivos(mappedPrograms as ProgramaActivo[])

            // Metricas
            const validRecords = records.filter(r => Array.isArray(r) && r[3])
            const uniqueStudentsCount = studentFilter === 'all' 
                ? new Set(validRecords.map(r => String(r[3]).trim())).size
                : 1

            const totalOpen = mappedPrograms.filter(p => p.estado === 'Abierto').length
            const totalLogrados = mappedPrograms.filter(p => p.estado === 'Logrado').length
            
            const preTests = mappedPrograms.filter(p => p.pre_test !== null).map(p => Number(p.pre_test))
            const postTests = mappedPrograms.filter(p => p.post_test !== null).map(p => Number(p.post_test))

            setMetrics({
                programas_abiertos: totalOpen,
                programas_logrados: totalLogrados,
                total_estudiantes: uniqueStudentsCount,
                promedio_pre_test: preTests.length ? preTests.reduce((a, b) => a + b, 0) / preTests.length : 0,
                promedio_post_test: postTests.length ? postTests.reduce((a, b) => a + b, 0) / postTests.length : 0,
                total_programas: mappedPrograms.length
            })
        } catch (err: any) {
            console.error('Error inside processRecords:', err)
            setError(`Error de procesamiento: ${err.message}`)
        }
    }

    // Efecto para cambios de filtro o records
    useEffect(() => {
        if (allRecords.length > 0) {
            processRecords(allRecords, selectedStudent)
        }
    }, [selectedStudent, allRecords])

    if (!isMounted) return null

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
                <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
                <div className="text-center">
                    <p className="text-xl font-bold text-slate-900 mb-1">Cargando Dashboard</p>
                    <p className="text-slate-500 animate-pulse">Sincronizando con Altus Cloud...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container-mobile py-20">
                <div className="max-w-xl mx-auto bg-white p-10 rounded-[2.5rem] border border-red-100 shadow-2xl shadow-red-100/50 text-center">
                    <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-inner">
                        <Activity className="text-red-500" size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">Error en el Dashboard</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed max-h-40 overflow-y-auto">{error}</p>
                    <button
                        onClick={() => fetchDashboardDataFromSheets()}
                        className="btn btn-primary px-10 py-4 rounded-2xl shadow-lg shadow-blue-200 flex items-center gap-3 mx-auto"
                    >
                        <RefreshCcw size={20} />
                        Reintentar Sincronización
                    </button>
                </div>
            </div>
        )
    }

    if (viewMode === 'flow' && role === 'terapeuta') {
        return (
            <div className="animate-fade-in pb-20">
                <div className="container-mobile pt-8 flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Registro de Sesión</h2>
                        <p className="text-slate-500">Nuevo ingreso de datos terapéuticos</p>
                    </div>
                    <button 
                        onClick={() => setViewMode('dashboard')}
                        className="bg-white border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <LayoutDashboard size={18} className="text-blue-600" />
                        Ver Dashboard
                    </button>
                </div>
                <TerapeutaFlow onAssignNew={() => {}} />
            </div>
        )
    }

    const today = new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    const studentNames = Array.from(new Set(allRecords.filter(r => Array.isArray(r) && r[3]).map(r => String(r[3]))))
        .sort((a, b) => a.localeCompare(b))

    return (
        <div className="container-mobile py-10 lg:py-16 animate-fade-in min-h-screen">
            <header className="mb-12">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-600/10 text-blue-600 text-[11px] font-bold uppercase tracking-widest border border-blue-600/20 backdrop-blur-sm">
                                {role === 'supervisora' ? 'Vista de Supervisión' : 'Portal de Terapeuta'}
                            </span>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                <span className="text-[10px] font-bold text-green-600 uppercase tracking-tighter">En vivo</span>
                            </div>
                        </div>
                        
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">
                            Dashboard <span className="text-blue-600">Altus</span>
                        </h1>
                        
                        <div className="flex items-center gap-4 text-slate-500 bg-white/50 w-fit px-4 py-2 rounded-2xl border border-slate-100 backdrop-blur-md">
                            <Calendar size={18} className="text-blue-500" />
                            <p className="text-sm font-bold capitalize">{today}</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        {role === 'terapeuta' && (
                            <button 
                                onClick={() => setViewMode('flow')}
                                className="btn btn-primary px-8 py-4 rounded-[1.25rem] shadow-xl shadow-blue-200 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <Plus size={20} strokeWidth={3} />
                                <span className="font-bold">Registrar Sesión</span>
                            </button>
                        )}
                        
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <Users size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <select 
                                value={selectedStudent}
                                onChange={(e) => setSelectedStudent(e.target.value)}
                                className="w-full sm:w-[260px] bg-white border border-slate-200 rounded-[1.25rem] pl-12 pr-6 py-4 font-bold text-slate-700 shadow-xl shadow-slate-100/50 focus:ring-4 focus:ring-blue-100 outline-none appearance-none transition-all cursor-pointer"
                            >
                                <option value="all">Todos los Estudiantes</option>
                                {studentNames.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </header>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                <MetricsCard title="Programas Abiertos" value={metrics?.programas_abiertos ?? 0} icon={<Activity size={24} />} color="blue" />
                <MetricsCard title="Programas Logrados" value={metrics?.programas_logrados ?? 0} icon={<CheckCircle2 size={24} />} color="green" />
                <MetricsCard title="Alumnos en Curso" value={metrics?.total_estudiantes ?? 0} icon={<Users size={24} />} color="purple" />
                <MetricsCard title="Metas Alcanzadas" value={metrics?.total_programas ?? 0} icon={<BookCopy size={24} />} color="indigo" />
                <MetricsCard title="Promedio Pre-Test" value={`${Number(metrics?.promedio_pre_test ?? 0).toFixed(1)}%`} icon={<BarChart3 size={24} />} color="amber" numeric />
                <MetricsCard title="Avance Post-Test" value={`${Number(metrics?.promedio_post_test ?? 0).toFixed(1)}%`} icon={<TrendingUp size={24} />} color="emerald" numeric />
            </section>

            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            Programas del Estudiante
                            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                        </h2>
                        <p className="text-slate-500 font-medium mt-1">Estatus actual de criterios y generalización</p>
                    </div>
                    <button className="hidden sm:flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors">
                        <ClipboardList size={18} />
                        Histórico Completo
                    </button>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-2xl shadow-slate-200/40 overflow-hidden backdrop-blur-sm">
                    <ErrorBoundary fallback={(err) => (
                        <div className="p-12 text-center bg-red-50 text-red-700">
                            <Activity className="mx-auto mb-4 text-red-500" size={32} />
                            <h3 className="text-lg font-bold mb-2">Error en Procesamiento</h3>
                            <p className="text-red-600/70">{err.message}</p>
                        </div>
                    )}>
                        <ProgramsTable programs={programasActivos} />
                    </ErrorBoundary>
                </div>
            </section>

            <footer className="mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 pb-10">
                <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-sm flex items-center justify-center text-[10px] font-black text-slate-400">
                                {String.fromCharCode(64 + i)}
                            </div>
                        ))}
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Supervisión en Línea</p>
                        <p className="text-sm font-bold text-slate-700">Equipo Altus Centro Terapéutico</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
