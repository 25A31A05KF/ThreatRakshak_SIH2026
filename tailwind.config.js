/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        soc: {
          bg: '#070b14',
          'bg-2': '#0a0f1c',
          panel: '#0e1525',
          'panel-2': '#121a2e',
          border: '#1c2942',
          'border-bright': '#2a3f5f',
        },
        cyan: {
          DEFAULT: '#22d3ee',
          glow: '#22d3ee',
        },
        threat: {
          critical: '#ef4444',
          warning: '#f59e0b',
          normal: '#10b981',
          info: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scan-line': 'scan-line 3s linear infinite',
        'flow': 'flow 1.5s linear infinite',
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'flicker': 'flicker 0.15s ease-in-out',
        'spin-slow': 'spin 8s linear infinite',
        'ping-slow': 'ping-slow 2s cubic-bezier(0,0,0.2,1) infinite',
        'bounce-slow': 'bounce-slow 1.5s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 12px 0 rgba(34,211,238,0.4)' },
          '50%': { opacity: '0.7', boxShadow: '0 0 24px 2px rgba(34,211,238,0.7)' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'flow': {
          '0%': { strokeDashoffset: '20' },
          '100%': { strokeDashoffset: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'ping-slow': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0.5' },
          '50%': { transform: 'translateY(4px)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(34,211,238,0.3)',
        'glow-red': '0 0 20px rgba(239,68,68,0.4)',
        'glow-amber': '0 0 20px rgba(245,158,11,0.3)',
        'glow-green': '0 0 20px rgba(16,185,129,0.3)',
        'panel': '0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};
