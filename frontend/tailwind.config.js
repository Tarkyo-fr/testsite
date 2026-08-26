/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0D10',
        surface: '#14171B',
        surface2: '#1B1F24',
        line: '#262B31',
        flare: '#FF5A1F',
        flareDim: '#B5410F',
        signal: '#38E1C6',
        text: '#EDEFF2',
        muted: '#8A919C'
      },
      fontFamily: {
        display: ['"Rajdhani"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      backgroundImage: {
        scan: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 3px)'
      }
    }
  },
  plugins: []
};
