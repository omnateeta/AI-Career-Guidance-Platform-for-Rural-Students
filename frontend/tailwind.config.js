/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EDE9FE',
          100: '#DDD6FE',
          200: '#C4B5FD',
          300: '#A78BFA',
          400: '#8B5CF6',
          500: '#6C63FF',
          600: '#6C63FF',
          700: '#5B54E6',
          800: '#4A44CC',
          900: '#3935B3',
        },
        secondary: {
          50: '#E0F7FE',
          100: '#B3ECFC',
          200: '#86E0FA',
          300: '#59D4F8',
          400: '#4FACFE',
          500: '#4FACFE',
          600: '#3B9AE6',
          700: '#2879CC',
          800: '#1457B3',
          900: '#003699',
        },
        accent: {
          50: '#FFF0F0',
          100: '#FFE0E0',
          200: '#FFC8C8',
          300: '#FFB0B0',
          400: '#FF9A9E',
          500: '#FF9A9E',
          600: '#FAD0C4',
          700: '#E6B8AC',
          800: '#CC9F94',
          900: '#B3867B',
        },
        bg: '#F3F6FB',
      },
      boxShadow: {
        'clay': '8px 8px 20px rgba(0,0,0,0.1), -8px -8px 20px rgba(255,255,255,0.9)',
        'clay-lg': '12px 12px 30px rgba(0,0,0,0.12), -12px -12px 30px rgba(255,255,255,1)',
        'clay-sm': '4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.8)',
        'glass': '0 8px 32px rgba(0,0,0,0.1)',
      },
      borderRadius: {
        'clay': '20px',
        'clay-lg': '24px',
        'clay-xl': '32px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'gradient-aurora': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'gradient-mesh': 'linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
