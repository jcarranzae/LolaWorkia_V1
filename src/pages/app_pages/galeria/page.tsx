'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { GalleryItem, Gallery3DArtwork } from '@/types';
import { DEFAULT_VIRTUAL_ROOMS, INITIAL_3D_ARTWORKS } from '@/data/mockGallery3D';
import { LightboxModal } from '@/components/LightboxModal';
import { VirtualGalleryCanvas } from '@/components/VirtualGalleryCanvas';
import { ArtworkCard, UnifiedArtwork } from '@/components/ArtworkCard';
import { CuratorialSheetModal } from '@/components/CuratorialSheetModal';
import { PurchaseModal } from '@/components/PurchaseModal';
import { getProxiedImageUrl } from '@/utils/imageUtils';
import { 
  Globe, 
  Box, 
  Eye, 
  Compass, 
  Layers, 
  Camera, 
  ExternalLink,
  Volume2,
  Sliders,
  Check,
  ShoppingBag,
  Sparkles,
  Search,
  Filter,
  Grid,
  Maximize2,
  Tag,
  Palette,
  ShieldCheck,
  Download
} from 'lucide-react';

interface RoomData {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  atmosphere: string;
  bgGradient: string;
  artworks: (Gallery3DArtwork & { priceEth?: string; editionSize?: string })[];
}

