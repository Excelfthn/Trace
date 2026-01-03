/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                monster: {
                    bg: '#050505',
                    surface: '#121212',
                    text: '#EAEAEA',
                },
                trace: {
                    ghost: '#6B7280', // Gray-500
                    dim: 'rgba(107, 114, 128, 0.4)',
                },
                scar: {
                    red: '#FF0033', // Aggressive Red
                    dark: '#3d000c',
                },
                gap: {
                    neon: '#00F0FF', // Cyber Blue
                    glow: 'rgba(0, 240, 255, 0.1)',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'thud': 'thud 0.3s cubic-bezier(.36,.07,.19,.97) both',
                'pulse-error': 'pulse-error 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'ghost-fade': 'ghost-fade 1s ease-out forwards',
            },
            keyframes: {
                thud: {
                    '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
                    '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
                    '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
                    '40%, 60%': { transform: 'translate3d(4px, 0, 0)' }
                },
                'pulse-error': {
                    '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0px rgba(255, 0, 51, 0.7)' },
                    '50%': { opacity: '.8', boxShadow: '0 0 0 10px rgba(255, 0, 51, 0)' }
                },
                'ghost-fade': {
                    '0%': { opacity: '1', filter: 'grayscale(0)' },
                    '100%': { opacity: '0.4', filter: 'grayscale(100%)' }
                }
            }
        },
    },
    plugins: [],
}
