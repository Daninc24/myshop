import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5002',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    // Enable code splitting for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['antd', '@ant-design/icons', '@headlessui/react', '@heroicons/react'],
          'vendor-charts': ['chart.js', 'react-chartjs-2', 'recharts'],
          'vendor-payment': ['@stripe/react-stripe-js', '@stripe/stripe-js', '@paypal/react-paypal-js'],
          'vendor-utils': ['axios', 'dayjs', 'framer-motion']
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    },
    // Enable source maps for debugging (optional, disable for smaller builds)
    sourcemap: false
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'antd',
      '@ant-design/icons'
    ]
  }
})
