import { Metadata } from 'next'
import Dashboard from '@/components/dashboard/Dashboard'

import { ErrorBoundary } from '@/components/ErrorBoundary'

export const metadata: Metadata = {
    title: 'Dashboard - Programas Terapéuticos',
    description: 'Panel de control y métricas de programas terapéuticos',
}

export default function DashboardPage() {
    return (
        <main className="min-h-screen">
            <ErrorBoundary fallback={(err) => <div className="p-10 m-10 bg-red-100 text-red-900 border border-red-500"><h2 className="text-xl bold">Error React:</h2><pre>{err.message}</pre><pre className="mt-4 break-all whitespace-pre-wrap">{err.stack}</pre></div>}>
                <Dashboard />
            </ErrorBoundary>
        </main>
    )
}
