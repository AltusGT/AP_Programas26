'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Home, Users, Plus, LayoutGrid, User, Shield } from 'lucide-react'
import { useRole } from '@/lib/contexts/RoleContext'

const NAV_ITEMS = (role: string) => [
    {
        label: 'Inicio',
        href: '/',
        icon: Home
    },
    {
        label: 'Alumnos',
        href: '/estudiantes',
        icon: Users
    },
    {
        label: 'Nuevo',
        href: '/registro',
        isCenter: true,
        icon: Plus
    },
    {
        label: 'Programas',
        href: '/programas',
        icon: LayoutGrid
    },
    {
        label: role === 'terapeuta' ? 'Modo: Ter.' : 'Modo: Sup.',
        isRoleToggle: true,
        icon: role === 'terapeuta' ? User : Shield
    }
]

export default function BottomNav({ className }: { className?: string }) {
    const pathname = usePathname()
    const { role, setRole } = useRole()

    const handleRoleToggle = () => {
        setRole(role === 'terapeuta' ? 'supervisora' : 'terapeuta')
    }

    return (
        <nav className={`fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 px-6 pb-6 pt-2 z-50 lg:hidden shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] ${className}`}>
            <div className="flex justify-between items-end max-w-md mx-auto relative">
                {NAV_ITEMS(role).map((item, index) => {
                    const active = !item.isRoleToggle && pathname === item.href
                    const Icon = item.icon

                    const Content = (
                        <div className={`flex flex-col items-center select-none transition-all duration-200 ${item.isCenter ? 'relative' : 'p-2'}`}>
                            {item.isCenter ? (
                                <div className="bg-blue-600 text-white rounded-full p-4 -mt-10 shadow-lg shadow-blue-200 border-4 border-white flex items-center justify-center transition-transform active:scale-90">
                                    <Icon size={24} strokeWidth={3} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-1">
                                    <Icon
                                        size={22}
                                        className={`${active || (item.isRoleToggle && role === 'supervisora') ? 'text-blue-600' : 'text-slate-400'} transition-colors`}
                                        strokeWidth={active ? 2.5 : 2}
                                    />
                                    <span className={`text-[10px] font-bold ${active || (item.isRoleToggle && role === 'supervisora') ? 'text-blue-600' : 'text-slate-400'}`}>
                                        {item.label}
                                    </span>
                                    {active && (
                                        <div className="w-1 h-1 bg-blue-600 rounded-full mt-0.5"></div>
                                    )}
                                </div>
                            )}
                        </div>
                    )

                    if (item.isRoleToggle) {
                        return (
                            <button key="role-toggle" onClick={handleRoleToggle} className="flex flex-col items-center">
                                {Content}
                            </button>
                        )
                    }

                    return (
                        <Link
                            key={item.href || index}
                            href={item.href!}
                            className="flex flex-col items-center"
                        >
                            {Content}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
