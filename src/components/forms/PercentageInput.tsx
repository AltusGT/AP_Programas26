'use client'

import React from 'react'
import { UseFormRegister, FieldError } from 'react-hook-form'
import { RegistroFormData } from '@/lib/validations/registro'

interface PercentageInputProps {
    name: keyof RegistroFormData
    label: string
    register: UseFormRegister<RegistroFormData>
    error?: FieldError
    required?: boolean
    placeholder?: string
}

export default function PercentageInput({
    name,
    label,
    register,
    error,
    required = false,
    placeholder = '0.0'
}: PercentageInputProps) {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
                <input
                    type="number"
                    id={name}
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder={placeholder}
                    className={`input w-full pr-12 text-numeric ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
                    {...register(name)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-slate-500 text-sm">%</span>
                </div>
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600">{error.message}</p>
            )}
        </div>
    )
}
