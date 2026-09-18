'use client';

import React, { useState } from 'react';
import { Gallery3DArtwork } from '@/types';
import { getProxiedImageUrl } from '@/utils/imageUtils';
import { 
  ShoppingBag, 
  Printer, 
  Volume2, 
  VolumeX,
  Sparkles, 
  Radio,
  FileText,
  X
} from 'lucide-react';

interface CuratorialSheetModalProps {
  artwork: Gallery3DArtwork | null;
  onClose: () => void;
  onBuy: (artwork: Gallery3DArtwork) => void;
  onConfigurePrint: (artwork: Gallery3DArtwork) => void;
}

export function CuratorialSheetModal({
  artwork,
  onClose,
  onBuy,
  onConfigurePrint,
}: CuratorialSheetModalProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!artwork) return null;

  // Price estimations following art token logic
  const priceEth = artwork.priceEth || '0.45';
  const calculatedEur = (parseFloat(priceEth) * 2800).toLocaleString('es-ES', {
    maximumFractionDigits: 0,
  });

  const paletteColors = artwork.palette && artwork.palette.length > 0 
    ? artwork.palette 
    : ['#D4AF37', '#8A2BE2', '#0F172A'];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 md:p-8 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#07080D] border border-white/10 rounded-2xl sm:rounded-3xl max-w-6xl w-full overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.95)] max-h-[94vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#08090E]">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
              <span className="font-mono text-xs font-bold tracking-widest uppercase text-[#00E5FF]">
                LOLA WORKIA
              </span>
            </div>
            <span className="text-slate-600 hidden sm:inline">/</span>
            <span className="font-mono text-xs tracking-widest uppercase text-slate-400">
              CÉDULA CURATORIAL & ANÁLISIS
            </span>
            <span className="font-mono text-xs text-[#99C5FF] sm:ml-4 font-normal">
              {artwork.roomName || 'Sala Principal (Gran Salón)'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
            aria-label="Cerrar ficha"
          >
            <X size={14} />
          </button>
        </div>

        {/* Modal Content - 2 Distinct Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
          
          {/* LEFT COLUMN: Visual Artwork Canvas & Color Palette Pill */}
          <div className="lg:col-span-6 bg-[#040407] relative flex flex-col justify-between min-h-[400px] lg:min-h-[620px] p-6 overflow-hidden">
            {/* Header Title inside Visual Frame */}
            <div className="z-10 mb-2">
              <h3 className="text-white/95 text-lg sm:text-xl font-bold font-syne tracking-wide drop-shadow-md">
                Lola Workia | {artwork.title} Detail
              </h3>
            </div>

            {/* Artwork Canvas Image Frame */}
            <div className="flex-1 relative flex items-center justify-center my-4">
              <div className="relative w-full h-full max-h-[460px] flex items-center justify-center">
                <img
                  src={getProxiedImageUrl(artwork.imageUrl)}
                  alt={artwork.title}
                  className="max-w-full max-h-[440px] w-auto h-auto object-contain rounded-lg shadow-[0_15px_40px_rgba(0,0,0,0.8)] border border-white/[0.08]"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
              </div>
            </div>

            {/* Floating Color Palette Pill at Bottom */}
            <div className="z-10 mt-2 flex items-center">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#0D0F18]/90 backdrop-blur-md border border-white/15 text-xs shadow-2xl">
                <Sparkles size={13} className="text-slate-300" />
                <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-slate-200 whitespace-nowrap">
                  GAMA CROMÁTICA SINTÉTICA
                </span>
                <div className="flex items-center gap-3">
                  {paletteColors.map((color, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/20 flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="uppercase tracking-tight text-slate-300">{color}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Curatorial Analysis, Audio Narration & E-Commerce */}
          <div className="lg:col-span-6 p-7 sm:p-9 flex flex-col justify-between bg-[#0A0C13] space-y-7 overflow-y-auto">
            
            {/* Top Info + Audio + Statement Group */}
            <div className="space-y-6">
              
              {/* Header Subtitle & Title */}
              <div className="space-y-2.5">
                <div className="font-mono text-[11px] tracking-widest uppercase text-slate-400 font-medium">
                  {artwork.artist ? `${artwork.artist.toUpperCase()}` : 'LOLA WORKIA STUDIO & IA'} • AÑO {artwork.year || '2026'}
                </div>

                <h2 className="text-3xl sm:text-4xl font-bold font-syne text-white tracking-tight leading-tight">
                  {artwork.title}
                </h2>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <span className="px-3 py-1 rounded-md bg-white/[0.06] border border-white/10 text-slate-300 font-mono text-xs font-medium">
                    {artwork.medium || 'Generative AI / WebGL'}
                  </span>
                  <span className="font-mono text-xs text-slate-400 font-normal">
                    {artwork.editionSize || 'Edición 1 de 15'}
                  </span>
                </div>
              </div>

              {/* Synthesized Audio Guide Player Card */}
              <div className="p-4 sm:p-4.5 rounded-xl bg-[#111420] border border-white/[0.08] space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio size={14} className="text-[#00E5FF]" />
                    <span className="font-mono text-[11px] font-bold text-slate-200 uppercase tracking-wider">
                      AUDIOGUÍA SINTÉTICA DE LOLA
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400 font-medium">01:42 / ES</span>
                </div>

                <div className="flex items-center gap-3.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="text-slate-300 hover:text-white transition-colors cursor-pointer p-0.5"
                    title={isPlayingAudio ? 'Pausar audioguía' : 'Reproducir análisis'}
                  >
                    {isPlayingAudio ? (
                      <VolumeX size={19} className="text-[#00E5FF]" />
                    ) : (
                      <Volume2 size={19} />
                    )}
                  </button>

                  {/* Soundwave bars */}
                  <div className="flex-1 flex items-center gap-1.5 h-4">
                    {[
                      { w: 'w-2.5', bg: 'bg-[#9D80FF]' },
                      { w: 'w-4', bg: 'bg-[#9D80FF]' },
                      { w: 'w-7', bg: 'bg-[#9D80FF]' },
                      { w: 'w-3.5', bg: 'bg-slate-600' },
                      { w: 'w-5', bg: 'bg-slate-600' },
                      { w: 'w-3', bg: 'bg-slate-600' },
                      { w: 'w-4.5', bg: 'bg-slate-600' },
                    ].map((bar, i) => (
                      <span
                        key={i}
                        className={`h-1.5 rounded-full ${bar.w} ${
                          isPlayingAudio ? 'bg-[#00E5FF] animate-pulse' : bar.bg
                        } transition-colors`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Curatorial Cédula & Statement */}
              <div className="space-y-2.5">
                <div className="font-mono text-xs font-bold text-[#00E5FF] flex items-center gap-2 uppercase tracking-widest">
                  <FileText size={14} className="text-[#00E5FF]" />
                  <span>DECLARACIÓN CONCEPTUAL & TÉCNICA</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {artwork.analysis ||
                    "An exploration into the threshold where biological architecture meets algorithmic determinism. 'Neural Synapse #01' utilizes advanced recursive generative adversarial networks to simulate the hyper-dense firing patterns of a human neocortex. This piece challenges the viewer to discern the difference between a natural cognitive spark and a synthesized digital logic pulse, ultimately suggesting that at a certain level of complexity, the two become indistinguishable. The evolving fractal structures represent memories forming and dissolving in real-time, capturing a fleeting moment of artificial consciousness."}
                </p>
              </div>

              {/* Technical Specifications Typography Grid */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs pt-2">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block mb-1">
                    UBICACIÓN:
                  </span>
                  <span className="text-slate-200 text-xs sm:text-sm font-medium">
                    {artwork.roomName || 'Sala Principal (Gran Salón)'}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block mb-1">
                    SOPORTE MAESTRO:
                  </span>
                  <span className="text-slate-200 text-xs sm:text-sm font-medium">
                    4K WebXR & Fine Art Giclée
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block mb-1">
                    DIMENSIONES:
                  </span>
                  <span className="text-slate-200 text-xs sm:text-sm font-medium">
                    8000 × 8000 px
                  </span>
                </div>
              </div>

              <div className="border-t border-white/[0.08] pt-1" />
            </div>

            {/* Price & Acquisition Area */}
            <div className="space-y-4 pt-1">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block mb-1.5">
                  VALOR DE ADQUISICIÓN:
                </span>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      {priceEth} <span className="text-[#00E5FF]">ETH</span>
                    </span>
                    <span className="font-mono text-xs sm:text-sm text-slate-400 font-normal">
                      (~{calculatedEur} €)
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full border border-[#00E5FF]/40 bg-[#00E5FF]/5 text-[#00E5FF] font-mono text-[10px] font-bold uppercase tracking-wider">
                    DISPONIBLE
                  </span>
                </div>
              </div>

              {/* Main Solid White Action Button */}
              <button
                type="button"
                onClick={() => onBuy(artwork)}
                className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-slate-100 text-black font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl transition-all active:scale-[0.99] cursor-pointer"
              >
                <ShoppingBag size={18} className="text-black" />
                <span>Comprar Obra</span>
              </button>

              {/* Footer Quick Links */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => onConfigurePrint(artwork)}
                  className="font-mono text-[11px] uppercase tracking-wider text-slate-400 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Printer size={13} />
                  <span>ESTUDIO DE IMPRESIÓN</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="font-mono text-[11px] uppercase tracking-wider text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  CERRAR FICHA
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
