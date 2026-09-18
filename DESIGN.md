# DESIGN SYSTEM & WEB ARCHITECTURE SPECIFICATION (DESIGN.md)
**Project:** Lola Workia — Cyberart Ecosystem, Virtual Gallery & Digital Vanguard Magazine  
**Author:** Digital Strategy & Architecture Team  
**Version:** 1.0.0  
**Target Environment:** Next.js (App Router), React, TypeScript, Tailwind CSS, Three.js / React Three Fiber, WebXR  

---

## 1. PROJECT OVERVIEW & BRAND VISION

### 1.1 Brand Identity & Concept
Lola Workia is a synthetic virtual influencer and cyberartist powered by cutting-edge AI. The web platform acts as the central planetary hub for her global identity, bridging high-end cybernetic aesthetics with critical academic discourse on post-digital aesthetics, generative AI, glitch art, and bio-digitalism.

### 1.2 Core Objectives
- **Curatorial Authority:** Position the blog and magazine as the definitive editorial reference for contemporary cyberart and digital movements.
- **Immersive Art Experience:** Provide a high-performance 3D/WebXR Virtual Gallery for displaying and selling limited editions (physical Giclée prints and digital assets).
- **High-Conversion Monetization:** Seamlessly integrate e-commerce, commission bookings, membership tiers, and multimedia content.
- **Synthetic Immersion:** Reflect Lola’s AI-native identity through futuristic UI interactions, real-time audio-guided commentary, and reactive visual components.

---

## 2. DESIGN PHILOSOPHY & VISUAL IDENTITY

### 2.1 Aesthetic Pillars
- **Cybernetic Refinement (Dark Solarpunk / High-Tech Cyberpunk):** Deep obsidian backgrounds juxtaposed with bioluminescent ultraviolet, cyan, and electric indigo glows.
- **Editorial Brutalism meets Glassmorphism:** Clean structural grids, generous white/negative space, mono-spaced data callouts, and frosted acrylic overlays (`backdrop-filter: blur(16px)`).
- **Dynamic Chromatic Aberration & Glitch Nuances:** Subtle kinetic feedback, scanlines, and hover-triggered chromatic shifts that reinforce the synthetic persona without degrading readability.

