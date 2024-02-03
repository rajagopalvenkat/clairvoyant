import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: {
      'primary': '#0a153b',
      'secondary': '#073e6b',
      'accent': '#6504db',
      'primary-bg': '#afbae3',
      'secondary-bg': '#c5d8f0',
      'primary-dark': '#bfc7e3',
      'secondary-dark': '#a4c4de',
      'accent-dark': '#a67ddb',
      'primary-bg-dark': '#060c24',
      'secondary-bg-dark': '#091729'
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
