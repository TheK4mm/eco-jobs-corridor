import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Identidad verde del Corredor Ecológico (base en #2e7d32)
        brand: {
          50: '#f1f8f1',
          100: '#dcefdd',
          200: '#b9dfbb',
          300: '#8bc88f',
          400: '#57aa5d',
          500: '#2e7d32',
          600: '#266a2a',
          700: '#1f5623',
          800: '#1b4a1f',
          900: '#163d1a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
