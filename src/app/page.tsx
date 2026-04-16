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
            <ErrorBoundary>
                <Dashboard />
            </ErrorBoundary>
        </main>
    )
}
