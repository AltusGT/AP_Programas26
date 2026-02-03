'use client'

import React from 'react'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

interface NavigationWrapperProps {
    children: React.ReactNode
}

export default function NavigationWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar for Desktop */}
            <Sidebar className="hidden lg:flex" />

            <div className="flex-1 flex flex-col min-w-0">
                <main className="flex-1 pb-20 lg:pb-0">
                    {children}
                </main>

                {/* Bottom Nav for Mobile */}
                <BottomNav className="lg:hidden" />
            </div>
        </div>
    )
}
