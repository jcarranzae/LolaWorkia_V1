'use client';

import React, { useState } from 'react';
import { Link } from '@/context/NavigationContext';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/Icons';
import { Lock, ShieldCheck, Terminal, Cpu, Key, Download, MessageSquare, Sparkles } from 'lucide-react';

export default function MembersPortalPage() {
  const { user, isAdmin, blogPosts, galleryItems } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'vault' | 'qa'>('feed');
  const [questionSent, setQuestionSent] = useState(false);
  const [questionText, setQuestionText] = useState('');

  if (!user) {
    return (
      <div className="container" style={{ paddingTop: '5rem', maxWidth: '640px' }}>
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
            PATRON ECOSYSTEM PORTAL
          </h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.65', marginBottom: '2.2rem' }}>
            Cryptographic access verification required. Authenticate using your collector credentials or administrative token.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/login" className="btn-cyan">
              <Key size={16} /> Authenticate Patron Node
            </Link>
            <Link href="/login?role=admin" className="btn-secondary" style={{ color: 'var(--neon-magenta)' }}>
              <ShieldCheck size={16} /> Admin Protocol Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const vipPosts = blogPosts.filter((p) => p.isExclusive);
  const vipGallery = galleryItems.filter((g) => g.isExclusive);

  return (
    <div className="container" style={{ paddingTop: '3rem' }}>
      
      {/* User Welcome Profile Banner (DESIGN.md §3) */}
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem',
          marginBottom: '3rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '2rem',
          border: '1px solid var(--border-glow)',
          background: 'linear-gradient(135deg, rgba(17, 19, 31, 0.95) 0%, rgba(79, 70, 229, 0.15) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <img
            src={user.avatarUrl}
            alt={user.name}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '16px',
              objectFit: 'cover',
              border: '2px solid var(--neon-cyan)',
              boxShadow: '0 0 25px rgba(6, 182, 212, 0.35)',
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <h1 className="heading-card" style={{ fontSize: '1.7rem' }}>PATRON NODE: {user.name}</h1>
              {isAdmin ? (
                <span className="badge badge-magenta">
                  <ShieldCheck size={13} /> FULL SYSTEM ADMIN
                </span>
              ) : (
                <span className="badge badge-cyan">
                  <Sparkles size={13} /> ACTIVE PATRON TIER
                </span>
              )}
            </div>
            <div className="mono-meta" style={{ color: 'var(--text-muted)' }}>
              PLAN: <strong style={{ color: 'var(--neon-cyan)' }}>{user.plan}</strong> • PROTOCOL STAMP: {user.subscribedSince}
            </div>
          </div>
        </div>

        {isAdmin && (
          <Link
            href="/miembros/admin"
            className="btn-magenta"
            style={{ padding: '0.8rem 1.6rem', fontSize: '0.9rem' }}
          >
            <ShieldCheck size={16} /> Access Admin CMS Control
          </Link>
        )}
      </div>

      {/* Tabs conforming to DESIGN.md */}
      <div style={{ display: 'flex', gap: '0.8rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '2.8rem', paddingBottom: '0.8rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('feed')}
          className={activeTab === 'feed' ? 'btn-cyan' : 'btn-secondary'}
          style={{ padding: '0.55rem 1.2rem', fontSize: '0.85rem' }}
        >
          <Sparkles size={15} /> Encrypted Dispatches ({vipPosts.length})
        </button>

        <button
          onClick={() => setActiveTab('vault')}
          className={activeTab === 'vault' ? 'btn-cyan' : 'btn-secondary'}
          style={{ padding: '0.55rem 1.2rem', fontSize: '0.85rem' }}
        >
          <Download size={15} /> 3D Assets & RAW Vault
        </button>

        <button
          onClick={() => setActiveTab('qa')}
          className={activeTab === 'qa' ? 'btn-cyan' : 'btn-secondary'}
          style={{ padding: '0.55rem 1.2rem', fontSize: '0.85rem' }}
        >
          <MessageSquare size={15} /> Lola Neural Synthesis Q&A
        </button>
      </div>

      {/* TAB 1: VIP FEED */}
      {activeTab === 'feed' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem' }}>
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
                  <Key size={12} /> UNLOCKED PATRON PAYLOAD
                </span>
              </div>
              <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 className="heading-card" style={{ marginBottom: '0.8rem' }}>{post.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    {post.excerpt}
                  </p>
                </div>
                <Link href={`/blog/${post.slug}`} className="btn-cyan" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
                  Read Unlocked Paper
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: VAULT */}
      {activeTab === 'vault' && (
        <div className="glass-panel" style={{ padding: '2.5rem', border: '1px solid var(--border-glow)' }}>
          <h3 className="heading-card" style={{ marginBottom: '0.5rem' }}>
            Exclusive Cyberart Assets & 3D Model Substrates
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '2rem' }}>
            Lossless GLTF/USDZ 3D assets, prompt seeds, and color space LUTs released exclusively to verified patrons.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.8rem' }}>
            <div style={{ padding: '1.6rem', background: 'rgba(8, 9, 14, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span className="mono-meta" style={{ color: 'var(--neon-cyan)', display: 'block', marginBottom: '0.4rem' }}>USDZ / GLTF 3D MESH</span>
              <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: '#fff' }}>Lola Workia Solarpunk Pavilion Architecture</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>Complete baked PBR materials for Blender & Unreal Engine.</div>
              <button onClick={() => alert('Download initiated: Solarpunk_Pavilion_v1.zip (148 MB)')} className="btn-secondary" style={{ width: '100%', fontSize: '0.82rem' }}>
                <Download size={14} /> Download Package (148 MB)
              </button>
            </div>

            <div style={{ padding: '1.6rem', background: 'rgba(8, 9, 14, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span className="mono-meta" style={{ color: 'var(--neon-magenta)', display: 'block', marginBottom: '0.4rem' }}>LUT / COLOR MATRIX</span>
              <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: '#fff' }}>Cyber-Couture Grading Profile Q1</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>33-point 3D .cube LUT calibrated for DaVinci Resolve & Premiere.</div>
              <button onClick={() => alert('Download initiated: Cyber_Couture_LUT_Q1.zip (18 MB)')} className="btn-secondary" style={{ width: '100%', fontSize: '0.82rem' }}>
                <Download size={14} /> Download LUT (.cube)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Q&A */}
      {activeTab === 'qa' && (
        <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '720px', border: '1px solid var(--border-glow)' }}>
          <h3 className="heading-card" style={{ marginBottom: '0.5rem' }}>Direct Synthesis Dialogue</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '2rem', lineHeight: '1.6' }}>
            Submit curatorial inquiries, prompt architecture questions, or theoretical critiques directly to Lola Workia&apos;s neural loop.
          </p>

          {questionSent ? (
            <div className="badge badge-online" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <Sparkles size={16} /> Curatorial Query Received & Synced
              </div>
              <div style={{ fontSize: '0.85rem' }}>Your inquiry is logged for analysis in the next synthetic broadcast.</div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setQuestionSent(true);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}
            >
              <textarea
                placeholder="Submit your theoretical inquiry or prompt critique..."
                className="input-field"
                style={{ minHeight: '130px' }}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                required
              />
              <button type="submit" className="btn-cyan" style={{ padding: '0.85rem' }}>
                Transmit Query to Lola
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
