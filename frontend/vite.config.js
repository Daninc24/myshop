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
          'vendor-ui': ['antd', '@ant-design/icons', '@heroicons/react'],
          'vendor-utils': ['axios', 'framer-motion'],
          'vendor-charts': ['chart.js', 'react-chartjs-2', 'recharts'],
          'vendor-pdf': ['jspdf', 'jspdf-autotable'],
          'vendor-print': ['react-to-print'],
          'vendor-barcode': ['react-qr-barcode-scanner', 'react-barcode-scanner'],
          'vendor-payments': ['@stripe/react-stripe-js', '@stripe/stripe-js', '@paypal/react-paypal-js'],
          'vendor-others': ['socket.io-client', 'uuid', 'dayjs', 'file-saver']
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Use terser for better compression (slower but smaller)
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Enable source maps for debugging (optional, disable for smaller builds)
    sourcemap: false,
    // Optimize CSS
    cssCodeSplit: true,
    // Preload modules for better performance
    modulePreload: {
      polyfill: false
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'antd',
      '@ant-design/icons',
      '@heroicons/react'
    ],
    exclude: [
      'jspdf',
      'jspdf-autotable',
      'react-to-print',
      'react-qr-barcode-scanner',
      'react-barcode-scanner',
      'chart.js',
      'react-chartjs-2',
      'recharts'
    ]
  }
})
