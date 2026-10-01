'use client';

import React, { useState } from 'react';
import { Link } from '@/context/NavigationContext';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/Icons';
import { Lock, ShieldCheck, Key, Download, MessageSquare, Sparkles, CheckCircle2, ArrowRight, FileCode, Check } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

export default function MembersPortalPage() {
  const { user, isAdmin, blogPosts, galleryItems } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'vault' | 'qa'>('feed');
  const [questionSent, setQuestionSent] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);

  const handleSimulatedDownload = (fileName: string, fileSize: string) => {
    setDownloadFeedback(`Iniciando descarga: ${fileName} (${fileSize})...`);
    // Create an actual downloadable text/blob anchor to avoid alert()
    const element = document.createElement('a');
    const file = new Blob([`Lola Workia Exclusive Patron Asset: ${fileName}\nAuthorized for: ${user?.name || 'Patron Member'}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setTimeout(() => {
      setDownloadFeedback(null);
    }, 4000);
  };

  if (!user) {
    return (
      <div className="container" style={{ paddingTop: '5rem', maxWidth: '640px' }}>
        <SEOHead
          title="Acceso Exclusivo a Miembros"
          description="Portal exclusivo para miembros y mecenas de Lola Workia. Acceso a publicaciones privadas, bóveda 3D y diálogo directo."
        />
        <div className="glass-panel" style={{ padding: '3.5rem 2.5rem', textAlign: 'center', border: '1px solid var(--border-glow)' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--neon-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              border: '1px solid var(--border-glow)',
              boxShadow: '0 0 25px rgba(6, 182, 212, 0.3)',
            }}
          >
            <Lock size={30} />
          </div>

          <h1 className="heading-card" style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>
            PORTAL EXCLUSIVO DE MECENAZGO
          </h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.65', marginBottom: '2.2rem' }}>
            Acceso restringido para miembros de la comunidad y coleccionistas. Identifícate con tus credenciales o token de acceso.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/login" className="btn-cyan">
              <Key size={16} /> Iniciar Sesión como Miembro
            </Link>
            <Link href="/login?role=admin" className="btn-secondary" style={{ color: 'var(--neon-magenta)' }}>
              <ShieldCheck size={16} /> Acceso Administrador
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const vipPosts = blogPosts.filter((p) => p.isExclusive);
  const vipGallery = galleryItems.filter((g) => g.isExclusive);

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      <SEOHead
        title="Portal de Miembros & Mecenazgo"
        description="Área exclusiva de coleccionistas y miembros VIP de Lola Workia."
      />

      {/* User Welcome Profile Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem 2.5rem',
          marginBottom: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.8rem',
          border: '1px solid var(--border-glow)',
          background: 'linear-gradient(135deg, rgba(17, 19, 31, 0.95) 0%, rgba(79, 70, 229, 0.15) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <img
            src={user.avatarUrl}
            alt={user.name}
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '16px',
              objectFit: 'cover',
              border: '2px solid var(--neon-cyan)',
              boxShadow: '0 0 25px rgba(6, 182, 212, 0.35)',
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <h1 className="heading-card" style={{ fontSize: '1.6rem' }}>MIEMBRO: {user.name}</h1>
              {isAdmin ? (
                <span className="badge badge-magenta">
                  <ShieldCheck size={13} /> ADMINISTRADOR DEL SISTEMA
                </span>
              ) : (
                <span className="badge badge-cyan">
                  <Sparkles size={13} /> MEMBRESÍA VIP ACTIVA
                </span>
              )}
            </div>
            <div className="mono-meta" style={{ color: '#cbd5e1' }}>
              PLAN: <strong style={{ color: 'var(--neon-cyan)' }}>{user.plan || 'Mecenas Collector'}</strong> • MIEMBRO DESDE: {user.subscribedSince || '2026'}
            </div>
          </div>
        </div>

        {isAdmin && (
          <Link
            href="/miembros/admin"
            className="btn-magenta"
            style={{ padding: '0.75rem 1.5rem', fontSize: '0.88rem' }}
          >
            <ShieldCheck size={16} /> Abrir Panel de Control CMS
          </Link>
        )}
      </div>

      {/* Download toast notification */}
      {downloadFeedback && (
        <div
          style={{
            padding: '1rem 1.4rem',
            marginBottom: '1.8rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} />
          <span>{downloadFeedback}</span>
        </div>
      )}

      {/* Tabs conforming to DESIGN.md */}
      <div style={{ display: 'flex', gap: '0.8rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '2.5rem', paddingBottom: '0.8rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('feed')}
          className={activeTab === 'feed' ? 'btn-cyan' : 'btn-secondary'}
          style={{ padding: '0.55rem 1.2rem', fontSize: '0.85rem' }}
        >
          <Sparkles size={15} /> Publicaciones Exclusivas ({vipPosts.length})
        </button>

        <button
          onClick={() => setActiveTab('vault')}
          className={activeTab === 'vault' ? 'btn-cyan' : 'btn-secondary'}
          style={{ padding: '0.55rem 1.2rem', fontSize: '0.85rem' }}
        >
          <Download size={15} /> Bóveda 3D & Recursos RAW
        </button>

        <button
          onClick={() => setActiveTab('qa')}
          className={activeTab === 'qa' ? 'btn-cyan' : 'btn-secondary'}
          style={{ padding: '0.55rem 1.2rem', fontSize: '0.85rem' }}
        >
          <MessageSquare size={15} /> Consultas & Diálogo con Lola
        </button>
      </div>

      {/* TAB 1: VIP FEED */}
      {activeTab === 'feed' && (
        <div>
          {vipPosts.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p>No hay artículos exclusivos en este momento. Vuelve a consultar próximamente.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.2rem' }}>
              {vipPosts.map((post) => (
                <div key={post.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-subtle)' }}>
                  <div
                    style={{
                      height: '240px',
                      backgroundImage: `url(${post.imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                    }}
                  >
                    <span className="badge badge-cyan" style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      <Key size={12} /> ACCESO VIP DESBLOQUEADO
                    </span>
                  </div>
                  <div style={{ padding: '1.8rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div className="mono-meta" style={{ color: 'var(--neon-cyan)', marginBottom: '0.5rem', fontSize: '0.72rem' }}>
                        {post.category} • {post.readTime}
                      </div>
                      <h2 className="heading-card" style={{ fontSize: '1.25rem', marginBottom: '0.8rem' }}>{post.title}</h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                        {post.excerpt}
                      </p>
                    </div>
                    <Link href={`/blog/${post.slug}`} className="btn-cyan" style={{ padding: '0.55rem 1.2rem', fontSize: '0.85rem' }}>
                      Leer Monografía Completa <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VAULT */}
      {activeTab === 'vault' && (
        <div className="glass-panel" style={{ padding: '2.5rem', border: '1px solid var(--border-glow)' }}>
          <h2 className="heading-card" style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>
            Bóveda de Recursos 3D & Archivos de Alta Fidelidad
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '2rem' }}>
            Modelos tridimensionales en formato GLTF/USDZ, mapas de texturas PBR y perfiles de colorimetría LUT exclusivos para mecenas verificados.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.8rem' }}>
            <div style={{ padding: '1.6rem', background: 'rgba(8, 9, 14, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span className="mono-meta" style={{ color: 'var(--neon-cyan)', display: 'block', marginBottom: '0.4rem' }}>MALLA 3D USDZ / GLTF</span>
              <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: '#fff', fontSize: '1rem' }}>Pabellón Solarpunk Lola Workia (Arquitectura 3D)</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem', lineHeight: '1.6' }}>
                Texturas PBR horneadas a 4K listas para importar en Blender, Maya y Unreal Engine 5.
              </div>
              <button
                type="button"
                onClick={() => handleSimulatedDownload('Solarpunk_Pavilion_v1.zip', '148 MB')}
                className="btn-secondary"
                style={{ width: '100%', fontSize: '0.82rem' }}
              >
                <Download size={14} /> Descargar Paquete 3D (148 MB)
              </button>
            </div>

            <div style={{ padding: '1.6rem', background: 'rgba(8, 9, 14, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span className="mono-meta" style={{ color: 'var(--neon-magenta)', display: 'block', marginBottom: '0.4rem' }}>PERFIL LUT / COLOR</span>
              <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: '#fff', fontSize: '1rem' }}>Cyber-Couture Grading Profile Q1</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem', lineHeight: '1.6' }}>
                LUT 3D de 33 puntos (.cube) calibrado para DaVinci Resolve, Premiere Pro y Final Cut.
              </div>
              <button
                type="button"
                onClick={() => handleSimulatedDownload('Cyber_Couture_LUT_Q1.cube', '18 MB')}
                className="btn-secondary"
                style={{ width: '100%', fontSize: '0.82rem' }}
              >
                <Download size={14} /> Descargar Archivo LUT (.cube)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Q&A */}
      {activeTab === 'qa' && (
        <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '720px', border: '1px solid var(--border-glow)' }}>
          <h2 className="heading-card" style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>
            Diálogo Curatorial Directo con Lola Workia
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '2rem', lineHeight: '1.6' }}>
            Envía tus consultas estéticas, preguntas sobre arquitectura de prompts de IA generativa o propuestas de colaboración técnica directamente al equipo de Lola.
          </p>

          {questionSent ? (
            <div style={{ padding: '2rem', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#34d399', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.5rem' }}>
                <CheckCircle2 size={20} /> Consulta Registrada con Éxito
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.4rem' }}>
                Tu consulta ha sido enviada al atelier. Recibirás una respuesta personalizada o análisis en la próxima sesión curatorial.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuestionSent(false);
                  setQuestionText('');
                }}
                className="btn-cyan"
                style={{ fontSize: '0.85rem', padding: '0.6rem 1.2rem' }}
              >
                Enviar otra consulta
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (questionText.trim()) {
                  setQuestionSent(true);
                }
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}
            >
              <div>
                <label htmlFor="qaQuestionText" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Tu pregunta o propuesta:
                </label>
                <textarea
                  id="qaQuestionText"
                  placeholder="Escribe tu consulta artística, duda técnica o inquietud conceptual..."
                  className="input-field"
                  style={{ minHeight: '130px', resize: 'vertical' }}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-cyan" style={{ padding: '0.75rem 1.6rem', fontSize: '0.9rem' }}>
                  Transmitir Consulta a Lola Workia
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
