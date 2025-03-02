module.exports = {
  theme: {
    extend: {
      keyframes: {
        slideInFromRight: {
          '0%': { 
            transform: 'translateX(100%)',
            opacity: '0'
          },
          '50%': {
            opacity: '0.5'
          },
          '100%': { 
            transform: 'translateX(0)',
            opacity: '1'
          }
        }
      },
      animation: {
        slideInFromRight: 'slideInFromRight 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards'
      }
    }
  }
} 