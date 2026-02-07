import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-orange': '#F77F00',
        'golden-amber': '#FCBF49',
        'cream': '#EAE2B7',
        'dark-grey': '#2D2D2D',
      },
    },
  },
  plugins: [],
}
export default config
