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
        // Beautiful blue color palette for Hello Blue Lenders
        primary: "#2563eb", // Beautiful blue
        "primary-light": "#3b82f6", // Lighter blue for hover states
        "primary-dark": "#1d4ed8", // Darker blue for active states
        "primary-muted": "#dbeafe", // Very light blue for backgrounds
        // Secondary blue colors for variety
        secondary: "#1e40af", // Deep blue
        "secondary-light": "#3b82f6", // Medium blue
        "secondary-dark": "#1e3a8a", // Very dark blue
        accent: "#0ea5e9", // Sky blue accent
        // Neutral colors with slight blue tint
        neutral: {
          50: "#f8fafc",
          100: "#f1f5f9", 
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a"
        },
        // Status colors
        success: "#10B981",
        warning: "#F59E0B", 
        error: "#EF4444",
        info: "#0ea5e9"
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-primary": "linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #0ea5e9 100%)",
        "gradient-hero": "linear-gradient(135deg, #2563eb 0%, #1e40af 50%, #1e3a8a 100%)"
      },
      fontFamily: {
        permanentMarker: ['var(--font-permanent-marker)'],
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(37, 99, 235, 0.1)',
        'medium': '0 4px 25px rgba(37, 99, 235, 0.15)',
        'strong': '0 8px 35px rgba(37, 99, 235, 0.2)'
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
