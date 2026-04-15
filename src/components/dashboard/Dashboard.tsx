'use client'

import React, { useEffect, useState } from 'react'
import { fetchBaseData, fetchDashboardData } from '@/lib/services/sheets'
import type { ProgramaActivo, Rol } from '@/types'
import { 
    Activity, 
    CheckCircle2, 
    Users, 
    BarChart3, 
    TrendingUp, 
    BookCopy, 
    Calendar, 
    Search,
    ChevronRight,
    ArrowLeft,
    RefreshCcw,
    Zap
} from 'lucide-react'
import { useRole } from '@/lib/contexts/RoleContext'
import ProgramsTable from './ProgramsTable'
import MetricsCard from './MetricsCard'

export default function Dashboard() {
    const { role } = useRole()
    const [isMounted, setIsMounted] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    
    // Lista de alumnos para la selección inicial
    const [studentsList, setStudentsList] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    
    // Estado del alumno seleccionado
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
    const [studentMetrics, setStudentMetrics] = useState<any>(null)
    const [studentPrograms, setStudentPrograms] = useState<any[]>([])
    const [loadingStudent, setLoadingStudent] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        loadInitialData()
    }, [])

    async function loadInitialData() {
        try {
            setLoading(true)
            setError(null)
            const data = await fetchBaseData()
            if (data && data.students) {
                setStudentsList(data.students.sort())
            }
        } catch (err: any) {
            console.error('Error loading students:', err)
            setError('No se pudieron cargar los alumnos de la base de datos.')
        } finally {
            setLoading(false)
        }
    }

    async function handleSelectStudent(name: string) {
        setSelectedStudent(name)
        setLoadingStudent(true)
        try {
            const data = await fetchDashboardData(name)
            if (data && data.records) {
                processStudentRecords(data.records)
            }
        } catch (err) {
            console.error('Error loading student data:', err)
        } finally {
            setLoadingStudent(false)
        }
    }

    function processStudentRecords(records: any[]) {
        if (!Array.isArray(records)) return

        const groups: Record<string, any> = {}
        
        records.forEach((r: any, i: number) => {
            if (!Array.isArray(r) || r.length < 9) return
            
            // r[6] = programa, r[7] = OCP, r[3] = Estudiante
            const programName = String(r[6] || 'Sin Programa')
            const ocpNum = String(r[7] || '1')
            const key = `${programName}-${ocpNum}`

            if (!groups[key]) {
                groups[key] = {
                    id: `p-${i}`,
                    estudiante: String(r[3]),
                    programa: programName,
                    ocp: ocpNum,
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
            const value = parseFloat(r[9])

            if (!isNaN(value)) {
                if (tipo === 'Inicial' || tipo === 'Asignación') groups[key].pre_test = value
                if (tipo === 'Final') {
                    groups[key].post_test = value
                    groups[key].estado = String(r[4] || 'Logrado')
                }
                if (tipo === 'Generalización') {
                    if (groups[key].resultado_g1 === null) groups[key].resultado_g1 = value
                    else if (groups[key].resultado_g2 === null) groups[key].resultado_g2 = value
                    else if (groups[key].resultado_g3 === null) groups[key].resultado_g3 = value
                }
            }
            if (String(r[4]) === 'Logrado') groups[key].estado = 'Logrado'
        })

        const mapped = Object.values(groups).map(p => {
            const gs = [p.resultado_g1, p.resultado_g2, p.resultado_g3].filter(g => g !== null)
            const prom = gs.length > 0 ? gs.reduce((a, b) => a + b, 0) / gs.length : 0
            return { ...p, promedio_generalizacion: prom }
        })

        setStudentPrograms(mapped)

        // Calcular métricas
        const open = mapped.filter(p => p.estado === 'Abierto').length
        const closed = mapped.filter(p => p.estado === 'Logrado').length
        const preValues = mapped.filter(p => p.pre_test !== null).map(p => p.pre_test)
        const postValues = mapped.filter(p => p.post_test !== null).map(p => p.post_test)

        setStudentMetrics({
            abiertos: open,
            logrados: closed,
            total: mapped.length,
            promedio_pre: preValues.length ? preValues.reduce((a,b)=>a+b,0)/preValues.length : 0,
            promedio_post: postValues.length ? postValues.reduce((a,b)=>a+b,0)/postValues.length : 0
        })
    }

    if (!isMounted) return null

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh]">
                <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6" />
                <p className="text-slate-500 font-bold animate-pulse">Cargando Sistema Altus...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container-mobile py-20 text-center">
                <div className="max-w-md mx-auto bg-white p-12 rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100">
                    <Activity size={60} className="text-red-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Error de Conexión</h2>
                    <p className="text-slate-500 mb-8">{error}</p>
                    <button onClick={loadInitialData} className="btn btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2">
                        <RefreshCcw size={20} /> Reintentar
                    </button>
                </div>
            </div>
        )
    }

    // VISTA 1: Selector de Alumno
    if (!selectedStudent) {
        const filteredStudents = studentsList.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()))

        return (
            <div className="container-mobile py-12 lg:py-20 animate-fade-in">
                <header className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-100">
                        <Zap size={14} /> Panel de Control Altus
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-4">
                        ¿A quién vamos a <span className="text-blue-600">revisar</span> hoy?
                    </h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">Selecciona un alumno para ver su dashboard personalizado, métricas de progreso y programas vigentes.</p>
                </header>

                <div className="max-w-4xl mx-auto space-y-10">
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={24} />
                        <input 
                            type="text" 
                            placeholder="Buscar alumno por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border-2 border-slate-100 rounded-[2.5rem] pl-16 pr-8 py-7 text-xl font-bold text-slate-800 shadow-xl shadow-slate-200/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStudents.map((name) => (
                            <button 
                                key={name}
                                onClick={() => handleSelectStudent(name)}
                                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col items-center gap-6"
                            >
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-[2rem] flex items-center justify-center text-blue-600 text-3xl font-black group-hover:scale-110 transition-transform">
                                    {name.charAt(0)}
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{name}</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Ver Dashboard</p>
                                </div>
                                <ChevronRight className="text-slate-200 group-hover:text-blue-500 transition-colors" />
                            </button>
                        ))}
                    </div>

                    {filteredStudents.length === 0 && (
                        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
                            <Users size={48} className="text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold">No se encontraron alumnos con ese nombre.</p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // VISTA 2: Dashboard del Alumno
    return (
        <div className="container-mobile py-10 lg:py-16 animate-fade-in pb-24">
            {/* Header con Botón Volver */}
            <header className="mb-12">
                <button 
                    onClick={() => setSelectedStudent(null)}
                    className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest mb-8 transition-colors"
                >
                    <ArrowLeft size={16} /> Volver al buscador
                </button>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-4 py-1.5 rounded-full bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-600/20">
                                {role === 'supervisora' ? 'Supervisión' : 'Terapeuta'} • Dashboard Alumno
                            </span>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-bold text-green-600 uppercase tracking-tighter">En vivo</span>
                            </div>
                        </div>
                        <h1 className="text-6xl font-black text-slate-900 tracking-tight mb-4">{selectedStudent}</h1>
                        <div className="flex items-center gap-4 text-slate-500 bg-white/50 w-fit px-4 py-2 rounded-2xl border border-slate-100 backdrop-blur-md">
                            <Calendar size={18} className="text-blue-500" />
                            <p className="text-sm font-bold capitalize">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                </div>
            </header>

            {loadingStudent ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-4" />
                    <p className="text-slate-400 font-bold">Obteniendo registros de {selectedStudent}...</p>
                </div>
            ) : (
                <>
                    {/* Metricas */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        <MetricsCard title="Programas Abiertos" value={studentMetrics?.abiertos ?? 0} icon={<Activity size={24} />} color="blue" />
                        <MetricsCard title="Metas Logradas" value={studentMetrics?.logrados ?? 0} icon={<CheckCircle2 size={24} />} color="green" />
                        <MetricsCard title="Total Criterios" value={studentMetrics?.total ?? 0} icon={<BookCopy size={24} />} color="purple" />
                        <MetricsCard title="Promedio Pre-Test" value={`${(studentMetrics?.promedio_pre ?? 0).toFixed(1)}%`} icon={<BarChart3 size={24} />} color="amber" numeric />
                        <MetricsCard title="Avance Post-Test" value={`${(studentMetrics?.promedio_post ?? 0).toFixed(1)}%`} icon={<TrendingUp size={24} />} color="emerald" numeric />
                        <MetricsCard title="Última Actividad" value="Hoy" icon={<Calendar size={24} />} color="indigo" />
                    </section>

                    {/* Tabla de Programas */}
                    <section className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-black text-slate-900">Programas Activos</h2>
                            <button className="hidden sm:flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors">
                                Exportar Reporte
                            </button>
                        </div>
                        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-2xl shadow-slate-200/40 overflow-hidden">
                            <ProgramsTable programs={studentPrograms} />
                        </div>
                    </section>
                </>
            )}
        </div>
    )
}
