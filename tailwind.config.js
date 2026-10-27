export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        energy: '#E63936',
        night: '#102A43',
        pearl: '#F3F5F7',
        success: '#16865C',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(16, 42, 67, 0.12)',
      },
      backgroundImage: {
        hero: 'linear-gradient(135deg, rgba(16,42,67,0.92), rgba(230,57,54,0.88))',
      }
    },
  },
  plugins: [],
};
