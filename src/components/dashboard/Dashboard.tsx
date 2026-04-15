'use client'

import React, { useEffect, useState } from 'react'
import { fetchDashboardData } from '@/lib/services/sheets'
import type { MetricasDashboard, ProgramaActivo } from '@/types'
import MetricsCard from './MetricsCard'
import ProgramsTable from './ProgramsTable'
import { Activity, CheckCircle2, Users, BarChart3, TrendingUp, BookCopy, Calendar } from 'lucide-react'
import { useRole } from '@/lib/contexts/RoleContext'
import TerapeutaFlow from './TerapeutaFlow'
import { ErrorBoundary } from '../ErrorBoundary'
export default function Dashboard() {
    const { role } = useRole()
    const [selectedStudent, setSelectedStudent] = useState<string>('all')
    const [allRecords, setAllRecords] = useState<any[]>([])
    const [viewMode, setViewMode] = useState<'dashboard' | 'flow'>('dashboard')

    useEffect(() => {
        setIsMounted(true)
        fetchDashboardDataFromSheets()
    }, [])

    useEffect(() => {
        if (role === 'terapeuta' && !allRecords.length) {
            setViewMode('flow')
        }
    }, [role, allRecords])

    async function fetchDashboardDataFromSheets() {
        try {
            setLoading(true)
            setError(null)

            const data = await fetchDashboardData()
            
            if (!data || data.error) throw new Error(data?.error || 'No se recibieron datos del servidor')

            const records = Array.isArray(data.records) ? data.records : []
            setAllRecords(records)
            processRecords(records, selectedStudent)
            
        } catch (err: any) {
            console.error('Error fetching dashboard data:', err)
            setError(err.message || 'Error al cargar los datos del dashboard')
        } finally {
            setLoading(false)
        }
    }

    function processRecords(records: any[], studentFilter: string) {
        // Filtrar por estudiante si no es 'all'
        const filteredRecords = studentFilter === 'all' 
            ? records 
            : records.filter(r => Array.isArray(r) && r[3] === studentFilter)

        // Agrupar por Estudiante + Programa + OCP (para tener una fila por programa/ocp)
        const groups: Record<string, any> = {}

        filteredRecords.forEach((r: any, i: number) => {
            if (!Array.isArray(r) || r.length < 9) return

            const key = `${r[3]}-${r[6]}-${r[7]}` // Estudiante-Programa-OCP
            if (!groups[key]) {
                groups[key] = {
                    id: i.toString(),
                    estudiante: r[3],
                    programa: r[6],
                    ocp: r[7],
                    criterio: r[8],
                    fecha_inicio: r[2],
                    estado: r[4],
                    pre_test: null,
                    post_test: null,
                    resultado_g1: null,
                    resultado_g2: null,
                    resultado_g3: null,
                    promedio_generalizacion: 0
                }
            }

            const tipo = r[5]
            const puntaje = parseFloat(r[9])

            if (tipo === 'Inicial' || tipo === 'Asignación') groups[key].pre_test = puntaje
            if (tipo === 'Final') {
                groups[key].post_test = puntaje
                groups[key].estado = r[4] || 'Logrado'
            }
            if (tipo === 'Generalización') {
                // Asignar en orden si no sabemos cuál G es (o si el GAS nos lo da en OCP_Criterio)
                if (groups[key].resultado_g1 === null) groups[key].resultado_g1 = puntaje
                else if (groups[key].resultado_g2 === null) groups[key].resultado_g2 = puntaje
                else if (groups[key].resultado_g3 === null) groups[key].resultado_g3 = puntaje
            }

            // Actualizar estado si algún registro dice 'Logrado'
            if (r[4] === 'Logrado') groups[key].estado = 'Logrado'
        })

        const mappedPrograms = Object.values(groups).map(p => {
            const gs = [p.resultado_g1, p.resultado_g2, p.resultado_g3].filter(g => g !== null)
            const prom = gs.length > 0 ? gs.reduce((a, b) => a + b, 0) / gs.length : 0
            return { ...p, promedio_generalizacion: prom }
        })

        setProgramasActivos(mappedPrograms)

        // Calcular métricas basadas en los grupos procesados
        const validRecords = records.filter(r => Array.isArray(r) && r[3])
        const uniqueStudents = studentFilter === 'all' 
            ? new Set(validRecords.map(r => r[3].toString().trim())).size
            : 1

        const totalOpen = mappedPrograms.filter(p => p.estado === 'Abierto').length
        const totalLogrados = mappedPrograms.filter(p => p.estado === 'Logrado').length
        
        const preTests = mappedPrograms.filter(p => p.pre_test !== null).map(p => p.pre_test)
        const postTests = mappedPrograms.filter(p => p.post_test !== null).map(p => p.post_test)

        setMetrics({
            programas_abiertos: totalOpen,
            programas_logrados: totalLogrados,
            total_estudiantes: uniqueStudents,
            promedio_pre_test: preTests.length ? preTests.reduce((a, b) => a + b, 0) / preTests.length : 0,
            promedio_post_test: postTests.length ? postTests.reduce((a, b) => a + b, 0) / postTests.length : 0,
            total_programas: mappedPrograms.length
        })
    }

    useEffect(() => {
        if (allRecords.length) {
            processRecords(allRecords, selectedStudent)
        }
    }, [selectedStudent])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="spinner" />
                <p className="text-slate-500 animate-pulse font-medium">Cargando...</p>
            </div>
        )
    }

    if (viewMode === 'flow' && role === 'terapeuta') {
        return (
            <div className="animate-fade-in">
                <div className="container-mobile pt-6 flex justify-end">
                    <button 
                        onClick={() => setViewMode('dashboard')}
                        className="btn-outline px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                    >
                        <BarChart3 size={16} /> Ver Dashboard
                    </button>
                </div>
                <TerapeutaFlow onAssignNew={() => {}} />
            </div>
        )
    }

    if (error) {
        return (
            <div className="container-mobile py-10">
                <div className="card border-red-200 bg-red-50 text-red-700 p-8 text-center max-w-2xl mx-auto">
                    <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="text-red-600" size={32} />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Error de Conexión</h2>
                    <p className="text-red-600/80 mb-6">{error}</p>
                    <button
                        onClick={() => fetchDashboardDataFromSheets()}
                        className="btn btn-primary px-8"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        )
    }

    const today = isMounted ? new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : ''

    return (
        <div className="container-mobile py-8 lg:py-12 animate-fade-in">
            <header className="mb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider mb-4 border border-blue-100">
                            Panel de Supervisión
                        </span>
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Dashboard Global</h1>
                        <div className="flex items-center gap-2 text-slate-500">
                            <Calendar size={18} className="text-slate-400" />
                            <p className="text-sm font-medium capitalize border-l border-slate-200 pl-2">{today}</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        {role === 'terapeuta' && (
                            <button 
                                onClick={() => setViewMode('flow')}
                                className="w-full sm:w-auto btn btn-primary px-6 py-3 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                            >
                                <Plus size={20} /> Registrar Sesión
                            </button>
                        )}
                        <select 
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            className="w-full sm:w-auto bg-white border border-slate-200 rounded-2xl px-6 py-3 font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-blue-100 outline-none min-w-[200px]"
                        >
                            <option value="all">Todos los Estudiantes</option>
                            {Array.from(new Set(allRecords.filter(r => Array.isArray(r)).map(r => r[3])))
                                .filter(Boolean)
                                .sort()
                                .map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))
                            }
                        </select>
                    </div>
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-sm`}>
                                    {String.fromCharCode(64 + i)}
                                </div>
                            ))}
                        </div>
                        <div className="pr-4 border-r border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Equipo</p>
                            <p className="text-xs font-bold text-slate-900">Altus Team</p>
                        </div>
                        <div className="flex items-center gap-2 px-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-bold text-slate-600">En vivo</span>
                        </div>
                    </div>
                </div>
            </header>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <MetricsCard
                    title="Programas Abiertos"
                    value={metrics?.programas_abiertos || 0}
                    icon={<Activity size={24} />}
                    color="blue"
                />

                <MetricsCard
                    title="Programas Logrados"
                    value={metrics?.programas_logrados || 0}
                    icon={<CheckCircle2 size={24} />}
                    color="green"
                />

                <MetricsCard
                    title="Total Estudiantes"
                    value={metrics?.total_estudiantes || 0}
                    icon={<Users size={24} />}
                    color="purple"
                />

                <MetricsCard
                    title="Promedio Pre-Test"
                    value={`${Number(metrics?.promedio_pre_test || 0).toFixed(1)}%`}
                    icon={<BarChart3 size={24} />}
                    color="amber"
                    numeric
                />

                <MetricsCard
                    title="Promedio Post-Test"
                    value={`${Number(metrics?.promedio_post_test || 0).toFixed(1)}%`}
                    icon={<TrendingUp size={24} />}
                    color="emerald"
                    numeric
                />

                <MetricsCard
                    title="Total Programas"
                    value={metrics?.total_programas || 0}
                    icon={<BookCopy size={24} />}
                    color="indigo"
                />
            </section>

            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Registros Recientes</h2>
                        <p className="text-slate-500 text-sm mt-1">Últimas actualizaciones de programas activos.</p>
                    </div>
                    <button className="btn-outline px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 group">
                        Ver histórico
                        <TrendingUp size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                    <ErrorBoundary fallback={(err) => <div className="p-4 bg-red-100 text-red-700">Error en ProgramsTable: {err.message}</div>}>
                        <ProgramsTable programs={programasActivos} />
                    </ErrorBoundary>
                </div>
            </section>
        </div>
    )
}
