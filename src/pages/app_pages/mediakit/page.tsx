'use client';

import React from 'react';
import { Icons } from '@/components/Icons';
import { Sparkles, Terminal, Activity, TrendingUp, Cpu, Globe } from 'lucide-react';

export default function MediaKitPage() {
  return (
    <div className="container" style={{ paddingTop: '3rem', maxWidth: '1100px' }}>
      
      {/* Header (DESIGN.md §3 /partnerships & mediakit) */}
      <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3.8rem auto' }}>
        <span className="badge badge-cyan" style={{ marginBottom: '1rem' }}>
          <Icons.BarChart size={14} /> Synthetic Entity Metrics & Brand Collabs
        </span>
        <h1 className="heading-display" style={{ marginBottom: '1rem' }}>
          MEDIA KIT & <span className="gradient-text-cyber">PARTNERSHIPS</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.65' }}>
          Verified audience analytics, algorithmic retention telemetry, and digital vanguard campaign case studies for luxury fashion, generative computing, and bio-tech brands.
        </p>
      </div>

      {/* Download Deck Callout */}
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '3.5rem',
          border: '1px solid var(--border-glow)',
          boxShadow: 'var(--shadow-glow)',
        }}
      >
        <div>
          <div className="mono-meta" style={{ color: 'var(--neon-cyan)', marginBottom: '0.3rem' }}>
            PRESS & CURATORIAL DOSSIER Q1-Q2 2026
          </div>
          <h3 className="heading-card" style={{ marginBottom: '0.4rem' }}>
            Download Comprehensive Partnership Deck
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Includes 3D virtual installation tariffs, WebXR sponsorships, and demographic metrics across European & North American hubs.
          </p>
        </div>

        <button
          onClick={() => alert('MediaKit 2026 PDF payload successfully compiled and downloaded.')}
          className="btn-cyan"
          style={{ padding: '0.8rem 1.6rem', fontSize: '0.9rem' }}
        >
          <Icons.Download size={16} /> Download MediaKit_2026.pdf (12.4 MB)
        </button>
      </div>

      {/* High-Level Telemetry Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3.5rem' }}>
        {[
          { label: 'GLOBAL NETWORK REACH', value: '450K+', delta: '+28% YoY', icon: Globe, color: 'var(--neon-cyan)' },
          { label: 'AVERAGE RETENTION', value: '4.8%', delta: '4x Industry Standard', icon: Activity, color: 'var(--neon-magenta)' },
          { label: 'XR SPATIAL VISITS', value: '82.4K', delta: 'Three.js / A-Frame', icon: Cpu, color: 'var(--accent-indigo)' },
          { label: 'PATRON CONVERSION', value: '11.2%', delta: 'Direct Collectors', icon: TrendingUp, color: '#34d399' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.6rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <span className="mono-meta" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{stat.label}</span>
              <stat.icon size={16} style={{ color: stat.color }} />
            </div>
            <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem' }}>
              {stat.value}
            </div>
            <span className="mono-meta" style={{ fontSize: '0.72rem', color: stat.color }}>{stat.delta}</span>
          </div>
        ))}
      </div>

      {/* Audience Demographics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3.5rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--border-subtle)' }}>
          <span className="badge badge-cyan" style={{ marginBottom: '1rem' }}>DEMOGRAPHICS</span>
          <h3 className="heading-card" style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>
            Gender & Generation Matrix
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontSize: '0.9rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Female / Non-Binary</span>
                <strong className="font-mono" style={{ color: 'var(--neon-cyan)' }}>68%</strong>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '68%', height: '100%', background: 'linear-gradient(90deg, var(--neon-cyan), var(--accent-indigo))' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Male / Other</span>
                <strong className="font-mono" style={{ color: 'var(--neon-magenta)' }}>32%</strong>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '32%', height: '100%', background: 'var(--neon-magenta)' }} />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <div className="mono-meta" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                PRIMARY COHORT: <strong style={{ color: '#fff' }}>18 - 34 YRS (79% OF COLLECTOR ECOSYSTEM)</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--border-subtle)' }}>
          <span className="badge badge-indigo" style={{ marginBottom: '1rem' }}>GEOGRAPHIC NODES</span>
          <h3 className="heading-card" style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>
            Top Regional Distributions
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>1. Spain (Madrid, Barcelona)</span>
              <strong className="font-mono" style={{ color: 'var(--neon-cyan)' }}>42%</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>2. United States (NYC, LA, Miami)</span>
              <strong className="font-mono" style={{ color: 'var(--neon-cyan)' }}>26%</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>3. Germany & UK (Berlin, London)</span>
              <strong className="font-mono" style={{ color: 'var(--neon-cyan)' }}>18%</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>4. LATAM & Japan (CDMX, Tokyo)</span>
              <strong className="font-mono" style={{ color: 'var(--neon-cyan)' }}>14%</strong>
            </li>
          </ul>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--border-subtle)' }}>
          <span className="badge badge-magenta" style={{ marginBottom: '1rem' }}>ALGORITHMIC IMPACT</span>
          <h3 className="heading-card" style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>
            Brand Collaboration Verticals
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {[
              { tag: 'High Fashion & Cyber Couture', share: '38%' },
              { tag: 'Creative AI & Hardware Compute', share: '29%' },
              { tag: 'Museum & WebXR Exhibitions', share: '21%' },
              { tag: 'Bio-Digital Wellness & Design', share: '12%' },
            ].map((v, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{v.tag}</span>
                <span className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--neon-magenta)', fontWeight: 700 }}>{v.share}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
