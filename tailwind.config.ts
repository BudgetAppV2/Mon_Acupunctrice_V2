import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
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
        public: {
          'beige-bg': '#F5F0E8',
          'beige-light': '#FAF6EF',
          'beige-dark': '#EDE4D3',
          'beige-warm': '#E8DFD0',
          'taupe-section': '#D5CDBF',
          'text-dark': '#2C2A26',
          'text-medium': '#5C5852',
          'text-light': '#8A857C',
          'accent-taupe': '#8A9A7B',
          'accent-taupe-dark': '#6F8566',
          'accent-taupe-light': '#A8B59C',
          'accent-warm': '#B8694A',
          'accent-warm-soft': '#C47A58',
          'border-subtle': '#E5DFD2',
        },
      },
      fontFamily: {
        'public-serif': ['var(--font-public-serif)', 'Georgia', 'serif'],
        'public-sans': ['var(--font-public-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'public-sm': '0 1px 2px rgba(44, 42, 38, 0.04), 0 1px 3px rgba(44, 42, 38, 0.06)',
        'public-md': '0 4px 6px rgba(44, 42, 38, 0.05), 0 2px 4px rgba(44, 42, 38, 0.04)',
        'public-lg': '0 10px 15px rgba(44, 42, 38, 0.06), 0 4px 6px rgba(44, 42, 38, 0.04)',
        'public-photo': '0 20px 40px rgba(44, 42, 38, 0.12), 0 8px 16px rgba(44, 42, 38, 0.08)',
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
