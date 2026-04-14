/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'export', // Necesario para exportación estática en GitHub Pages
    basePath: '/AP_Programas26', // Nombre del repositorio en GitHub
    trailingSlash: true, // Mejora la compatibilidad de rutas en hosts estáticos

    // Image optimization - GitHub Pages no soporta optimización dinámica de imágenes de Next.js
    images: {
        unoptimized: true,
    },

    // Environment variables
    env: {
        NEXT_PUBLIC_GAS_URL: process.env.NEXT_PUBLIC_GAS_URL,
    },
}

module.exports = nextConfig
