'use client'

import React, { useEffect, useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registroSchema, defaultValues, type RegistroFormData } from '@/lib/validations/registro'
import { supabase } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import FormSection from './FormSection'
import PercentageInput from './PercentageInput'

interface RegistroFormProps {
    initialData?: Partial<RegistroFormData>
    onSubmit: (data: RegistroFormData) => Promise<void>
    onCancel: () => void
}

export default function RegistroForm({
    initialData,
    onSubmit,
    onCancel
}: RegistroFormProps) {
    const [estudiantes, setEstudiantes] = useState<Array<{ id: string; nombre: string }>>([])
    const [programas, setProgramas] = useState<Array<{ id: string; nombre: string }>>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isDirty }
    } = useForm<RegistroFormData>({
        resolver: zodResolver(registroSchema) as any,
        defaultValues: (initialData || defaultValues) as any
    })

    // Auto-completar criterio cuando cambia programa u OCP
    const selectedProgramaNombre = watch('programa')
    const selectedOcpNumero = watch('ocp')

    useEffect(() => {
        async function fetchCriterion() {
            if (!selectedProgramaNombre || !selectedOcpNumero) return

            try {
                // 1. Obtener ID del programa desde el catálogo
                // Usamos 'as any' temporalmente debido a discrepancias en la inferencia de tipos genéricos
                const { data: prog } = await (supabase
                    .from('programas_catalogo') as any)
                    .select('id')
                    .eq('nombre', selectedProgramaNombre)
                    .single()

                if (prog) {
                    // 2. Obtener el criterio específico para ese OCP
                    const { data: ocpData } = await (supabase
                        .from('programas_ocp') as any)
                        .select('criterio')
                        .eq('programa_id', prog.id)
                        .eq('numero_ocp', selectedOcpNumero)
                        .single()

                    if (ocpData) {
                        setValue('criterio', ocpData.criterio, { shouldDirty: true })
                    }
                }
            } catch (error) {
                console.error('Error fetching criterion:', error)
            }
        }

        fetchCriterion()
    }, [selectedProgramaNombre, selectedOcpNumero, setValue])

    // Reset form when initialData changes
    useEffect(() => {
        if (initialData) {
            reset(initialData)
        }
    }, [initialData, reset])

    // Cargar estudiantes y programas
    useEffect(() => {
        async function fetchData() {
            setIsLoading(true)
            try {
                // Fetch estudiantes
                const { data: estudiantesData, error: estudiantesError } = await supabase
                    .from('estudiantes')
                    .select('id, nombre')
                    .order('nombre')

                if (estudiantesError) throw estudiantesError

                // Fetch programas
                const { data: programasData, error: programasError } = await supabase
                    .from('programas_catalogo')
                    .select('id, nombre')
                    .order('nombre')

                if (programasError) throw programasError

                setEstudiantes(estudiantesData || [])
                setProgramas(programasData || [])
            } catch (error) {
                console.error('Error loading data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    // Auto-guardado en localStorage
    const formData = watch()
    useEffect(() => {
        const interval = setInterval(() => {
            if (isDirty) {
                localStorage.setItem('registro_draft', JSON.stringify(formData))
            }
        }, 30000) // Cada 30 segundos

        return () => clearInterval(interval)
    }, [formData, isDirty])

    // Recuperar draft al cargar
    useEffect(() => {
        if (!initialData) {
            const draft = localStorage.getItem('registro_draft')
            if (draft) {
                // TODO: Mostrar modal para confirmar recuperación de draft
                console.log('Draft disponible:', draft)
            }
        }
    }, [initialData])

    const handleFormSubmit = async (data: RegistroFormData) => {
        setIsSaving(true)
        try {
            await onSubmit(data)
            // Limpiar draft después de guardar exitosamente
            localStorage.removeItem('registro_draft')
        } catch (error) {
            console.error('Error submitting form:', error)
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="spinner" />
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit(((data) => handleFormSubmit(data)) as SubmitHandler<RegistroFormData>)} className="space-y-4">
            {/* Información Básica */}
            <FormSection title="Información Básica" isRequired defaultExpanded>
                {/* Estudiante */}
                <div>
                    <label htmlFor="estudiante" className="block text-sm font-medium text-slate-700 mb-1">
                        Estudiante <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="estudiante"
                        style={{ minHeight: '44px' }}
                        className={`input w-full ${errors.estudiante ? 'border-red-500' : ''}`}
                        {...register('estudiante')}
                    >
                        <option value="">Seleccionar estudiante...</option>
                        {estudiantes.map(est => (
                            <option key={est.id} value={est.nombre}>
                                {est.nombre}
                            </option>
                        ))}
                    </select>
                    {errors.estudiante && (
                        <p className="mt-1 text-sm text-red-600">{errors.estudiante.message}</p>
                    )}
                </div>

                {/* Programa */}
                <div>
                    <label htmlFor="programa" className="block text-sm font-medium text-slate-700 mb-1">
                        Programa <span className=" text-red-500">*</span>
                    </label>
                    <select
                        id="programa"
                        style={{ minHeight: '44px' }}
                        className={`input w-full ${errors.programa ? 'border-red-500' : ''}`}
                        {...register('programa')}
                    >
                        <option value="">Seleccionar programa...</option>
                        {programas.map(prog => (
                            <option key={prog.id} value={prog.nombre}>
                                {prog.nombre}
                            </option>
                        ))}
                    </select>
                    {errors.programa && (
                        <p className="mt-1 text-sm text-red-600">{errors.programa.message}</p>
                    )}
                </div>

                {/* OCP */}
                <div>
                    <label htmlFor="ocp" className="block text-sm font-medium text-slate-700 mb-1">
                        OCP (Objetivo a Corto Plazo) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        id="ocp"
                        min="1"
                        step="1"
                        placeholder="10"
                        className={`input w-full text-numeric ${errors.ocp ? 'border-red-500' : ''}`}
                        {...register('ocp')}
                    />
                    {errors.ocp && (
                        <p className="mt-1 text-sm text-red-600">{errors.ocp.message}</p>
                    )}
                </div>

                {/* Criterio */}
                <div>
                    <label htmlFor="criterio" className="block text-sm font-medium text-slate-700 mb-1">
                        Criterio <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="criterio"
                        rows={3}
                        placeholder="Descripción del criterio de éxito del programa..."
                        className={`input w-full ${errors.criterio ? 'border-red-500' : ''}`}
                        {...register('criterio')}
                    />
                    {errors.criterio && (
                        <p className="mt-1 text-sm text-red-600">{errors.criterio.message}</p>
                    )}
                </div>

                {/* Fecha Inicio */}
                <div>
                    <label htmlFor="fecha_inicio" className="block text-sm font-medium text-slate-700 mb-1">
                        Fecha de Inicio <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        id="fecha_inicio"
                        className={`input w-full ${errors.fecha_inicio ? 'border-red-500' : ''}`}
                        {...register('fecha_inicio')}
                    />
                    {errors.fecha_inicio && (
                        <p className="mt-1 text-sm text-red-600">{errors.fecha_inicio.message}</p>
                    )}
                </div>

                {/* Pre-Test */}
                <PercentageInput
                    name="pre_test"
                    label="Pre-Test"
                    register={register}
                    error={errors.pre_test}
                    placeholder="Opcional"
                />
            </FormSection>

            {/* Finalización */}
            <FormSection title="Finalización" defaultExpanded={false}>
                {/* Fecha Final */}
                <div>
                    <label htmlFor="fecha_final" className="block text-sm font-medium text-slate-700 mb-1">
                        Fecha Final
                    </label>
                    <input
                        type="date"
                        id="fecha_final"
                        className={`input w-full ${errors.fecha_final ? 'border-red-500' : ''}`}
                        {...register('fecha_final')}
                    />
                    {errors.fecha_final && (
                        <p className="mt-1 text-sm text-red-600">{errors.fecha_final.message}</p>
                    )}
                </div>

                {/* Post-Test */}
                <PercentageInput
                    name="post_test"
                    label="Post-Test"
                    register={register}
                    error={errors.post_test}
                    placeholder="Opcional"
                />

                {/* Estado */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Estado del Programa
                    </label>
                    <div className="flex gap-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="Abierto"
                                className="mr-2"
                                {...register('estado')}
                            />
                            <span className="text-sm">Abierto</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="Logrado"
                                className="mr-2"
                                {...register('estado')}
                            />
                            <span className="text-sm">Logrado</span>
                        </label>
                    </div>
                </div>
            </FormSection>

            {/* Generalizaciones */}
            <FormSection title="Generalizaciones" defaultExpanded={false}>
                {/* G1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="fecha_g1" className="block text-sm font-medium text-slate-700 mb-1">
                            Fecha G1
                        </label>
                        <input
                            type="date"
                            id="fecha_g1"
                            className={`input w-full ${errors.fecha_g1 ? 'border-red-500' : ''}`}
                            {...register('fecha_g1')}
                        />
                        {errors.fecha_g1 && (
                            <p className="mt-1 text-sm text-red-600">{errors.fecha_g1.message}</p>
                        )}
                    </div>
                    <PercentageInput
                        name="resultado_g1"
                        label="Resultado G1"
                        register={register}
                        error={errors.resultado_g1}
                        placeholder="Opcional"
                    />
                </div>

                {/* G2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="fecha_g2" className="block text-sm font-medium text-slate-700 mb-1">
                            Fecha G2
                        </label>
                        <input
                            type="date"
                            id="fecha_g2"
                            className={`input w-full ${errors.fecha_g2 ? 'border-red-500' : ''}`}
                            {...register('fecha_g2')}
                        />
                        {errors.fecha_g2 && (
                            <p className="mt-1 text-sm text-red-600">{errors.fecha_g2.message}</p>
                        )}
                    </div>
                    <PercentageInput
                        name="resultado_g2"
                        label="Resultado G2"
                        register={register}
                        error={errors.resultado_g2}
                        placeholder="Opcional"
                    />
                </div>

                {/* G3 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="fecha_g3" className="block text-sm font-medium text-slate-700 mb-1">
                            Fecha G3
                        </label>
                        <input
                            type="date"
                            id="fecha_g3"
                            className={`input w-full ${errors.fecha_g3 ? 'border-red-500' : ''}`}
                            {...register('fecha_g3')}
                        />
                        {errors.fecha_g3 && (
                            <p className="mt-1 text-sm text-red-600">{errors.fecha_g3.message}</p>
                        )}
                    </div>
                    <PercentageInput
                        name="resultado_g3"
                        label="Resultado G3"
                        register={register}
                        error={errors.resultado_g3}
                        placeholder="Opcional"
                    />
                </div>
            </FormSection>

            {/* Sticky Footer con Botones */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 -mx-4 -mb-4 mt-6 flex gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn btn-outline flex-1"
                    disabled={isSaving}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <>
                            <div className="spinner-sm mr-2" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <svg width="20" height="20" style={{ width: '20px', height: '20px' }} className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Guardar
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}
