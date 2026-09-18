'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from '@/context/NavigationContext';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/Icons';
import { Lock, Key, ShieldCheck, Cpu } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const { user, login, loginWithGoogle, register } = useAuth();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Automatic Role Discrimination & Redirection
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.push('/miembros/admin');
      } else {
        router.push('/miembros');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        const res = await register(name, username, email, password);
        if (!res.success) {
          setErrorMessage(res.message || 'Error registering patron node.');
        }
      } else {
        const inputToLogin = email.trim() || username.trim();
        const res = await login(inputToLogin, password);
        if (!res.success) {
          setErrorMessage(res.message || 'Authentication error.');
        } else if (res.role) {
          if (res.role === 'admin') router.push('/miembros/admin');
          else router.push('/miembros');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unexpected protocol error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setErrorMessage(res.message || 'Failed Google authentication handshake.');
      } else if (res.role) {
        if (res.role === 'admin') router.push('/miembros/admin');
        else router.push('/miembros');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'OAuth identity provider failure.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '3.2rem 2.8rem', border: '1px solid var(--border-glow)', boxShadow: 'var(--shadow-glow)' }}>
      {/* Header (DESIGN.md §3) */}
      <div style={{ textAlign: 'center', marginBottom: '2.4rem' }}>
        <div
          style={{
            width: '58px',
            height: '58px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--accent-indigo) 0%, var(--neon-cyan) 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.2rem auto',
            boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)',
          }}
        >
          <Lock size={26} />
        </div>

        <h1 className="heading-card" style={{ fontSize: '1.7rem' }}>
          {isRegisterMode ? 'REGISTER PATRON NODE' : 'PATRON AUTHENTICATION'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.6rem', lineHeight: '1.6' }}>
          {isRegisterMode
            ? 'Initialize your collector identity to unlock exclusive 3D pavilion stanzas.'
            : 'Authenticate your cryptographic patron node to access uncompressed assets.'}
        </p>
      </div>

      {/* Google Login Provider */}
      <div style={{ marginBottom: '1.8rem' }}>
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          className="btn-secondary"
          style={{
            width: '100%',
            padding: '0.85rem',
            fontSize: '0.9rem',
            opacity: isSubmitting ? 0.7 : 1,
            justifyContent: 'center',
          }}
        >
          <Icons.Google size={18} />
          <span>{isSubmitting ? 'Verifying Handshake...' : 'Authenticate with Google'}</span>
        </button>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', margin: '1.8rem 0', gap: '1rem' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
        <span className="mono-meta" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          OR VIA EMAIL CREDENTIALS
        </span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            padding: '0.85rem 1.2rem',
            borderRadius: 'var(--radius-sm)',
            color: '#f87171',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Email / Password Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        {isRegisterMode && (
          <div>
            <label className="mono-meta" style={{ display: 'block', color: 'var(--neon-cyan)', marginBottom: '0.4rem' }}>
              FULL NAME
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Maya Lin"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        {isRegisterMode && (
          <div>
            <label className="mono-meta" style={{ display: 'block', color: 'var(--neon-cyan)', marginBottom: '0.4rem' }}>
              NODE USERNAME
            </label>
            <input
              type="text"
              required
              placeholder="mayalin_node"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        )}

        <div>
          <label className="mono-meta" style={{ display: 'block', color: 'var(--neon-cyan)', marginBottom: '0.4rem' }}>
            {isRegisterMode ? 'EMAIL ADDRESS' : 'EMAIL ADDRESS OR USERNAME'}
          </label>
          <input
            type={isRegisterMode ? 'email' : 'text'}
            required
            placeholder={isRegisterMode ? 'node@domain.xyz' : 'node@domain.xyz or username'}
            className="input-field"
            value={isRegisterMode ? email : email || username}
            onChange={(e) => {
              if (isRegisterMode) {
                setEmail(e.target.value);
              } else {
                setEmail(e.target.value);
                setUsername(e.target.value);
              }
            }}
          />
        </div>

        <div>
          <label className="mono-meta" style={{ display: 'block', color: 'var(--neon-cyan)', marginBottom: '0.4rem' }}>
            PASSPHRASE
          </label>
          <input
            type="password"
            required
            placeholder="••••••••••••"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn-cyan"
          disabled={isSubmitting}
          style={{ padding: '0.9rem', marginTop: '0.5rem', opacity: isSubmitting ? 0.7 : 1 }}
        >
          {isSubmitting ? 'Authenticating Protocol...' : isRegisterMode ? 'Create Patron Node' : 'Initialize Session'}
        </button>
      </form>

      {/* Toggle login vs register mode */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '2rem', paddingTop: '1.5rem', textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => {
            setIsRegisterMode(!isRegisterMode);
            setErrorMessage('');
          }}
          className="mono-meta"
          style={{ color: 'var(--neon-cyan)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {isRegisterMode ? 'Existing node? Initialize Login' : 'New Collector? Register Patron Account'}
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="container" style={{ paddingTop: '4rem', maxWidth: '520px' }}>
      <Suspense fallback={<div className="mono-meta" style={{ textAlign: 'center', padding: '3rem', color: 'var(--neon-cyan)' }}>Loading Authentication Module...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
