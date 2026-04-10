import axios from 'axios';
import { API_BASE } from '../config/api.js';

/**
 * GET /test-email on the API host (not under /api/v1).
 * In dev, uses Vite proxy with a relative URL when possible.
 */
export async function requestTestEmail({ to, secret }) {
  const params = new URLSearchParams({ to });
  if (secret) params.set('secret', secret);
  const qs = params.toString();
  const path = `/test-email?${qs}`;
  const url = import.meta.env.DEV ? path : `${API_BASE}${path}`;
  const { data } = await axios.get(url);
  return data;
}
