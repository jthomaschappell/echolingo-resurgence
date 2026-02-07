import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'palette-dark': '#24354C',
        'palette-terracotta': '#C04E3D',
        'palette-orange': '#DD7C3A',
        'palette-golden': '#F0BB54',
        'palette-cream': '#FDF8F0',
        'stripe-primary': '#DD7C3A',
        'stripe-dark': '#24354C',
        'stripe-light': '#FDF8F0',
        'stripe-orange': '#C04E3D',
        'stripe-text': '#24354C',
        'stripe-muted': '#5a6b7d',
      },
      boxShadow: {
        'stripe': '0 4px 6px -1px rgba(36, 53, 76, 0.08), 0 2px 4px -2px rgba(36, 53, 76, 0.06)',
        'stripe-lg': '0 10px 15px -3px rgba(221, 124, 58, 0.15), 0 4px 6px -4px rgba(221, 124, 58, 0.1)',
      },
    },
  },
  plugins: [],
}
export default config
