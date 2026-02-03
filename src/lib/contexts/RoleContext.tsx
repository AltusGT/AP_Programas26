'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Rol } from '@/types'

interface RoleContextType {
    role: Rol
    setRole: (role: Rol) => void
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: React.ReactNode }) {
    const [role, setRoleState] = useState<Rol>('terapeuta')

    // Load role from localStorage on mount
    useEffect(() => {
        const savedRole = localStorage.getItem('app-role') as Rol
        if (savedRole && (savedRole === 'terapeuta' || savedRole === 'supervisora')) {
            setRoleState(savedRole)
        }
    }, [])

    const setRole = (newRole: Rol) => {
        setRoleState(newRole)
        localStorage.setItem('app-role', newRole)
    }

    return (
        <RoleContext.Provider value={{ role, setRole }}>
            {children}
        </RoleContext.Provider>
    )
}

export function useRole() {
    const context = useContext(RoleContext)
    if (context === undefined) {
        throw new Error('useRole must be used within a RoleProvider')
    }
    return context
}
