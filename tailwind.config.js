/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        ivory: '#F6F2EC',
        sand: '#ECE5DA',
        ink: '#1C1A17',
        bronze: { DEFAULT: '#85663A', light: '#C9A774' },
        // Semantic tokens driven by CSS variables so dark mode is designed, not inverted.
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        raised: 'rgb(var(--raised) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-fg': 'rgb(var(--accent-fg) / <alpha-value>)',
        st: {
          new: 'rgb(var(--st-new) / <alpha-value>)',
          progress: 'rgb(var(--st-progress) / <alpha-value>)',
          done: 'rgb(var(--st-done) / <alpha-value>)',
          escalated: 'rgb(var(--st-escalated) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', '"Noto Naskh Arabic"', 'Georgia', 'serif'],
        sans: ['Rubik', '"Noto Naskh Arabic"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgb(28 26 23 / 0.04), 0 8px 24px -12px rgb(28 26 23 / 0.12)',
      },
    },
  },
  plugins: [],
};
