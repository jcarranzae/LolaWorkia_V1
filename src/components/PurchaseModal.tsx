'use client';

import React from 'react';
import { Gallery3DArtwork } from '@/types';
import { getProxiedImageUrl } from '@/utils/imageUtils';
import { 
  ShoppingBag, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  CreditCard,
  Lock,
  Cpu,
  Fingerprint
} from 'lucide-react';

interface PurchaseModalProps {
  artwork: Gallery3DArtwork | null;
  onClose: () => void;
}

export function PurchaseModal({ artwork, onClose }: PurchaseModalProps) {
  if (!artwork) return null;

  const priceEth = artwork.priceEth || '1.85';
  const calculatedEur = (parseFloat(priceEth) * 2800).toLocaleString('es-ES', {
    maximumFractionDigits: 0,
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-[#08090E]/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#11131F] border border-white/10 rounded-2xl sm:rounded-3xl max-w-lg w-full overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_30px_rgba(79,70,229,0.2)] p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-cyan-300">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F8FAFC]">Adquisición & Reserva</h3>
              <p className="text-xs font-mono text-slate-400">ATELIER LOLA WORKIA</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-white/10"
          >
            ✕
          </button>
        </div>

        {/* Selected Artwork Preview Card */}
        <div className="p-4 rounded-2xl bg-[#171a2b] border border-white/10 flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#08090E] flex-shrink-0 border border-white/10">
            <img
              src={getProxiedImageUrl(artwork.imageUrl)}
              alt={artwork.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="text-[11px] font-mono font-medium text-indigo-400 uppercase tracking-wider truncate">
              {artwork.artist || 'Lola Workia'}
            </div>
            <h4 className="text-sm sm:text-base font-bold text-[#F8FAFC] truncate">
              {artwork.title}
            </h4>
            <div className="text-xs font-mono font-bold text-[#F8FAFC]">
              {priceEth} <span className="text-cyan-400">ETH</span> <span className="text-slate-400 font-normal">({calculatedEur} €)</span>
            </div>
          </div>
        </div>

        {/* Informative Status Notice */}
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300">
            <Clock size={15} />
            <span>Módulo de Checkout & Smart Contract</span>
          </div>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Has seleccionado adquirir esta obra. El botón de compra y pasarela de pago (Stripe Elements / Web3 Gateway) se activará próximamente junto con la emisión del contrato inteligente y certificado de autenticidad.
          </p>
        </div>

        {/* Value Points */}
        <div className="space-y-2.5 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-cyan-400 flex-shrink-0" />
            <span>Obra original en resolución maestra 4K (Tirada Fine Art)</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-indigo-400 flex-shrink-0" />
            <span>Certificado digital verificado por el Atelier de Lola Workia</span>
          </div>
          <div className="flex items-center gap-2">
            <Fingerprint size={15} className="text-pink-400 flex-shrink-0" />
            <span>Acceso prioritario a futuros drops y exhibiciones VIP</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/30 active:scale-[0.98]"
          >
            Entendido, volver a la galería
          </button>
        </div>
      </div>
    </div>
  );
}
