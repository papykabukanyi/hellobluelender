/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Unified color palette based on green theme
        primary: "#1F7832", // Hempire Enterprise primary green
        "primary-light": "#2B9B47", // Lighter green for hover states
        "primary-dark": "#155A26", // Darker green for active states
        "primary-muted": "#E8F4EA", // Very light green for backgrounds
        // Secondary colors for accents and variety
        secondary: "#2C5530", // Darker forest green
        "secondary-light": "#4A7C59", // Medium forest green
        "secondary-dark": "#1A3A1F", // Very dark forest green
        // Neutral colors with slight green tint
        neutral: {
          50: "#F8FBF9",
          100: "#F1F7F3", 
          200: "#E3EFDE",
          300: "#C6D9C1",
          400: "#A1B89A",
          500: "#7A9773",
          600: "#5A7A53",
          700: "#456142",
          800: "#2F4332",
          900: "#1C2A1F"
        },
        // Status colors
        success: "#10B981",
        warning: "#F59E0B", 
        error: "#EF4444",
        info: "#3B82F6"
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-primary": "linear-gradient(135deg, #1F7832 0%, #2B9B47 50%, #155A26 100%)",
        "gradient-hero": "linear-gradient(135deg, #1F7832 0%, #2C5530 50%, #1A3A1F 100%)"
      },
      fontFamily: {
        permanentMarker: ['var(--font-permanent-marker)'],
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(31, 120, 50, 0.1)',
        'medium': '0 4px 25px rgba(31, 120, 50, 0.15)',
        'strong': '0 8px 35px rgba(31, 120, 50, 0.2)'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-4px)' },
          '60%': { transform: 'translateY(-2px)' }
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
