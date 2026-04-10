import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import PageHero from '../components/PageHero';
import contactHero from '../assets/contact-hero.jpg';
import { forgotPassword, resetPassword } from '../api/auth.api.js';
import '../styles/auth.css';

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(user?.role === 'admin' ? '/admin' : '/', { replace: true });
    }
  }, [isAuthenticated, user, navigate, authLoading]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const { message } = await forgotPassword({ email: email.trim() });
      setInfo(message || 'If an account exists for this email, you will receive a code shortly.');
      setStep(2);
      setOtp('');
    } catch (err) {
      setError(err.message || 'Could not send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { message } = await resetPassword({
        email: email.trim(),
        otp: otp.replace(/\D/g, '').slice(0, 6),
        password,
      });
      setResetDone(true);
      setError('');
      setInfo(message || 'Password updated. You can sign in now.');
      setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (err) {
      setError(err.message || 'Could not reset password. Check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHero
        title="Forgot password"
        subtitle="Reset your password using the code we send to your email."
        backgroundImage={contactHero}
        breadcrumbs={[
          { label: 'Login', path: '/login' },
          { label: 'Forgot password', path: '/forgot-password' },
        ]}
      />
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Forgot password</h1>
          <p className="auth-subtitle">
            {resetDone
              ? 'Redirecting to login…'
              : step === 1
                ? 'Enter your email and we will send you a 6-digit verification code.'
                : 'Enter the code from your email and choose a new password.'}
          </p>

          {error && <div className="auth-error">{error}</div>}
          {info && <div className="auth-success">{info}</div>}

          {resetDone ? (
            <p className="auth-footer" style={{ marginTop: '8px' }}>
              <Link to="/login" className="auth-link">
                Go to login now
              </Link>
            </p>
          ) : null}

          {step === 1 && (
            <form onSubmit={handleSendCode} className="auth-form">
              <div className="auth-form-group">
                <label htmlFor="fp-email" className="auth-label">
                  Email address
                </label>
                <input
                  id="fp-email"
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="Enter your email"
                />
              </div>
              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Sending…' : 'Send verification code'}
              </button>
            </form>
          )}

          {step === 2 && !resetDone && (
            <form onSubmit={handleReset} className="auth-form">
              <div className="auth-form-group">
                <label htmlFor="fp-email-readonly" className="auth-label">
                  Email
                </label>
                <input
                  id="fp-email-readonly"
                  type="email"
                  className="auth-input"
                  value={email}
                  readOnly
                  style={{ background: '#f7fafc', color: '#4a5568' }}
                />
                <button
                  type="button"
                  className="auth-button-secondary"
                  onClick={() => {
                    setStep(1);
                    setError('');
                    setInfo('');
                    setOtp('');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                >
                  Use a different email
                </button>
              </div>
              <div className="auth-form-group">
                <label htmlFor="fp-otp" className="auth-label">
                  6-digit code
                </label>
                <input
                  id="fp-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="auth-input"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  minLength={6}
                  maxLength={6}
                  placeholder="000000"
                />
              </div>
              <div className="auth-form-group">
                <label htmlFor="fp-password" className="auth-label">
                  New password
                </label>
                <div className="password-input-wrapper">
                  <input
                    id="fp-password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="New password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                <small className="auth-hint">
                  At least 8 characters with uppercase, lowercase, number, and special character
                </small>
              </div>
              <div className="auth-form-group">
                <label htmlFor="fp-confirm" className="auth-label">
                  Confirm new password
                </label>
                <div className="password-input-wrapper">
                  <input
                    id="fp-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="auth-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Updating…' : 'Reset password'}
              </button>
            </form>
          )}

          {!resetDone && (
            <p className="auth-footer">
              <Link to="/login" className="auth-link">
                Back to login
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
