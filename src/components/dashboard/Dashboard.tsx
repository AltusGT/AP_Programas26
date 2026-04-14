'use client'

import React, { useEffect, useState } from 'react'
import { fetchDashboardData } from '@/lib/services/sheets'
import type { MetricasDashboard, ProgramaActivo } from '@/types'
import MetricsCard from './MetricsCard'
import ProgramsTable from './ProgramsTable'
import { Activity, CheckCircle2, Users, BarChart3, TrendingUp, BookCopy, Calendar } from 'lucide-react'
import { useRole } from '@/lib/contexts/RoleContext'
import TerapeutaFlow from './TerapeutaFlow'

export default function Dashboard() {
    const { role } = useRole()
    const [metrics, setMetrics] = useState<MetricasDashboard | null>(null)
    const [programasActivos, setProgramasActivos] = useState<ProgramaActivo[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (role === 'supervisora') {
            fetchDashboardDataFromSheets()
        } else {
            setLoading(false)
        }
    }, [role])

    async function fetchDashboardDataFromSheets() {
        try {
            setLoading(true)
            setError(null)

            const data = await fetchDashboardData()
            
            if (!data || data.error) throw new Error(data?.error || 'No se recibieron datos del servidor')

            const records = Array.isArray(data.records) ? data.records : []
            
            // Calculo seguro de métricas
            const studentsSet = new Set(records.filter(r => Array.isArray(r) && r[3]).map(r => r[3].toString().trim()))
            const uniqueStudents = studentsSet.size
            
            const openPrograms = records.filter((r: any) => Array.isArray(r) && r[4] === 'Abierto').length
            const logrados = records.filter((r: any) => Array.isArray(r) && (r[4] === 'Logrado' || r[4] === 'Finalizado')).length

            setMetrics({
                programas_abiertos: openPrograms,
                programas_logrados: logrados,
                total_estudiantes: uniqueStudents,
                promedio_pre_test: 0, 
                promedio_post_test: 0,
                total_programas: records.length
            })

            // Mapear records de array a objetos para ProgramsTable
            const mappedPrograms = records
                .filter((r: any) => Array.isArray(r) && r.length >= 7)
                .map((r: any, i: number) => ({
                    id: i.toString(),
                    id_sesion: r[1],
                    fecha_inicio: r[2],
                    estudiante: r[3],
                    tipo_registro: r[5], // Tipo (Index 5)
                    programa: r[6],      // Programa (Index 6)
                    materia_programa: r[6],
                    ocp: r[7],           // OCP Num (Index 7)
                    criterio: r[8],      // Criterio Text (Index 8)
                    estado: r[4],        // Estado (Index 4)
                    pre_test: (r[5] === 'Asignación' || r[5] === 'Inicial') ? r[9] : null,
                    post_test: r[5] === 'Final' ? r[9] : null
                }))
            
            setProgramasActivos(mappedPrograms)
        } catch (err: any) {
            console.error('Error fetching dashboard data:', err)
            setError(err.message || 'Error al cargar los datos del dashboard')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="spinner" />
                <p className="text-slate-500 animate-pulse font-medium">Cargando...</p>
            </div>
        )
    }

    if (role === 'terapeuta') {
        return <TerapeutaFlow />
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

    const today = new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

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

                    <div className="hidden md:flex items-center gap-4 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
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
                    value={`${metrics?.promedio_pre_test?.toFixed(1) || '0.0'}%`}
                    icon={<BarChart3 size={24} />}
                    color="amber"
                    numeric
                />

                <MetricsCard
                    title="Promedio Post-Test"
                    value={`${metrics?.promedio_post_test?.toFixed(1) || '0.0'}%`}
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
                    <ProgramsTable programs={programasActivos} />
                </div>
            </section>
        </div>
    )
}
