'use client'

import React, { useState } from 'react'
import type { ProgramaActivo } from '@/types'
import { Eye, Edit, CheckCircle, ChevronDown, ChevronUp, Target, Award, Clock } from 'lucide-react'
import Link from 'next/link'

interface ProgramsTableProps {
    programs: ProgramaActivo[]
}

export default function ProgramsTable({ programs }: ProgramsTableProps) {
    const [sortField, setSortField] = useState<keyof ProgramaActivo>('fecha_inicio')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

    const handleSort = (field: keyof ProgramaActivo) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    const sortedPrograms = [...programs].sort((a, b) => {
        const aValue = a[sortField]
        const bValue = b[sortField]

        if (aValue == null) return 1
        if (bValue == null) return -1

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortDirection === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue)
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortDirection === 'asc'
                ? aValue - bValue
                : bValue - aValue
        }

        return 0
    })

    const formatDate = (dateString: any) => {
        try {
            if (!dateString) return 'Sin fecha'
            // Manejar fechas de Sheets que a veces vienen como strings "DD/MM/YYYY" o objetos Date
            let date: Date
            if (typeof dateString === 'string') {
                const parts = dateString.split('/')
                if (parts.length === 3) {
                    date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
                } else {
                    date = new Date(dateString)
                }
            } else {
                date = new Date(dateString)
            }

            if (isNaN(date.getTime())) return 'Fecha inválida'
            
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            })
        } catch (e) {
            return 'Error fecha'
        }
    }

    const formatPercentage = (value: any) => {
        if (value == null || value === '' || isNaN(Number(value))) return '-'
        return `${Number(value).toFixed(1)}%`
    }

    if (programs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-inner">
                    <Clock className="text-slate-300" size={48} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    Sin programas activos
                </h3>
                <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                    No se encontraron registros para los filtros seleccionados. Los programas abiertos y logrados del alumno aparecerán aquí.
                </p>
            </div>
        )
    }

    return (
        <div className="w-full">
            {/* Mobile Cards View */}
            <div className="lg:hidden p-4 space-y-4">
                {sortedPrograms.map((program, index) => (
                    <div
                        key={`${program.estudiante}-${program.programa}-${index}`}
                        className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-1">
                                    {String(program.estudiante || 'N/A')}
                                </span>
                                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                                    {String(program.programa || 'Sin Título')}
                                </h3>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                                    program.estado === 'Logrado' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                    {String(program.estado || 'Abierto')}
                                </span>
                                <span className="text-xs font-bold text-slate-400">OCP {program.ocp || '-'}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Pre-Test</p>
                                <p className="font-bold text-slate-900">{formatPercentage(program.pre_test)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Post-Test</p>
                                <p className={`font-bold ${program.post_test ? 'text-emerald-600' : 'text-slate-300'}`}>
                                    {formatPercentage(program.post_test)}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Generalización</p>
                                <p className="font-bold text-slate-900">{formatPercentage(program.promedio_generalizacion)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">F. Inicio</p>
                                <p className="text-xs font-bold text-slate-600">{formatDate(program.fecha_inicio)}</p>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex -space-x-1">
                                {[program.resultado_g1, program.resultado_g2, program.resultado_g3].map((g, i) => (
                                    g !== null && (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600" title={`G${i+1}`}>
                                            G{i+1}
                                        </div>
                                    )
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    href={`/registro?id=${program.id}`}
                                    className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                >
                                    <Edit size={18} />
                                </Link>
                                <button className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-green-50 hover:text-green-600 transition-colors">
                                    <CheckCircle size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            {[
                                { key: 'estudiante', label: 'Estudiante', align: 'left' },
                                { key: 'programa', label: 'Programa', align: 'left' },
                                { key: 'ocp', label: 'OCP', align: 'center' },
                                { key: 'fecha_inicio', label: 'Inicio', align: 'left' },
                                { key: 'pre_test', label: 'Pre-T', align: 'center' },
                                { key: 'post_test', label: 'Post-T', align: 'center' },
                                { key: 'promedio_generalizacion', label: 'G Avg', align: 'center' },
                                { key: 'estado', label: 'Estado', align: 'center' },
                            ].map((col) => (
                                <th
                                    key={col.key}
                                    className={`px-6 py-5 text-${col.align} text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] cursor-pointer hover:text-blue-600 transition-colors group`}
                                    onClick={() => handleSort(col.key as keyof ProgramaActivo)}
                                >
                                    <div className={`flex items-center ${col.align === 'center' ? 'justify-center' : ''} gap-2`}>
                                        {col.label}
                                        {sortField === col.key && (
                                            sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                        )}
                                    </div>
                                </th>
                            ))}
                            <th className="px-6 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {sortedPrograms.map((program, index) => (
                            <tr
                                key={`${program.estudiante}-${program.programa}-${index}`}
                                className="hover:bg-blue-50/30 transition-all duration-300 group"
                            >
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                            {String(program.estudiante || '??').substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="font-bold text-slate-900">{String(program.estudiante || 'Estudiante sin nombre')}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="max-w-[200px]">
                                        <p className="font-bold text-slate-800 leading-tight">{String(program.programa || 'Programa sin nombre')}</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">{String(program.criterio || 'Sin criterio')}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs ring-4 ring-white shadow-sm">
                                        {program.ocp || '-'}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Clock size={14} className="text-slate-300" />
                                        <span className="text-xs font-bold">{formatDate(program.fecha_inicio)}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <div className="inline-flex flex-col">
                                        <span className="text-xs font-black text-slate-900">{formatPercentage(program.pre_test)}</span>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Initial</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <div className="inline-flex flex-col">
                                        <span className={`text-xs font-black ${program.post_test ? 'text-emerald-600' : 'text-slate-300'}`}>
                                            {formatPercentage(program.post_test)}
                                        </span>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Result</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="flex -space-x-1.5 mr-2">
                                            {[program.resultado_g1, program.resultado_g2, program.resultado_g3].map((g, i) => (
                                                g !== null && (
                                                    <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-blue-500/10 flex items-center justify-center text-[8px] font-black text-blue-600" title={`G${i+1}`}>
                                                        {i+1}
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                        <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                                            Number(program.promedio_generalizacion) >= 80 ? 'bg-green-50 text-green-700' : 
                                            Number(program.promedio_generalizacion) >= 60 ? 'bg-amber-50 text-amber-700' : 'text-slate-400'
                                        }`}>
                                            {formatPercentage(program.promedio_generalizacion)}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                        program.estado === 'Logrado' 
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                            : 'bg-blue-50 text-blue-600 border border-blue-100'
                                    }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${program.estado === 'Logrado' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                                        {String(program.estado || 'Abierto')}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 hover:bg-white hover:shadow-md rounded-xl text-blue-600 transition-all">
                                            <Eye size={18} />
                                        </button>
                                        <Link
                                            href={`/registro?id=${program.id}`}
                                            className="p-2 hover:bg-white hover:shadow-md rounded-xl text-amber-600 transition-all"
                                        >
                                            <Edit size={18} />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
