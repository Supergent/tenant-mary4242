import type { Config } from 'tailwindcss';

export const tailwindPreset = {
  content: [],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--color-primary-foreground)',
          emphasis: 'var(--color-primary-emphasis)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          foreground: 'var(--color-secondary-foreground)',
          emphasis: 'var(--color-secondary-emphasis)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          foreground: 'var(--color-accent-foreground)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          foreground: 'var(--color-success-foreground)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          foreground: 'var(--color-warning-foreground)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          foreground: 'var(--color-danger-foreground)',
        },
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        muted: 'var(--color-muted)',
        border: 'var(--color-border)',
        neutral: {
          DEFAULT: 'var(--color-surface)',
          foreground: 'var(--color-text-primary)',
          'foreground-secondary': 'var(--color-text-secondary)',
        },
      },
      fontFamily: {
        sans: ['var(--font-base)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'monospace'],
      },
      spacing: {
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)',
        md: 'var(--spacing-md)',
        lg: 'var(--spacing-lg)',
        xl: 'var(--spacing-xl)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
    },
  },
} satisfies Partial<Config>;

export default tailwindPreset;
