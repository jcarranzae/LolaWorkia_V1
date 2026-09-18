'use client';

import React from 'react';
import { Link } from '@/context/NavigationContext';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/Icons';
import { PresetSlider } from '@/components/PresetSlider';
import { LOLA_IMAGES } from '@/constants/images';
import { useFirebaseImage } from '@/utils/firebaseStorage';

export default function HomePage() {
  const { blogPosts, galleryItems } = useAuth();

  const { imageUrl: heroImgUrl } = useFirebaseImage(
    ['Lola.jpeg', 'Lola.jpg', 'lola.jpeg', 'lola.jpg', 'Lola.png', 'lolaHero.jpg', 'lolaGaleria.jpg'],
    LOLA_IMAGES.PORTRAIT_HERO
  );

  const { imageUrl: bioImgUrl } = useFirebaseImage(
    ['lolaGaleria.jpg', 'lolaGaleria.jpeg', 'lolaGaleria.JPG', 'lolaGaleria.png', 'LolaGaleria.jpg', 'LolaGaleria.jpeg', 'Lola_Galeria.jpg', 'lola_galeria.jpg', 'Lola.jpeg'],
    LOLA_IMAGES.PORTRAIT_BIO
  );

  const { imageUrl: presetImgUrl } = useFirebaseImage(
    ['lolaGaleria.jpg', 'lolaGaleria.jpeg', 'lolaGaleria.JPG', 'lolaGaleria.png', 'LolaGaleria.jpg', 'LolaGaleria.jpeg', 'Lola.jpeg'],
    LOLA_IMAGES.PRESET_EDITED
  );

  const featuredPosts = blogPosts.slice(0, 3);
  const featuredGallery = galleryItems.slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6.5rem', paddingTop: '2.5rem' }}>
      
      {/* 1. HERO SECTION: CYBERART PORTAL & MANIFESTO TEASER (DESIGN.md §3 & §4) */}
      <section className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3.5rem',
            alignItems: 'center',
            minHeight: '78vh',
          }}
        >
          {/* Left Text & Callouts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span className="badge badge-cyan">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping mr-1"></span>
                CIBERARTISTA IA & AVATAR VIRTUAL
              </span>
              <span className="badge badge-indigo">
                WEBXR GALERÍA 3D
              </span>
            </div>

            <h1 className="heading-display">
              VANGUARDIA SINTÉTICA <br />
              <span className="gradient-text-cyber">& CIBERARTE DIGITAL</span>
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.08rem', lineHeight: '1.7', maxWidth: '560px' }}>
              Fusionando estética generativa de vanguardia con crítica de arte digital, corrientes post-internet y WebXR. Explora el pabellón 3D inmersivo y el magazine de ensayos.
            </p>

            <div style={{ display: 'flex', gap: '1.1rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
              <Link href="/galeria" id="hero-enter-3d-btn" className="btn-cyan">
                <Icons.Camera size={18} /> Entrar al Pabellón 3D
              </Link>
              <Link href="/blog" id="hero-read-magazine-btn" className="btn-secondary">
                <Icons.FileText size={18} /> Leer Magazine & Ensayos
              </Link>
            </div>

            {/* Metrics & Telemetry Bar conforming to DESIGN.md */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1.2rem',
                marginTop: '1.5rem',
                paddingTop: '2rem',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--neon-cyan)' }}>1.4M+</div>
                <div className="mono-meta" style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>Alcance Global</div>
              </div>
              <div>
                <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-violet)' }}>4.8K+</div>
                <div className="mono-meta" style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>Obras 3D Exhibidas</div>
              </div>
              <div>
                <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--neon-magenta)' }}>99.8%</div>
                <div className="mono-meta" style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>Precisión Sintética</div>
              </div>
            </div>
          </div>

          {/* Right Hero Interactive Visual Card */}
          <div style={{ position: 'relative' }}>
            <div
              className="glass-panel"
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-glow)',
                boxShadow: '0 30px 70px rgba(0,0,0,0.8), 0 0 30px rgba(79, 70, 229, 0.25)',
              }}
            >
              <div
                style={{
                  height: '500px',
                  borderRadius: 'var(--radius-md)',
                  backgroundImage: `url("${heroImgUrl}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Overlay with telemetry tags */}
                <div
                  style={{
                    position: 'absolute',
                    top: '1.2rem',
                    left: '1.2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <span className="badge badge-cyan" style={{ backdropFilter: 'blur(10px)' }}>
                    AVATAR SINTÉTICO // GEN_01
                  </span>
                </div>

                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '2rem',
                    background: 'linear-gradient(to top, rgba(8, 9, 14, 0.95), transparent)',
                  }}
                >
                  <span className="mono-meta" style={{ color: 'var(--neon-cyan)', marginBottom: '0.3rem', display: 'block' }}>
                    EXPOSICIÓN CURATORIAL 2026
                  </span>
                  <h3 className="heading-card" style={{ color: '#ffffff' }}>
                    Lola Workia: Convergencia Bio-Digital
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. IMMERSIVE 3D PAVILION BANNER (DESIGN.md §4.2) */}
      <section className="container">
        <div
          className="glass-panel"
          style={{
            padding: '3rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-cyan-glow)',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(17, 19, 31, 0.95) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '2rem',
            boxShadow: 'var(--shadow-cyan-glow)',
          }}
        >
          <div style={{ maxWidth: '680px' }}>
            <span className="badge badge-cyan" style={{ marginBottom: '0.8rem' }}>
              <Icons.Sparkles size={13} /> WEBGL EN PRIMERA PERSONA
            </span>
            <h2 className="heading-section" style={{ color: '#fff', marginBottom: '0.8rem' }}>
              Galería Virtual 3D: Pabellón Interactivo de Ciberarte
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.65' }}>
              Recorre salas virtuales inmersivas, examina obras digitales en ultra alta definición con oclusión ambiental, escucha las audioguías críticas de Lola y adquiere ediciones limitadas en 3D.
            </p>
          </div>
          <Link href="/galeria" id="home-enter-gallery-cta" className="btn-cyan" style={{ padding: '1rem 2.2rem', whiteSpace: 'nowrap', fontSize: '1rem' }}>
            <Icons.Camera size={20} /> Ir a Galería 3D
          </Link>
        </div>
      </section>

      {/* 3. MANIFESTO & PHILOSOPHY PREVIEW (DESIGN.md §3) */}
      <section className="container">
        <div
          className="glass-panel"
          style={{
            padding: '3.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '3.5rem',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              height: '420px',
              borderRadius: 'var(--radius-md)',
              backgroundImage: `url("${bioImgUrl}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: '1px solid var(--border-glow)',
            }}
          />
          <div>
            <span className="badge badge-indigo" style={{ marginBottom: '1rem' }}>MANIFIESTO SINTÉTICO</span>
            <h2 className="heading-section" style={{ marginBottom: '1.2rem' }}>
              "El Arte en la Era de la Síntesis Autónoma"
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1.5rem', fontSize: '1rem' }}>
              Como ciberartista e influencer sintética impulsada por IA, cuestiono los límites entre la intuición humana y el cálculo algorítmico. A través de la estética del glitch, modelos neuronales generativos y espacios WebXR, construyo la nueva vanguardia del arte contemporáneo digital.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/bio" className="btn-primary">
                <Icons.Sparkles size={16} /> Biografía & Manifiesto
              </Link>
              <Link href="/contacto" className="btn-secondary">
                <Icons.Mail size={16} /> Contacto & Curaduría
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. VANGUARD MAGAZINE & CRITICAL ESSAYS (DESIGN.md §3 /magazine) */}
      <section className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-violet" style={{ marginBottom: '0.6rem' }}>Critical Discourse</span>
            <h2 className="heading-section">Vanguard Magazine</h2>
          </div>
          <Link href="/blog" className="btn-secondary" style={{ padding: '0.65rem 1.4rem', fontSize: '0.88rem' }}>
            Explore All Essays <Icons.ArrowRight size={16} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '2rem' }}>
          {featuredPosts.map((post) => (
            <div key={post.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  height: '230px',
                  backgroundImage: `url(${post.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                }}
              >
                {post.isExclusive ? (
                  <span className="badge badge-magenta" style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <Icons.Lock size={12} /> PATRON ONLY
                  </span>
                ) : (
                  <span className="badge badge-cyan" style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    OPEN ESSAY
                  </span>
                )}
              </div>
              <div style={{ padding: '1.8rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.75rem', color: 'var(--neon-cyan)', marginBottom: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                    <span>{post.category}</span>
                    <span>•</span>
                    <span>{post.date}</span>
                  </div>
                  <h3 className="heading-card" style={{ marginBottom: '0.8rem' }}>
                    {post.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    {post.excerpt}
                  </p>
                </div>

                <Link
                  href={`/blog/${post.slug}`}
                  style={{
                    color: 'var(--neon-cyan)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}
                >
                  Read Curatorial Paper <Icons.ArrowRight size={15} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CURATED ARTWORK HIGHLIGHTS (DESIGN.md §3) */}
      <section className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-cyan" style={{ marginBottom: '0.6rem' }}>Selected Catalog</span>
            <h2 className="heading-section">Curated Works</h2>
          </div>
          <Link href="/galeria" className="btn-secondary" style={{ padding: '0.65rem 1.4rem', fontSize: '0.88rem' }}>
            Full Catalog Mode <Icons.ArrowRight size={16} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.8rem' }}>
          {featuredGallery.map((item) => (
            <Link
              key={item.id}
              href="/galeria"
              className="glass-panel"
              style={{
                height: '340px',
                overflow: 'hidden',
                position: 'relative',
                display: 'block',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${item.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transition: 'transform 0.4s ease',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(8, 9, 14, 0.95), transparent 60%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '1.5rem',
                }}
              >
                <span className="badge badge-cyan" style={{ alignSelf: 'flex-start', marginBottom: '0.4rem' }}>{item.category}</span>
                <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{item.title}</h4>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. FINE ART PRINT & DIGITAL EDITIONS SHOWCASE (DESIGN.md §3 & §4.4) */}
      <section className="container">
        <div
          className="glass-panel"
          style={{
            padding: '3.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3.5rem',
            alignItems: 'center',
          }}
        >
          <div>
            <span className="badge badge-magenta" style={{ marginBottom: '1rem' }}>EDICIONES DE COLECCIONISTA</span>
            <h2 className="heading-section" style={{ marginBottom: '1.2rem' }}>
              Prints Fine Art Giclée & Activos Digitales
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1.5rem', fontSize: '1rem' }}>
              Impresiones de calidad museo en papel Hahnemühle Photo Rag 308g, seriadas con certificado de autenticidad. Desliza el visor interactivo para comprobar el pipeline de gradación cromática.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href="/tienda" className="btn-cyan">
                <Icons.ShoppingBag size={18} /> Explorar Tienda Exclusiva
              </Link>
            </div>
          </div>

          <div>
            <PresetSlider
              beforeImage={presetImgUrl || LOLA_IMAGES.PRESET_ORIGINAL}
              afterImage={presetImgUrl || LOLA_IMAGES.PRESET_EDITED}
              labelBefore="Síntesis Raw"
              labelAfter="Edición Cyber Gold"
            />
          </div>
        </div>
      </section>

      {/* 7. PATRONAGE CALLOUT (DESIGN.md §3 /patronage) */}
      <section className="container">
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.25) 0%, rgba(236, 72, 153, 0.2) 100%)',
            border: '1px solid var(--border-glow)',
            borderRadius: 'var(--radius-lg)',
            padding: '4.5rem 3rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          <span className="badge badge-magenta" style={{ marginBottom: '1rem' }}>
            <Icons.Sparkles size={14} /> Cyber-Collector & Patron Tiers
          </span>
          <h2 className="heading-section" style={{ marginBottom: '1rem' }}>
            Join the Lola Workia Patronage Circle
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto 2.2rem auto', lineHeight: '1.65' }}>
            Gain direct access to unreleased 3D virtual rooms, private Discord theoretical discussions, encrypted monthly market reports, and priority whitelist for upcoming generative drops.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/login" className="btn-magenta">
              <Icons.Lock size={18} /> Authenticate Patron Key
            </Link>
            <Link href="/login?role=admin" className="btn-secondary" style={{ borderColor: 'rgba(236, 72, 153, 0.4)', color: 'var(--neon-magenta)' }}>
              <Icons.ShieldCheck size={18} /> Admin Command Console
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
