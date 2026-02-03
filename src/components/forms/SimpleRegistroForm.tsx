'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

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
            const [estudiantesRes, programasRes] = await Promise.all([
                supabase.from('estudiantes').select('*').eq('activo', true).order('nombre'),
                supabase.from('programas_catalogo').select('*').order('nombre')
            ])

            setEstudiantes(estudiantesRes.data || [])
            setProgramas(programasRes.data || [])
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleProgramaChange(programaId: string) {
        const programa = programas.find(p => p.id === programaId)
        setSelectedPrograma(programa)
        setSelectedOcp(null)

        if (programaId) {
            const { data } = await supabase
                .from('programas_ocp')
                .select('*')
                .eq('programa_id', programaId)
                .order('numero_ocp')
            setOcps(data || [])
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

            const { error } = await (supabase.from('registros_programas') as any).insert([{
                estudiante: selectedEstudiante,
                programa: selectedPrograma.nombre,
                ocp: selectedOcp.numero_ocp,
                criterio: selectedOcp.criterio,
                estado: 'Abierto',
                fecha_inicio: guatemalaDate
            }])

            if (error) throw error

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
                    value={selectedPrograma?.id || ''}
                    onChange={(e) => handleProgramaChange(e.target.value)}
                    className="input w-full h-14 text-base font-medium"
                    required
                >
                    <option value="">-- Seleccionar programa --</option>
                    {programas.map(prog => (
                        <option key={prog.id} value={prog.id}>{prog.nombre}</option>
                    ))}
                </select>
            </div>

            {/* OCP */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                    Objetivo (OCP) <span className="text-red-500">*</span>
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
                    <option value="">-- Seleccionar OCP --</option>
                    {ocps.map(ocp => (
                        <option key={ocp.id} value={ocp.id}>
                            OCP {ocp.numero_ocp} - {ocp.criterio.substring(0, 50)}...
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
