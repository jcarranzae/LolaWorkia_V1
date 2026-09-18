'use client';

import React, { useState } from 'react';
import { Icons } from '@/components/Icons';
import { Mail, Sparkles, Send, ShieldCheck, Globe, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [formTab, setFormTab] = useState<'pr' | 'fan'>('pr');
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    brandOrCompany: '',
    budget: '€5,000 - €15,000 / 2 - 5 ETH',
    collaborationType: 'WebXR Spatial Installation & Co-Creation',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="container" style={{ paddingTop: '3rem', maxWidth: '1050px' }}>
      
      {/* Header (DESIGN.md §3) */}
      <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 3.8rem auto' }}>
        <span className="badge badge-cyan" style={{ marginBottom: '1rem' }}>
          <Mail size={14} /> Neural Node Communications
        </span>
        <h1 className="heading-display" style={{ marginBottom: '1rem' }}>
          INITIATE <span className="gradient-text-cyber">COLLABORATION</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.65' }}>
          Representing a luxury atelier, generative AI lab, or cultural institution? Direct curatorial and brand inquiries to Lola Workia&apos;s representation node.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'start',
        }}
      >
        {/* Left: Contact Information Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
          <div className="glass-panel" style={{ padding: '2.2rem', border: '1px solid var(--border-glow)' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--neon-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.2rem',
                border: '1px solid var(--border-glow)',
              }}
            >
              <Globe size={22} />
            </div>
            <h3 className="heading-card" style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>
              Representation & Curatorial Office
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.2rem' }}>
              For institutional exhibitions, commercial commissions, synthetic licensing, and WebXR pavilion residencies:
            </p>
            <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--neon-cyan)' }}>
              curator@lolaworkia.xyz
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2.2rem', border: '1px solid var(--border-subtle)' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(236, 72, 153, 0.15)',
                color: 'var(--neon-magenta)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.2rem',
                border: '1px solid rgba(236, 72, 153, 0.3)',
              }}
            >
              <Sparkles size={22} />
            </div>
            <h3 className="heading-card" style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>
              Studio Physical Node
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6' }}>
              Passeig de Gràcia 85, Planta 4<br />
              08008 Barcelona, Spain (Bio-Digital Node)
            </p>
          </div>
        </div>

        {/* Right: Interactive Form Panel */}
        <div className="glass-panel" style={{ padding: '2.5rem', border: '1px solid var(--border-glow)' }}>
          {/* Tab Switcher */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-full)',
              padding: '0.35rem',
              marginBottom: '2rem',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              onClick={() => setFormTab('pr')}
              className={formTab === 'pr' ? 'btn-cyan' : 'btn-secondary'}
              style={{ flex: 1, padding: '0.55rem', fontSize: '0.82rem' }}
            >
              Curatorial & Brand Proposals
            </button>
            <button
              onClick={() => setFormTab('fan')}
              className={formTab === 'fan' ? 'btn-cyan' : 'btn-secondary'}
              style={{ flex: 1, padding: '0.55rem', fontSize: '0.82rem' }}
            >
              Collector Dialogue
            </button>
          </div>

          {submitted ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1.5rem',
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid var(--border-glow)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'rgba(6, 182, 212, 0.2)',
                  color: 'var(--neon-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.2rem auto',
                }}
              >
                <Icons.Check size={28} />
              </div>
              <h3 className="heading-card" style={{ marginBottom: '0.5rem' }}>
                Transmission Synchronized!
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.8rem', lineHeight: '1.6' }}>
                Your proposal has been logged into the curatorial queue. The management node responds within 24 standard operational hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="btn-secondary"
                style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem' }}
              >
                Transmit Another Query
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
              <div>
                <label className="mono-meta" style={{ display: 'block', color: 'var(--neon-cyan)', marginBottom: '0.5rem' }}>
                  FULL NAME / REPRESENTATIVE *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  className="input-field"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="mono-meta" style={{ display: 'block', color: 'var(--neon-cyan)', marginBottom: '0.5rem' }}>
                  CONTACT EMAIL / NODE ADDRESS *
                </label>
                <input
                  type="email"
                  required
                  placeholder="node@institution.xyz"
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {formTab === 'pr' && (
                <>
                  <div>
                    <label className="mono-meta" style={{ display: 'block', color: 'var(--neon-cyan)', marginBottom: '0.5rem' }}>
                      INSTITUTION / BRAND ATELIER
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Palais de Tokyo / Acne Studios"
                      className="input-field"
                      value={formData.brandOrCompany}
                      onChange={(e) => setFormData({ ...formData, brandOrCompany: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="mono-meta" style={{ display: 'block', color: 'var(--neon-cyan)', marginBottom: '0.5rem' }}>
                      ESTIMATED PROJECT BUDGET
                    </label>
                    <select
                      className="input-field"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    >
                      <option value="€5,000 - €15,000 / 2 - 5 ETH">€5,000 - €15,000 / 2 - 5 ETH</option>
                      <option value="€15,000 - €40,000 / 5 - 15 ETH">€15,000 - €40,000 / 5 - 15 ETH</option>
                      <option value="€40,000+ / 15+ ETH">€40,000+ / 15+ ETH</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="mono-meta" style={{ display: 'block', color: 'var(--neon-cyan)', marginBottom: '0.5rem' }}>
                  PROJECT SPECIFICATION & SCOPE *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail your curatorial proposal, WebXR commission, or licensing concept..."
                  className="input-field"
                  style={{ resize: 'vertical' }}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-cyan" style={{ padding: '0.9rem', marginTop: '0.5rem' }}>
                <Send size={16} /> Transmit Curatorial Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
