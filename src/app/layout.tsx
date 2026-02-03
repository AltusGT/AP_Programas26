import type { Metadata, Viewport } from 'next'
import { Open_Sans, Roboto, Roboto_Mono } from 'next/font/google'
import './globals.css'

// Font configurations
const openSans = Open_Sans({
    subsets: ['latin'],
    weight: ['400', '600', '700'],
    variable: '--font-open-sans',
    display: 'swap',
})

const roboto = Roboto({
    subsets: ['latin'],
    weight: ['300', '400', '500', '700'],
    variable: '--font-roboto',
    display: 'swap',
})

const robotoMono = Roboto_Mono({
    subsets: ['latin'],
    weight: ['400', '500'],
    variable: '--font-roboto-mono',
    display: 'swap',
})

// Metadata for SEO and PWA
export const metadata: Metadata = {
    title: 'Programas Terapéuticos - Seguimiento y Registro',
    description: 'Sistema de registro y seguimiento de programas terapéuticos para terapeutas y supervisoras',
    keywords: ['terapia', 'programas', 'seguimiento', 'educación', 'ABA'],
    authors: [{ name: 'Altus Programas' }],
    applicationName: 'Programas Terapéuticos',
    generator: 'Next.js',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Programas',
    },
    formatDetection: {
        telephone: false,
    },
    openGraph: {
        type: 'website',
        siteName: 'Programas Terapéuticos',
        title: 'Programas Terapéuticos',
        description: 'Sistema de registro y seguimiento de programas terapéuticos',
    },
}

// Viewport configuration for PWA
export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: '#385da9', // Altus Blue
}

import NavigationWrapper from '@/components/layout/NavigationWrapper'
import { RoleProvider } from '@/lib/contexts/RoleContext'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html
            lang="es"
            className={`${openSans.variable} ${roboto.variable} ${robotoMono.variable}`}
        >
            <head>
                {/* PWA Meta Tags */}
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />

                {/* Favicon */}
                <link rel="icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" href="/logo.png" />
            </head>
            <body className="font-roboto antialiased min-h-screen bg-slate-50">
                <RoleProvider>
                    <NavigationWrapper>
                        {children}
                    </NavigationWrapper>
                </RoleProvider>
            </body>
        </html>
    )
}
