const DEV_APP_PORTS = new Set(['5173', '5174', '4173', '4174'])

function sanitizeApiBase(raw) {
  const fallback = 'http://127.0.0.1:5000'
  const trimmed = (raw || fallback).trim().replace(/\/$/, '') || fallback
  let base = trimmed.replace(/\/api\/v1\/?$/, '')
  try {
    const u = new URL(base)
    const port = u.port || (u.protocol === 'https:' ? '443' : '80')
    if (
      import.meta.env.DEV &&
      DEV_APP_PORTS.has(port) &&
      (u.hostname === 'localhost' || u.hostname === '127.0.0.1')
    ) {
      console.error(
        '[api] VITE_API_BASE points at the Vite dev port. It must be your backend URL (e.g. http://127.0.0.1:5000). Using fallback.',
      )
      base = fallback
    } else if (u.hostname === 'localhost') {
      u.hostname = '127.0.0.1'
      base = u.toString().replace(/\/$/, '')
    }
  } catch {
    base = fallback
  }
  return base.replace(/\/api\/v1\/?$/, '')
}

export const API_BASE = sanitizeApiBase(import.meta.env.VITE_API_BASE)
export const API_BASE_URL = `${API_BASE}/api/v1`
