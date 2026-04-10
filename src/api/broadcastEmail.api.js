import adminClient from './adminClient.js';

/** @returns {Promise<Array>} broadcast history logs */
export async function getBroadcastEmailHistory() {
  const response = await adminClient.get('/admin/broadcast-emails');
  return response.data?.data || [];
}

/**
 * Send one email per user (same template; supports {{firstName}}, {{lastName}}, {{email}}).
 * @param {{ subject: string, text: string, html?: string, includeAdmins?: boolean }} payload
 */
export async function sendBroadcastEmail(payload) {
  const response = await adminClient.post('/admin/broadcast-emails', payload, {
    timeout: 300000,
  });
  if (response.data?.success) {
    return response.data;
  }
  throw new Error(response.data?.message || 'Broadcast failed');
}
