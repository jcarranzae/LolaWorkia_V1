'use client';

import React, { useState } from 'react';
import { GalleryItem } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/Icons';
import { Link } from '@/context/NavigationContext';

interface LightboxModalProps {
  item: GalleryItem | null;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({ item, onClose }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(item?.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);

  if (!item) return null;

  const isLocked = item.isExclusive && !user;

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(likes + 1);
      setHasLiked(true);
    } else {
      setLikes(likes - 1);
      setHasLiked(false);
    }
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '1000px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          position: 'relative',
          padding: 0,
          background: 'var(--bg-secondary)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            zIndex: 10,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.6)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)',
          }}
        >
          <Icons.X size={20} />
        </button>

        {/* Media Container */}
        <div style={{ position: 'relative', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '350px' }}>
          <img
            src={item.imageUrl}
            alt={item.title}
            style={{
              maxWidth: '100%',
              maxHeight: '80vh',
              objectFit: 'contain',
              filter: isLocked ? 'blur(12px) brightness(0.5)' : 'none',
              transition: 'filter 0.3s ease',
            }}
          />

          {isLocked && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center',
                background: 'rgba(9, 10, 15, 0.75)',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'rgba(139, 92, 246, 0.2)',
                  color: '#c084fc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  border: '1px solid rgba(192, 132, 252, 0.4)',
                }}
              >
                <Icons.Lock size={24} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Contenido Exclusivo VIP
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '360px', marginBottom: '1.5rem' }}>
                Esta fotografía en resolución completa HD está reservada para miembros VIP del club de Lola Workia.
              </p>
              <Link href="/login" className="btn-vip" onClick={onClose}>
                Inicia Sesión o Únete VIP
              </Link>
            </div>
          )}
        </div>

        {/* Image Metadata & Info */}
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <span className="badge badge-gold">{item.category}</span>
              {item.isExclusive && <span className="badge badge-vip"><Icons.Lock size={12} /> VIP</span>}
            </div>

            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>
              {item.title}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              {item.location && (
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Ubicación:</strong> {item.location}
                </div>
              )}
              {item.cameraInfo && (
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Equipo & Lente:</strong> {item.cameraInfo}
                </div>
              )}
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Fecha de captura:</strong> {item.date}
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={handleLike}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: hasLiked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                color: hasLiked ? '#f87171' : 'var(--text-primary)',
                padding: '0.6rem 1.2rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              <Icons.Heart size={18} fill={hasLiked ? '#f87171' : 'none'} color={hasLiked ? '#f87171' : 'currentColor'} />
              {likes}
            </button>

            {!isLocked && (
              <a
                href={item.imageUrl}
                target="_blank"
                download
                className="btn-secondary"
                style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
              >
                <Icons.Download size={16} /> Descargar HD
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
