'use client'

import React, { useState } from 'react'
import type { ProgramaActivo } from '@/types'
import { Eye, Edit, CheckCircle } from 'lucide-react'
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
            const date = new Date(dateString)
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
            <div className="card text-center py-12">
                <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-heading-3 font-open-sans text-slate-600 mb-2">
                    No hay programas activos
                </h3>
                <p className="text-body text-slate-500">
                    Los programas abiertos aparecerán aquí
                </p>
            </div>
        )
    }

    return (
        <>
            {/* Mobile Cards View */}
            <div className="lg:hidden space-y-3">
                {sortedPrograms.map((program, index) => (
                    <div
                        key={`${program.estudiante}-${program.programa}-${index}`}
                        className="card hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h3 className="font-open-sans font-semibold text-slate-900 mb-1">
                                    {program.estudiante}
                                </h3>
                                <p className="text-body-sm text-slate-600">
                                    {program.programa}
                                </p>
                            </div>
                            <span className="badge badge-info ml-2">
                                OCP {program.ocp}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-caption mb-1">Criterio</p>
                                <p className="text-body-sm text-slate-900 truncate">
                                    {program.criterio}
                                </p>
                            </div>
                            <div>
                                <p className="text-caption mb-1">Inicio</p>
                                <p className="text-body-sm text-slate-900">
                                    {formatDate(program.fecha_inicio)}
                                </p>
                            </div>
                            <div>
                                <p className="text-caption mb-1">Pre-Test</p>
                                <p className="text-numeric text-body-sm text-slate-900">
                                    {formatPercentage(program.pre_test)}
                                </p>
                            </div>
                            <div>
                                <p className="text-caption mb-1">Promedio G</p>
                                <p className="text-numeric text-body-sm text-slate-900">
                                    {formatPercentage(program.promedio_generalizacion)}
                                </p>
                            </div>
                        </div>

                        {/* Generalization Sessions */}
                        {(program.resultado_g1 || program.resultado_g2 || program.resultado_g3) && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                                <p className="text-caption mb-2">Sesiones de Generalización</p>
                                <div className="flex gap-2">
                                    {program.resultado_g1 && (
                                        <span className="badge badge-success">
                                            G1: {formatPercentage(program.resultado_g1)}
                                        </span>
                                    )}
                                    {program.resultado_g2 && (
                                        <span className="badge badge-success">
                                            G2: {formatPercentage(program.resultado_g2)}
                                        </span>
                                    )}
                                    {program.resultado_g3 && (
                                        <span className="badge badge-success">
                                            G3: {formatPercentage(program.resultado_g3)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block card overflow-hidden">
                <div className="scroll-container">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th
                                    className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                                    onClick={() => handleSort('estudiante')}
                                >
                                    Estudiante
                                    {sortField === 'estudiante' && (
                                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                                    onClick={() => handleSort('programa')}
                                >
                                    Programa
                                    {sortField === 'programa' && (
                                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                    OCP
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                    Criterio
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                                    onClick={() => handleSort('fecha_inicio')}
                                >
                                    Inicio
                                    {sortField === 'fecha_inicio' && (
                                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                    Pre-Test
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                    G1
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                    G2
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                    G3
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                    Promedio
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {sortedPrograms.map((program, index) => (
                                <tr
                                    key={`${program.estudiante}-${program.programa}-${index}`}
                                    className="hover:bg-slate-50 transition-colors"
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                        {program.estudiante}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-700">
                                        {program.programa}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        <span className="badge badge-info text-xs">
                                            {program.ocp}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate">
                                        {program.criterio}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-700">
                                        {formatDate(program.fecha_inicio)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-numeric text-center text-slate-900">
                                        {formatPercentage(program.pre_test)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-numeric text-center text-slate-900">
                                        {formatPercentage(program.resultado_g1)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-numeric text-center text-slate-900">
                                        {formatPercentage(program.resultado_g2)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-numeric text-center text-slate-900">
                                        {formatPercentage(program.resultado_g3)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-numeric text-center">
                                        <span className={`font-semibold ${program.promedio_generalizacion && program.promedio_generalizacion >= 80
                                            ? 'text-green-600'
                                            : program.promedio_generalizacion && program.promedio_generalizacion >= 60
                                                ? 'text-amber-600'
                                                : 'text-slate-900'
                                            }`}>
                                            {formatPercentage(program.promedio_generalizacion)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                className="p-1 hover:bg-blue-50 rounded text-blue-600 transition-colors"
                                                title="Ver detalles"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <Link
                                                href={`/registro?id=${program.id}`}
                                                className="p-1 hover:bg-amber-50 rounded text-amber-600 transition-colors"
                                                title="Editar registro"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </Link>
                                            <button
                                                className="p-1 hover:bg-green-50 rounded text-green-600 transition-colors"
                                                title="Cerrar programa"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}
