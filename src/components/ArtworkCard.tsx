'use client';

import React from 'react';
import { Gallery3DArtwork, GalleryItem } from '@/types';
import { getProxiedImageUrl } from '@/utils/imageUtils';
import { 
  Eye, 
  ShoppingBag, 
  Sliders, 
  Volume2, 
  Sparkles, 
  ShieldCheck,
  Tag,
  Palette,
  Maximize2
} from 'lucide-react';

export interface UnifiedArtwork extends Gallery3DArtwork {
  type?: '3d' | '2d';
  category?: string;
  priceEur?: string;
  raw2D?: GalleryItem;
  raw3D?: Gallery3DArtwork;
}

interface ArtworkCardProps {
  artwork: UnifiedArtwork;
  onInspect: (artwork: Gallery3DArtwork) => void;
  onBuy: (artwork: Gallery3DArtwork) => void;
  onConfigurePrint: (artwork: Gallery3DArtwork) => void;
  showRoomBadge?: boolean;
}

export function ArtworkCard({
  artwork,
  onInspect,
  onBuy,
  onConfigurePrint,
  showRoomBadge = true,
}: ArtworkCardProps) {
  // Estimated pricing fallback if not provided
  const priceEth = artwork.priceEth || '1.85';
  const calculatedEur = (parseFloat(priceEth) * 2800).toLocaleString('es-ES', {
    maximumFractionDigits: 0,
  });

  const handleInspect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInspect(artwork);
  };

  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBuy(artwork);
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConfigurePrint(artwork);
  };

  return (
    <div
      className="group relative rounded-2xl border border-white/10 bg-[#11131F] hover:border-indigo-500/50 transition-all duration-300 shadow-xl hover:shadow-[0_0_30px_rgba(79,70,229,0.18)] flex flex-col justify-between overflow-hidden"
    >
      {/* Top Image Section */}
      <div className="p-4 pb-0">
        <div 
          className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#08090E] cursor-pointer border border-white/5 group-hover:border-indigo-500/30 transition-all"
          onClick={handleInspect}
        >
          <img
            src={getProxiedImageUrl(artwork.imageUrl)}
            alt={artwork.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80';
            }}
          />
          {/* Gentle dark vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090E]/90 via-transparent to-transparent pointer-events-none" />

          {/* Badges on Top */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
            {showRoomBadge && artwork.roomName ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-black/75 backdrop-blur-md text-cyan-300 border border-cyan-500/30 shadow-md">
                {artwork.roomName}
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-black/75 backdrop-blur-md text-cyan-300 border border-cyan-500/30 shadow-md">
                {artwork.medium || 'Modelado 3D'}
              </span>
            )}

            {artwork.isExclusive && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-pink-500/25 backdrop-blur-md text-pink-300 border border-pink-500/40 shadow-md">
                VIP
              </span>
            )}
          </div>

          {/* Quick Hover Inspect Button */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleInspect}
              className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-lg hover:scale-105"
              title="Abrir ficha curatorial"
              aria-label="Abrir ficha curatorial"
            >
              <Maximize2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Section with High-Contrast Typography & Spacing */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Artist & Year Row */}
          <div className="flex items-center justify-between text-xs font-mono font-medium tracking-wider uppercase text-indigo-400">
            <span className="flex items-center gap-1.5 text-indigo-300">
              <Sparkles size={13} className="text-cyan-400" />
              {artwork.artist || 'Lola Workia'}
            </span>
            <span className="text-slate-500">{artwork.year || '2026'}</span>
          </div>

          {/* Artwork Title */}
          <h4 
            onClick={handleInspect}
            className="text-lg font-bold text-[#F8FAFC] group-hover:text-cyan-300 transition-colors leading-snug tracking-tight cursor-pointer"
          >
            {artwork.title}
          </h4>

          {/* Medium / Technique Tag */}
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded text-xs font-mono font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20">
              {artwork.medium || 'Modelado Digital & Redes Neuronales'}
            </span>
          </div>

          {/* Curatorial Excerpt */}
          <p className="text-sm text-[#94A3B8] leading-relaxed line-clamp-2">
            {artwork.analysis || 'Composición artística contemporánea con texturizado de alta fidelidad e integración espacial en la galería virtual.'}
          </p>

          {/* Color Palette Swatches or Authenticity Tag */}
          <div className="pt-1 flex items-center justify-between gap-3 text-xs">
            {artwork.palette && artwork.palette.length > 0 ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono text-slate-500 mr-1">PALETA:</span>
                {artwork.palette.map((color, i) => (
                  <span
                    key={i}
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            ) : (
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <ShieldCheck size={13} className="text-cyan-400" />
                Certificado On-Chain
              </span>
            )}

            <span className="font-mono text-[11px] text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
              {artwork.editionSize || '1/15 Edición'}
            </span>
          </div>
        </div>

        {/* Pricing Strip & Action Buttons */}
        <div className="pt-4 mt-4 border-t border-white/10 space-y-3">
          {/* Price Header */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 uppercase tracking-wider">
              <Tag size={12} className="text-cyan-400" />
              <span>Adquisición:</span>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-[#F8FAFC] font-mono">
                {priceEth} <span className="text-cyan-400 text-xs">ETH</span>
              </span>
              <span className="text-xs text-slate-400 ml-1.5">
                (~{calculatedEur} €)
              </span>
            </div>
          </div>

          {/* Primary Action: COMPRAR Button (Electric Gradient) */}
          <button
            type="button"
            onClick={handleBuy}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <ShoppingBag size={16} className="text-white" />
            <span>Comprar Obra</span>
          </button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleInspect}
              className="py-2 px-2.5 rounded-xl bg-[#171a2b] hover:bg-[#20243b] text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-white/10 hover:border-cyan-500/30"
            >
              <Volume2 size={13} className="text-cyan-400" />
              <span>Ver Ficha</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-white/10"
            >
              <Sliders size={13} className="text-slate-400" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