export default function VirtualGalleryPage() {
  const { galleryItems, gallery3dArtworks } = useAuth();
  const [activeTab, setActiveTab] = useState<'3d-tour' | 'all-artworks' | 'photo-catalog' | 'print-configurator' | 'webxr-vr'>('3d-tour');
  const [selectedRoomIndex, setSelectedRoomIndex] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [collectionFilter, setCollectionFilter] = useState<'all' | '3d' | '2d' | 'recent' | 'exclusive'>('all');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);
  const [active3DArtwork, setActive3DArtwork] = useState<Gallery3DArtwork | null>(null);
  const [purchasingArtwork, setPurchasingArtwork] = useState<Gallery3DArtwork | null>(null);

  // Print Configurator State
  const [selectedDimension, setSelectedDimension] = useState<'A3' | '50x70' | '70x100'>('50x70');
  const [selectedPaper, setSelectedPaper] = useState<'Hahnemuhle' | 'GermanEtching' | 'MetallicGloss'>('Hahnemuhle');
  const [selectedFrame, setSelectedFrame] = useState<'MatteBlack' | 'RawOak' | 'FloatingAcrylic'>('MatteBlack');
  const [selectedSetting, setSelectedSetting] = useState<'MinimalLoft' | 'CyberStudio' | 'WhiteCube'>('CyberStudio');
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [configuratorArtwork, setConfiguratorArtwork] = useState<{
    title: string;
    artist: string;
    imageUrl: string;
    medium?: string;
  }>({
    title: 'Sinfonía Algorítmica I',
    artist: 'Lola Work Studio',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    medium: 'Redes Neuronales & Pintura Digital',
  });

  // Dynamic calculation of rooms, merging user uploaded artworks with default mock rooms
  const virtualRooms: RoomData[] = useMemo(() => {
    // 1. Process default rooms
    const processedRooms: RoomData[] = DEFAULT_VIRTUAL_ROOMS.map((room) => {
      // Find all artworks uploaded by user for this room (from Firestore/state)
      const userArtworks = (gallery3dArtworks || []).filter((art) => art.roomId === room.id);

      // Find initial mock artworks for this room that aren't already included
      const defaultArtworks = INITIAL_3D_ARTWORKS.filter(
        (art) => art.roomId === room.id && !userArtworks.some((u) => u.id === art.id || u.title === art.title)
      );

      // User uploaded artworks appear FIRST in the room
      const combined = [...userArtworks, ...defaultArtworks];

      return {
        id: room.id,
        name: room.name,
        subtitle: room.subtitle,
        description: room.description,
        atmosphere: room.atmosphere,
        bgGradient: room.bgGradient || 'from-neutral-900 via-neutral-950 to-black',
        artworks: combined.map((a, i) => ({
          ...a,
          priceEth: a.priceEth || `${(0.45 + i * 0.15).toFixed(2)} ETH`,
          editionSize: a.editionSize || `Edición 1 de ${15 + i * 5}`,
        })),
      };
    });

    // 2. Detect any custom rooms created by users in Firestore
    const standardRoomIds = new Set(DEFAULT_VIRTUAL_ROOMS.map((r) => r.id));
    const customRoomIds = new Set(
      (gallery3dArtworks || [])
        .map((a) => a.roomId)
        .filter((id) => id && !standardRoomIds.has(id))
    );

    customRoomIds.forEach((cId) => {
      const customArts = (gallery3dArtworks || []).filter((a) => a.roomId === cId);
      if (customArts.length > 0) {
        processedRooms.push({
          id: cId,
          name: customArts[0]?.roomName || `Sala: ${cId}`,
          subtitle: 'Pabellón Personalizado de Exposición',
          description: `Espacio de exhibición curado específicamente para las obras registradas bajo "${customArts[0]?.roomName || cId}".`,
          atmosphere: 'Iluminación Especular Dinámica',
          bgGradient: 'from-amber-950/40 via-neutral-900 to-black',
          artworks: customArts.map((a, i) => ({
            ...a,
            priceEth: a.priceEth || '0.65 ETH',
            editionSize: a.editionSize || 'Edición 1 de 10',
          })),
        });
      }
    });

    // 3. Check for any orphan artworks without a roomId and attach them to the first room
    const unassigned = (gallery3dArtworks || []).filter(
      (a) => !a.roomId || (!standardRoomIds.has(a.roomId) && !customRoomIds.has(a.roomId))
    );
    if (unassigned.length > 0 && processedRooms[0]) {
      const formattedUnassigned = unassigned.map((a, i) => ({
        ...a,
        priceEth: a.priceEth || '0.50 ETH',
        editionSize: a.editionSize || 'Edición Única',
      }));
      // Avoid duplicate IDs
      const existingIds = new Set(processedRooms[0].artworks.map((art) => art.id));
      const novel = formattedUnassigned.filter((art) => !existingIds.has(art.id));
      processedRooms[0].artworks = [...novel, ...processedRooms[0].artworks];
    }

    return processedRooms;
  }, [gallery3dArtworks]);

  const currentRoom = virtualRooms[selectedRoomIndex] || virtualRooms[0] || {
    id: 'gran-salon',
    name: 'Sala Principal (Gran Salón)',
    subtitle: 'Exposición Central',
    description: 'Pabellón central de arte contemporáneo y colecciones permanentes.',
    atmosphere: 'Luz Cálida Focalizada',
    bgGradient: 'from-neutral-900 via-neutral-950 to-black',
    artworks: [],
  };

  // Filter 2D photo catalog items
  const photoCategories = ['Todos', 'Lookbook', 'Viajes', 'Estilo de Vida', 'VIP Exclusive'];
  const filteredPhotoItems = useMemo(() => {
    return galleryItems.filter((item) => {
      if (selectedCategory === 'Todos') return true;
      if (selectedCategory === 'VIP Exclusive') return item.isExclusive;
      return item.category === selectedCategory;
    });
  }, [galleryItems, selectedCategory]);

  // Unified list of ALL artworks for the "Colección Completa" tab
  const allUnifiedArtworks: UnifiedArtwork[] = useMemo(() => {
    const list: UnifiedArtwork[] = [];

    // 3D Artworks from all active virtual rooms
    virtualRooms.forEach((room) => {
      room.artworks.forEach((art) => {
        list.push({
          ...art,
          type: '3d',
          roomName: room.name,
          roomId: room.id,
          raw3D: art,
        });
      });
    });

    // 2D Gallery Items
    (galleryItems || []).forEach((item, idx) => {
      list.push({
        id: item.id,
        title: item.title,
        roomId: 'catalogo-2d',
        roomName: item.category || 'Catálogo 2D',
        artist: 'Lola Work Photography',
        imageUrl: item.imageUrl,
        year: item.date ? item.date.substring(0, 4) : '2026',
        medium: 'Fotografía Editorial & Fine Art',
        analysis: `Fotografía editorial original capturada en ${item.location || 'estudio'}. Archivo maestro de alta resolución.`,
        palette: ['#0f172a', '#d4af37', '#f8fafc'],
        isExclusive: item.isExclusive,
        priceEth: `${(0.65 + (idx % 4) * 0.2).toFixed(2)}`,
        editionSize: 'Tirada Fine Art 1/25',
        type: '2d',
        raw2D: item,
      });
    });

    return list;
  }, [virtualRooms, galleryItems]);

  // Filtered unified collection
  const filteredUnifiedCollection = useMemo(() => {
    return allUnifiedArtworks.filter((art) => {
      // Type Filter
      if (collectionFilter === '3d' && art.type !== '3d') return false;
      if (collectionFilter === '2d' && art.type !== '2d') return false;
      if (collectionFilter === 'exclusive' && !art.isExclusive) return false;

      // Search query
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const matchTitle = art.title.toLowerCase().includes(q);
        const matchArtist = art.artist?.toLowerCase().includes(q);
        const matchCategory = art.category?.toLowerCase().includes(q);
        const matchMedium = art.medium?.toLowerCase().includes(q);
        const matchRoom = art.roomName?.toLowerCase().includes(q);
        if (!matchTitle && !matchArtist && !matchCategory && !matchMedium && !matchRoom) {
          return false;
        }
      }

      return true;
    });
  }, [allUnifiedArtworks, collectionFilter, searchTerm]);

  // Total count stats
  const total3DCount = gallery3dArtworks?.length || 0;
  const total2DCount = galleryItems?.length || 0;
  const totalCombinedCount = total3DCount + total2DCount;

  // Print Configurator Price Calculation
  const calculatePrice = () => {
    let base = 180;
    if (selectedDimension === '50x70') base += 85;
    if (selectedDimension === '70x100') base += 170;
    if (selectedPaper === 'GermanEtching') base += 45;
    if (selectedPaper === 'MetallicGloss') base += 60;
    if (selectedFrame === 'RawOak') base += 65;
    if (selectedFrame === 'FloatingAcrylic') base += 120;
    return base;
  };

  const handleOpenInConfigurator = (artwork: { title: string; artist?: string; imageUrl: string; medium?: string }) => {
    setConfiguratorArtwork({
      title: artwork.title,
      artist: artwork.artist || 'Lola Work Studio',
      imageUrl: artwork.imageUrl,
      medium: artwork.medium || 'Fine Art Giclée',
    });
    setActive3DArtwork(null);
    setActiveItem(null);
    setActiveTab('print-configurator');
  };

  return (
    <div className="min-h-screen bg-[#08090E] text-[#F8FAFC] pt-8 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Navigation Tabs Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-cyan-300 text-xs font-mono font-semibold uppercase tracking-widest mb-3">
            <Sparkles size={13} className="text-cyan-400" />
            <span>Pabellón 3D & Ecosistema de Arte</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3">
            GALERÍA <span className="bg-gradient-to-r from-white via-indigo-200 to-cyan-400 bg-clip-text text-transparent">VIRTUAL</span>
          </h1>

          <p className="text-[#94A3B8] text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            Explora las salas de exhibición tridimensionales en WebXR, examina las piezas interactivas y descubre la colección curada por Lola Workia.
          </p>

          {/* Navigation Mode Pill Switcher */}
          <div className="inline-flex flex-wrap items-center justify-center p-1.5 rounded-full bg-[#11131F] border border-white/10 shadow-xl gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('3d-tour')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activeTab === '3d-tour'
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Globe size={16} className={activeTab === '3d-tour' ? 'text-white' : 'text-cyan-400'} />
              <span>Pabellón 3D & Estancias</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('all-artworks')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'all-artworks'
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Grid size={16} className={activeTab === 'all-artworks' ? 'text-white' : 'text-indigo-400'} />
              <span>Colección Completa ({totalCombinedCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('photo-catalog')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'photo-catalog'
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Camera size={16} className={activeTab === 'photo-catalog' ? 'text-white' : 'text-cyan-400'} />
              <span>Catálogo Editorial ({total2DCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('print-configurator')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'print-configurator'
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sliders size={16} className={activeTab === 'print-configurator' ? 'text-white' : 'text-violet-400'} />
              <span>Estudio de Impresión</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: PABELLÓN 3D & ESTANCIAS */}
        {/* ========================================================================= */}
        {activeTab === '3d-tour' && (
          <div className="space-y-10">
            {/* 3D Virtual Room Canvas Viewer */}
            <div>
              <VirtualGalleryCanvas
                roomName={currentRoom.name}
                roomAtmosphere={currentRoom.atmosphere}
                roomSubtitle={currentRoom.subtitle}
                artworks={currentRoom.artworks}
                onSelectArtwork={(art) => setActive3DArtwork(art)}
              />
            </div>

            {/* Room Selector Cards Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-[#F8FAFC]">
                  <Compass size={18} className="text-cyan-400" />
                  <span>Salas y Estancias del Pabellón ({virtualRooms.length})</span>
                </h2>
                <span className="text-xs font-mono text-slate-400">
                  Selecciona una sala para explorar sus obras en 3D
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {virtualRooms.map((room, idx) => {
                  const isSelected = selectedRoomIndex === idx;
                  const previewImage = room.artworks[0]?.imageUrl || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80';

                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => setSelectedRoomIndex(idx)}
                      className={`relative text-left rounded-2xl overflow-hidden border p-4 transition-all duration-300 ${
                        isSelected
                          ? 'border-indigo-500 bg-[#16192a] shadow-[0_0_25px_rgba(79,70,229,0.25)] ring-1 ring-indigo-500/50'
                          : 'border-white/10 bg-[#11131F] hover:border-white/20 hover:bg-[#141624]'
                      }`}
                    >
                      {/* Room Top Tag */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full ${
                          isSelected ? 'bg-indigo-500 text-white shadow-sm' : 'bg-white/10 text-slate-300'
                        }`}>
                          Sala {idx + 1}
                        </span>
                        <span className="text-[11px] font-mono text-cyan-400 font-medium">
                          {room.artworks.length} {room.artworks.length === 1 ? 'obra' : 'obras'}
                        </span>
                      </div>

                      {/* Small Room Art Preview */}
                      <div className="w-full h-24 rounded-xl overflow-hidden mb-3 bg-black/60 relative border border-white/5">
                        <img
                          src={previewImage}
                          alt={room.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#08090E]/90 via-transparent to-transparent" />
                        <span className="absolute bottom-1.5 left-2 text-[10px] text-slate-300 font-mono">
                          {room.atmosphere}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-[#F8FAFC] truncate mb-1">
                        {room.name}
                      </h3>
                      <p className="text-xs text-[#94A3B8] line-clamp-2">
                        {room.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Artworks List for the Active Room */}
            <div className="space-y-4 pt-6 border-t border-white/10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
                    <Layers size={18} className="text-indigo-400" />
                    <span>Obras Expuestas en {currentRoom.name} ({currentRoom.artworks.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {currentRoom.subtitle} • {currentRoom.atmosphere}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('all-artworks')}
                  className="text-xs font-mono font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                >
                  <span>Ver todas las obras</span>
                  <ExternalLink size={12} />
                </button>
              </div>

              {currentRoom.artworks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {currentRoom.artworks.map((art) => (
                    <ArtworkCard
                      key={art.id}
                      artwork={art}
                      onInspect={(artwork) => setActive3DArtwork(artwork)}
                      onBuy={(artwork) => setPurchasingArtwork(artwork)}
                      onConfigurePrint={(artwork) => handleOpenInConfigurator(artwork)}
                      showRoomBadge={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-[#11131F] rounded-2xl border border-white/10">
                  <p className="text-slate-400 text-sm">No hay obras expuestas actualmente en esta sala.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: COLECCIÓN COMPLETA DE OBRAS SUBIDAS */}
        {/* ========================================================================= */}
        {activeTab === 'all-artworks' && (
          <div className="space-y-6">
            {/* Search & Filter Toolbar */}
            <div className="bg-[#11131F] p-4 sm:p-6 rounded-2xl border border-white/10 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                {/* Search Bar */}
                <div className="relative w-full sm:w-80">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por título, artista, sala o técnica..."
                    className="w-full pl-9 pr-4 py-2 bg-[#08090E] border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setCollectionFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                      collectionFilter === 'all'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Todas ({totalCombinedCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => setCollectionFilter('3d')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                      collectionFilter === '3d'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Obras 3D ({total3DCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => setCollectionFilter('2d')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                      collectionFilter === '2d'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Fotografía 2D ({total2DCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => setCollectionFilter('exclusive')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                      collectionFilter === 'exclusive'
                        ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                        : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    VIP Exclusivas
                  </button>
                </div>
              </div>
            </div>

            {/* Artworks Grid */}
            {filteredUnifiedCollection.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                {filteredUnifiedCollection.map((art) => (
                  <ArtworkCard
                    key={art.id}
                    artwork={art}
                    onInspect={(artwork) => {
                      if (art.type === '3d' && art.raw3D) {
                        setActive3DArtwork(art.raw3D);
                      } else if (art.type === '2d' && art.raw2D) {
                        setActiveItem(art.raw2D);
                      } else {
                        setActive3DArtwork(artwork);
                      }
                    }}
                    onBuy={(artwork) => setPurchasingArtwork(artwork)}
                    onConfigurePrint={(artwork) => handleOpenInConfigurator(artwork)}
                    showRoomBadge={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-[#10121a] rounded-2xl border border-neutral-800">
                <Layers size={36} className="mx-auto text-neutral-600 mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">No se encontraron obras</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  No hay obras que coincidan con la búsqueda o el filtro seleccionado.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CATÁLOGO EDITORIAL 2D */}
        {/* ========================================================================= */}
        {activeTab === 'photo-catalog' && (
          <div className="space-y-6">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {photoCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-amber-400 text-black shadow-md'
                      : 'bg-[#12141c] text-neutral-300 hover:text-white border border-neutral-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Photo Catalog Grid */}
            {filteredPhotoItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPhotoItems.map((item) => (
                  <div
                    key={item.id}
                    className="group rounded-xl overflow-hidden border border-neutral-800 bg-[#0f1118] hover:border-amber-400/60 transition-all shadow-lg hover:shadow-2xl flex flex-col cursor-pointer"
                    onClick={() => setActiveItem(item)}
                  >
                    <div className="relative h-64 bg-black overflow-hidden">
                      <img
                        src={getProxiedImageUrl(item.imageUrl)}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-black/70 backdrop-blur-md text-amber-300 border border-amber-500/30">
                        {item.category}
                      </span>

                      {item.isExclusive && (
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600 text-white">
                          🔒 VIP
                        </span>
                      )}

                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs text-neutral-300">
                        <span className="truncate">{item.location || 'Fine Art Photography'}</span>
                        <span className="font-mono">{item.cameraInfo || '35mm'}</span>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors mb-2">
                        {item.title}
                      </h4>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-800">
                        <span className="text-amber-400 font-semibold">Inspeccionar HD</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenInConfigurator({
                              title: item.title,
                              artist: 'Lola Work Photography',
                              imageUrl: item.imageUrl,
                              medium: 'Fotografía Fine Art',
                            });
                          }}
                          className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white"
                        >
                          Imprimir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-[#10121a] rounded-2xl border border-neutral-800">
                <Camera size={36} className="mx-auto text-neutral-600 mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">No hay fotografías en esta categoría</h3>
                <p className="text-xs text-neutral-400">Prueba seleccionando otra categoría o añade nuevas fotos desde el panel.</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ESTUDIO DE IMPRESIÓN FINE ART */}
        {/* ========================================================================= */}
        {activeTab === 'print-configurator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Live Print Simulator Viewport */}
            <div className="lg:col-span-7 bg-[#10121a] p-6 sm:p-8 rounded-2xl border border-neutral-800">
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-2">
                Simulador de Enmarcado y Montaje
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                {configuratorArtwork.title}
              </h3>

              {/* Interior Environment Simulator */}
              <div 
                className="relative rounded-xl overflow-hidden p-8 sm:p-12 flex items-center justify-center min-h-[380px] sm:min-h-[460px] border border-neutral-800 transition-all duration-500"
                style={{
                  background: selectedSetting === 'CyberStudio'
                    ? 'radial-gradient(ellipse at center, #1e1b4b 0%, #090a0f 100%)'
                    : selectedSetting === 'MinimalLoft'
                    ? 'radial-gradient(ellipse at center, #27272a 0%, #090a0f 100%)'
                    : 'radial-gradient(ellipse at center, #3f3f46 0%, #18181b 100%)',
                }}
              >
                {/* Framed Canvas */}
                <div
                  className="transition-all duration-500 shadow-2xl rounded"
                  style={{
                    padding: selectedFrame === 'FloatingAcrylic' ? '8px' : '16px',
                    background: selectedFrame === 'MatteBlack'
                      ? '#111111'
                      : selectedFrame === 'RawOak'
                      ? '#854d0e'
                      : 'rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.2)',
                    maxWidth: selectedDimension === '70x100' ? '380px' : selectedDimension === '50x70' ? '320px' : '260px',
                  }}
                >
                  <div className="p-3 bg-[#0d0e14] rounded shadow-inner">
                    <img
                      src={getProxiedImageUrl(configuratorArtwork.imageUrl)}
                      alt={configuratorArtwork.title}
                      className="w-full h-auto object-cover rounded shadow"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Ambient Setting Switcher */}
              <div className="mt-4 flex items-center justify-between text-xs text-neutral-400">
                <span>Ambiente:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSetting('CyberStudio')}
                    className={`px-2.5 py-1 rounded ${selectedSetting === 'CyberStudio' ? 'bg-amber-400 text-black font-semibold' : 'bg-neutral-800 text-neutral-300'}`}
                  >
                    Estudio Cyber
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSetting('MinimalLoft')}
                    className={`px-2.5 py-1 rounded ${selectedSetting === 'MinimalLoft' ? 'bg-amber-400 text-black font-semibold' : 'bg-neutral-800 text-neutral-300'}`}
                  >
                    Loft Minimalista
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSetting('WhiteCube')}
                    className={`px-2.5 py-1 rounded ${selectedSetting === 'WhiteCube' ? 'bg-amber-400 text-black font-semibold' : 'bg-neutral-800 text-neutral-300'}`}
                  >
                    White Cube
                  </button>
                </div>
              </div>
            </div>

            {/* Print Configuration Controls */}
            <div className="lg:col-span-5 bg-[#10121a] p-6 sm:p-8 rounded-2xl border border-neutral-800 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Configuración Fine Art</h3>
                <p className="text-xs text-neutral-400">Papeles certificados de museo y enmarcado artesanal.</p>
              </div>

              {/* 1. Dimension */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  1. Dimensiones de Impresión
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'A3', label: 'A3 (29.7x42cm)', sub: 'Estándar' },
                    { id: '50x70', label: '50 x 70 cm', sub: '+85€' },
                    { id: '70x100', label: '70 x 100 cm', sub: '+170€' },
                  ].map((dim) => (
                    <button
                      key={dim.id}
                      type="button"
                      onClick={() => setSelectedDimension(dim.id as any)}
                      className={`p-2.5 rounded-xl text-center border text-xs transition-all ${
                        selectedDimension === dim.id
                          ? 'border-amber-400 bg-amber-500/10 text-white font-semibold'
                          : 'border-neutral-800 bg-[#0a0b10] text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div>{dim.label}</div>
                      <div className="text-[10px] text-amber-400 font-mono mt-0.5">{dim.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Paper */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  2. Papel de Calidad Museo
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'Hahnemuhle', title: 'Hahnemühle Photo Rag 308g', desc: '100% Algodón, acabado mate aterciopelado', extra: 'Incluido' },
                    { id: 'GermanEtching', title: 'German Etching 310g', desc: 'Textura grabada tradicional para pigmentos intensos', extra: '+45€' },
                    { id: 'MetallicGloss', title: 'Metallic Glossy Baryta', desc: 'Reflejos metálicos y contraste extremo', extra: '+60€' },
                  ].map((paper) => (
                    <button
                      key={paper.id}
                      type="button"
                      onClick={() => setSelectedPaper(paper.id as any)}
                      className={`w-full p-3 rounded-xl text-left border flex items-center justify-between text-xs transition-all ${
                        selectedPaper === paper.id
                          ? 'border-amber-400 bg-amber-500/10 text-white'
                          : 'border-neutral-800 bg-[#0a0b10] text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-white">{paper.title}</div>
                        <div className="text-[11px] text-neutral-400">{paper.desc}</div>
                      </div>
                      <span className="font-mono text-amber-400 font-semibold">{paper.extra}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Frame */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  3. Enmarcado & Moldura
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'MatteBlack', label: 'Negro Mate', sub: 'Aluminio' },
                    { id: 'RawOak', label: 'Roble Natural', sub: '+65€' },
                    { id: 'FloatingAcrylic', label: 'Caja Flotante', sub: '+120€' },
                  ].map((fr) => (
                    <button
                      key={fr.id}
                      type="button"
                      onClick={() => setSelectedFrame(fr.id as any)}
                      className={`p-2.5 rounded-xl text-center border text-xs transition-all ${
                        selectedFrame === fr.id
                          ? 'border-amber-400 bg-amber-500/10 text-white font-semibold'
                          : 'border-neutral-800 bg-[#0a0b10] text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div>{fr.label}</div>
                      <div className="text-[10px] text-amber-400 font-mono mt-0.5">{fr.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price & Checkout Summary */}
              <div className="pt-4 border-t border-neutral-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-neutral-400">Total de Edición Fine Art</div>
                    <div className="text-2xl font-extrabold text-white">{calculatePrice()} €</div>
                  </div>
                  <div className="text-right text-xs text-emerald-400 font-medium">
                    <div>✓ Certificado de Autenticidad</div>
                    <div>✓ Envío Asegurado DHL Express</div>
                  </div>
                </div>

                {orderConfirmed ? (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs text-center font-semibold">
                    ✓ ¡Solicitud de impresión registrada! El laboratorio Fine Art preparará la prueba de color.
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setOrderConfirmed(true);
                      setTimeout(() => setOrderConfirmed(false), 5000);
                    }}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={18} />
                    <span>Encargar Tirada Fine Art Certificada</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Curatorial Sheet Modal (Superimposed Ficha & Acquisition) */}
        <CuratorialSheetModal
          artwork={active3DArtwork}
          onClose={() => setActive3DArtwork(null)}
          onBuy={(artwork) => setPurchasingArtwork(artwork)}
          onConfigurePrint={(artwork) => handleOpenInConfigurator(artwork)}
        />

        {/* Purchase Intent Modal */}
        <PurchaseModal
          artwork={purchasingArtwork}
          onClose={() => setPurchasingArtwork(null)}
        />

        {/* Lightbox Modal for 2D Photo Items */}
        <LightboxModal item={activeItem} onClose={() => setActiveItem(null)} />

      </div>
    </div>
  );
}
