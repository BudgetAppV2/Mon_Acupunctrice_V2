import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        sage: '#5C7A5F',
        sand: '#F5F1E9',
        'status-idea': '#3b82f6',
        'status-planned': '#eab308',
        'status-shot': '#f97316',
        'status-editing': '#a855f7',
        'status-ready': '#22c55e',
        'status-published': '#6b7280',
      },
      keyframes: {
        'slide-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
