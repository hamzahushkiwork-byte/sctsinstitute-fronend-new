import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestTestEmail } from '../api/testEmail.api.js';
import '../styles/auth.css';

/**
 * Dev-only SMTP smoke test. Route is registered from App.jsx when import.meta.env.DEV.
 */
function DevEmailTest() {
  const [to, setTo] = useState('');
  const [secret, setSecret] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const data = await requestTestEmail({
        to: to.trim(),
        secret: secret.trim() || undefined,
      });
      setStatus({ ok: true, data });
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Request failed';
      setStatus({ ok: false, message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <h1 className="auth-title" style={{ fontSize: '28px' }}>
          Dev: test email
        </h1>
        <p className="auth-subtitle">
          Calls <code style={{ fontSize: '13px' }}>GET /test-email</code> via the Vite proxy
          (same backend as <code style={{ fontSize: '13px' }}>VITE_API_BASE</code>). Production
          APIs require <code style={{ fontSize: '13px' }}>secret</code> when{' '}
          <code style={{ fontSize: '13px' }}>TEST_EMAIL_SECRET</code> is set.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <label htmlFor="test-to" className="auth-label">
              To (email)
            </label>
            <input
              id="test-to"
              className="auth-input"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="auth-form-group">
            <label htmlFor="test-secret" className="auth-label">
              Secret (optional — production only)
            </label>
            <input
              id="test-secret"
              className="auth-input"
              type="password"
              autoComplete="off"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="TEST_EMAIL_SECRET value"
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Sending…' : 'Send test email'}
          </button>
        </form>

        {status?.ok && (
          <div className="auth-success" style={{ marginTop: '20px' }}>
            Sent. {status.data?.messageId ? `Message ID: ${status.data.messageId}` : JSON.stringify(status.data)}
          </div>
        )}
        {status && !status.ok && (
          <div className="auth-error" style={{ marginTop: '20px' }}>
            {status.message}
          </div>
        )}

        <p className="auth-footer">
          <Link to="/" className="auth-link">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

export default DevEmailTest;
