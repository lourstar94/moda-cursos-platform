// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      // NUEVAS EXTENSIONES PARA OPTIMIZACIÓN MÓVIL
      fontSize: {
        'mobile-lg': ['18px', { lineHeight: '1.6' }],
        'mobile-base': ['16px', { lineHeight: '1.6' }],
        'mobile-sm': ['14px', { lineHeight: '1.5' }],
      },
      spacing: {
        'touch': '44px',
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
      // Para mejorar transiciones en móvil
      transitionProperty: {
        'transform-opacity': 'transform, opacity',
      }
    },
  },
  plugins: [],
}