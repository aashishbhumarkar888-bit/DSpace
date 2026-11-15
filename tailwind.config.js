/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#04070B',
        'surface-elevated': 'rgba(10, 16, 26, 0.78)',
        'border-hairline': 'rgba(0, 240, 255, 0.16)',
        'border-glow': 'rgba(0, 240, 255, 0.45)',
        cyan: {
          electric: '#00F0FF',
          400: '#22d3ee',
          500: '#00F0FF',
        },
        magenta: {
          phase: '#FF2A85',
        },
        amber: {
          dielectric: '#FFB800',
        },
        crimson: {
          anomaly: '#FF1E56',
        },
        emerald: {
          recovery: '#00E676',
        },
      },
      fontFamily: {
        sans: ['"Inter"', '"Space Grotesk"', 'sans-serif'],
        display: ['"Space Grotesk"', '"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(0, 240, 255, 0.25), 0 0 30px rgba(0, 240, 255, 0.1)',
        'glow-magenta': '0 0 15px rgba(255, 42, 133, 0.25), 0 0 30px rgba(255, 42, 133, 0.1)',
        'glow-crimson': '0 0 15px rgba(255, 30, 86, 0.35), 0 0 30px rgba(255, 30, 86, 0.15)',
        'glow-amber': '0 0 15px rgba(255, 184, 0, 0.25), 0 0 30px rgba(255, 184, 0, 0.1)',
        'glow-emerald': '0 0 15px rgba(0, 230, 118, 0.25), 0 0 30px rgba(0, 230, 118, 0.1)',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
      },
    },
  },
  plugins: [],
}

