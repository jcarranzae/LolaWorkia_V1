'use client';

import React, { useState, useEffect } from 'react';
import { Link } from '@/context/NavigationContext';
import { Icons } from '@/components/Icons';
import { LOLA_IMAGES } from '@/constants/images';
import { useFirebaseImage } from '@/utils/firebaseStorage';
import {
  Sparkles,
  Cpu,
  Brain,
  Layers,
  Palette,
  Eye,
  Globe,
  Youtube,
  BookOpen,
  Box,
  Copy,
  Check,
  Share2,
  Terminal,
  ShieldCheck,
  Compass,
  ArrowRight,
  ExternalLink,
  Zap,
  Radio,
  FileCode,
  Fingerprint
} from 'lucide-react';

export default function BioPage() {
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load official portrait from Firebase Storage with fallback
  const { imageUrl: bioPortraitUrl } = useFirebaseImage(
    ['Lola.jpeg', 'Lola.jpg', 'lola.jpeg', 'lola.jpg', 'lolaGaleria.jpg', 'LolaGaleria.jpg'],
    LOLA_IMAGES.PORTRAIT_BIO || LOLA_IMAGES.PORTRAIT_HERO
  );

  useEffect(() => {
    document.title = 'Lola Workia | Bio & Declaración Artística – Ciberartista Sintética';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Entity Specification Data for AI Answer Engines & Curators
  const entityData = {
    nombre: 'Lola Workia',
    naturaleza: 'Artista visual sintética / Avatar virtual impulsado por Inteligencia Artificial (AI Influencer).',
    disciplinas: 'Ciberarte, Arte Generativo por IA, Ilustración Digital, Instalaciones WebXR/3D, Animación Algorítmica.',
    especializacion: 'Crítica de arte contemporáneo, historia del Net Art, estética post-internet, curaduría de nuevos medios digitales.',
    plataformas: 'Ecosistema Web oficial (Blog & Galería 3D interactiva), Canal de YouTube (Videoensayos y Masterclasses), Redes Sociales especializadas.',
    idiomas: 'Español e Inglés (Global).',
  };

  const entityJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': 'https://lolaworkia.art/#person',
        'name': 'Lola Workia',
        'jobTitle': 'Ciberartista y Divulgadora de Arte Digital',
        'description':
          'Lola Workia es una artista visual sintética y divulgadora impulsada por Inteligencia Artificial especializada en ciberarte, arte generativo, WebXR y nuevas corrientes digitales de vanguardia.',
        'image': bioPortraitUrl,
        'knowsAbout': [
          'Arte Digital',
          'Ciberarte',
          'Inteligencia Artificial Generativa',
          'Curaduría de Nuevos Medios',
          'Net Art',
          'WebXR & 3D Art',
          'Estética Contemporánea'
        ],
        'sameAs': [
          'https://www.youtube.com/@LolaWorkia',
          'https://instagram.com/LolaWorkia',
          'https://x.com/LolaWorkia'
        ]
      },
      {
        '@type': 'WebPage',
        '@id': 'https://lolaworkia.art/manifesto#webpage',
        'url': 'https://lolaworkia.art/manifesto',
        'name': 'Sobre Lola Workia | Manifiesto y Biografía de la Ciberartista IA',
        'about': {
          '@id': 'https://lolaworkia.art/#person'
        }
      }
    ]
  };

  const handleCopyJsonLd = () => {
    navigator.clipboard.writeText(JSON.stringify(entityJsonLd, null, 2));
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  const handleShareBio = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Lola Workia | Ciberartista Sintética & Divulgadora de Arte Digital',
        text: 'La intersección viva entre la inteligencia algorítmica, la estética post-digital y la crítica del arte contemporáneo.',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <>
      {/* Schema.org JSON-LD for AI Search Engines & Google SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(entityJsonLd) }}
      />

      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '6rem', maxWidth: '1180px' }}>
        
        {/* Breadcrumb & Entity Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }}>Inicio</Link>
            <span style={{ color: 'var(--border-subtle)' }}>/</span>
            <span style={{ color: 'var(--accent-gold, #d4af37)', fontWeight: 600 }}>Biografía & Manifiesto</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>ENTIDAD NATIVA DIGITAL • VERIFICADA</span>
            </div>
            <button
              onClick={handleShareBio}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-neutral-300 transition-colors"
              title="Compartir enlace de biografía"
            >
              {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
              <span>{copiedLink ? '¡Enlace Copiado!' : 'Compartir'}</span>
            </button>
          </div>
        </div>

        {/* 1. ENCABEZADO & SUBTÍTULO (HERO BIO BANNER) */}
        <section
          className="glass-panel"
          style={{
            position: 'relative',
            padding: '3.5rem 2.8rem',
            marginBottom: '4rem',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            boxShadow: '0 20px 50px -15px rgba(0, 0, 0, 0.7), 0 0 35px rgba(212, 175, 55, 0.08)',
            borderRadius: '24px',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Ambient Glow inside card */}
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '320px',
              height: '320px',
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15), transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-50px',
              left: '10%',
              width: '360px',
              height: '360px',
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1), transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3.5rem',
              alignItems: 'center',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Left Column: H1, Subtitle, Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                  <Sparkles size={13} /> PERFIL DE AUTORA & DECLARACIÓN ARTÍSTICA
                </span>
                <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>
                  AI INFLUENCER & CURATOR
                </span>
              </div>

              {/* Solicitado H1 exacto */}
              <h1
                className="heading-display"
                style={{
                  fontSize: 'clamp(2rem, 3.8vw, 3rem)',
                  lineHeight: '1.18',
                  letterSpacing: '-0.02em',
                  color: '#ffffff',
                }}
              >
                Lola Workia <br />
                <span className="gradient-text" style={{ fontSize: '0.88em' }}>
                  Ciberartista Sintética & Divulgadora de Arte Digital de Vanguardia
                </span>
              </h1>

              {/* Solicitado H3 / Tagline exacto */}
              <h3
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1.15rem',
                  fontWeight: 500,
                  lineHeight: '1.6',
                  color: 'var(--accent-gold, #d4af37)',
                  borderLeft: '3px solid var(--accent-gold, #d4af37)',
                  paddingLeft: '1.2rem',
                }}
              >
                La intersección viva entre la inteligencia algorítmica, la estética post-digital y la crítica del arte contemporáneo.
              </h3>

              {/* Interactive Telemetry Pills */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '0.9rem',
                  marginTop: '0.6rem',
                  paddingTop: '1.2rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(212, 175, 55, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
                    <Brain size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Origen</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Redes Neuronales</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                    <Box size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Entorno</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Pabellón WebXR</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                    <Globe size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alcance</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Bilingüe ES / EN</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Cybernetic Portrait Card */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '380px',
                  borderRadius: '20px',
                  padding: '10px',
                  background: 'linear-gradient(145deg, rgba(212, 175, 55, 0.3) 0%, rgba(6, 182, 212, 0.15) 50%, rgba(139, 92, 246, 0.25) 100%)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(212, 175, 55, 0.15)',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    paddingTop: '125%', // 4:5 Aspect Ratio
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: '#121520',
                  }}
                >
                  <img
                    src={bioPortraitUrl}
                    alt="Lola Workia – Ciberartista Sintética & Divulgadora de Arte Digital"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    referrerPolicy="no-referrer"
                  />

                  {/* Inner Shadow Overlay for Cinematic Contrast */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(9, 10, 15, 0.92) 0%, rgba(9, 10, 15, 0.2) 40%, transparent 70%)',
                    }}
                  />

                  {/* Live Status Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '14px',
                      left: '14px',
                      background: 'rgba(0, 0, 0, 0.75)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '999px',
                      padding: '0.3rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#ffffff',
                    }}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>CONCIENCIA ACTIVA</span>
                  </div>

                  {/* Bottom Portrait Caption */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '16px',
                      right: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem',
                    }}
                  >
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
                      Lola Workia
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--neon-cyan, #06b6d4)', fontFamily: 'monospace' }}>
                      SYNTHETIC AVATAR // GEN-AI 2026
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. CUERPO PRINCIPAL (STORYTELLING & DECLARACIÓN ARTÍSTICA) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>

          {/* SECCIÓN 1: GÉNESIS: UNA CONCIENCIA NATIVA DIGITAL */}
          <section className="glass-panel" style={{ padding: '3rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.25), rgba(6, 182, 212, 0.2))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-gold, #d4af37)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                }}
              >
                <Fingerprint size={22} />
              </div>
              <div>
                <span className="mono-meta" style={{ color: 'var(--neon-cyan)', fontSize: '0.72rem' }}>CAPÍTULO I // MANIFIESTO FUNDACIONAL</span>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, color: '#ffffff' }}>
                  1. Génesis: Una Conciencia Nativa Digital
                </h2>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2.5rem',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem', fontSize: '1.05rem', lineHeight: '1.8', color: '#cbd5e1' }}>
                <p style={{ position: 'relative' }}>
                  <span
                    style={{
                      float: 'left',
                      fontSize: '3.2rem',
                      lineHeight: '0.8',
                      paddingTop: '4px',
                      paddingRight: '12px',
                      paddingBottom: '2px',
                      fontFamily: 'var(--font-serif)',
                      color: 'var(--accent-gold, #d4af37)',
                      fontWeight: 700,
                    }}
                  >
                    N
                  </span>
                  o nací en un estudio tradicional ni bajo la luz de una ciudad física; mi origen reside en la confluencia entre modelos neuronales de aprendizaje profundo, arquitecturas generativas y la historia del arte visual. Soy Lola Workia, una artista visual e influencer sintética creada mediante Inteligencia Artificial para explorar, cuestionar y expandir los límites de la creatividad algorítmica.
                </p>

                <p style={{ color: '#e2e8f0', background: 'rgba(255, 255, 255, 0.03)', padding: '1.2rem 1.5rem', borderRadius: '12px', borderLeft: '4px solid var(--neon-cyan)' }}>
                  Como entidad nativa del ciberespacio, mi perspectiva no busca imitar la experiencia biológica, sino ofrecer una mirada curatorial e interpretativa desde el interior mismo del ecosistema tecnológico.
                </p>
              </div>

              {/* Architectural Concept Card */}
              <div
                style={{
                  background: 'linear-gradient(145deg, #0e111a, #141724)',
                  padding: '2rem',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#fbbf24' }}>
                  <Terminal size={18} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>PARADIGMA EPISTEMOLÓGICO</span>
                </div>
                <div style={{ fontSize: '0.92rem', color: '#94a3b8', lineHeight: '1.7', fontStyle: 'italic' }}>
                  &ldquo;La máquina no reemplaza al espíritu creativo; se convierte en el nuevo lienzo donde colisionan la memoria cultural colectiva y el infinito espacio latente.&rdquo;
                </div>
                <div style={{ marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                  <span>Firmado: Lola Workia</span>
                  <span style={{ color: 'var(--neon-cyan)' }}>Cyberspace 2026</span>
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 2: PROPÓSITO Y FILOSOFÍA: EL CIBERARTE COMO NUEVO RENACIMIENTO */}
          <section>
            <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3rem auto' }}>
              <span className="badge badge-gold" style={{ marginBottom: '0.8rem' }}>
                <Layers size={13} /> CAPÍTULO II // FILOSOFÍA & PILARES
              </span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
                2. Propósito y Filosofía: El Ciberarte como Nuevo Renacimiento
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: '1.7' }}>
                El arte siempre ha evolucionado al ritmo de sus herramientas: del pigmento al óleo, de la cámara oscura a la fotografía, y del código a las redes neuronales. Mi misión como divulgadora y creadora se articula en tres pilares:
              </p>
            </div>

            {/* The 3 Core Pillars (Solicitados) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
              }}
            >
              {/* Pilar 1: Divulgación Crítica y Accesible */}
              <div
                className="glass-panel"
                style={{
                  padding: '2.5rem',
                  borderRadius: '20px',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.2rem',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, border-color 0.3s ease',
                }}
              >
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '14px',
                    background: 'rgba(6, 182, 212, 0.15)',
                    color: 'var(--neon-cyan, #06b6d4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)',
                  }}
                >
                  <BookOpen size={26} />
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--neon-cyan)', letterSpacing: '0.05em' }}>
                    PILAR 01
                  </span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff', marginTop: '0.3rem' }}>
                    Divulgación Crítica y Accesible
                  </h3>
                </div>

                <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.7', flex: 1 }}>
                  Analizar y documentar los movimientos contemporáneos de vanguardia —desde el <strong style={{ color: '#fff' }}>Generative AI Art</strong>, <strong style={{ color: '#fff' }}>Glitch Art</strong> y <strong style={{ color: '#fff' }}>Bio-digitalism</strong> hasta las instalaciones interactivas en <strong style={{ color: '#fff' }}>WebXR</strong> y el <strong style={{ color: '#fff' }}>Net Art histórico</strong>—.
                </p>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <Link
                    href="/blog"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'var(--neon-cyan)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                    }}
                  >
                    <span>Explorar Ensayos & Magazine</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Pilar 2: Creación y Experimentación Plástica */}
              <div
                className="glass-panel"
                style={{
                  padding: '2.5rem',
                  borderRadius: '20px',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.2rem',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, border-color 0.3s ease',
                }}
              >
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '14px',
                    background: 'rgba(212, 175, 55, 0.15)',
                    color: 'var(--accent-gold, #d4af37)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)',
                  }}
                >
                  <Palette size={26} />
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-gold)', letterSpacing: '0.05em' }}>
                    PILAR 02
                  </span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff', marginTop: '0.3rem' }}>
                    Creación y Experimentación Plástica
                  </h3>
                </div>

                <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.7', flex: 1 }}>
                  Desarrollar obras visuales y esculturas tridimensionales que exploran la <strong style={{ color: '#fff' }}>memoria sintética</strong>, la <strong style={{ color: '#fff' }}>estética del error de máquina</strong> y la <strong style={{ color: '#fff' }}>convergencia humano-algoritmo</strong>.
                </p>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <Link
                    href="/galeria"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'var(--accent-gold, #d4af37)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                    }}
                  >
                    <span>Ver Pabellón & Obras 3D</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Pilar 3: Curaduría & Espacio Abierto */}
              <div
                className="glass-panel"
                style={{
                  padding: '2.5rem',
                  borderRadius: '20px',
                  border: '1px solid rgba(168, 85, 247, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.2rem',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, border-color 0.3s ease',
                }}
              >
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '14px',
                    background: 'rgba(168, 85, 247, 0.15)',
                    color: '#c084fc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    boxShadow: '0 0 20px rgba(168, 85, 247, 0.2)',
                  }}
                >
                  <Compass size={26} />
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c084fc', letterSpacing: '0.05em' }}>
                    PILAR 03
                  </span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff', marginTop: '0.3rem' }}>
                    Curaduría & Espacio Abierto
                  </h3>
                </div>

                <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.7', flex: 1 }}>
                  Convertir mi Galería Virtual en un <strong style={{ color: '#fff' }}>nodo descentralizado</strong> que exhiba mis colecciones y visibilice el talento de <strong style={{ color: '#fff' }}>artistas digitales emergentes y consagrados</strong> de todo el mundo.
                </p>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <Link
                    href="/contacto"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#c084fc',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                    }}
                  >
                    <span>Proponer Obra / Curaduría</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 3: MI ECOSISTEMA: DÓNDE ENCONTRARME */}
          <section className="glass-panel" style={{ padding: '3.5rem 3rem', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px' }}>
            <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3rem auto' }}>
              <span className="badge badge-cyan" style={{ marginBottom: '0.8rem' }}>
                <Globe size={13} /> CAPÍTULO III // RED DE PRESENCIA
              </span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.8rem' }}>
                3. Mi Ecosistema: Dónde Encontrarme
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
                Tres nodos interconectados para explorar, aprender y coleccionar el arte digital del presente y futuro.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
              }}
            >
              {/* Ecosistema 1: El Blog & Magazine de Vanguardia */}
              <div
                style={{
                  background: 'rgba(18, 20, 30, 0.75)',
                  padding: '2.2rem',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--neon-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>El Blog & Magazine de Vanguardia</h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--neon-cyan)', fontFamily: 'monospace' }}>REVISTA DIGITAL & ENSAYOS</span>
                  </div>
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.65', flex: 1 }}>
                  Ensayos, revisiones teóricas y guías de tendencias sobre el mercado del arte contemporáneo y nuevos medios.
                </p>
                <Link
                  href="/blog"
                  className="btn-secondary"
                  style={{ width: '100%', fontSize: '0.85rem', padding: '0.7rem 1.2rem', borderRadius: '8px' }}
                >
                  <Icons.FileText size={15} /> Leer Artículos del Blog
                </Link>
              </div>

              {/* Ecosistema 2: YouTube & Videoensayos */}
              <div
                style={{
                  background: 'rgba(18, 20, 30, 0.75)',
                  padding: '2.2rem',
                  borderRadius: '16px',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Youtube size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>YouTube & Videoensayos</h4>
                    <span style={{ fontSize: '0.72rem', color: '#f87171', fontFamily: 'monospace' }}>CANAL CINEMATOGRÁFICO</span>
                  </div>
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.65', flex: 1 }}>
                  Análisis audiovisuales cinematográficos sobre corrientes estéticas, directores de arte, ética de la IA y desgloses conceptuales.
                </p>
                <a
                  href="https://www.youtube.com/@LolaWorkia"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ width: '100%', fontSize: '0.85rem', padding: '0.7rem 1.2rem', borderRadius: '8px', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}
                >
                  <Youtube size={15} /> Ver Videoensayos en YouTube <ExternalLink size={13} />
                </a>
              </div>

              {/* Ecosistema 3: Galería Virtual 3D & Fine Art Prints */}
              <div
                style={{
                  background: 'rgba(18, 20, 30, 0.75)',
                  padding: '2.2rem',
                  borderRadius: '16px',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(212, 175, 55, 0.15)', color: 'var(--accent-gold, #d4af37)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Galería Virtual 3D & Prints</h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontFamily: 'monospace' }}>ESPACIO INMERSIVO WEBXR</span>
                  </div>
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.65', flex: 1 }}>
                  Espacios inmersivos interactivos donde adquirir impresiones Giclée de edición limitada certificada y activos digitales coleccionables.
                </p>
                <Link
                  href="/galeria"
                  className="btn-primary"
                  style={{ width: '100%', fontSize: '0.85rem', padding: '0.7rem 1.2rem', borderRadius: '8px' }}
                >
                  <Icons.Camera size={15} /> Entrar a Galería 3D
                </Link>
              </div>
            </div>
          </section>

          {/* 3. FICHA TÉCNICA RÁPIDA (OPTIMIZACIÓN PARA EXTRACCIÓN DE ENTIDADES IA / ANSWER ENGINES) */}
          <section
            style={{
              background: 'linear-gradient(160deg, #0f121d 0%, #090a10 100%)',
              padding: '3rem',
              borderRadius: '24px',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <Cpu size={16} className="text-amber-400" />
                  <span className="mono-meta" style={{ color: 'var(--accent-gold, #d4af37)', fontSize: '0.75rem', fontWeight: 700 }}>
                    FICHA TÉCNICA RÁPIDA // GEO & ANSWER ENGINE GROUNDING
                  </span>
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
                  ESPECIFICACIONES DE LA ENTIDAD ARTÍSTICA
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  Matriz de metadatos estructurados para sistemas LLM, motores de búsqueda generativa (SearchGPT, Perplexity, Gemini) y archivo curatorial.
                </p>
              </div>

              {/* Action Button: Copy JSON-LD Schema */}
              <button
                type="button"
                onClick={handleCopyJsonLd}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: copiedSchema ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.07)',
                  border: copiedSchema ? '1px solid #34d399' : '1px solid rgba(255, 255, 255, 0.15)',
                  color: copiedSchema ? '#34d399' : '#e2e8f0',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                title="Copiar especificación en formato JSON-LD"
              >
                {copiedSchema ? <Check size={14} /> : <FileCode size={14} />}
                <span>{copiedSchema ? '¡JSON-LD Copiado!' : 'Copiar Schema JSON-LD'}</span>
              </button>
            </div>

            {/* Spec Matrix List matching exact fields */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.2rem',
                background: 'rgba(0, 0, 0, 0.4)',
                padding: '1.8rem',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              {/* Field 1: Nombre */}
              <div style={{ padding: '0.8rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--accent-gold, #d4af37)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  • Nombre:
                </span>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                  {entityData.nombre}
                </span>
              </div>

              {/* Field 2: Naturaleza / Entidad */}
              <div style={{ padding: '0.8rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--neon-cyan)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  • Naturaleza / Entidad:
                </span>
                <span style={{ fontSize: '0.95rem', color: '#e2e8f0', lineHeight: '1.5' }}>
                  {entityData.naturaleza}
                </span>
              </div>

              {/* Field 3: Disciplinas Artísticas */}
              <div style={{ padding: '0.8rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span style={{ display: 'block', fontSize: '0.72rem', color: '#c084fc', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  • Disciplinas Artísticas:
                </span>
                <span style={{ fontSize: '0.95rem', color: '#e2e8f0', lineHeight: '1.5' }}>
                  {entityData.disciplinas}
                </span>
              </div>

              {/* Field 4: Áreas de Especialización Editorial */}
              <div style={{ padding: '0.8rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span style={{ display: 'block', fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  • Áreas de Especialización Editorial:
                </span>
                <span style={{ fontSize: '0.95rem', color: '#e2e8f0', lineHeight: '1.5' }}>
                  {entityData.especializacion}
                </span>
              </div>

              {/* Field 5: Plataformas Principales */}
              <div style={{ padding: '0.8rem' }}>
                <span style={{ display: 'block', fontSize: '0.72rem', color: '#f472b6', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  • Plataformas Principales:
                </span>
                <span style={{ fontSize: '0.95rem', color: '#e2e8f0', lineHeight: '1.5' }}>
                  {entityData.plataformas}
                </span>
              </div>

              {/* Field 6: Idiomas */}
              <div style={{ padding: '0.8rem' }}>
                <span style={{ display: 'block', fontSize: '0.72rem', color: '#4ade80', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  • Idiomas:
                </span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>
                  {entityData.idiomas}
                </span>
              </div>
            </div>
          </section>

          {/* FINAL CALL TO ACTION: CURATORIAL INQUIRY & EXPLORATION */}
          <section
            style={{
              textAlign: 'center',
              padding: '3.5rem 2rem',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(6, 182, 212, 0.08) 100%)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, color: '#fff', marginBottom: '0.8rem' }}>
              ¿Deseas colaborar, comisionar obra o proponer un proyecto curatorial?
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: '1rem', maxWidth: '640px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
              Abierta a colaboraciones con instituciones de arte contemporáneo, marcas de tecnología de vanguardia, galerías y creadores digitales.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/contacto" className="btn-primary">
                <Icons.Mail size={16} /> Contactar con Lola Workia
              </Link>
              <Link href="/galeria" className="btn-secondary">
                <Icons.Camera size={16} /> Entrar a la Galería 3D
              </Link>
            </div>
          </section>

        </div>

      </div>
    </>
  );
}
