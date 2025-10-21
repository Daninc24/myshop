import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react'
    })
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    global: 'globalThis'
  },
  resolve: {
    alias: {
      'react': 'react',
      'react-dom': 'react-dom'
    },
    dedupe: ['react', 'react-dom']
  },

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
          // Keep React together in vendor chunk
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI libraries
          'vendor-ui': ['antd', '@ant-design/icons', '@heroicons/react'],
          // Utility libraries
          'vendor-utils': ['axios', 'framer-motion', 'dayjs'],
          // Chart libraries
          'vendor-charts': ['chart.js', 'react-chartjs-2', 'recharts'],
          // PDF libraries
          'vendor-pdf': ['jspdf', 'jspdf-autotable'],
          // Payment libraries
          'vendor-payments': ['@stripe/stripe-js', '@stripe/react-stripe-js', '@paypal/react-paypal-js']
        },
        // Optimize chunk names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '').replace('.js', '') : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `img/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Use terser for better compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      },
      mangle: {
        safari10: true
      }
    },
    // Disable source maps for production
    sourcemap: false,
    // Optimize CSS
    cssCodeSplit: true,
    // Preload modules for better performance
    modulePreload: {
      polyfill: false
    },
    // Target modern browsers for smaller bundles
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
    // Optimize asset inlining
    assetsInlineLimit: 4096
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      'axios',
      'antd',
      '@ant-design/icons',
      '@heroicons/react',
      'framer-motion'
    ],
    force: true,
    exclude: [
      'jspdf',
      'jspdf-autotable',
      'react-to-print',
      'react-qr-barcode-scanner',
      'react-barcode-scanner',
      'chart.js',
      'react-chartjs-2',
      'recharts'
    ],
    // Ensure React is pre-bundled correctly
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  
  // Ensure proper external handling
  external: (id) => {
    // Don't externalize React in production builds
    return false;
  }
})
