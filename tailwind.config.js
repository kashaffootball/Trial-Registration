/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#1E1E1E',
        surface: '#2B2B2B',
        primary: '#02FD55',
        secondary: '#8E02FF',
        text: '#FFFFFF',
        subtle: '#C7C7CC',
        error: '#EF4444',
        success: '#16A34A',
      },
      fontFamily: {
        kashaf: ['SharpGrotesk-Book', 'sans-serif'],
        kashafBold: ['SharpGrotesk-Bold', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(2, 253, 85, 0.35), 0 20px 50px rgba(142, 2, 255, 0.15)',
      },
    },
  },
  plugins: [],
};
