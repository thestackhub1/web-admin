import type { Config } from 'tailwindcss'

/**
 * The Stack Hub - Unified Color Palette
 * =====================================
 * Core colors derived from the logo design:
 * - Primary Blue #3B82F6 → Light #93C5FD (Franchising/Main Brand)
 * - Emerald #10B981 → Light #6EE7B7 (Growth/Education)
 * - Amber #F59E0B → Light #FCD34D (Construction/Highlights)
 * - Purple #8B5CF6 → Light #C4B5FD (Manufacturing/Insights)
 * - Neutrals: Dark #1F2937, Body #4B5563, Background #FFFFFF/#F8FAFC
 */

const config: Config = {
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/client/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // ==========================================
                // Core / Main Brand (Franchising) - Blue
                // ==========================================
                primary: {
                    DEFAULT: 'var(--color-primary)',
                    50: 'var(--color-primary-50)',
                    100: 'var(--color-primary-100)',
                    200: 'var(--color-primary-200)',
                    300: 'var(--color-primary-300)',
                    400: 'var(--color-primary-400)',
                    500: 'var(--color-primary-500)',
                    600: 'var(--color-primary-600)',
                    700: 'var(--color-primary-700)',
                    800: 'var(--color-primary-800)',
                    900: 'var(--color-primary-900)',
                },
                blue: {
                    DEFAULT: 'var(--color-primary)',
                    50: 'var(--color-primary-50)',
                    100: 'var(--color-primary-100)',
                    200: 'var(--color-primary-200)',
                    300: 'var(--color-primary-300)',
                    400: 'var(--color-primary-400)',
                    500: 'var(--color-primary-500)',
                    600: 'var(--color-primary-600)',
                    700: 'var(--color-primary-700)',
                    800: 'var(--color-primary-800)',
                    900: 'var(--color-primary-900)',
                },
                // ==========================================
                // Growth (Education) - Emerald/Success
                // ==========================================
                success: {
                    DEFAULT: 'var(--color-success)',
                    50: 'var(--color-success-50)',
                    100: 'var(--color-success-100)',
                    200: 'var(--color-success-200)',
                    300: 'var(--color-success-300)',
                    400: 'var(--color-success-400)',
                    500: 'var(--color-success-500)',
                    600: 'var(--color-success-600)',
                    700: 'var(--color-success-700)',
                    800: 'var(--color-success-800)',
                    900: 'var(--color-success-900)',
                },
                emerald: {
                    DEFAULT: 'var(--color-success)',
                    50: 'var(--color-success-50)',
                    100: 'var(--color-success-100)',
                    200: 'var(--color-success-200)',
                    300: 'var(--color-success-300)',
                    400: 'var(--color-success-400)',
                    500: 'var(--color-success-500)',
                    600: 'var(--color-success-600)',
                    700: 'var(--color-success-700)',
                    800: 'var(--color-success-800)',
                    900: 'var(--color-success-900)',
                },
                // ==========================================
                // Base (Construction) - Amber/Warning
                // ==========================================
                warning: {
                    DEFAULT: 'var(--color-warning)',
                    50: 'var(--color-warning-50)',
                    100: 'var(--color-warning-100)',
                    200: 'var(--color-warning-200)',
                    300: 'var(--color-warning-300)',
                    400: 'var(--color-warning-400)',
                    500: 'var(--color-warning-500)',
                    600: 'var(--color-warning-600)',
                    700: 'var(--color-warning-700)',
                    800: 'var(--color-warning-800)',
                    900: 'var(--color-warning-900)',
                },
                amber: {
                    DEFAULT: 'var(--color-warning)',
                    50: 'var(--color-warning-50)',
                    100: 'var(--color-warning-100)',
                    200: 'var(--color-warning-200)',
                    300: 'var(--color-warning-300)',
                    400: 'var(--color-warning-400)',
                    500: 'var(--color-warning-500)',
                    600: 'var(--color-warning-600)',
                    700: 'var(--color-warning-700)',
                    800: 'var(--color-warning-800)',
                    900: 'var(--color-warning-900)',
                },
                // ==========================================
                // Future (Manufacturing) - Purple/Insight
                // ==========================================
                insight: {
                    DEFAULT: 'var(--color-insight)',
                    50: 'var(--color-insight-50)',
                    100: 'var(--color-insight-100)',
                    200: 'var(--color-insight-200)',
                    300: 'var(--color-insight-300)',
                    400: 'var(--color-insight-400)',
                    500: 'var(--color-insight-500)',
                    600: 'var(--color-insight-600)',
                    700: 'var(--color-insight-700)',
                    800: 'var(--color-insight-800)',
                    900: 'var(--color-insight-900)',
                },
                purple: {
                    DEFAULT: 'var(--color-insight)',
                    50: 'var(--color-insight-50)',
                    100: 'var(--color-insight-100)',
                    200: 'var(--color-insight-200)',
                    300: 'var(--color-insight-300)',
                    400: 'var(--color-insight-400)',
                    500: 'var(--color-insight-500)',
                    600: 'var(--color-insight-600)',
                    700: 'var(--color-insight-700)',
                    800: 'var(--color-insight-800)',
                    900: 'var(--color-insight-900)',
                },
                // ==========================================
                // Neutrals
                // ==========================================
                neutral: {
                    DEFAULT: 'var(--color-neutral)',
                    50: 'var(--color-neutral-50)',
                    100: 'var(--color-neutral-100)',
                    200: 'var(--color-neutral-200)',
                    300: 'var(--color-neutral-300)',
                    400: 'var(--color-neutral-400)',
                    500: 'var(--color-neutral-500)',
                    600: 'var(--color-neutral-600)',
                    700: 'var(--color-neutral-700)',
                    800: 'var(--color-neutral-800)',
                    900: 'var(--color-neutral-900)',
                    950: 'var(--color-neutral-950)',
                },
                // ==========================================
                // Semantic Color Aliases
                // ==========================================
                danger: {
                    DEFAULT: 'var(--color-danger)',
                    50: 'var(--color-danger-50)',
                    500: 'var(--color-danger-500)',
                    600: 'var(--color-danger-600)',
                },
                rose: {
                    DEFAULT: 'var(--color-danger)',
                    50: 'var(--color-danger-50)',
                    500: 'var(--color-danger-500)',
                    600: 'var(--color-danger-600)',
                },
                red: {
                    DEFAULT: 'var(--color-danger)',
                    50: 'var(--color-danger-50)',
                    500: 'var(--color-danger-500)',
                    600: 'var(--color-danger-600)',
                },
            },
            backgroundImage: {
                // Solid gradients
                'gradient-primary': 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%)',
                'gradient-success': 'linear-gradient(135deg, var(--color-success-500) 0%, var(--color-success-600) 100%)',
                'gradient-warning': 'linear-gradient(135deg, var(--color-warning-500) 0%, var(--color-warning-600) 100%)',
                'gradient-insight': 'linear-gradient(135deg, var(--color-insight-500) 0%, var(--color-insight-600) 100%)',
                // Admin-specific: Professional blue-purple gradient for dashboards
                'gradient-subtle': 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-insight-500) 100%)',
                'gradient-admin': 'linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-insight-600) 100%)',
                // Hero/Background gradients
                'gradient-hero': 'linear-gradient(135deg, #FFFFFF 0%, var(--color-primary-50) 50%, var(--color-insight-50) 100%)',
                'gradient-hero-logo': 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-success-50) 25%, var(--color-warning-50) 50%, var(--color-insight-50) 100%)',
                // Sidebar hover gradients (blue to purple)
                'gradient-sidebar-hover': 'linear-gradient(90deg, var(--color-primary-50) 0%, var(--color-insight-50) 100%)',
                'gradient-sidebar-active': 'linear-gradient(90deg, var(--color-primary-100) 0%, var(--color-insight-100) 100%)',
            },
            boxShadow: {
                'glow-primary': '0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.1)',
                'glow-success': '0 0 20px rgba(16, 185, 129, 0.3), 0 0 40px rgba(16, 185, 129, 0.1)',
                'glow-warning': '0 0 20px rgba(245, 158, 11, 0.3), 0 0 40px rgba(245, 158, 11, 0.1)',
                'glow-insight': '0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1)',
                'glow-card': '0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
                'glow-card-hover': '0 8px 30px rgba(59, 130, 246, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.1)',
                'glow-logo': '0 0 30px rgba(59, 130, 246, 0.3), 0 0 60px rgba(16, 185, 129, 0.2), 0 0 90px rgba(245, 158, 11, 0.15), 0 0 120px rgba(139, 92, 246, 0.1)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'fade-in-up': 'fadeInUp 0.6s ease-out',
                'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
                'shimmer': 'shimmer 1.5s infinite',
                'glow-pulse': 'glowPulse 2s ease-in-out infinite',
                'sidebar-expand': 'sidebarExpand 0.3s ease-out',
                'sidebar-collapse': 'sidebarCollapse 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'pulse-subtle': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.85' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                glowPulse: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
                    '50%': { boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)' },
                },
                sidebarExpand: {
                    '0%': { width: '5rem' },
                    '100%': { width: '16rem' },
                },
                sidebarCollapse: {
                    '0%': { width: '16rem' },
                    '100%': { width: '5rem' },
                },
            },
        },
    },
    plugins: [],
}

export default config
