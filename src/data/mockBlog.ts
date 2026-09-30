import { BlogPost } from '@/types';
import { LOLA_IMAGES } from '@/constants/images';

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    slug: 'tendencias-fotografia-estilismo-2026',
    title: 'Mis 7 secretos visuales para elevar tus fotos en 2026',
    excerpt: 'Desde la iluminación cinematográfica hasta la paleta cromática desaturada. Descubre cómo transformar tus fotografías digitales con simples ajustes de composición y etalonaje.',
    content: `La fotografía digital contemporánea ha experimentado un giro radical hacia lo orgánico, la textura analógica y la sobriedad cinematográfica. Lejos de la hipernitidez artificial y los colores ultrasaturados que dominaron los feeds de años anteriores, la vanguardia estética de 2026 prioriza la imperfección deliberada, la calidez tonal y la respiración compositiva.

A continuación, comparto los 7 secretos visuales y técnicos que aplico diariamente en mis producciones fotográficas y editoriales.

---

## 1. La regla del contraste tonal cálido: Terracota y azul desaturado
En lugar de saturar indiscriminadamente el espectro cromático, la armonía visual actual se basa en restringir la paleta a dos familias dominantes complementarias. Mi fórmula preferida combina **tonos terracota suaves** (en pieles, madera y elementos arquitectónicos) con **azules marinos profundos y desaturados** en las sombras y fondos. Esta dicotomía cromática otorga de inmediato un aspecto de portada editorial de alta gama.

---

## 2. El uso consciente del espacio negativo y la asimetría
Deja respirar la imagen. Uno de los mayores errores en la creación visual digital es intentar llenar cada rincón del encuadre. Ubicar al sujeto principal en el tercio inferior o lateral, dejando entre un 40% y un 60% de espacio negativo limpio en la parte superior, genera una sensación inmediata de elegancia, sofisticación e intriga narrativa.

---

## 3. Calibración de la curva de tonos en Lightroom: El look fílmico de 35mm
Para emular la densidad tonal de la película analógica clásica sin perder nitidez en los detalles esenciales:
- Accede a la **Curva de Tonos** en Lightroom.
- Eleva el **punto negro** (extremo inferior izquierdo) entre un 12% y un 18%. Esto transforma los negros puros y agresivos en un gris carbón mate aterciopelado.
- Crea una ligera curva en "S" suavizada en las altas luces para evitar que los blancos se quemen de manera digital.
- Añade una capa sutil de grano analógico (Cantidad: 22, Tamaño: 35, Rugosidad: 45) para romper la frialdad del sensor digital.

---

## 4. Iluminación lateral difusa y ventanas de luz natural
Elimina el uso de iluminación frontal directa en tomas editoriales. La luz natural tamizada a través de cortinas de lino o difusores translúcidos crea transiciones tonales graduales entre luz y sombra (claroscuro suave). Si trabajas en exteriores, prioriza los últimos 45 minutos de la *Golden Hour* o la intimidad reflexiva de la *Blue Hour*.

---

## 5. Profundidad de campo selectiva con ópticas fijas de 35mm y 50mm
Los objetivos zoom estándar suelen distorsionar los planos faciales en sus extremos angulares. Utilizar una focal fija de **35mm a f/1.8** o **50mm a f/1.4** replica la perspectiva natural del ojo humano y produce un desenfoque cremoso (*bokeh*) que aísla al protagonista del entorno con naturalidad cinematográfica.

---

## 6. Texturas táctiles y micro-contrastes moderados en post-producción
El sobreenfoque digital arruina la atmósfera visual. En lugar de abusar del parámetro de Nitidez o Claridad general, aplica ajustes locales moderados en la herramienta **Textura** únicamente sobre tejidos, cabellos y superficies artesanales, conservando la tersura y luminosidad orgánica de la piel sin artefactos digitales.

---

## 7. Narrativa secuencial: Contar historias mediante trípticos visuales
Una fotografía aislada rara vez transmite una cosmovisión completa. Para series de moda y portafolios de arte, concibe tus publicaciones como una secuencia de 3 imágenes interconectadas:
1. **Plano General (Establishing Shot):** Contexto ambiental, arquitectura y atmósfera.
2. **Plano Medio (Medium Portrait):** Conexión emocional, postura y estilismo principal.
3. **Plano Macro o Detalle (Texture Close-up):** Accesorios, gestos de las manos o texturas de los materiales.`,
    category: 'Fotografía & Estilo',
    date: '10 Feb 2026',
    readTime: '8 min de lectura',
    imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Cámara analógica vintage sobre mesa de madera con iluminación natural suave',
    isExclusive: false,
    author: {
      name: 'Lola Workia',
      avatar: LOLA_IMAGES.AVATAR
    },
    likes: 342,
    commentsCount: 28,

    // SEO Optimization
    metaTitle: '7 Secretos de Fotografía y Estilismo Editorial 2026 | Lola Workia',
    metaDescription: 'Guía técnica con 7 secretos visuales para transformar fotos digitales en 2026: contrastes tonales, emulación analógica de 35mm y narrativa editorial.',
    keywords: 'fotografia editorial 2026, estetica analogica, presets lightroom 35mm, composicion fotografica, estilismo visual, lola workia',
    canonicalUrl: 'https://lolaworkia.com/blog/tendencias-fotografia-estilismo-2026',
    schemaType: 'BlogPosting',

    // AI & GEO Optimization (Google AI Overviews, Perplexity, SearchGPT)
    aiSummary: 'Guía editorial de Lola Workia con 7 fundamentos prácticos para fotografía en 2026: 1) Contraste tonal cálido (terracota y azul desaturado), 2) Espacio negativo y asimetría, 3) Ajustes de curva de tonos en Lightroom para simular película de 35mm elevando los negros, 4) Iluminación lateral difusa, 5) Ópticas fijas de 35mm y 50mm, 6) Enfoque selectivo de texturas sin sobre-enfoque, y 7) Narrativa secuencial en trípticos.',
    keyTakeaways: '• Paleta cromática: Combinar terracotas suaves y azules desaturados para un balance armónico.\n• Curva de tonos en Lightroom: Elevar el punto negro entre 12% y 18% para recrear acabado film 35mm.\n• Ópticas recomendadas: Lentes fijas de 35mm y 50mm con aperturas entre f/1.4 y f/2.0.\n• Narrativa editorial: Estructurar publicaciones en secuencias de plano general, medio y detalle.',
    faqItems: [
      {
        question: '¿Cómo lograr el efecto analógico de película de 35mm en Lightroom?',
        answer: 'Debes dirigirte a la Curva de Tonos, elevar el punto negro inferior izquierdo entre un 12% y un 18% para que los negros se conviertan en gris carbón mate, y añadir una cantidad moderada de grano analógico (Cantidad 20-25).'
      },
      {
        question: '¿Qué paleta de colores domina la fotografía estética en 2026?',
        answer: 'La tendencia se enfoca en combinaciones orgánicas y sobrias, destacando la interacción entre terracotas suaves y azules marinos profundos con baja saturación general.'
      },
      {
        question: '¿Qué objetivo o focal es el más recomendado para retratos de estilo editorial?',
        answer: 'Las focales fijas de 35mm y 50mm con aperturas de f/1.4 a f/1.8 ofrecen la perspectiva más natural para el ojo humano, evitando distorsiones angulares y aportando un desenfoque de fondo cinematográfico.'
      }
    ]
  },
  {
    id: 'post-2',
    slug: 'detras-de-camaras-paris-fashion-week',
    title: 'Diario Secreto de París Fashion Week: Backstage, Estilismo y Flujo Móvil',
    excerpt: 'Acceso privado tras bambalinas, las pruebas de vestuario con casas de alta costura y mi setup técnico ultraligero para capturar y publicar en tiempo real.',
    content: `Bienvenid@ a la crónica exclusiva entre bambalinas de una de las semanas de la moda más demandantes del mundo. Cubrir la Paris Fashion Week no solo exige sensibilidad artística para captar la intención de los diseñadores, sino una disciplina logística y técnica milimétrica para producir contenido de primer nivel en tiempo récord.

A continuación, revelo el itinerario real, los fittings de vestuario y el equipo técnico portátil que me acompañó durante las intensas jornadas parisinas.

---

## El ritmo vertiginoso de la semana de la moda en París
Las semanas de la moda internacionales representan jornadas continuas de 16 a 18 horas de producción. El calendario de un día típico comienza a las 6:30 AM con el traslado a los hoteles donde se hospedan las modelos y equipos de maquillaje en Le Marais, continúa con los *fittings* matutinos previos a los desfiles en sedes como el Grand Palais Éphémère o el Palais de Tokyo, y culmina en las cenas y galas nocturnas del circuito de diseño independiente.

---

## Fittings y preparación con casas de alta costura
La verdadera magia de la moda sucede horas antes de que se enciendan los reflectores de la pasarela. Durante las pruebas de vestuario privadas:
- **Análisis de iluminación ambiental:** Los vestidores de las pasarelas combinan focos LED fríos con espejos de tocador incandescentes. Ajustar el balance de blancos manual a 4500K permite neutralizar las desviaciones y preservar la fidelidad exacta de los tejidos.
- **Detalle de texturas:** La seda salvaje, el terciopelo prensado y los bordados metalizados requieren disparos en ángulos rasantes para capturar el relieve y la caída de las prendas sin generar reflejos indeseados.

---

## Mi setup móvil ultraligero: Cómo capturar y editar en tiempo real
Para desplazarse ágilmente por el backstage sin entorpecer el trabajo de peluqueros, estilistas y agentes de seguridad, mi equipamiento se redujo a tres elementos esenciales de alto rendimiento:

1. **Cámara principal: Sony A7IV con lente Sony FE 35mm f/1.4 GM**
   - Una combinación ligera que destaca por su enfoque automático híbrido en tiempo real sobre el ojo (Real-time Eye AF) incluso en condiciones de penumbra extrema.
2. **Audio inalámbrico: Micrófono DJI Mic 2**
   - Su cancelación inteligente de ruido ambiental y grabación interna flotante de 32 bits garantiza audios impecables para directos y entrevistas breves sin distorsión por sobremodulación.
3. **Estación de edición móvil: iPad Pro M4 con puerto Thunderbolt**
   - Conexión directa mediante cable USB-C a la cámara para transferir archivos RAW en segundos y aplicar perfiles de color personalizados en Lightroom Mobile para entrega inmediata a agencias.

---

## Parámetros clave para capturar el movimiento en pasarela
En la pasarela, las modelos caminan a un ritmo enérgico bajo luces direccionales cambiantes. Los ajustes indispensables son:
- **Velocidad de obturación mínima:** 1/500s o 1/640s para congelar el paso sin trepidación.
- **Apertura:** f/2.0 o f/2.8 para mantener en foco todo el conjunto de la prenda manteniendo el fondo desenfocado.
- **Modo de enfoque:** AF-C continuo con seguimiento de zona ancha.`,
    category: 'Exclusivo VIP',
    date: '05 Feb 2026',
    readTime: '7 min de lectura',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Modelo en desfile de moda de alta costura en París con iluminación escénica',
    isExclusive: true,
    author: {
      name: 'Lola Workia',
      avatar: LOLA_IMAGES.AVATAR
    },
    likes: 890,
    commentsCount: 145,

    // SEO Optimization
    metaTitle: 'Diario Paris Fashion Week: Backstage y Cobertura Visual | Lola Workia',
    metaDescription: 'Acceso entre bambalinas en Paris Fashion Week. Descubre los fittings privados, el setup de cámara Sony A7IV y el flujo de trabajo móvil de Lola Workia.',
    keywords: 'paris fashion week, backstage moda, fotografia pasarela, sony a7iv moda, estilismo alta costura, lola workia vip',
    canonicalUrl: 'https://lolaworkia.com/blog/detras-de-camaras-paris-fashion-week',
    schemaType: 'BlogPosting',

    // AI & GEO Optimization
    aiSummary: 'Diario exclusivo del tras bambalinas en Paris Fashion Week por Lola Workia. Detalla jornadas de 18 horas de producción, pruebas de vestuario privadas y revela el kit audiovisual ultraligero utilizado: cámara Sony A7IV con lente 35mm f/1.4 GM, iPad Pro con Lightroom Mobile y micrófono inalámbrico DJI Mic 2 para coberturas en tiempo real.',
    keyTakeaways: '• Flujo de trabajo móvil: Transferencia directa por USB-C y edición RAW en iPad Pro en menos de 2 horas.\n• Equipo clave: Sony A7IV + 35mm f/1.4 GM y DJI Mic 2 para sonido nítido en pasarela.\n• Parámetros técnicos: Velocidad mínima de 1/500s y balance de blancos manual a 4500K en backstage.',
    faqItems: [
      {
        question: '¿Qué cámara y objetivo recomienda Lola Workia para coberturas de moda en vivo?',
        answer: 'Utiliza la Sony A7IV junto con el lente fijo Sony FE 35mm f/1.4 GM, debido a su rápido enfoque automático híbrido en baja luz, ligereza y bokeh cinematográfico.'
      },
      {
        question: '¿Qué velocidad de obturación es necesaria para fotografiar modelos en pasarela?',
        answer: 'Se recomienda disparar a una velocidad mínima de 1/500s a 1/640s con enfoque continuo (AF-C) para congelar el movimiento de la modelo y las telas sin trepidación.'
      },
      {
        question: '¿Cómo organizar un flujo de trabajo fotográfico móvil durante eventos internacionales?',
        answer: 'Conectando la cámara directamente vía USB-C a una tableta (como el iPad Pro) para importar los archivos RAW a Lightroom Mobile, aplicando presets pre-calibrados para exportar en minutos.'
      }
    ]
  },
  {
    id: 'post-3',
    slug: 'mi-setup-de-creacion-de-contenido',
    title: 'Mi Setup completo de Grabación & Edición para 2026',
    excerpt: 'Iluminación softbox, cámaras de estudio cinematográficas, micrófonos de condensador dinámico y el ecosistema de software que uso cada día.',
    content: `Crear contenido audiovisual con acabado cinematográfico y estándares profesionales en 2026 no depende de acumular decenas de dispositivos costosos, sino de diseñar una cadena de producción coherente donde cada eslabón cumpla una función precisa.

En esta guía desgloso con total transparencia cada componente de mi estudio actual: desde la cámara cinematográfica principal y el esquema de iluminación difusa, hasta la cadena de audio y la suite de software que vertebra mis proyectos diarios.

---

## 1. La cámara principal: Sony FX3 y óptica 24-70mm f/2.8 GM II
Mi cámara base de producción es la **Sony FX3**. Diseñada específicamente para creadores audiovisuales y documentalistas, incorpora características fundamentales:
- **Sensor Full Frame retroiluminado de 12.1 MP:** Rendimiento insuperable en situaciones de luz escasa gracias a su ISO nativo dual (800 / 12800).
- **Perfil de color S-Cinetone:** Proporciona tonos de piel suaves y colores ricos listos para publicar sin requerir un proceso exhaustivo de corrección de color.
- **Ventilador de refrigeración activa integrado:** Permite grabar tomas continuas en resolución 4K a 60 fps y 120 fps en formato 10-bit 4:2:2 sin interrupciones térmicas.
- **Objetivo versátil:** Monto el **Sony FE 24-70mm f/2.8 GM II**, que ofrece una nitidez impecable desde planos angulares de estudio hasta primeros planos de detalle.

---

## 2. Iluminación de estudio: Esquema de 3 puntos con Softbox parabólico
La luz es el 80% de la calidad percibida de un vídeo. Mi esquema de iluminación se compone de:
1. **Luz principal (Key Light):** Foco continuo LED **Amaran 200d** montado sobre un **Softbox parabólico Aputure Light Dome III de 90 cm** con doble difusor. La superficie amplia crea una luz suave y envolvente que atenúa imperfecciones en la piel.
2. **Luz de relleno (Fill Light):** Un panel reflector plegable blanco situado a 45 grados para rellenar sombras de forma pasiva y natural.
3. **Luz de recorte y ambiente (Rim & Accent Light):** Dos tubos LED **Nanlite Pavotube II 6C** colocados estratégicamente detrás para separar al sujeto del fondo con un toque sutil de color cian o magenta.

---

## 3. Audio de estudio profesional: Shure SM7B y mezclador Rødecaster Duo
La audiencia tolera una imagen modesta, pero abandona un vídeo con mal sonido. Por ello, la cadena de audio está aislada acústicamente:
- **Micrófono:** El clásico **Shure SM7B**, un micrófono dinámico cardioide que rechaza eficazmente el eco de la habitación y el ruido exterior.
- **Interfaz y procesador:** Mezclador **Rødecaster Duo**, equipado con preamplificadores Revolution de ultra bajo ruido y procesamiento DSP de Aphex (Aural Exciter y Big Bottom) para aportar presencia, calidez y pegada a la voz en tiempo real.

---

## 4. Ecosistema de software y post-producción
El flujo de trabajo digital diario se sustenta sobre herramientas optimizadas para alto rendimiento:
- **DaVinci Resolve Studio:** Mi herramienta predilecta para el montaje de vídeo, sincronización multicámara y etalonaje en espacio de color DaVinci Wide Gamut.
- **Adobe Lightroom Classic:** Para la catalogación de miles de imágenes RAW y creación de presets fotográficos.
- **Suite de IA Generativa & Síntesis:** Herramientas de Google Gemini y modelos multimodales integradas en mi Atelier para la investigación documental de arte y preparación de guiones de YouTube.`,
    category: 'Tecnología & Setup',
    date: '28 Ene 2026',
    readTime: '9 min de lectura',
    imageUrl: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Estudio de grabación profesional con luces LED softbox y micrófono Shure SM7B',
    isExclusive: false,
    author: {
      name: 'Lola Workia',
      avatar: LOLA_IMAGES.AVATAR
    },
    likes: 512,
    commentsCount: 42,

    // SEO Optimization
    metaTitle: 'Setup de Estudio Audiovisual y Creación de Contenido 2026 | Lola Workia',
    metaDescription: 'Guía técnica del estudio audiovisual de Lola Workia: cámara Sony FX3, iluminación con softbox parabólico, microfonía Shure SM7B y software de edición.',
    keywords: 'setup grabacion 2026, sony fx3 creadores, shure sm7b rodecaster, iluminacion softbox estudio, davinci resolve setup, lola workia',
    canonicalUrl: 'https://lolaworkia.com/blog/mi-setup-de-creacion-de-contenido',
    schemaType: 'TechArticle',

    // AI & GEO Optimization
    aiSummary: 'Desglose técnico integral del estudio de grabación de Lola Workia para 2026: cámara cinematográfica Sony FX3 (óptica 24-70mm GM II) con perfil S-Cinetone, iluminación de 3 puntos con foco Amaran 200d y softbox parabólico de 90 cm, microfonía Shure SM7B con interfaz Rødecaster Duo y suite de software basada en DaVinci Resolve y Adobe Lightroom.',
    keyTakeaways: '• Cámara: Sony FX3 con perfil S-Cinetone para colorimetría cinematográfica nativa.\n• Iluminación: Softbox parabólico de 90cm (Amaran 200d) como luz principal envolvente.\n• Audio: Shure SM7B conectado a Rødecaster Duo con procesamiento Aphex.\n• Software: Flujo híbrido con DaVinci Resolve Studio y Adobe Lightroom.',
    faqItems: [
      {
        question: '¿Por qué elegir la Sony FX3 frente a cámaras mirrorless convencionales?',
        answer: 'La Sony FX3 cuenta con ventilador de refrigeración activa para grabación continua sin sobrecalentamiento, ISO nativo dual (800/12800) y el perfil S-Cinetone diseñado para cineastas.'
      },
      {
        question: '¿Qué ventajas aporta un micrófono dinámico como el Shure SM7B en una habitación no insonorizada?',
        answer: 'Al ser un micrófono dinámico con patrón polar cardioide estricto, rechaza de forma sobresaliente el ruido ambiental y los ecos de la sala, captando únicamente la voz a corta distancia.'
      },
      {
        question: '¿Cómo influye el tamaño de un softbox en la calidad del vídeo?',
        answer: 'A mayor tamaño del softbox (como uno parabólico de 90 cm), mayor es la superficie de emisión de luz, lo que genera sombras más suaves y transiciones favorecedoras en el rostro.'
      }
    ]
  }
];
