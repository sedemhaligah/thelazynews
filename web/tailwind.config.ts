import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:              '#F7F8FA',
        surface:         '#FFFFFF',
        'surface-alt':   '#EFF1F5',
        border:          '#E2E5EB',
        primary:         '#0D0F14',
        body:            '#3A3D45',
        muted:           '#7B8190',
        accent:          '#0052FF',
        'accent-hover':  '#0041CC',
        'accent-light':  '#EBF0FF',
        ai:              '#7B2FFF',
        'ai-bg':         '#F3EEFF',
        tech:            '#0099CC',
        'tech-bg':       '#E6F6FB',
        economy:         '#00875A',
        'economy-bg':    '#E6F5F0',
        business:        '#CC5500',
        'business-bg':   '#FFF0E6',
        finance:         '#CC2936',
        'finance-bg':    '#FFF0F1',
      },
      fontFamily: {
        display: ['var(--font-sora)', 'Sora', 'sans-serif'],
        body:    ['var(--font-inter)', 'Inter', 'sans-serif'],
        mono:    ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm:   '6px',
        md:   '10px',
        lg:   '16px',
        full: '9999px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(0,0,0,0.05)',
        sm: '0 2px 8px rgba(0,0,0,0.06)',
        md: '0 4px 16px rgba(0,0,0,0.08)',
        lg: '0 8px 32px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
}

export default config
