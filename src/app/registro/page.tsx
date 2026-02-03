import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense } from 'react'
import TerapeutaFlow from '@/components/dashboard/TerapeutaFlow'

function RegistroContent() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Form Container */}
            <main className="container-mobile py-6">
                <TerapeutaFlow />
            </main>
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

