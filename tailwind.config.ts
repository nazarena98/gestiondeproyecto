import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-montserrat)', 'Montserrat', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#FF6B35',
          light: '#FFF1EB',
          dark: '#E85520',
          secondary: '#FF9500',
          accent: '#06B6D4',
        },
        sidebar: {
          DEFAULT: '#12152A',
          hover: '#1E2242',
          active: '#FF6B35',
        },
        canvas: '#F0F2F7',
        surface: {
          DEFAULT: '#FFFFFF',
          raised: '#F8FAFC',
        },
        status: {
          pending: '#94A3B8',
          'in-progress': '#3B82F6',
          'waiting-client': '#F59E0B',
          blocked: '#EF4444',
          'in-review': '#8B5CF6',
          completed: '#10B981',
          cancelled: '#6B7280',
        },
        client: {
          1: '#6366F1',
          2: '#EC4899',
          3: '#10B981',
          4: '#F59E0B',
          5: '#06B6D4',
          6: '#8B5CF6',
          7: '#F97316',
          8: '#14B8A6',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        dropdown: '0 10px 25px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        '4': '4px',
        '6': '6px',
        '10': '10px',
        '14': '14px',
      },
      fontSize: {
        '11': ['11px', { lineHeight: '1.3', letterSpacing: '0.04em' }],
        '13': ['13px', { lineHeight: '1.5' }],
      },
      keyframes: {
        'toast-slide-in': {
          from: { transform: 'translateX(calc(100% + 16px))', opacity: '0' },
          to:   { transform: 'translateX(0)',                  opacity: '1' },
        },
        'toast-slide-out': {
          from: { transform: 'translateX(0)',                  opacity: '1' },
          to:   { transform: 'translateX(calc(100% + 16px))', opacity: '0' },
        },
        'progress-shrink': {
          from: { width: '100%' },
          to:   { width: '0%' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
      animation: {
        'toast-in':  'toast-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'toast-out': 'toast-slide-out 0.3s ease-in forwards',
        shimmer:     'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
