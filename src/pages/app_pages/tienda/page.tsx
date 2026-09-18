'use client';

import React, { useState } from 'react';
import { INITIAL_PRESET_PRODUCTS } from '@/data/mockPresets';
import { PresetSlider } from '@/components/PresetSlider';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/Icons';

export default function ShopPage() {
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  return (
    <div className="container" style={{ paddingTop: '3rem' }}>
      
      {/* Header (DESIGN.md §3 /shop) */}
      <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 3.8rem auto' }}>
        <span className="badge badge-cyan" style={{ marginBottom: '1rem' }}>
          <Icons.ShoppingBag size={14} /> Direct Commerce & Collector Drops
        </span>
        <h1 className="heading-display" style={{ marginBottom: '1rem' }}>
          COLLECTOR <span className="gradient-text-cyber">DROPS & LUTS</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.65' }}>
          Archival fine art print editions, high-precision synthetic LUTs for DaVinci/Lightroom, and cryptographic authenticity passes.
        </p>
      </div>

      {/* Products Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
        {INITIAL_PRESET_PRODUCTS.map((prod) => {
          const isFreeForVip = prod.isExclusiveVipFree && user;

          return (
            <div key={prod.id} className="glass-panel" style={{ padding: '2.2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                  <span className="badge badge-cyan">{prod.category}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--neon-cyan)', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    <Icons.Star size={15} fill="var(--neon-cyan)" /> {prod.rating} ({prod.reviewsCount} Collectors)
                  </div>
                </div>

                <h3 className="heading-card" style={{ marginBottom: '0.6rem' }}>
                  {prod.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.55', marginBottom: '1.5rem' }}>
                  {prod.subtitle}
                </p>

                {/* Before / After Slider */}
                <div style={{ marginBottom: '1.8rem' }}>
                  <PresetSlider
                    beforeImage={prod.beforeImage}
                    afterImage={prod.afterImage}
                    labelBefore="Raw Render"
                    labelAfter="Cyber Spectrum"
                  />
                </div>

                {/* Features List */}
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                  {prod.features.map((feat, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Icons.Check size={14} color="var(--neon-cyan)" /> {feat}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price & Action */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  {isFreeForVip ? (
                    <div>
                      <span className="font-mono" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--neon-magenta)' }}>0.00 ETH</span>
                      <span className="badge badge-magenta" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>PATRON BENEFIT</span>
                    </div>
                  ) : (
                    <div>
                      <span className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>€{prod.discountPrice || prod.price}</span>
                      {prod.discountPrice && (
                        <span className="font-mono" style={{ fontSize: '0.85rem', textDecoration: 'line-through', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                          €{prod.price}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedProduct(prod)}
                  className={isFreeForVip ? 'btn-magenta' : 'btn-cyan'}
                  style={{ padding: '0.65rem 1.4rem', fontSize: '0.85rem' }}
                >
                  <Icons.Download size={15} /> {isFreeForVip ? 'Instant Patron Download' : 'Acquire Collector Edition'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Download / Checkout Modal */}
      {selectedProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px', width: '100%', padding: '2.8rem', textAlign: 'center', border: '1px solid var(--border-glow)' }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--accent-indigo) 0%, var(--neon-cyan) 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.2rem auto',
                boxShadow: '0 0 25px rgba(6, 182, 212, 0.4)',
              }}
            >
              <Icons.ShoppingBag size={24} />
            </div>

            <h3 className="heading-card" style={{ marginBottom: '0.5rem' }}>
              {selectedProduct.title}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              {user ? 'As an authenticated patron, your direct encrypted payload link is ready.' : 'Provide your node email address to receive lossless 3D files and cryptographic certificate.'}
            </p>

            <input
              type="email"
              defaultValue={user?.email || ''}
              placeholder="cyber.node@domain.xyz"
              className="input-field"
              style={{ marginBottom: '1.2rem' }}
            />

            <button
              onClick={() => {
                alert(`Direct download initiated for: ${selectedProduct.title}. Encrypted payload sent to email.`);
                setSelectedProduct(null);
              }}
              className="btn-cyan"
              style={{ width: '100%', padding: '0.9rem', fontSize: '0.92rem' }}
            >
              Confirm & Download Payload
            </button>

            <button
              onClick={() => setSelectedProduct(null)}
              className="mono-meta"
              style={{ display: 'block', margin: '1.2rem auto 0 auto', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
