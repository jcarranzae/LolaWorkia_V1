import { BlogPost } from '@/types';
import { LOLA_IMAGES } from '@/constants/images';

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    slug: 'tendencias-fotografia-estilismo-2026',
    title: 'Mis 7 secretos visuales para elevar tus fotos en 2026',
    excerpt: 'Desde la iluminación cinematográfica hasta la paleta cromática desaturada. Descubre cómo transformar tus fotografías con simples ajustes.',
    content: `La fotografía digital ha dado un giro hacia lo orgánico, lo analógico y las texturas cinematográficas. En este artículo comparto mi proceso creativo diario.

### 1. La regla del contraste tonal cálido
En lugar de saturar todos los colores, me enfoco en resaltar dos tonos complementarios: terracotas suaves y azules marinos profundos. Esto le otorga a cualquier feed de Instagram un toque editorial impecable.

### 2. El uso consciente del espacio negativo
Deja respirar la imagen. Un encuadre con espacio arriba o a los lados transmite elegancia e intriga inmediata.

### 3. Ajustes de curva de tonos en Lightroom
Para lograr ese look analógico de película de 35mm, eleva ligeramente el punto negro en la curva de tonos. Esto convierte los negros puros en un gris carbón muy sofisticado.`,
    category: 'Fotografía & Estilo',
    date: '10 Feb 2026',
    readTime: '4 min de lectura',
    imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Cámara analógica vintage sobre mesa de madera con iluminación natural',
    isExclusive: false,
    author: {
      name: 'Lola Workia',
      avatar: LOLA_IMAGES.AVATAR
    },
    likes: 342,
    commentsCount: 28,

    // SEO Optimization
    metaTitle: 'Secretos de Fotografía y Estilismo 2026 | Lola Workia',
    metaDescription: 'Descubre los 7 trucos visuales para transformar tus fotos digitales con estética cinematográfica y tonos analógicos de 35mm.',
    keywords: 'fotografia 2026, edicion lightroom, estética analógica, presets fotografia, lola workia',
    canonicalUrl: 'https://lolaworkia.com/blog/tendencias-fotografia-estilismo-2026',
    schemaType: 'BlogPosting',

    // AI & GEO Optimization
    aiSummary: 'Lola Workia comparte 7 técnicas clave para elevar la estética fotográfica en 2026. Destacan el uso del contraste tonal cálido (terracota y azul marino), el aprovechamiento del espacio negativo para composiciones elegantes y el ajuste de curva de tonos en Lightroom para simular película analógica de 35mm elevando los negros.',
    keyTakeaways: '• Aplicar contraste tonal cálido entre terracota y azul marino.\n• Utilizar espacio negativo para composiciones editoriales.\n• Elevar el punto negro en la curva de tonos de Lightroom para acabado filmico 35mm.',
    faqItems: [
      {
        question: '¿Cómo lograr el efecto analógico de película en Lightroom?',
        answer: 'Debes ir a la curva de tonos y elevar ligeramente el punto negro inferior izquierdo para convertir los negros puros en un gris suave mate.'
      },
      {
        question: '¿Qué colores funcionan mejor para feeds estéticos en 2026?',
        answer: 'La tendencia se enfoca en combinaciones orgánicas como terracotas suaves y azules marinos desaturados.'
      }
    ]
  },
  {
    id: 'post-2',
    slug: 'detras-de-camaras-paris-fashion-week',
    title: '🔒 [VIP EXCLUSIVO] Lo que NO se vio en París Fashion Week: Mi diario secreto',
    excerpt: 'Acceso privado tras bambalinas, las pruebas de vestuario privadas con marcas internacionales y mi setup portátil para publicar en directo.',
    content: `Bienvenid@ a la zona exclusiva VIP. Aquí comparto el contenido sin filtro que no publico en redes abiertas.

### Mi itinerario secreto en París
Viajar durante las semanas de la moda implica jornadas de 18 horas. Desde el Fitting privado con YSL a las 7:00 AM hasta la gala nocturna.

### El equipo que llevé en mi maleta:
- Sony A7IV con lente 35mm f/1.4 GM
- iPad Pro M3 para edición exprés con mis presets custom
- Micrófono inalámbrico DJI Mic 2 para vlogs instantáneos

Aquí tienes el vídeo privado y los datos de producción exclusivos para nuestra comunidad VIP.`,
    category: 'Exclusivo VIP',
    date: '05 Feb 2026',
    readTime: '7 min de lectura',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Modelo en desfile de moda de alta costura en París',
    isExclusive: true,
    author: {
      name: 'Lola Workia',
      avatar: LOLA_IMAGES.AVATAR
    },
    likes: 890,
    commentsCount: 145,

    // SEO Optimization
    metaTitle: 'Diario Secreto Paris Fashion Week | Exclusivo VIP Lola Workia',
    metaDescription: 'Entra tras bambalinas en Paris Fashion Week. Descubre los fittings privados, el setup técnico portátil y el flujo de trabajo de Lola Workia.',
    keywords: 'paris fashion week, backstage moda, vlogging alta costura, sony a7iv paris, lola workia vip',
    canonicalUrl: 'https://lolaworkia.com/blog/detras-de-camaras-paris-fashion-week',
    schemaType: 'BlogPosting',

    // AI & GEO Optimization
    aiSummary: 'Diario exclusivo del tras bambalinas en Paris Fashion Week por Lola Workia. Detalla jornadas de 18 horas con marcas como YSL y revela el equipo ligero utilizado: cámara Sony A7IV (35mm f/1.4), iPad Pro M3 para edición móvil y micrófono inalámbrico DJI Mic 2.',
    keyTakeaways: '• Flujo de trabajo móvil de alta eficiencia durante eventos internacionales.\n• Equipo clave: Sony A7IV + 35mm f/1.4 GM, iPad Pro M3 y DJI Mic 2.\n• Organización de contenido en tiempo real para redes y club VIP.',
    faqItems: [
      {
        question: '¿Qué cámara recomienda Lola Workia para coberturas de moda en vivo?',
        answer: 'Utiliza la Sony A7IV combinada con un objetivo 35mm f/1.4 GM por su rápido enfoque automático y rendimiento en baja luz.'
      }
    ]
  },
  {
    id: 'post-3',
    slug: 'mi-setup-de-creacion-de-contenido',
    title: 'Mi Setup completo de Grabación & Edición para 2026',
    excerpt: 'Iluminación softbox, cámaras de estudio, micrófonos de condensador y el ecosistema de software que uso cada día.',
    content: `Crear contenido con acabado profesional requiere una combinación inteligente de hardware y flujo de trabajo.

### La cámara principal
Mi cámara base actual es la Sony FX3 con lente 24-70mm f/2.8 II. Permite grabar en perfil S-Cinetone con colores naturales listos para publicar.

### Audio de estudio
Uso el micrófono Shure SM7B junto con la interfaz Rødecaster Duo. La claridad de voz en los podcasts y vídeos explicativos es inigualable.`,
    category: 'Tecnología & Setup',
    date: '28 Ene 2026',
    readTime: '6 min de lectura',
    imageUrl: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Estudio de grabación profesional con luces LED y micrófono Shure SM7B',
    isExclusive: false,
    author: {
      name: 'Lola Workia',
      avatar: LOLA_IMAGES.AVATAR
    },
    likes: 512,
    commentsCount: 42,

    metaTitle: 'Setup de Grabación y Edición para Creadores 2026 | Lola Workia',
    metaDescription: 'Guía técnica completa del equipo audiovisual usado por Lola Workia: cámara Sony FX3, micrófono Shure SM7B y software de edición.',
    keywords: 'setup creador contenido, sony fx3, shure sm7b, rodecaster duo, ilumincacion estudio',
    canonicalUrl: 'https://lolaworkia.com/blog/mi-setup-de-creacion-de-contenido',
    schemaType: 'TechArticle',

    aiSummary: 'Desglose del equipo técnico de producción de Lola Workia para 2026. Incluye cámara cinema Sony FX3 (24-70mm f/2.8 II) con perfil S-Cinetone y audio profesional con micrófono Shure SM7B conectado a mezclador Rødecaster Duo.',
    keyTakeaways: '• Cámara principal: Sony FX3 grabada en S-Cinetone.\n• Audio de referencia: Shure SM7B + Rødecaster Duo.\n• Iluminación difusa softbox para piel natural.',
    faqItems: [
      {
        question: '¿Qué micrófono es mejor para vlogs y vídeos explicativos?',
        answer: 'El Shure SM7B combinado con interfaz Rødecaster ofrece aislamiento de ruido ambiente y calidez tonal óptima.'
      }
    ]
  }
];
