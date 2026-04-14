'use client'

import React, { useState, useEffect } from 'react'
import { fetchBaseData, fetchCatalog, saveSession } from '@/lib/services/sheets'

interface SimpleRegistroFormProps {
    onSubmit: () => void
    onCancel: () => void
}

export default function SimpleRegistroForm({ onSubmit, onCancel }: SimpleRegistroFormProps) {
    const [estudiantes, setEstudiantes] = useState<any[]>([])
    const [programas, setProgramas] = useState<any[]>([])
    const [ocps, setOcps] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [selectedEstudiante, setSelectedEstudiante] = useState('')
    const [selectedPrograma, setSelectedPrograma] = useState<any>(null)
    const [selectedOcp, setSelectedOcp] = useState<any>(null)

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            setLoading(true)
            const [baseData, catalogData] = await Promise.all([
                fetchBaseData(),
                fetchCatalog()
            ])

            setEstudiantes(baseData.students.map((name: string) => ({ id: name, nombre: name })) || [])
            setProgramas(catalogData || [])
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleProgramaChange(nombre: string) {
        const programa = programas.find(p => p.nombre === nombre)
        setSelectedPrograma(programa)
        setSelectedOcp(null)

        if (programa && programa.criterios) {
            // Transformar criterios [string] a [{id, numero_ocp, criterio}]
            const criteriaList = programa.criterios.map((c: string, i: number) => ({
                id: `${nombre}-${i}`,
                numero_ocp: i + 1,
                criterio: c
            }))
            setOcps(criteriaList)
        } else {
            setOcps([])
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!selectedEstudiante || !selectedPrograma || !selectedOcp) {
            alert('Por favor completa todos los campos')
            return
        }

        setSaving(true)
        try {
            const guatemalaDate = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Guatemala' })

            // Formatear para el saveSession de Code.gs
            const sessionRecord = {
                idSesion: `SES-${Date.now()}`,
                fechaSesion: guatemalaDate,
                estudiante: selectedEstudiante,
                tipoRegistro: 'Terapéutico',
                materia: selectedPrograma.nombre,
                ocp: selectedOcp.numero_ocp,
                uac: 0,
                uai: 0,
                nivelAyuda: 'N/A',
                reforzador: 'N/A',
                programaReforzamiento: 'N/A'
            }

            await saveSession([sessionRecord])

            alert('✅ Programa asignado exitosamente')
            onSubmit()
        } catch (error: any) {
            console.error('Error:', error)
            alert(`❌ Error al asignar: ${error.message}`)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="spinner" />
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Estudiante */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                    Estudiante <span className="text-red-500">*</span>
                </label>
                <select
                    value={selectedEstudiante}
                    onChange={(e) => setSelectedEstudiante(e.target.value)}
                    className="input w-full h-14 text-base font-medium"
                    required
                >
                    <option value="">-- Seleccionar estudiante --</option>
                    {estudiantes.map(est => (
                        <option key={est.id} value={est.nombre}>{est.nombre}</option>
                    ))}
                </select>
            </div>

            {/* Programa */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                    Programa <span className="text-red-500">*</span>
                </label>
                <select
                    value={selectedPrograma?.nombre || ''}
                    onChange={(e) => handleProgramaChange(e.target.value)}
                    className="input w-full h-14 text-base font-medium"
                    required
                >
                    <option value="">-- Seleccionar programa --</option>
                    {programas.map(prog => (
                        <option key={prog.nombre} value={prog.nombre}>{prog.nombre}</option>
                    ))}
                </select>
            </div>

            {/* OCP */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                    Criterio <span className="text-red-500">*</span>
                </label>
                <select
                    value={selectedOcp?.id || ''}
                    onChange={(e) => {
                        const ocp = ocps.find(o => o.id === e.target.value)
                        setSelectedOcp(ocp)
                    }}
                    className="input w-full h-14 text-base font-medium"
                    disabled={!selectedPrograma}
                    required
                >
                    <option value="">-- Seleccionar criterio --</option>
                    {ocps.map(ocp => (
                        <option key={ocp.id} value={ocp.id}>
                            {ocp.numero_ocp} - {ocp.criterio.substring(0, 50)}...
                        </option>
                    ))}
                </select>
            </div>

            {/* Criterio Preview */}
            {selectedOcp && (
                <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-100">
                    <div className="flex gap-3">
                        <div className="w-1.5 bg-blue-500 rounded-full shrink-0" />
                        <div>
                            <p className="text-xs font-black text-blue-900/50 uppercase tracking-wider mb-2">
                                Criterio Completo:
                            </p>
                            <p className="text-sm text-blue-800 font-medium leading-relaxed">
                                {selectedOcp.criterio}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 h-14 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={saving || !selectedEstudiante || !selectedPrograma || !selectedOcp}
                    className="flex-1 h-14 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200"
                >
                    {saving ? 'Guardando...' : 'Asignar Programa'}
                </button>
            </div>
        </form>
    )
}
