'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense } from 'react'
import TerapeutaFlow from '@/components/dashboard/TerapeutaFlow'
import { PlusCircle, ClipboardCheck, ArrowLeft } from 'lucide-react'
import { useRole } from '@/lib/contexts/RoleContext'
import SimpleRegistroForm from '@/components/forms/SimpleRegistroForm'

function RegistroContent() {
    const { role } = useRole()
    const [mode, setMode] = React.useState<'choice' | 'session' | 'assignment'>('choice')

    if (mode === 'session') {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="container-mobile py-4 px-4">
                    <button onClick={() => setMode('choice')} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-4 font-bold">
                        <ArrowLeft size={20} /> Volver al menú
                    </button>
                    <TerapeutaFlow onAssignNew={() => setMode('assignment')} />
                </div>
            </div>
        )
    }

    if (mode === 'assignment') {
        return (
            <div className="min-h-screen bg-white">
                <div className="container-mobile py-6 max-w-2xl mx-auto px-4">
                    <button onClick={() => setMode('choice')} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-8 font-bold">
                        <ArrowLeft size={20} /> Volver al menú
                    </button>

                    <div className="mb-10">
                        <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Asignar Programa</h1>
                        <p className="text-slate-500 font-medium">Asocia un programa del catálogo a un niño específico.</p>
                    </div>

                    <SimpleRegistroForm
                        onSubmit={() => {
                            setMode('choice')
                            window.location.reload()
                        }}
                        onCancel={() => setMode('choice')}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg space-y-6">
                <div className="text-center mb-12 animate-fade-in">
                    <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">¿Qué deseas hacer?</h1>
                    <p className="text-slate-500 text-lg font-medium">Selecciona una acción para continuar</p>
                </div>

                <div className="grid grid-cols-1 gap-6 animate-slide-up">
                    <button
                        onClick={() => setMode('session')}
                        className="group bg-white p-8 rounded-[40px] border-2 border-transparent hover:border-blue-500 shadow-xl shadow-slate-200/50 transition-all flex items-center gap-8 text-left"
                    >
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner shrink-0">
                            <ClipboardCheck size={40} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-slate-900 group-hover:text-blue-700 mb-1">Nueva Sesión</h2>
                            <p className="text-slate-500 font-medium leading-tight">Registrar resultados de Pre-test, Post-test o G1-G3.</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setMode('assignment')}
                        className="group bg-white p-8 rounded-[40px] border-2 border-transparent hover:border-emerald-500 shadow-xl shadow-slate-200/50 transition-all flex items-center gap-8 text-left"
                    >
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner shrink-0">
                            <PlusCircle size={40} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-700 mb-1">Asignar Programa</h2>
                            <p className="text-slate-500 font-medium leading-tight">Vincular un nuevo criterio del catálogo a un niño.</p>
                        </div>
                    </button>

                    <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 flex gap-4 items-start">
                        <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-200">
                            <span className="font-black text-lg">!</span>
                        </div>
                        <p className="text-amber-800 text-sm font-medium leading-relaxed">
                            <span className="font-bold block mb-1 text-amber-900">Nota para Terapeutas:</span>
                            Si el programa que buscas no aparece en "Nueva Sesión", solicita a tu supervisora que lo asigne primero.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function RegistroPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="spinner" /></div>}>
            <RegistroContent />
        </Suspense>
    )
}
