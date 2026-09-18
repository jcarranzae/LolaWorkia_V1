'use client';

import React, { useState, useEffect } from 'react';
import { Link, usePathname } from '@/context/NavigationContext';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/Icons';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation Links - Configured with enabled flags to easily reactivate in the future
  const allNavLinks: { href: string; label: string; badge?: string; badgeClass?: string; enabled: boolean }[] = [
    { href: '/', label: 'Inicio', enabled: true },
    { href: '/bio', label: 'Bio', badge: 'IA', badgeClass: 'badge-gold', enabled: true },
    { href: '/galeria', label: 'Galería', badge: '3D', badgeClass: 'badge-cyan', enabled: true },
    { href: '/blog', label: 'Blog', enabled: true },
    { href: '/ia-art', label: 'IA Arte', badge: 'IA', badgeClass: 'badge-violet', enabled: false }, // Hidden for now, preserved for future
    { href: '/tienda', label: 'Tienda', enabled: false }, // Hidden for now, preserved for future
    { href: '/mediakit', label: 'Media Kit', enabled: false }, // Hidden for now, preserved for future
    { href: '/contacto', label: 'Contacto', enabled: true },
  ];

  const navLinks = allNavLinks.filter((link) => link.enabled);

  // Set to true whenever the audio feature should be shown in navigation again
  const SHOW_AUDIO_TOGGLE = false;

  return (
    <header
      id="main-cyber-navbar"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        background: scrolled ? 'rgba(8, 9, 14, 0.92)' : 'rgba(8, 9, 14, 0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
        
        {/* Left: Brand Kinetic Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <Link href="/" id="nav-brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--accent-indigo) 0%, var(--neon-cyan) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '1.2rem',
                fontFamily: 'var(--font-display)',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}
            >
              LW
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                LOLA <span className="gradient-text-cyber">WORKIA</span>
              </span>
              <span className="mono-meta" style={{ display: 'block', fontSize: '0.62rem', color: 'var(--text-secondary)' }}>
                Synthetic Cyberart Hub
              </span>
            </div>
          </Link>

          {/* System Online Badge conforming to DESIGN.md §4.1 */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-mono text-[10px] tracking-wider text-cyan-300 font-semibold uppercase">
              SYSTEM ONLINE
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="desktop-nav">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                id={`nav-link-${link.href.replace('/', '') || 'portal'}`}
                style={{
                  position: 'relative',
                  fontSize: '0.88rem',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                  transition: 'color 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.2rem',
                }}
              >
                {link.label}
                {link.badge && (
                  <span className={`badge ${link.badgeClass || 'badge-cyan'}`} style={{ fontSize: '0.6rem', padding: '0.15rem 0.45rem' }}>
                    {link.badge}
                  </span>
                )}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      left: 0,
                      right: 0,
                      height: '2px',
                      borderRadius: '2px',
                      background: 'linear-gradient(90deg, var(--neon-cyan), var(--accent-violet))',
                      boxShadow: '0 0 10px var(--neon-cyan)',
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Tools: Audio Synth, 3D Quick Entry & User Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          
          {/* Ambient Audio Player Toggle (Hidden for now, preserved for future) */}
          {SHOW_AUDIO_TOGGLE && (
            <button
              id="nav-audio-synth-toggle"
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              title={isPlayingAudio ? "Mute Synthetic Audio" : "Play Ambient Soundscape"}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.75rem',
                background: isPlayingAudio ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: isPlayingAudio ? '1px solid var(--neon-cyan)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                color: isPlayingAudio ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '14px' }}>
                <div className={isPlayingAudio ? "equalizer-bar" : ""} style={{ width: '2px', height: isPlayingAudio ? undefined : '6px', background: isPlayingAudio ? 'var(--neon-cyan)' : 'var(--text-muted)', borderRadius: '1px' }} />
                <div className={isPlayingAudio ? "equalizer-bar" : ""} style={{ width: '2px', height: isPlayingAudio ? undefined : '10px', background: isPlayingAudio ? 'var(--neon-cyan)' : 'var(--text-muted)', borderRadius: '1px' }} />
                <div className={isPlayingAudio ? "equalizer-bar" : ""} style={{ width: '2px', height: isPlayingAudio ? undefined : '4px', background: isPlayingAudio ? 'var(--neon-cyan)' : 'var(--text-muted)', borderRadius: '1px' }} />
              </div>
              <span className="hidden sm:inline">{isPlayingAudio ? 'SYNTH: ON' : 'AUDIO'}</span>
            </button>
          )}

          {/* Auth Dropdown / Portal Entry */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                id="nav-user-dropdown-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  background: 'rgba(17, 19, 31, 0.8)',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-glow)',
                  color: 'var(--text-primary)',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundSize: 'cover',
                    backgroundImage: `url(${user.avatarUrl})`,
                    backgroundPosition: 'center',
                    border: '1px solid var(--neon-cyan)',
                  }}
                />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
                  {user.name.split(' ')[0]}
                </span>
                {user.role === 'admin' ? (
                  <span className="badge badge-magenta" style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem' }}>
                    ADMIN
                  </span>
                ) : (
                  <span className="badge badge-violet" style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem' }}>
                    VIP
                  </span>
                )}
              </button>

              {userDropdownOpen && (
                <div
                  id="nav-user-dropdown-menu"
                  style={{
                    position: 'absolute',
                    top: '125%',
                    right: 0,
                    width: '230px',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-glow)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.6rem',
                    boxShadow: '0 15px 40px rgba(0,0,0,0.8)',
                    zIndex: 60,
                  }}
                >
                  <div style={{ padding: '0.6rem 0.8rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.4rem' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{user.name}</div>
                    <div className="mono-meta" style={{ fontSize: '0.7rem', color: 'var(--neon-cyan)' }}>@{user.username}</div>
                  </div>

                  {isAdmin && (
                    <Link
                      href="/miembros/admin"
                      id="nav-dropdown-admin-link"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem 0.8rem',
                        fontSize: '0.85rem',
                        color: 'var(--neon-magenta)',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600,
                      }}
                    >
                      <Icons.ShieldCheck size={16} /> Panel de Administración
                    </Link>
                  )}

                  <Link
                    href="/miembros"
                    id="nav-dropdown-patrons-link"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 0.8rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <Icons.Sparkles size={16} /> Zona Miembros / VIP
                  </Link>

                  <button
                    id="nav-dropdown-logout-btn"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      marginTop: '0.4rem',
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    <Icons.LogOut size={16} /> Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              id="nav-login-btn"
              className="btn-secondary"
              style={{ padding: '0.55rem 1.1rem', fontSize: '0.82rem', gap: '0.4rem' }}
            >
              <Icons.Lock size={14} /> Acceso Miembros
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            id="mobile-nav-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle"
            style={{
              padding: '0.5rem',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            {mobileMenuOpen ? <Icons.X size={20} /> : <Icons.Sliders size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-drawer-container"
          style={{
            background: 'var(--bg-surface-elevated)',
            padding: '1.5rem',
            borderBottom: '1px solid var(--border-glow)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                fontFamily: 'var(--font-heading)',
                color: pathname === link.href ? 'var(--neon-cyan)' : 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {link.label}
              {link.badge && <span className={`badge ${link.badgeClass || 'badge-cyan'}`}>{link.badge}</span>}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 980px) {
          .desktop-nav {
            display: none !important;
          }
        }
        @media (min-width: 981px) {
          .mobile-toggle {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