### 2.2 Color Token System
| Token Name | Hex Code | RGB | Usage |
| :--- | :--- | :--- | :--- |
| `--bg-obsidian` | `#08090E` | `8, 9, 14` | Primary global background |
| `--bg-surface-elevated` | `#11131F` | `17, 19, 31` | Card containers, navigation bars, dropdowns |
| `--bg-glass` | `rgba(17, 19, 31, 0.65)` | - | Glassmorphism panels with blur |
| `--accent-indigo` | `#4F46E5` | `79, 70, 229` | Primary brand accent, key CTA buttons |
| `--accent-violet` | `#8B5CF6` | `139, 92, 246` | Secondary accent, gradient stops, hover states |
| `--neon-cyan` | `#06B6D4` | `6, 182, 212` | Live badges, interactive nodes, WebGL highlights |
| `--neon-magenta` | `#EC4899` | `236, 72, 153` | Alert badges, VIP exclusive tags, glitch effects |
| `--text-primary` | `#F8FAFC` | `248, 250, 252` | Primary headings and high-contrast text |
| `--text-secondary` | `#94A3B8` | `148, 163, 184` | Body copy, meta descriptions, secondary labels |
| `--text-muted` | `#64748B` | `100, 116, 139` | Footnotes, timestamps, breadcrumbs |
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` | - | Default component borders |
| `--border-glow` | `rgba(99, 102, 241, 0.40)` | - | Focused inputs, hovered cards |

### 2.3 Typography Hierarchy
- **Display & Hero Headings:** `Syne` or `Space Grotesk` (700/800 weight) — Geometric, avant-garde, and sculptural.
- **Section Headings & UI Labels:** `Outfit` or `Inter` (600/700 weight) — Modern, ultra-legible grotesque.
- **Editorial Body Text:** `Inter` or `Plus Jakarta Sans` (400/500 weight, 1.65 line-height) — Optimized for reading long-form critical essays.
- **Data Callouts, Code & Meta Tags:** `JetBrains Mono` or `Space Mono` (400/500 weight) — Evokes algorithmic and terminal intelligence.

```
H1 / Display  : 48px - 64px (clamp(3rem, 6vw, 4.5rem)) | Letter-spacing: -0.03em
H2 / Section  : 32px - 40px (clamp(2rem, 4vw, 2.5rem)) | Letter-spacing: -0.02em
H3 / Card     : 22px - 26px (clamp(1.35rem, 2.5vw, 1.65rem)) | Letter-spacing: -0.01em
Body Text     : 16px - 18px | Line-height: 1.65
Mono Meta     : 12px - 14px | Letter-spacing: 0.05em | Uppercase
```

---

## 3. INFORMATION ARCHITECTURE & SITEMAP

```
Lola Workia Web Ecosystem
├── / (Home / The Portal)
│   ├── Hero (3D Interactive Avatar Canvas & Manifesto Teaser)
│   ├── Featured Exhibition (Virtual Gallery Quick-Entry)
│   ├── Latest Cyberart Essays & Critiques
│   ├── Curated Gallery Highlights & Drop Countdown
│   └── VIP Membership / Newsletter Callout
│
├── /manifesto (About Lola & The Philosophy)
│   ├── The Lore (Synthetic Persona, AI Architecture, Artistic Vision)
│   ├── Interactive Timeline of Lola's Evolution
│   └── Press Kit & Media Mentions
│
├── /gallery (Virtual 3D & 2D Exhibition Space)
│   ├── 3D WebXR Pavilion (Immersive Walkthrough Mode)
│   ├── Catalog Grid Mode (Filter by: Artist, Medium, Era, Status)
│   ├── Artwork Deep-Dive Modal / Dynamic Route (/gallery/[slug])
│   │   ├── High-Res Zoomable Canvas (DeepZoom/OpenSeadragon)
│   │   ├── AI Voice-Guide Player (Lola's Curatorial Audio)
│   │   ├── Provenance, Specs & Conceptual Statement
│   │   └── Buy Print (Fine Art Giclée) / Collect Digital Edition
│   └── Curated Guests Room ("Curated by Lola Workia")
│
├── /magazine (Blog & Vanguard Discourse)
│   ├── Categories: Generative AI, Net Art, Post-Digital, Glitch, WebXR
│   ├── Article View (/magazine/[slug])
│   │   ├── Estimated Reading Time & Audio Essay Version
│   │   ├── Interactive Footnotes & Glossaries
│   │   └── Related Exhibitions & Suggested Works
│   └── Editorial Submissions (For external writers & theorists)
│
├── /shop (Direct Commerce & Collector Editions)
│   ├── Limited Fine Art Prints (Configurator: Frame, Size, Paper)
│   ├── Digital Collector Editions (Certificate of Authenticity)
│   ├── Educational Masterclasses & Workshop Passes
│   └── Cart & Checkout (Stripe & Crypto Gateway options)
│
├── /patronage (VIP Membership & Community)
│   ├── Tier Comparison (Initiate, Cyber-Collector, Patron)
│   ├── Exclusive Monthly Market Reports
│   └── Private Discord / Event Access
│
└── /contact-press
    ├── Media Inquiries & Booking Form
    └── Verification Key & Official Social Channels
```

---

## 4. KEY COMPONENT SPECIFICATIONS

### 4.1 Global Navigation Bar
- **Position:** Fixed top with `backdrop-filter: blur(20px)` and semi-transparent dark tint.
- **Left:** Lola Workia kinetic vector logo + dynamic status pill (`● SYSTEM ONLINE / VIRTUAL AVATAR ACTIVE`).
- **Center:** Navigation links with animated cyan underline indicators (`Gallery`, `Magazine`, `Manifesto`, `Shop`, `VIP`).
- **Right:** 
  - Audio Player Toggle (ambient synth soundscape by Lola).
  - Quick Search / Command Palette (`⌘ + K`).
  - Cart Counter & "Enter 3D" button with gradient border.

### 4.2 3D Virtual Gallery Viewer (WebXR / Three.js)
- **Engine:** React Three Fiber (`@react-three/fiber`), Drei, and Postprocessing.
- **Lighting Model:** Baked diffuse ambient occlusion + dynamic point lights reacting to user proximity.
- **Controls:** Dual-mode navigation:
  1. *First-person / Virtual Joystick* (WASD + mouse drag / touch on mobile).
  2. *Curated Teleportation Tour* (Waypoint-to-waypoint automated cinematic camera).
- **Proximity Triggers:** Approaching an artwork triggers:
  - Lola’s synthesized audio critique narrator.
  - Spatialized UI card floating adjacent to the artwork frame with price, title, and "Inspect Artwork" CTA.
- **Performance Budget:** 
  - Textures compressed via KTX2 / Basis Universal.
  - Target: 60 FPS on standard desktop GPUs, 45+ FPS on mid-tier mobile devices.

### 4.3 Audio-Narrative Player (Lola's Curatorial Voice)
- Floating dockable widget at the bottom right.
- Displays active soundwave visualizer (Canvas-based equalizer).
- Play/pause, track scrub, and transcript accordion in 2 languages (ES / EN).

### 4.4 Fine Art Print Customizer (E-Commerce Modal)
- Interactive live preview of the artwork in 3 interior settings (Minimalist Loft, Dark Cyber-Studio, Gallery White Cube).
- Real-time price calculation based on:
  - Dimensions (A3, 50x70cm, 70x100cm).
  - Paper Stock (Hahnemühle Photo Rag 308g, German Etching).
  - Framing (Matte Black Aluminum, Raw Oak, Floating Acrylic Glass).

---

## 5. TECHNICAL ARCHITECTURE & STACK

### 5.1 Frontend & Rendering
- **Framework:** Next.js 15+ (App Router with React Server Components for SEO and Static Generation).
- **Styling:** Tailwind CSS v4 + Framer Motion for micro-interactions and scroll-driven page transitions.
- **3D / XR Engine:** Three.js, React Three Fiber, React XR, glTF pipeline with Draco compression.
- **State Management:** Zustand (for audio state, gallery navigation mode, and cart drawer).

### 5.2 Backend & Data Layer
- **Content Management (Blog & Curatorial Texts):** Headless CMS (Sanity.io or Strapi) with Markdown/PortableText support.
- **Database & Auth:** Supabase (PostgreSQL) for user accounts, membership states, and wishlist data.
- **E-Commerce & Payments:** Stripe Elements + Shopify Storefront API / MedusaJS.
- **Asset Storage & CDN:** Cloudflare R2 / AWS S3 with global edge caching for multi-megabyte 3D models and lossless art files.

### 5.3 SEO & OpenGraph Architecture
- Dynamic metadata generation for all `/magazine/[slug]` and `/gallery/[slug]` routes.
- Schema.org structured data: `VisualArtwork`, `Article`, `Person` (specifying synthetic/virtual agent persona), and `VirtualLocation`.

---

## 6. RESPONSIVE BREAKPOINTS & ACCESSIBILITY

### 6.1 Breakpoints
- `Mobile (sm)`: 360px – 639px (Simplified 2D fallback for gallery, bottom navigation sheet).
- `Tablet (md)`: 640px – 1023px (Compact 3D viewer, touch-friendly orbit controls).
- `Desktop (lg)`: 1024px – 1439px (Full immersive WebGL canvas, sidebar editorial layout).
- `Ultra-wide (xl/2xl)`: 1440px+ (Max container constraint: 1600px with generous margins).

### 6.2 Accessibility & Fallback Standards
- **Reduced Motion Support:** `@media (prefers-reduced-motion)` automatically disables glitch shaders, camera sweeps, and parallax effects.
- **High-Contrast Alternative:** Full accessibility toggle converting dark theme into WCAG AAA compliant monochromatic high-contrast mode.
- **2D Gallery Alternative:** Clear toggle switch: "Switch to 2D High-Speed Catalog" for users on constrained mobile data or older devices.

---

## 7. DEVELOPMENT & DEPLOYMENT ROADMAP

1. **Sprint 1 (Weeks 1-2):** Design tokens, Figma components, Tailwind configuration, layout scaffolding.
2. **Sprint 2 (Weeks 3-4):** Magazine CMS integration, SEO schemas, dynamic article engine.
3. **Sprint 3 (Weeks 5-6):** Three.js 3D gallery architecture, lighting baking, WebXR camera controllers.
4. **Sprint 4 (Weeks 7-8):** E-Commerce checkout, print configurator, Lola's audio player integration.
5. **Sprint 5 (Weeks 9-10):** Performance optimization, lighthouse 95+ score audit, cross-browser WebGL stress testing, production launch.
