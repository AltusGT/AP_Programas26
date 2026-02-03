'use client'

import React from 'react'

interface MetricsCardProps {
    title: string
    value: string | number
    icon: React.ReactNode
    color: 'blue' | 'green' | 'purple' | 'amber' | 'emerald' | 'indigo' | 'red' | 'orange'
    trend?: {
        value: number
        isPositive: boolean
    } | null
    numeric?: boolean
}

const colorClasses = {
    blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'text-[#385da9]', // Altus Blue
        iconBg: 'bg-blue-100',
        text: 'text-slate-900',
    },
    green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: 'text-green-600',
        iconBg: 'bg-green-100',
        text: 'text-slate-900',
    },
    purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        icon: 'text-purple-600',
        iconBg: 'bg-purple-100',
        text: 'text-slate-900',
    },
    amber: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: 'text-[#faac3c]', // Altus Orange
        iconBg: 'bg-amber-100',
        text: 'text-slate-900',
    },
    emerald: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        icon: 'text-emerald-600',
        iconBg: 'bg-emerald-100',
        text: 'text-slate-900',
    },
    indigo: {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        icon: 'text-indigo-600',
        iconBg: 'bg-indigo-100',
        text: 'text-slate-900',
    },
    red: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: 'text-[#e5442a]', // Altus Red
        iconBg: 'bg-red-100',
        text: 'text-slate-900',
    },
    orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        icon: 'text-[#faac3c]', // Altus Orange
        iconBg: 'bg-orange-100',
        text: 'text-slate-900',
    },
}

export default function MetricsCard({
    title,
    value,
    icon,
    color,
    trend,
    numeric = false,
}: MetricsCardProps) {
    const colors = colorClasses[color]

    return (
        <div className="card bg-white border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative group">
            <div className={`absolute top-0 left-0 w-full h-1 ${colors.bg.replace('bg-', 'bg-').replace('50', '500')}`} />
            <div className="flex items-start justify-between relative z-10">
                <div className="flex-1">
                    <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
                        {title}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <p className={`${numeric ? 'text-numeric' : 'font-open-sans'} text-3xl font-bold text-slate-900 leading-none mb-1 group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-600 transition-all`}>
                            {value}
                        </p>
                    </div>

                    {trend && (
                        <div className="mt-4 flex items-center gap-2 bg-slate-50 w-fit px-2 py-1 rounded-lg">
                            <span className={`text-xs font-bold flex items-center gap-0.5 ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                            </span>
                            <span className="text-[10px] font-medium text-slate-400">vs. mes ant.</span>
                        </div>
                    )}
                </div>

                <div className={`${colors.bg} p-3.5 rounded-2xl ${colors.icon} shadow-sm group-hover:scale-110 transition-transform duration-300 w-14 h-14 flex items-center justify-center flex-shrink-0`}>
                    {icon}
                </div>
            </div>
        </div>
    )
}
