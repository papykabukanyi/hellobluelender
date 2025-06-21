/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],  theme: {
    extend: {
      colors: {
        primary: "#1F7832", // Hempire Enterprise green color
        "primary-light": "#33355e", // Lighter shade for hover states
        "primary-dark": "#13152b", // Darker shade for active states
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        permanentMarker: ['var(--font-permanent-marker)'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
