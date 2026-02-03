'use client'

import React from 'react'

interface FormSectionProps {
    title: string
    isRequired?: boolean
    defaultExpanded?: boolean
    children: React.ReactNode
}

export default function FormSection({
    title,
    isRequired = false,
    defaultExpanded = true,
    children
}: FormSectionProps) {
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)

    return (
        <div className="card mb-4">
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full text-left"
            >
                <h3 className="text-base font-open-sans font-semibold text-slate-900">
                    {title}
                    {isRequired && <span className="text-red-500 ml-1">*</span>}
                </h3>
                <svg
                    width="24"
                    height="24"
                    style={{ width: '20px', height: '20px' }}
                    className={`w-5 h-5 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isExpanded && (
                <div className="mt-4 space-y-4">
                    {children}
                </div>
            )}
        </div>
    )
}
