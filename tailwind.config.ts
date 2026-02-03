import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                'open-sans': ['var(--font-open-sans)', 'sans-serif'],
                'roboto': ['var(--font-roboto)', 'sans-serif'],
                'roboto-mono': ['var(--font-roboto-mono)', 'monospace'],
            },
            colors: {
                altus: {
                    blue: '#385da9',
                    orange: '#faac3c',
                    red: '#e5442a',
                },
                primary: {
                    DEFAULT: '#385da9',
                    dark: '#2a4685',
                    light: '#5378c0',
                    lightest: '#e8eef9',
                },
                secondary: {
                    DEFAULT: '#faac3c',
                    dark: '#d98f1f',
                    light: '#ffc565',
                    lightest: '#fff5e5',
                },
                accent: {
                    DEFAULT: '#e5442a',
                    dark: '#c23318',
                    light: '#f06b56',
                    lightest: '#fee9e5',
                },
            },
            spacing: {
                'xs': '0.25rem',
                'sm': '0.5rem',
                'md': '1rem',
                'lg': '1.5rem',
                'xl': '2rem',
                '2xl': '3rem',
            },
            borderRadius: {
                'sm': '0.375rem',
                'md': '0.5rem',
                'lg': '0.75rem',
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
            boxShadow: {
                'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                'md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1)',
            },
            transitionDuration: {
                'fast': '150ms',
                'base': '300ms',
                'slow': '500ms',
            },
        },
    },
    plugins: [],
}

export default config
