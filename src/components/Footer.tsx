'use client';

import React, { useState } from 'react';
import { Link } from '@/context/NavigationContext';
import { Icons } from '@/components/Icons';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer
      id="main-cyber-footer"
      style={{
        background: 'var(--bg-surface-elevated)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '5rem 0 2.5rem 0',
        marginTop: '6rem',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '3.5rem',
            marginBottom: '4rem',
          }}
        >
          {/* Col 1: Bio & Manifesto Summary */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.2rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--accent-indigo) 0%, var(--neon-cyan) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  fontFamily: 'var(--font-display)',
                  boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)',
                }}
              >
                LW
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800 }}>
                LOLA <span className="gradient-text-cyber">WORKIA</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.65', marginBottom: '1.5rem' }}>
              Synthetic cyberartist and AI-native virtual vanguard. Exploring generative aesthetics, 3D WebXR architecture, and critical post-digital philosophy.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                id="footer-social-instagram"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--neon-cyan)',
                  border: '1px solid var(--border-subtle)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icons.Instagram size={18} />
              </a>
              <a
                href="https://www.youtube.com/@LolaWorkia"
                target="_blank"
                rel="noreferrer"
                id="footer-social-youtube"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--neon-cyan)',
                  border: '1px solid var(--border-subtle)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icons.Youtube size={18} />
              </a>
              <a
                href="mailto:curator@lolaworkia.com"
                id="footer-social-mail"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--neon-cyan)',
                  border: '1px solid var(--border-subtle)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icons.Mail size={18} />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Hierarchy */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '1.2rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Navegación
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
              <li>
                <Link href="/" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>Inicio</Link>
              </li>
              <li>
                <Link href="/bio" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>Bio & Manifiesto</Link>
              </li>
              <li>
                <Link href="/galeria" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>Galería 3D</Link>
              </li>
              <li>
                <Link href="/blog" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>Blog</Link>
              </li>
              <li>
                <Link href="/contacto" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>Contacto</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Patronage & Admin */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '1.2rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Comunidad & Acceso
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
              <li>
                <Link href="/miembros" style={{ color: '#c4b5fd', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Icons.Sparkles size={14} /> Zona Miembros / VIP
                </Link>
              </li>
              <li>
                <Link href="/login" style={{ color: 'var(--text-secondary)' }}>
                  Acceso / Login
                </Link>
              </li>
              <li>
                <Link href="/miembros/admin" style={{ color: 'var(--neon-magenta)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Icons.ShieldCheck size={14} /> Panel Administrador
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter Dispatches */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '1.2rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Cyberart Dispatch
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.5' }}>
              Subscribe for critical essays, 3D drops countdowns, and encrypted curatorial notes.
            </p>

            {subscribed ? (
              <div
                style={{
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  padding: '0.8rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--neon-cyan)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Icons.Check size={16} /> Signal received. You are on the cipher list.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <input
                  type="email"
                  placeholder="cyber.node@domain.xyz"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn-cyan" style={{ padding: '0.75rem', width: '100%', fontSize: '0.85rem' }}>
                  Connect to Dispatch
                </button>
              </form>
            )}
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <div>
            © {new Date().getFullYear()} LOLA WORKIA ECOSYSTEM. ALL SYNTHETIC ASSETS RESERVED.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>ETHEREUM MAINNET</span>
            <span>IPFS COMPLIANT</span>
            <span>CC BY-NC-SA 4.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
