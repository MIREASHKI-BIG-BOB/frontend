/**** Tailwind config for HeraBEAT ****/
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#fefafa',
        text: '#1A1A1A',
        accent: '#d46a92',
        ok: '#28A745',
        warn: '#FFC107',
        danger: '#DC3545',
        secondary: '#6C757D',
        chartBg: '#f6d2d6',
        fhr: '#6a4162',
        uc: '#f39db6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #f6d2d6 0%, #fefafa 60%)',
      },
    },
  },
  plugins: [],
};
