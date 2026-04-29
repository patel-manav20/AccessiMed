export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#E0FBFC',
        bgSecondary: '#C2DFE3',
        surface: '#9DB4C0',
        soft: '#C2DFE3',
        light: '#E0FBFC',
        deep: '#253237',
        deepSoft: '#5C6B73',
        elevated: 'rgba(92, 107, 115, 0.22)',
        primary: '#253237',
        secondary: '#5C6B73',
        textPrimary: '#253237',
        textSecondary: '#5C6B73',
        success: '#5C6B73',
        warning: '#9DB4C0',
        danger: '#253237',
        ink: '#253237',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(37,50,55,0.16), 0 20px 55px -26px rgba(37,50,55,0.35)',
        panel: '0 24px 45px -30px rgba(37, 50, 55, 0.35)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(37, 50, 55, 0.35)' },
          '70%': { boxShadow: '0 0 0 14px rgba(37, 50, 55, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 1.8s infinite',
        shimmer: 'shimmer 2.3s linear infinite',
      },
    },
  },
  plugins: [],
}
