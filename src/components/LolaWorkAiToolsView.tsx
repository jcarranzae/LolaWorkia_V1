import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ArtCritiqueTool from './ArtCritiqueTool';
import RecipesTool from './RecipesTool';
import FreelancersTool from './FreelancersTool';
import { Icons } from './Icons';
import { Eye, ShieldAlert, Sparkles, Utensils, Brush, Users, ExternalLink, Cpu } from 'lucide-react';

export const LolaWorkAiToolsView: React.FC = () => {
  const { user, loginWithGoogle } = useAuth();
  const [activeTool, setActiveTool] = useState<'3d-gallery' | 'art' | 'recipes' | 'freelancers'>('3d-gallery');

  return (
    <div className="container" style={{ paddingTop: '3rem' }}>
      {/* Header Banner conforming to DESIGN.md */}
      <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 3rem auto' }}>
        <span className="badge badge-cyan" style={{ marginBottom: '1rem' }}>
          <Cpu size={14} /> Synthetic Intelligence Studio & Sandbox
        </span>
        <h1 className="heading-display" style={{ marginBottom: '1rem' }}>
          CYBERART LAB & <span className="gradient-text-cyber">SYNTHETIC TOOLS</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.65' }}>
          Spatial 3D gallery telepresence, generative critique engine, and cybernetic network collaboration node.
        </p>
      </div>

      {/* Navigation Subtabs */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
          marginBottom: '3rem',
        }}
      >
        <button
          onClick={() => setActiveTool('3d-gallery')}
          className={activeTool === '3d-gallery' ? 'btn-cyan' : 'btn-secondary'}
          style={{ fontSize: '0.85rem', padding: '0.65rem 1.4rem' }}
        >
          <Eye size={16} /> 3D WebXR Pavilion
        </button>
        <button
          onClick={() => setActiveTool('art')}
          className={activeTool === 'art' ? 'btn-cyan' : 'btn-secondary'}
          style={{ fontSize: '0.85rem', padding: '0.65rem 1.4rem' }}
        >
          <Brush size={16} /> Cybernetic Art Critique
        </button>
        <button
          onClick={() => setActiveTool('recipes')}
          className={activeTool === 'recipes' ? 'btn-cyan' : 'btn-secondary'}
          style={{ fontSize: '0.85rem', padding: '0.65rem 1.4rem' }}
        >
          <Utensils size={16} /> Bio-Digital Gastronomy
        </button>
        <button
          onClick={() => setActiveTool('freelancers')}
          className={activeTool === 'freelancers' ? 'btn-cyan' : 'btn-secondary'}
          style={{ fontSize: '0.85rem', padding: '0.65rem 1.4rem' }}
        >
          <Users size={16} /> Collaborator Matrix
        </button>
      </div>

      {/* Active Tool Content */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glow)' }}>
        {activeTool === '3d-gallery' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 className="heading-card" style={{ fontSize: '1.3rem' }}>Spatial WebXR Cyberart Pavilion</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                  Explore interactive 3D spatial installations with full six-degrees-of-freedom camera controls.
                </p>
              </div>
              <a
                href="https://learn.aframe.io/examples/3d-gallery/"
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.55rem 1.2rem' }}
              >
                Launch Immersive Fullscreen <ExternalLink size={14} />
              </a>
            </div>
            <div
              style={{
                width: '100%',
                height: '620px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--border-glow)',
                background: '#050608',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              <iframe
                src="https://learn.aframe.io/examples/3d-gallery/"
                title="Lola Workia 3D Virtual Gallery"
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                allow="fullscreen; VR"
              />
            </div>
          </div>
        )}

        {activeTool === 'art' && <ArtCritiqueTool user={user as any} />}
        {activeTool === 'recipes' && <RecipesTool user={user as any} />}
        {activeTool === 'freelancers' && <FreelancersTool user={user as any} />}
      </div>
    </div>
  );
};

export default LolaWorkAiToolsView;
