import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        xs: ['12px', '1.5'],
        sm: ['13px', '1.5'],
        base: ['14px', '1.5'],
        lg: ['16px', '1.4'],
        xl: ['20px', '1.3'],
        '2xl': ['28px', '1.2'],
        '3xl': ['40px', '1.2'],
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: 'var(--surface)',
        hover: 'var(--hover)',
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        'foreground-secondary': 'var(--foreground-secondary)',
        'foreground-tertiary': 'var(--foreground-tertiary)',
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          tint: 'var(--accent-tint)',
        },
        status: {
          indexed: 'var(--status-indexed)',
          processing: 'var(--status-processing)',
          failed: 'var(--status-failed)',
        },
        destructive: 'var(--status-failed)',
      },
      borderRadius: {
        lg: '8px',
        md: '6px',
        sm: '4px',
        xl: '12px',
        '2xl': '16px',
      },
      transitionDuration: {
        '150': '150ms',
      },
      maxWidth: {
        content: '1100px',
        chat: '760px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
