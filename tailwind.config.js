/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // Bright Blue for active elements
        'background-start': '#1e1b4b', // Dark Indigo/Purple
        'background-end': '#111827', // Dark Gray/Blue
        surface: '#1f2937', // Darker surface for nav/panels
        muted: {
          DEFAULT: '#9ca3af',
          foreground: '#d1d5db',
        },
        // New colors from image
        'page-bg': '#121212',
        'form-bg': '#1C1C1C',
        'input-bg': '#2D2D2D',
        'btn-bg': '#424242',
        'btn-bg-hover': '#525252',
        'border-dark': '#333333',
        'text-secondary': '#AFAFAF',
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
};
