import { PresetProduct } from '@/types';
import { LOLA_IMAGES } from '@/constants/images';

export const INITIAL_PRESET_PRODUCTS: PresetProduct[] = [
  {
    id: 'preset-1',
    title: 'Lola Workia Gold Lightroom Pack 2026',
    subtitle: 'El paquete insignia de 12 presets para fotografía móvil y de estudio.',
    price: 39.99,
    discountPrice: 24.99,
    category: 'Lightroom',
    rating: 4.9,
    reviewsCount: 184,
    beforeImage: LOLA_IMAGES.PRESET_ORIGINAL,
    afterImage: LOLA_IMAGES.PRESET_EDITED,
    features: [
      '12 Presets DNG (Móvil Lightroom)',
      '12 Presets XMP (Escritorio Photoshop/Lightroom)',
      'Guía paso a paso de instalación en PDF',
      'Ajustes de tono de piel dorados y cine vintage'
    ],
    isExclusiveVipFree: true
  },
  {
    id: 'preset-2',
    title: 'Cyberpunk & Tokyo Night LUTs',
    subtitle: '6 LUTs 3D profesionales para gradación de color de vídeo 4K en Premiere y DaVinci.',
    price: 49.99,
    discountPrice: 29.99,
    category: 'LUTs',
    rating: 4.8,
    reviewsCount: 92,
    beforeImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=60',
    afterImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=60',
    features: [
      '6 Archivos .CUBE de alta fidelidad',
      'Optimizado para perfiles S-Log3, C-Log y HLG',
      'Licencia comercial de uso ilimitado'
    ],
    isExclusiveVipFree: false
  },
  {
    id: 'preset-3',
    title: 'E-Book: De Creador a Marca Personal',
    subtitle: '150 páginas con mi metodología para construir una audiencia leal y monetizar.',
    price: 19.99,
    category: 'E-Book',
    rating: 5.0,
    reviewsCount: 215,
    beforeImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=60',
    afterImage: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=60',
    features: [
      'Formato PDF + EPUB interactivo',
      'Plantillas de tarifario y presupuestos para marcas',
      'Lista de verificación para lanzamientos de campañas'
    ],
    isExclusiveVipFree: true
  }
];
