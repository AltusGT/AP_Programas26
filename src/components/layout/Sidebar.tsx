'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, PlusCircle, Users, BookOpen, UserCircle, Shield, User as UserIcon } from 'lucide-react'
import { useRole } from '@/lib/contexts/RoleContext'

const NAV_ITEMS = [
    {
        label: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
        color: 'text-blue-600'
    },
    {
        label: 'Nuevo Registro',
        href: '/registro',
        icon: PlusCircle,
        color: 'text-emerald-600'
    },
    {
        label: 'Estudiantes',
        href: '/estudiantes',
        icon: Users,
        color: 'text-purple-600'
    },
    {
        label: 'Catálogo',
        href: '/programas',
        icon: BookOpen,
        color: 'text-amber-600'
    }
]

export default function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname()
    const { role, setRole } = useRole()

    return (
        <aside className={`w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 hidden lg:flex ${className}`}>
            <div className="p-8 flex-1 flex flex-col">
                <div className="mb-10 flex justify-start px-4">
                    <img src="/AP_Programas26/logo.png" alt="Altus" className="w-32 h-auto object-contain" />
                </div>

                <nav className="space-y-2 flex-1">
                    {NAV_ITEMS.map((item) => {
                        const active = pathname === item.href
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 group ${active
                                    ? 'bg-blue-50 text-blue-700 shadow-sm shadow-blue-100/50'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                {active && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                                )}
                                <Icon size={20} className={`transition-colors duration-300 ${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                <span className="relative z-10">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Role Selector Dashboard */}
                <div className="mt-8 pt-8 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-4 text-center">Modo de Vista</p>
                    <div className="bg-slate-50 p-1 rounded-2xl border border-slate-100 flex flex-col gap-1">
                        <button
                            onClick={() => setRole('terapeuta')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 relative overflow-hidden group ${role === 'terapeuta'
                                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                                }`}
                        >
                            {role === 'terapeuta' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />}
                            <UserIcon size={16} className={role === 'terapeuta' ? 'text-blue-500' : 'text-slate-400'} />
                            Terapeuta
                        </button>
                        <button
                            onClick={() => setRole('supervisora')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 relative overflow-hidden group ${role === 'supervisora'
                                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                                }`}
                        >
                            {role === 'supervisora' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />}
                            <Shield size={16} className={role === 'supervisora' ? 'text-blue-500' : 'text-slate-400'} />
                            Supervisora
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm">
                            <UserCircle size={24} className="text-blue-600" />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900 leading-tight capitalize">{role}</p>
                        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Altus Centro</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
