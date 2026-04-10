import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/** Vite dev ports — must never be used as the API proxy target (common .env mistake). */
const DEV_APP_PORTS = new Set(['5173', '5174', '4173', '4174'])

function proxyTargetFromEnv(raw) {
  const fallback = 'http://127.0.0.1:5000'
  const base = (raw || fallback).trim().replace(/\/$/, '') || fallback
  try {
    const u = new URL(base)
    const port = u.port || (u.protocol === 'https:' ? '443' : '80')
    if (
      DEV_APP_PORTS.has(port) &&
      (u.hostname === 'localhost' || u.hostname === '127.0.0.1')
    ) {
      console.warn(
        `[vite] VITE_API_BASE (${base}) looks like the frontend dev server, not the API. ` +
          `Proxy will use ${fallback}. Set VITE_API_BASE to your backend (e.g. http://127.0.0.1:5000).`,
      )
      return fallback
    }
    if (u.hostname === 'localhost') {
      u.hostname = '127.0.0.1'
    }
    return u.toString().replace(/\/$/, '')
  } catch {
    return fallback
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBase = proxyTargetFromEnv(env.VITE_API_BASE)

  return {
    base: '/',
    plugins: [react()],
    server: {
      proxy: {
        // Proxy /uploads to backend
        '/uploads': {
          target: apiBase,
          changeOrigin: true,
          secure: false,
        },
        // Proxy /api to backend
        '/api': {
          target: apiBase,
          changeOrigin: true,
          secure: false,
        },
        // SMTP smoke test route (same origin as API root, not under /api/v1)
        '/test-email': {
          target: apiBase,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
