import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// ============================================
// CONFIGURAÇÃO DE BASE PATH
// ============================================
// Para subpasta: '/sistema' (ex: dreamkeys.com.br/sistema)
// Para raiz/subdomínio: '' (deixe vazio)
// ============================================
const BASE_PATH = '/sistema' // 👈 ALTERE AQUI conforme necessário

// Garantir que BASE_PATH tenha barra final se não for vazio
const baseUrl = BASE_PATH && !BASE_PATH.endsWith('/') ? `${BASE_PATH}/` : BASE_PATH || '/'
const basePathTrimmed = baseUrl.replace(/\/$/, '') // ex: '/sistema'

// Plugin para substituir %BASE_URL% no HTML
const baseUrlPlugin = () => {
  return {
    name: 'base-url-replace',
    transformIndexHtml(html: string) {
      return html.replace(/%BASE_URL%/g, baseUrl)
    }
  }
}

// Em dev, o Vite serve public/ na raiz (/), mas o HTML pede favicon em /sistema/logo-url.svg.
// Este plugin serve arquivos de public/ também em /sistema/ para o favicon aparecer localmente.
const publicUnderBasePlugin = () => {
  return {
    name: 'public-under-base',
    configureServer(server: import('vite').ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith(basePathTrimmed + '/') && req.method === 'GET') {
          const name = req.url.slice(basePathTrimmed.length).replace(/^\//, '').split('?')[0]
          if (!name || name.includes('..')) return next()
          const file = path.resolve(process.cwd(), 'public', name)
          if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return next()
          try {
            const data = fs.readFileSync(file)
            const ext = path.extname(name).toLowerCase()
            const types: Record<string, string> = {
              '.svg': 'image/svg+xml',
              '.ico': 'image/x-icon',
              '.png': 'image/png',
              '.json': 'application/json',
              '.webmanifest': 'application/manifest+json'
            }
            res.setHeader('Content-Type', types[ext] || 'application/octet-stream')
            res.end(data)
            return
          } catch {
            next()
          }
        }
        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: BASE_PATH,
  plugins: [react(), baseUrlPlugin(), publicUnderBasePlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['react', 'react-dom', 'styled-components']
  },
  server: {
    hmr: {
      overlay: true
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    emptyOutDir: true, // Limpar diretório de saída antes do build
    sourcemap: false, // Desabilitar sourcemap em produção para melhor performance
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor libraries em chunks separados
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          // Chart.js - usando registro manual em vez de chart.js/auto para evitar
          // problemas de ordem de carregamento com code splitting
          charts: ['chart.js', 'react-chartjs-2'],
          ui: ['styled-components', 'react-icons'],
          utils: ['date-fns', 'react-toastify']
        }
      }
    },
    // Otimizações de build
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remover console.log em produção
        drop_debugger: true
      }
    }
  },
  optimizeDeps: {
    force: true,
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'styled-components',
      'react-icons',
      'date-fns',
      'chart.js',
      'react-chartjs-2'
    ],
    exclude: []
  }
})
