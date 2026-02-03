import { Metadata } from 'next'
import Dashboard from '@/components/dashboard/Dashboard'

export const metadata: Metadata = {
    title: 'Dashboard - Programas Terapéuticos',
    description: 'Panel de control y métricas de programas terapéuticos',
}

export default function DashboardPage() {
    return (
        <main className="min-h-screen">
            <Dashboard />
        </main>
    )
}
