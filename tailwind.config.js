/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F5EFE0',
        paper: '#FBF6E9',
        ink: '#1E2A1C',
        moss: '#355E3B',
        fern: '#4A7C59',
        sage: '#8BA888',
        earth: '#8B6F47',
        terra: '#C8724D',
        sun: '#E8B84A',
        marigold: '#E89B2E',
        saffron: '#D4661F',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      boxShadow: {
        botanical: '0 24px 80px rgba(30,42,28,0.12)',
        card: '0 18px 50px rgba(30,42,28,0.08)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        floaty: 'floaty 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
