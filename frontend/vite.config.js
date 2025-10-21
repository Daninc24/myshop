import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  resolve: {
    alias: {
      'react': 'react',
      'react-dom': 'react-dom'
    },
    dedupe: ['react', 'react-dom']
  },
  esbuild: {
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
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
        manualChunks: (id) => {
          // React ecosystem
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'vendor-react';
          }
          // UI libraries
          if (id.includes('antd') || id.includes('@ant-design') || id.includes('@heroicons')) {
            return 'vendor-ui';
          }
          // Utility libraries
          if (id.includes('axios') || id.includes('framer-motion') || id.includes('dayjs')) {
            return 'vendor-utils';
          }
          // Chart libraries (lazy loaded)
          if (id.includes('chart.js') || id.includes('recharts')) {
            return 'vendor-charts';
          }
          // PDF libraries (lazy loaded)
          if (id.includes('jspdf')) {
            return 'vendor-pdf';
          }
          // Payment libraries (lazy loaded)
          if (id.includes('stripe') || id.includes('paypal')) {
            return 'vendor-payments';
          }
          // Other vendor libraries
          if (id.includes('node_modules')) {
            return 'vendor-others';
          }
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
      'react-router-dom',
      'axios',
      'antd',
      '@ant-design/icons',
      '@heroicons/react',
      'framer-motion'
    ],
    force: true
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
