import { GalleryItem } from '@/types';
import { LOLA_IMAGES } from '@/constants/images';

export const INITIAL_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Amanecer Editorial en la Costa Brava',
    category: 'Lookbook',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    aspectRatio: 'portrait',
    isExclusive: false,
    location: 'Begur, España',
    cameraInfo: 'Leica M11 • 35mm Summilux f/1.4',
    likes: 420,
    date: '2026-02-08'
  },
  {
    id: 'gal-2',
    title: '🔒 Sesión Privada VIP - Retrato de Alta Costura',
    category: 'VIP Exclusive',
    imageUrl: LOLA_IMAGES.PORTRAIT_HERO,
    aspectRatio: 'portrait',
    isExclusive: true,
    location: 'Estudio Alpha, Madrid',
    cameraInfo: 'Hasselblad X2D 100C • 85mm f/1.8',
    likes: 980,
    date: '2026-02-01'
  },
  {
    id: 'gal-3',
    title: 'Arquitectura Minimalista en Kyoto',
    category: 'Viajes',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    aspectRatio: 'landscape',
    isExclusive: false,
    location: 'Kyoto, Japón',
    cameraInfo: 'Sony A7IV • 24mm f/1.4 GM',
    likes: 610,
    date: '2026-01-20'
  },
  {
    id: 'gal-4',
    title: 'Noche Neón en Shinjuku',
    category: 'Viajes',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    aspectRatio: 'portrait',
    isExclusive: false,
    location: 'Tokyo, Japón',
    cameraInfo: 'Fujifilm X-Pro3 • 23mm f/2',
    likes: 745,
    date: '2026-01-18'
  },
  {
    id: 'gal-5',
    title: '🔒 Behind The Scenes: Campaña de Primavera 2026',
    category: 'VIP Exclusive',
    imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80',
    aspectRatio: 'portrait',
    isExclusive: true,
    location: 'Milán, Italia',
    cameraInfo: 'Canon R5 • 50mm f/1.2 L',
    likes: 1120,
    date: '2026-01-10'
  },
  {
    id: 'gal-6',
    title: 'Luces & Sombras Urbanas',
    category: 'Estilo de Vida',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
    aspectRatio: 'square',
    isExclusive: false,
    location: 'Barcelona, España',
    cameraInfo: 'Sony A7IV • 85mm f/1.4',
    likes: 530,
    date: '2025-12-28'
  },
  {
    id: 'gal-7',
    title: 'Atardecer Dorado en Santorini',
    category: 'Viajes',
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
    aspectRatio: 'landscape',
    isExclusive: false,
    location: 'Oia, Grecia',
    cameraInfo: 'Dji Mavic 3 Pro',
    likes: 890,
    date: '2025-12-15'
  },
  {
    id: 'gal-8',
    title: '🔒 Moodboard Creativo - Colección Privada',
    category: 'VIP Exclusive',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
    aspectRatio: 'portrait',
    isExclusive: true,
    location: 'París, Francia',
    cameraInfo: 'Kodak Portra 400 Film',
    likes: 1420,
    date: '2025-11-30'
  }
];
