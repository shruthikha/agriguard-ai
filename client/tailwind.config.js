/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary pastel sage green palette
        sage: {
          50:  '#EAF4E4',  // page background
          100: '#DDEBDD',  // pastel mint
          200: '#C9DEC1',  // soft sage border
          300: '#B5D1B0',
          400: '#90BA8A',
          500: '#6E9E6A',
          600: '#527A5A',  // primary green
          700: '#3F6246',
          800: '#2E4D35',
          900: '#1E3524',
          950: '#0F1E12',
        },
        // Forest text palette
        forest: {
          50:  '#F2F7F3',
          100: '#E0EDE3',
          200: '#B8D4BE',
          300: '#88B494',
          400: '#5E9470',
          500: '#3F7350',
          600: '#294333',  // dark forest text (replaces black)
          700: '#1F3327',
          800: '#14231A',
          900: '#0A1410',
        },
        // Secondary muted olive
        olive: {
          50:  '#F5F7EE',
          100: '#EAECDA',
          200: '#D4D8B5',
          300: '#BBC090',
          400: '#A4A870',
          500: '#899B6A',  // muted olive
          600: '#6D7D53',
          700: '#54613F',
          800: '#3C462C',
          900: '#252B1A',
        },
        // Warm cream background
        cream: {
          50:  '#FEFCF7',
          100: '#FBF7ED',
          200: '#F8F4E8',  // soft cream
          300: '#F2EAD5',
          400: '#E8DABC',
        },
        // Warm warning amber
        harvest: {
          50:  '#FDF8EC',
          100: '#FAF0D2',
          200: '#F3DFA0',
          300: '#EAC86A',  // D8B86A
          400: '#D8B86A',  // warning
          500: '#C49A40',
          600: '#9B7A30',
          700: '#735B24',
          800: '#4E3D18',
          900: '#2A200D',
        },
        // Soft danger rose
        clay: {
          50:  '#FAEEED',
          100: '#F3D9D8',
          200: '#E5B3B0',
          300: '#D49490',
          400: '#C98282',  // danger
          500: '#B86A6A',
          600: '#9B5252',
          700: '#7A3D3D',
          800: '#5A2C2C',
          900: '#3A1C1C',
        },
        // Legacy agri (keep for backwards compat)
        agri: {
          50:  '#EAF4E4',
          100: '#DDEBDD',
          200: '#C9DEC1',
          300: '#B5D1B0',
          400: '#90BA8A',
          500: '#6E9E6A',
          600: '#527A5A',
          700: '#3F6246',
          800: '#2E4D35',
          900: '#294333',
          950: '#1E3524',
        },
        earth: {
          50:  '#FDF8EC',
          100: '#FAF0D2',
          200: '#F3DFA0',
          300: '#EAC86A',
          400: '#D8B86A',
          500: '#C49A40',
          600: '#9B7A30',
          700: '#735B24',
          800: '#4E3D18',
          900: '#2A200D',
        },
        beige: {
          50:  '#FEFCF7',
          100: '#FBF7ED',
          200: '#F8F4E8',
          300: '#F2EAD5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
      },
      boxShadow: {
        'xs':       '0 1px 3px rgba(41,67,51,0.04)',
        'sm':       '0 2px 8px rgba(41,67,51,0.06)',
        'soft':     '0 4px 20px rgba(70,95,75,0.06)',
        'card':     '0 4px 24px rgba(41,67,51,0.07)',
        'elevated': '0 8px 32px rgba(41,67,51,0.10)',
        'focus':    '0 0 0 3px rgba(82,122,90,0.20)',
        'none':     'none',
      },
      backgroundImage: {
        'sage-gradient': 'linear-gradient(135deg, #EAF4E4 0%, #F4F8EF 100%)',
        'forest-gradient': 'linear-gradient(135deg, #2E4D35 0%, #527A5A 100%)',
        'leaf-gradient': 'linear-gradient(160deg, #C9DEC1 0%, #DDEBDD 50%, #EAF4E4 100%)',
      },
      animation: {
        'fade-in':    'fadeIn 0.25s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft: { '0%,100%': { opacity: '0.8' }, '50%': { opacity: '1' } },
      }
    },
  },
  plugins: [],
}
