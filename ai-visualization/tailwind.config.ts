import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: {
      'primary': {
        DEFAULT: '#0a153b',
        50: '#d3d8e8',
        100: '#aeb7d6',
        200: '#8491bd',
        500: '#263770',
        800: '#0a153b',
        900: '#030b26',
        950: '#010617'
      },
      'secondary': {
        DEFAULT: '#074f6b',
        50: '#d1e1e8',
        100: '#a5cad9',
        200: '#77abbf',
        500: '#263770',
        800: '#074f6b',
        900: '#032938',
        950: '#011117'
      },
      'accent': {
        DEFAULT: '#6504db',
        200: '#a074d6',
        800: '#6504db'
      },
      'danger': {
        DEFAULT: '#690a00', 
        50: '#e8ccca',
        100: '#e3aba6',
        200: '#d99089',
        500: '#c43427',
        800: '#690a00',
        900: '#3d0600',
        950: '#210300'
      }/*,
      'primary-bg': '#d5dff0',
      'secondary-bg': '#c5d8f0',
      'primary-dark': '#bfc7e3',
      'secondary-dark': '#a4c4de',
      'accent-dark': '#a67ddb',
      'primary-bg-dark': '#060c24',
      'secondary-bg-dark': '#091729'*/
    },
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config
