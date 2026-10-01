'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Markdown from 'react-markdown';
import { Link } from '@/context/NavigationContext';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/Icons';
import { FAQItem, BlogPost, Gallery3DArtwork } from '@/types';
import { LOLA_IMAGES } from '@/constants/images';
import { DEFAULT_VIRTUAL_ROOMS } from '@/data/mockGallery3D';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ArtCritiqueTool from '@/components/ArtCritiqueTool';
import ArticleRenderer from '@/components/ArticleRenderer';
import { 
  Brush, 
  Sparkles, 
  Palette, 
  BookOpen, 
  Search, 
  AlertCircle, 
  Check, 
  Box, 
  Globe, 
  Layers, 
  UploadCloud, 
  Plus, 
  CheckCircle2, 
  ExternalLink,
  Eye,
  Trash2,
  Maximize2,
  Minimize2,
  Columns,
  Edit3,
  Bold,
  Italic,
  List,
  Heading2,
  Heading3,
  Quote,
  Code,
  Type,
  ArrowLeft
} from 'lucide-react';

export default function AdminDashboardPage() {
  const {
    user,
    isAdmin,
    usersList,
    blogPosts,
    galleryItems,
    gallery3dArtworks,
    categories,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    addGalleryItem,
    deleteGalleryItem,
    addGallery3DArtwork,
    deleteGallery3DArtwork,
    updateUserRole,
    addCategory,
    deleteCategory,
  } = useAuth();

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [deletingGalleryId, setDeletingGalleryId] = useState<string | null>(null);
  const [deleting3DArtworkId, setDeleting3DArtworkId] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadImageStatus, setUploadImageStatus] = useState<{ message: string; isError?: boolean } | null>(null);
  const [isUploadingGalleryImage, setIsUploadingGalleryImage] = useState(false);
  const [uploadGalleryStatus, setUploadGalleryStatus] = useState<{ message: string; isError?: boolean } | null>(null);

  const [activeTab, setActiveTab] = useState<'posts' | 'gallery' | 'gallery3d' | 'art-critique' | 'researches' | 'users' | 'analytics'>('posts');
  const [postsSubView, setPostsSubView] = useState<'list' | 'editor'>('list');
  const [postSearchQuery, setPostSearchQuery] = useState('');
  const [selectedPostCategory, setSelectedPostCategory] = useState('All');

  const filteredPosts = useMemo(() => {
    return blogPosts.filter((p) => {
      const matchesCat = selectedPostCategory === 'All' || p.category === selectedPostCategory;
      const query = postSearchQuery.toLowerCase().trim();
      if (!query) return matchesCat;
      const matchesTitle = p.title?.toLowerCase().includes(query);
      const matchesSlug = p.slug?.toLowerCase().includes(query);
      const matchesCatName = p.category?.toLowerCase().includes(query);
      const matchesExcerpt = p.excerpt?.toLowerCase().includes(query);
      return matchesCat && (matchesTitle || matchesSlug || matchesCatName || matchesExcerpt);
    });
  }, [blogPosts, selectedPostCategory, postSearchQuery]);

  // Extended Post State with SEO & GEO AI Optimization
  const [newPost, setNewPost] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Fotografía & Estilo',
    date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
    readTime: '5 min de lectura',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    imageAlt: '',
    isExclusive: false,
    // Traditional SEO
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    canonicalUrl: '',
    schemaType: 'BlogPosting' as const,
    // GEO (Generative Engine Optimization) / AI Search
    aiSummary: '',
    keyTakeaways: '',
  });

  // Fullscreen expanded editor for article content
  const [isFullscreenContent, setIsFullscreenContent] = useState(false);
  const [fullscreenViewMode, setFullscreenViewMode] = useState<'edit' | 'split' | 'preview'>('edit');
  const fullscreenTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Esc key listener & scroll lock for fullscreen editor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreenContent) {
        setIsFullscreenContent(false);
      }
    };
    if (isFullscreenContent) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        fullscreenTextareaRef.current?.focus();
      }, 60);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreenContent]);

  // Helper to insert markdown syntax at cursor position
  const handleInsertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = fullscreenTextareaRef.current;
    if (!textarea) {
      setNewPost((prev) => ({ ...prev, content: (prev.content || '') + prefix + suffix }));
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = newPost.content || '';
    const selectedText = currentText.substring(start, end) || (prefix.includes('#') ? 'Título de Sección' : 'texto');
    const replacement = prefix + selectedText + suffix;
    const updated = currentText.substring(0, start) + replacement + currentText.substring(end);

    setNewPost((prev) => ({ ...prev, content: updated }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 20);
  };

  const contentWordCount = newPost.content.trim() ? newPost.content.trim().split(/\s+/).length : 0;
  const contentCharCount = newPost.content.length;

  // Dynamic FAQ Items state for Schema.org FAQPage & AI Grounding
  const [faqList, setFaqList] = useState<FAQItem[]>([
    { question: '', answer: '' },
  ]);

  // New Gallery Item State
  const [newGallery, setNewGallery] = useState({
    title: '',
    category: 'Lookbook',
    imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
    location: 'Barcelona, España',
    cameraInfo: 'Sony A7IV 35mm',
    isExclusive: false,
    aspectRatio: 'portrait' as const,
    date: new Date().toISOString().split('T')[0],
  });

  // New 3D Gallery Artwork State
  const [new3DArtwork, setNew3DArtwork] = useState({
    title: '',
    roomId: 'gran-salon',
    roomName: 'Sala Principal (Gran Salón)',
    artist: 'Lola Work Studio & IA',
    year: '2026',
    medium: 'Modelado 3D & Redes Generativas Latentes',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    analysis: 'Composición volumétrica con iluminación especular calculada para diálogo espacial en el pabellón tridimensional.',
    palette: ['#d4af37', '#8a2be2', '#0f172a'],
    isExclusive: false,
  });

  const [customColorInput, setCustomColorInput] = useState('#d4af37');
  const [isUploading3DImage, setIsUploading3DImage] = useState(false);
  const [upload3DStatus, setUpload3DStatus] = useState<{ message: string; isError?: boolean } | null>(null);
  const [filter3DRoom, setFilter3DRoom] = useState<string>('all');

  if (!user || !isAdmin) {
    return (
      <div className="container" style={{ paddingTop: '5rem', maxWidth: '600px' }}>
        <div className="glass-panel" style={{ padding: '3.5rem 2.5rem', textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
            }}
          >
            <Icons.ShieldCheck size={32} />
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', color: '#f87171' }}>
            Acceso Denegado: Exclusivo Administrador
          </h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2rem' }}>
            Esta zona de administración avanzada requiere la cuenta de usuario con rol de Administrador.
          </p>

          <Link href="/login" className="btn-cyan">
            <Icons.ShieldCheck size={18} /> Iniciar Sesión como Administrador
          </Link>
        </div>
      </div>
    );
  }

  const handleAddFaq = () => {
    setFaqList([...faqList, { question: '', answer: '' }]);
  };

  const handleRemoveFaq = (index: number) => {
    setFaqList(faqList.filter((_, i) => i !== index));
  };

  const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...faqList];
    updated[index][field] = value;
    setFaqList(updated);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadImageStatus({ message: 'Subiendo imagen a Firebase Storage...' });

    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(storage, `blog_covers/${Date.now()}_${cleanFileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      setNewPost((prev) => ({ ...prev, imageUrl: downloadUrl }));
      setUploadImageStatus({ message: '✓ Imagen subida a Firebase Storage con éxito' });
    } catch (err: any) {
      console.error('Error Firebase Storage upload:', err);
      // Local Base64 fallback if Storage bucket permissions or connectivity fail
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewPost((prev) => ({ ...prev, imageUrl: reader.result as string }));
          setUploadImageStatus({ message: 'Imagen cargada localmente (Fallback Data URL)', isError: true });
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const resetPostForm = () => {
    setEditingPostId(null);
    setNewPost({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: categories[0] || 'Fotografía & Estilo',
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      readTime: '5 min de lectura',
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
      imageAlt: '',
      isExclusive: false,
      metaTitle: '',
      metaDescription: '',
      keywords: '',
      canonicalUrl: '',
      schemaType: 'BlogPosting',
      aiSummary: '',
      keyTakeaways: '',
    });
    setFaqList([{ question: '', answer: '' }]);
    setUploadImageStatus(null);
  };

  const handleEditClick = (post: any) => {
    setEditingPostId(post.id);
    setNewPost({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      category: post.category || 'Fotografía & Estilo',
      date: post.date || new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      readTime: post.readTime || '5 min de lectura',
      imageUrl: post.imageUrl || '',
      imageAlt: post.imageAlt || '',
      isExclusive: !!post.isExclusive,
      metaTitle: post.metaTitle || '',
      metaDescription: post.metaDescription || '',
      keywords: post.keywords || '',
      canonicalUrl: post.canonicalUrl || '',
      schemaType: post.schemaType || 'BlogPosting',
      aiSummary: post.aiSummary || '',
      keyTakeaways: post.keyTakeaways || '',
    });

    if (post.faqItems && post.faqItems.length > 0) {
      setFaqList(post.faqItems);
    } else {
      setFaqList([{ question: '', answer: '' }]);
    }

    setUploadImageStatus(null);
    setPostsSubView('editor');
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;

    const generatedSlug = newPost.slug || newPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const validFaqs = faqList.filter((f) => f.question.trim() !== '' && f.answer.trim() !== '');

    const postPayload = {
      ...newPost,
      slug: generatedSlug,
      excerpt: newPost.excerpt || newPost.metaDescription || newPost.content.substring(0, 150) + '...',
      metaTitle: newPost.metaTitle || newPost.title,
      metaDescription: newPost.metaDescription || newPost.excerpt,
      faqItems: validFaqs,
      author: {
        name: user.name,
        avatar: user.avatarUrl || LOLA_IMAGES.AVATAR,
      },
    };

    if (editingPostId) {
      await updateBlogPost(editingPostId, postPayload);
      setActionFeedback({ message: '¡Publicación actualizada con éxito en la plataforma!', type: 'success' });
    } else {
      await addBlogPost(postPayload);
      setActionFeedback({ message: '¡Publicación optimizada para SEO & IA creada y guardada con éxito!', type: 'success' });
    }
    setTimeout(() => setActionFeedback(null), 5000);

    resetPostForm();
    setPostsSubView('list');
  };

  const handleAddNewCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const res = await addCategory(newCategoryName);
    if (!res.success) {
      setActionFeedback({ message: res.message || 'Error al añadir la categoría', type: 'error' });
    } else {
      setNewCategoryName('');
      setActionFeedback({ message: `Categoría "${newCategoryName}" añadida con éxito.`, type: 'success' });
    }
    setTimeout(() => setActionFeedback(null), 5000);
  };

  const handleGalleryImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingGalleryImage(true);
    setUploadGalleryStatus({ message: 'Subiendo fotografía a Firebase Storage...' });

    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(storage, `gallery_2d/${Date.now()}_${cleanFileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      setNewGallery((prev) => ({ ...prev, imageUrl: downloadUrl }));
      setUploadGalleryStatus({ message: '✓ Imagen subida a Firebase Storage con éxito' });
    } catch (err: any) {
      console.error('Error Firebase Storage Gallery upload:', err);
      // Fallback Data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewGallery((prev) => ({ ...prev, imageUrl: reader.result as string }));
          setUploadGalleryStatus({ message: 'Imagen cargada en memoria local (Fallback Data URL)', isError: true });
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingGalleryImage(false);
    }
  };

  const handleCreateGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGallery.title || !newGallery.imageUrl) return;

    await addGalleryItem(newGallery);

    setNewGallery({
      title: '',
      category: 'Lookbook',
      imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
      location: 'Barcelona, España',
      cameraInfo: 'Sony A7IV 35mm',
      isExclusive: false,
      aspectRatio: 'portrait',
      date: new Date().toISOString().split('T')[0],
    });
    setUploadGalleryStatus(null);

    setActionFeedback({
      message: `¡Fotografía "${newGallery.title}" guardada en Firebase y añadida a la galería con éxito!`,
      type: 'success',
    });
    setTimeout(() => setActionFeedback(null), 5000);
  };

  const handleConfirmDeletePost = async (p: BlogPost) => {
    const targetId = p.id || p.slug;
    if (!targetId) return;
    try {
      await deleteBlogPost(targetId);
      setDeletingPostId(null);
      setActionFeedback({ message: `Publicación "${p.title}" eliminada con éxito.`, type: 'success' });
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (e: any) {
      setActionFeedback({ message: `Error al eliminar la publicación: ${e?.message || 'Error desconocido'}`, type: 'error' });
      setTimeout(() => setActionFeedback(null), 5000);
    }
  };

  const handleConfirmDeleteGallery = async (itemId: string, itemTitle?: string) => {
    if (!itemId) return;
    try {
      await deleteGalleryItem(itemId);
      setDeletingGalleryId(null);
      setActionFeedback({ message: `Elemento de galería "${itemTitle || itemId}" eliminado.`, type: 'success' });
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (e: any) {
      setActionFeedback({ message: `Error al eliminar de galería: ${e?.message || 'Error desconocido'}`, type: 'error' });
      setTimeout(() => setActionFeedback(null), 5000);
    }
  };

  // 3D GALLERY METHODS & FIREBASE STORAGE BUCKET UPLOAD
  const handle3DImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading3DImage(true);
    setUpload3DStatus({ message: 'Subiendo obra/textura al Bucket de Firebase Storage...' });

    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(storage, `gallery_3d/${Date.now()}_${cleanFileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      setNew3DArtwork((prev) => ({ ...prev, imageUrl: downloadUrl }));
      setUpload3DStatus({ message: '✓ Obra subida a Firebase Storage Bucket con éxito' });
    } catch (err: any) {
      console.error('Error Firebase Storage 3D upload:', err);
      // Fallback Data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNew3DArtwork((prev) => ({ ...prev, imageUrl: reader.result as string }));
          setUpload3DStatus({ message: 'Obra cargada en memoria local (Fallback Data URL)', isError: true });
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading3DImage(false);
    }
  };

  const handleAddColorToPalette = () => {
    if (!customColorInput || new3DArtwork.palette.includes(customColorInput)) return;
    setNew3DArtwork((prev) => ({
      ...prev,
      palette: [...prev.palette, customColorInput],
    }));
  };

  const handleRemoveColorFromPalette = (colorToRemove: string) => {
    setNew3DArtwork((prev) => ({
      ...prev,
      palette: prev.palette.filter((c) => c !== colorToRemove),
    }));
  };

  const handleCreate3DArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!new3DArtwork.title || !new3DArtwork.imageUrl) {
      setActionFeedback({ message: 'Por favor completa el título y la imagen de la obra 3D.', type: 'error' });
      setTimeout(() => setActionFeedback(null), 5000);
      return;
    }

    const roomObj = DEFAULT_VIRTUAL_ROOMS.find((r) => r.id === new3DArtwork.roomId);

    await addGallery3DArtwork({
      title: new3DArtwork.title,
      roomId: new3DArtwork.roomId,
      roomName: roomObj ? roomObj.name : new3DArtwork.roomName,
      artist: new3DArtwork.artist || 'Lola Work Studio',
      year: new3DArtwork.year || '2026',
      medium: new3DArtwork.medium || 'Modelado 3D & Redes Generativas',
      imageUrl: new3DArtwork.imageUrl,
      analysis: new3DArtwork.analysis || 'Obra interactiva expuesta en el pabellón tridimensional.',
      palette: new3DArtwork.palette.length > 0 ? new3DArtwork.palette : ['#d4af37', '#8a2be2'],
      isExclusive: new3DArtwork.isExclusive,
    });

    setActionFeedback({
      message: `¡Obra 3D "${new3DArtwork.title}" guardada en Firebase y expuesta en ${roomObj?.name || new3DArtwork.roomId}!`,
      type: 'success',
    });
    setTimeout(() => setActionFeedback(null), 5000);

    // Reset Form
    setNew3DArtwork({
      title: '',
      roomId: 'gran-salon',
      roomName: 'Sala Principal (Gran Salón)',
      artist: 'Lola Work Studio & IA',
      year: '2026',
      medium: 'Modelado 3D & Redes Generativas Latentes',
      imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
      analysis: 'Composición volumétrica con iluminación especular calculada para diálogo espacial en el pabellón tridimensional.',
      palette: ['#d4af37', '#8a2be2', '#0f172a'],
      isExclusive: false,
    });
    setUpload3DStatus(null);
  };

  const handleConfirmDelete3DArtwork = async (artworkId: string, artworkTitle?: string) => {
    if (!artworkId) return;
    try {
      await deleteGallery3DArtwork(artworkId);
      setDeleting3DArtworkId(null);
      setActionFeedback({ message: `Obra 3D "${artworkTitle || artworkId}" eliminada de Firebase.`, type: 'success' });
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (e: any) {
      setActionFeedback({ message: `Error al eliminar la obra 3D: ${e?.message || 'Error desconocido'}`, type: 'error' });
      setTimeout(() => setActionFeedback(null), 5000);
    }
  };

  const handleConfirmDeleteCategory = async (catName: string) => {
    try {
      await deleteCategory(catName);
      setDeletingCategory(null);
      setActionFeedback({ message: `Categoría "${catName}" eliminada.`, type: 'success' });
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (e: any) {
      setActionFeedback({ message: `Error al eliminar la categoría: ${e?.message || 'Error desconocido'}`, type: 'error' });
      setTimeout(() => setActionFeedback(null), 5000);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-8 flex flex-col gap-8">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#06B6D4]/30 bg-gradient-to-br from-[#06B6D4]/10 via-[#11131F] to-[#08090E]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center shrink-0 border border-[#06B6D4]/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Icons.ShieldCheck size={26} />
          </div>
          <div>
            <h1 className="font-syne font-bold text-2xl text-white mb-1 flex items-center flex-wrap gap-3">
              Panel de Control Administrador
              <span className="font-mono text-[10px] px-2.5 py-1 bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30 rounded uppercase tracking-wider font-bold">
                SEO &amp; GEO READY
              </span>
            </h1>
            <p className="text-[#94A3B8] text-sm leading-relaxed">
              Gestión editorial integral y publicaciones optimizadas para buscadores (Google) y motores de IA (ChatGPT, Perplexity, Gemini).
            </p>
          </div>
        </div>

        <Link
          href="/miembros"
          className="shrink-0 px-6 py-2.5 rounded-full border border-white/10 text-sm font-medium hover:bg-white/5 text-white transition-colors"
        >
          Volver a Vista Miembro
        </Link>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
              : 'bg-red-500/15 border border-red-500/40 text-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span>{actionFeedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="text-inherit hover:opacity-80 p-1 text-base"
          >
            ✕
          </button>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex gap-2 sm:gap-6 border-b border-white/10 overflow-x-auto pb-1 text-sm font-bold font-syne custom-scrollbar">
        <button
          onClick={() => setActiveTab('posts')}
          className={`pb-3 px-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'posts'
              ? 'text-[#06B6D4] border-b-2 border-[#06B6D4]'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <Icons.FileText size={16} /> Publicaciones ({blogPosts.length})
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`pb-3 px-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'gallery'
              ? 'text-[#06B6D4] border-b-2 border-[#06B6D4]'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <Icons.Camera size={16} /> Catálogo Editorial ({galleryItems.length})
        </button>

        <button
          onClick={() => setActiveTab('gallery3d')}
          className={`pb-3 px-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'gallery3d'
              ? 'text-[#06B6D4] border-b-2 border-[#06B6D4]'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <Box size={16} /> Galería 3D &amp; Estancias ({gallery3dArtworks?.length ?? 0})
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#06B6D4]/20 text-[#06B6D4] font-mono font-bold">
            3D
          </span>
        </button>

        <button
          onClick={() => setActiveTab('art-critique')}
          className={`pb-3 px-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'art-critique'
              ? 'text-[#06B6D4] border-b-2 border-[#06B6D4]'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <Brush size={16} /> Crítica de Arte IA
        </button>

        <button
          onClick={() => setActiveTab('researches')}
          className={`pb-3 px-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'researches'
              ? 'text-[#06B6D4] border-b-2 border-[#06B6D4]'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <BookOpen size={16} /> Artículos Investigación
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'users'
              ? 'text-[#06B6D4] border-b-2 border-[#06B6D4]'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <Icons.User size={16} /> Usuarios ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 px-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'text-[#06B6D4] border-b-2 border-[#06B6D4]'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <Icons.BarChart size={16} /> Métricas &amp; Finanzas
        </button>
      </div>

      {/* TAB 1: POSTS MANAGEMENT WITH COMPLETE SEO & GEO OPTIMIZATION */}
      {activeTab === 'posts' && (
        <div className="flex flex-col gap-6">
          {/* Sub-view Navigation Bar & Filters */}
          <div className="glass-panel p-4 rounded-xl border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setPostsSubView('list')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                  postsSubView === 'list'
                    ? 'bg-[#06B6D4] text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-white/5 text-[#94A3B8] hover:text-white hover:bg-white/10'
                }`}
              >
                <Icons.FileText size={16} /> Catálogo de Publicaciones ({blogPosts.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  resetPostForm();
                  setPostsSubView('editor');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                  postsSubView === 'editor' && !editingPostId
                    ? 'bg-[#06B6D4] text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-white/5 text-[#94A3B8] hover:text-white hover:bg-white/10'
                }`}
              >
                <Icons.Plus size={16} /> Nueva Publicación
              </button>

              {editingPostId && (
                <button
                  type="button"
                  onClick={() => setPostsSubView('editor')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                    postsSubView === 'editor'
                      ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                      : 'bg-white/5 text-amber-300 hover:bg-white/10'
                  }`}
                >
                  <Icons.Edit size={16} /> Editando Borrador
                </button>
              )}
            </div>

            {postsSubView === 'list' && (
              <div className="flex items-center gap-3 flex-wrap">
                <select
                  value={selectedPostCategory}
                  onChange={(e) => setSelectedPostCategory(e.target.value)}
                  className="input-field text-xs py-2 px-3 bg-black/40 border-white/10 rounded-lg text-[#F1F5F9] cursor-pointer"
                >
                  <option value="All">Todas las Categorías</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar publicación..."
                    value={postSearchQuery}
                    onChange={(e) => setPostSearchQuery(e.target.value)}
                    className="input-field text-xs py-2 pl-8 pr-3 bg-black/40 border-white/10 rounded-lg text-[#F1F5F9] w-48 sm:w-56"
                  />
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
                </div>
              </div>
            )}
          </div>

          {/* SUB-VIEW 1: LIST / CATALOG */}
          {postsSubView === 'list' && (
            <div className="flex flex-col gap-6">
              {/* Category Management Bar */}
              <div className="glass-panel p-5 rounded-xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                    📁 Gestión de Categorías del Blog ({categories.length})
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Añade o gestiona las etiquetas temáticas. Se sincronizan en tiempo real con el portal del blog.
                  </p>
                </div>

                <form onSubmit={handleAddNewCategory} className="flex items-center gap-2 w-full md:w-auto">
                  <input
                    type="text"
                    required
                    placeholder="Nueva categoría..."
                    className="input-field text-xs py-2 px-3 bg-black/40 border-white/10 rounded-lg text-[#F1F5F9] w-full md:w-52"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <button type="submit" className="btn-cyan text-xs py-2 px-3 shrink-0 flex items-center gap-1">
                    <Icons.Plus size={14} /> Añadir
                  </button>
                </form>
              </div>

              {/* Category Badges Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((cat) => (
                  <div
                    key={cat}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-200"
                  >
                    <span className="font-semibold">{cat}</span>
                    {categories.length > 1 && (
                      deletingCategory === cat ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleConfirmDeleteCategory(cat)}
                            className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold hover:bg-red-500"
                          >
                            Confirmar
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingCategory(null)}
                            className="text-[10px] text-slate-400 hover:text-white px-1"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeletingCategory(cat)}
                          className="text-red-400 hover:text-red-300 ml-1 text-xs"
                          title={`Eliminar categoría ${cat}`}
                        >
                          ✕
                        </button>
                      )
                    )}
                  </div>
                ))}
              </div>

              {/* Grid of Posts */}
              {filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPosts.map((p) => {
                    const postIdOrSlug = p.id || p.slug;
                    const isConfirmingDelete = deletingPostId === postIdOrSlug;

                    return (
                      <div
                        key={postIdOrSlug}
                        className="glass-panel rounded-xl overflow-hidden border border-white/10 flex flex-col hover:border-[#06B6D4]/40 transition-all duration-300 group"
                      >
                        {/* Cover Image & Badges */}
                        <div className="relative h-48 w-full overflow-hidden bg-black/40">
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#08090E] via-transparent to-black/30" />

                          {/* Category Tag */}
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-black/60 backdrop-blur-md border border-white/15 text-[#06B6D4]">
                              {p.category}
                            </span>
                          </div>

                          {/* VIP Tag */}
                          {p.isExclusive && (
                            <div className="absolute top-3 right-3">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/80 backdrop-blur-md text-white border border-purple-400/40">
                                🔒 VIP
                              </span>
                            </div>
                          )}

                          {/* Date */}
                          <div className="absolute bottom-2 left-3 text-[11px] text-slate-300 font-mono">
                            {p.date}
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                          <div>
                            <h4 className="font-syne font-bold text-base text-white line-clamp-2 leading-snug mb-2 group-hover:text-[#06B6D4] transition-colors">
                              {p.title}
                            </h4>

                            <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed">
                              {p.excerpt || (p.content ? p.content.substring(0, 100) + '...' : '')}
                            </p>
                          </div>

                          <div>
                            {/* Badges metadata */}
                            <div className="flex items-center gap-2 flex-wrap mb-4 pt-2 border-t border-white/5 text-[11px]">
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                                {p.schemaType || 'BlogPosting'}
                              </span>

                              {p.aiSummary && (
                                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                                  <Sparkles size={10} /> GEO IA
                                </span>
                              )}

                              <span className="text-[11px] text-[#64748B] ml-auto">
                                {p.readTime || '5 min'}
                              </span>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditClick(p)}
                                  className="btn-cyan py-1.5 px-3 text-xs flex items-center gap-1.5"
                                >
                                  <Icons.Edit size={13} /> Editar
                                </button>

                                <Link
                                  href={`/blog/${p.slug}`}
                                  target="_blank"
                                  className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs text-[#94A3B8] hover:text-white transition-colors flex items-center gap-1"
                                >
                                  <ExternalLink size={13} /> Ver
                                </Link>
                              </div>

                              {isConfirmingDelete ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleConfirmDeletePost(p)}
                                    className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-xs font-bold transition-colors"
                                  >
                                    Confirmar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletingPostId(null)}
                                    className="text-xs text-slate-400 hover:text-white px-1.5 py-1"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setDeletingPostId(postIdOrSlug)}
                                  className="text-red-400 hover:text-red-300 p-1.5 rounded-md hover:bg-red-500/10 transition-colors"
                                  title="Eliminar publicación"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="glass-panel p-12 rounded-xl text-center flex flex-col items-center justify-center gap-3 border border-white/10">
                  <Icons.FileText size={36} className="text-[#64748B] opacity-50" />
                  <p className="text-sm font-semibold text-white">No se encontraron publicaciones</p>
                  <p className="text-xs text-[#94A3B8]">
                    No hay publicaciones que coincidan con la búsqueda &quot;{postSearchQuery}&quot; o el filtro de categoría seleccionado.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setPostSearchQuery('');
                      setSelectedPostCategory('All');
                    }}
                    className="btn-secondary text-xs mt-2"
                  >
                    Restablecer Filtros
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW 2: EDITOR */}
          {postsSubView === 'editor' && (
            <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
              {/* Editor Header Navigation */}
              <div className="flex items-center justify-between gap-4 p-4 rounded-xl glass-panel border border-white/10">
                <button
                  type="button"
                  onClick={() => setPostsSubView('list')}
                  className="btn-secondary text-xs flex items-center gap-2 hover:border-[#06B6D4]"
                >
                  <ArrowLeft size={14} /> Volver al Catálogo de Artículos
                </button>

                <div className="flex items-center gap-3">
                  {editingPostId && (
                    <button
                      type="button"
                      onClick={() => {
                        resetPostForm();
                        setPostsSubView('list');
                      }}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 px-3 py-1.5 rounded-md border border-red-500/20 hover:bg-red-500/10"
                    >
                      <Icons.X size={14} /> Cancelar Edición
                    </button>
                  )}
                </div>
              </div>

              {/* Full Width Post Form */}
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10">
                <div className="border-b border-white/10 pb-5 mb-6">
                  <h3 className="text-xl font-bold font-syne text-white flex items-center gap-2">
                    {editingPostId ? (
                      <>
                        <Icons.Edit size={22} className="text-amber-400" /> Modificar Publicación Existente
                      </>
                    ) : (
                      <>
                        <Icons.Sparkles size={22} className="text-[#06B6D4]" /> Crear Publicación Optimizada (SEO &amp; GEO IA)
                      </>
                    )}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#94A3B8] mt-1.5 leading-relaxed">
                    {editingPostId
                      ? 'Actualiza los campos de contenido, posicionamiento web y marcado estructurado. Los cambios se sincronizarán al guardar.'
                      : 'Rellena los bloques de contenido, posicionamiento para Google y optimización semántica para modelos de lenguaje (ChatGPT, Perplexity, Gemini).'}
                  </p>
                </div>

                <form onSubmit={handleCreatePost} className="flex flex-col gap-8">
                  {/* SECTION 1: MAIN CONTENT */}
                  <div className="p-5 rounded-xl border border-white/10 bg-black/20 flex flex-col gap-5">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#06B6D4] flex items-center gap-2">
                      📌 1. Contenido General del Artículo
                    </div>

                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-slate-200">
                          Título Principal (H1) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Guía Completa de Fotografía y Edición para 2026"
                          className="input-field text-sm"
                          value={newPost.title}
                          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-200">
                            Slug Permalink (URL)
                          </label>
                          <input
                            type="text"
                            placeholder="guia-fotografia-2026"
                            className="input-field text-sm font-mono"
                            value={newPost.slug}
                            onChange={(e) => setNewPost({ ...newPost, slug: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-200">
                            Categoría
                          </label>
                          <select
                            className="input-field text-sm cursor-pointer"
                            value={newPost.category}
                            onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                          >
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Image Upload Box */}
                      <div className="p-4 rounded-xl border border-white/10 bg-black/30 flex flex-col gap-3">
                        <label className="block text-xs font-bold text-[#06B6D4]">
                          📸 Imagen de Portada (Firebase Storage / Archivo Local)
                        </label>

                        <div className="flex gap-3 items-center flex-wrap">
                          <input
                            type="file"
                            accept="image/*"
                            id="blogCoverFileInput"
                            style={{ display: 'none' }}
                            onChange={handleImageFileUpload}
                          />
                          <label
                            htmlFor="blogCoverFileInput"
                            className="btn-secondary py-2 px-4 text-xs cursor-pointer inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white border-white/20"
                          >
                            <Icons.Camera size={15} /> Seleccionar Imagen de tu Equipo
                          </label>

                          {isUploadingImage && (
                            <span className="text-xs text-[#06B6D4] font-semibold animate-pulse">
                              ⚡ Subiendo a Firebase Storage...
                            </span>
                          )}
                        </div>

                        {uploadImageStatus && (
                          <div
                            className={`text-xs font-semibold ${
                              uploadImageStatus.isError ? 'text-red-400' : 'text-emerald-400'
                            }`}
                          >
                            {uploadImageStatus.message}
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] text-[#94A3B8] mb-1">URL Final de la Portada *</label>
                            <input
                              type="text"
                              required
                              placeholder="https://images.unsplash.com/..."
                              className="input-field text-xs font-mono"
                              value={newPost.imageUrl}
                              onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-[#94A3B8] mb-1">Texto Alt de Imagen (SEO Visual)</label>
                            <input
                              type="text"
                              placeholder="Ej. Cámara vintage sobre fondo de madera..."
                              className="input-field text-xs"
                              value={newPost.imageAlt}
                              onChange={(e) => setNewPost({ ...newPost, imageAlt: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* Image Thumbnail Preview */}
                        {newPost.imageUrl && (
                          <div className="flex items-center gap-3 p-2 rounded-lg bg-black/40 border border-white/5">
                            <img
                              src={newPost.imageUrl}
                              alt="Previsualización"
                              className="w-20 h-14 object-cover rounded-md border border-white/10 shrink-0"
                            />
                            <div className="overflow-hidden">
                              <div className="text-xs font-bold text-white">Previsualización de Portada</div>
                              <div className="text-[11px] text-[#94A3B8] truncate max-w-md">
                                {newPost.imageUrl}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1 text-slate-200">
                          Resumen Corto (Excerpt)
                        </label>
                        <input
                          type="text"
                          placeholder="Breve introducción para tarjetas y feed..."
                          className="input-field text-sm"
                          value={newPost.excerpt}
                          onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                        />
                      </div>

                      {/* Content editor textarea */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5 flex-wrap gap-2">
                          <label className="text-xs font-semibold text-slate-200">
                            Contenido Completo (Markdown / Texto) *
                          </label>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-[#94A3B8]">
                              {contentWordCount} palabras • {contentCharCount} car.
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsFullscreenContent(true)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#06B6D4]/10 border border-[#06B6D4]/30 text-[#06B6D4] text-xs font-bold hover:bg-[#06B6D4]/20 transition-colors"
                              title="Ampliar editor a pantalla completa"
                            >
                              <Maximize2 size={13} /> Pantalla Completa
                            </button>
                          </div>
                        </div>

                        <div className="relative">
                          <textarea
                            required
                            rows={8}
                            placeholder="Escribe el cuerpo del artículo con Markdown (# Título, **negrita**, listas, etc.)..."
                            className="input-field text-sm font-sans w-full min-h-[180px] pb-10"
                            value={newPost.content}
                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                          />

                          <button
                            type="button"
                            onClick={() => setIsFullscreenContent(true)}
                            className="absolute bottom-3 right-3 bg-black/70 hover:bg-black border border-white/20 text-[#06B6D4] px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 backdrop-blur-md transition-colors"
                            title="Ampliar a pantalla completa"
                          >
                            <Maximize2 size={12} /> Ampliar
                          </button>
                        </div>
                      </div>

                      {/* FULLSCREEN EXPANDED TEXTAREA MODAL */}
                      {isFullscreenContent && (
                        <div
                          style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 99999,
                            background: '#0a0c14',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            color: '#f3f4f6',
                            animation: 'fadeIn 0.2s ease-out',
                          }}
                        >
                          {/* Top Header Bar */}
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '1rem',
                              padding: '0.8rem 1.5rem',
                              background: '#121520',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                          >
                            {/* Title & Stats */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                              <div
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  background: 'rgba(6, 182, 212, 0.2)',
                                  color: '#06B6D4',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Edit3 size={18} />
                              </div>
                              <div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span>Editor de Contenido a Pantalla Completa</span>
                                  <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', fontWeight: 600 }}>
                                    Sincronización en Vivo
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                  <span style={{ color: '#06B6D4', fontWeight: 600 }}>{newPost.title ? `"${newPost.title.substring(0, 45)}..."` : 'Nuevo Artículo'}</span>
                                  <span>•</span>
                                  <span>{contentWordCount} palabras</span>
                                  <span>•</span>
                                  <span>{contentCharCount} caracteres</span>
                                </div>
                              </div>
                            </div>

                            {/* Formatting Toolbar & View Mode Switcher */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                              {/* Markdown Quick Buttons */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(0,0,0,0.4)', padding: '0.25rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <button
                                  type="button"
                                  onClick={() => handleInsertMarkdown('\n## ', '\n')}
                                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: '4px', background: 'transparent', color: '#e5e7eb', border: 'none', cursor: 'pointer' }}
                                  title="Insertar Encabezado H2"
                                >
                                  H2
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleInsertMarkdown('\n### ', '\n')}
                                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: '4px', background: 'transparent', color: '#e5e7eb', border: 'none', cursor: 'pointer' }}
                                  title="Insertar Encabezado H3"
                                >
                                  H3
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleInsertMarkdown('**', '**')}
                                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: '4px', background: 'transparent', color: '#e5e7eb', border: 'none', cursor: 'pointer' }}
                                  title="Texto en Negrita"
                                >
                                  <strong>B</strong>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleInsertMarkdown('*', '*')}
                                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', fontStyle: 'italic', borderRadius: '4px', background: 'transparent', color: '#e5e7eb', border: 'none', cursor: 'pointer' }}
                                  title="Texto en Cursiva"
                                >
                                  <em>I</em>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleInsertMarkdown('\n- ', '')}
                                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px', background: 'transparent', color: '#e5e7eb', border: 'none', cursor: 'pointer' }}
                                  title="Lista con viñetas"
                                >
                                  • Lista
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleInsertMarkdown('\n> ', '\n')}
                                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px', background: 'transparent', color: '#e5e7eb', border: 'none', cursor: 'pointer' }}
                                  title="Bloque de Cita"
                                >
                                  &ldquo; Cita
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleInsertMarkdown('\n```\n', '\n```\n')}
                                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px', background: 'transparent', color: '#e5e7eb', border: 'none', cursor: 'pointer', fontFamily: 'monospace' }}
                                  title="Bloque de Código"
                                >
                                  &lt;/&gt;
                                </button>
                              </div>

                              {/* View Mode Toggle (Edit / Split / Preview) */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: 'rgba(0,0,0,0.5)', padding: '0.25rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <button
                                  type="button"
                                  onClick={() => setFullscreenViewMode('edit')}
                                  style={{
                                    padding: '0.35rem 0.65rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    borderRadius: '4px',
                                    background: fullscreenViewMode === 'edit' ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
                                    color: fullscreenViewMode === 'edit' ? '#06B6D4' : '#9ca3af',
                                    border: 'none',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Solo Editor
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFullscreenViewMode('split')}
                                  style={{
                                    padding: '0.35rem 0.65rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    borderRadius: '4px',
                                    background: fullscreenViewMode === 'split' ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
                                    color: fullscreenViewMode === 'split' ? '#06B6D4' : '#9ca3af',
                                    border: 'none',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Vista Dividida
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFullscreenViewMode('preview')}
                                  style={{
                                    padding: '0.35rem 0.65rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    borderRadius: '4px',
                                    background: fullscreenViewMode === 'preview' ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
                                    color: fullscreenViewMode === 'preview' ? '#06B6D4' : '#9ca3af',
                                    border: 'none',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Vista Previa
                                </button>
                              </div>

                              {/* Prominent Shrink / Reduce Button */}
                              <button
                                type="button"
                                onClick={() => setIsFullscreenContent(false)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
                                  color: '#000',
                                  border: 'none',
                                  padding: '0.45rem 1rem',
                                  borderRadius: '6px',
                                  fontSize: '0.85rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)',
                                  transition: 'all 0.2s',
                                }}
                                title="Reducir y volver al formulario general (o presiona Esc)"
                              >
                                <Minimize2 size={16} /> Reducir / Salir (Esc)
                              </button>
                            </div>
                          </div>

                          {/* Main Fullscreen Body */}
                          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
                            {/* Editor Column */}
                            {(fullscreenViewMode === 'edit' || fullscreenViewMode === 'split') && (
                              <div
                                style={{
                                  flex: fullscreenViewMode === 'split' ? '1 1 50%' : '1 1 100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  borderRight: fullscreenViewMode === 'split' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                  background: '#0d0f18',
                                  padding: '1.5rem',
                                  overflowY: 'auto',
                                }}
                              >
                                <textarea
                                  ref={fullscreenTextareaRef}
                                  placeholder="Escribe aquí el contenido completo del artículo con formato Markdown...&#10;&#10;Ejemplo:&#10;## Introducción&#10;Este es el cuerpo del artículo...&#10;&#10;• Punto clave 1&#10;• Punto clave 2"
                                  value={newPost.content}
                                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    minHeight: '450px',
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: '#f3f4f6',
                                    fontSize: '1.05rem',
                                    lineHeight: '1.75',
                                    fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
                                    resize: 'none',
                                  }}
                                />
                              </div>
                            )}

                            {/* Live Markdown Preview Column */}
                            {(fullscreenViewMode === 'preview' || fullscreenViewMode === 'split') && (
                              <div
                                style={{
                                  flex: fullscreenViewMode === 'split' ? '1 1 50%' : '1 1 100%',
                                  padding: '2rem',
                                  background: '#080a10',
                                  overflowY: 'auto',
                                }}
                              >
                                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#06B6D4', marginBottom: '0.8rem', fontWeight: 700 }}>
                                    Previsualización de Lectura Maquetada (HTML / SEO)
                                  </div>
                                  {newPost.content ? (
                                    <ArticleRenderer content={newPost.content} showTableOfContents={true} allowCopyHtml={true} />
                                  ) : (
                                    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '2rem 0', textAlign: 'center' }}>
                                      Escribe texto en el panel izquierdo para ver la previsualización maquetada en tiempo real.
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Bottom Fullscreen Status Bar */}
                          <div
                            style={{
                              padding: '0.6rem 1.5rem',
                              background: '#121520',
                              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <span style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Check size={14} /> Cambios sincronizados en el borrador
                              </span>
                              <span>|</span>
                              <span>Atajos: **negrita**, *cursiva*, ## Encabezado, &gt; Cita</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <button
                                type="button"
                                onClick={() => setIsFullscreenContent(false)}
                                style={{
                                  background: 'transparent',
                                  border: '1px solid rgba(255,255,255,0.2)',
                                  color: '#d1d5db',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                }}
                              >
                                Volver al Formulario
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-2">
                        <input
                          type="checkbox"
                          id="exclusiveCheck"
                          checked={newPost.isExclusive}
                          onChange={(e) => setNewPost({ ...newPost, isExclusive: e.target.checked })}
                          className="rounded border-white/20 text-[#06B6D4] focus:ring-0"
                        />
                        <label htmlFor="exclusiveCheck" className="text-xs font-semibold cursor-pointer text-slate-200">
                          🔒 Marcar como Contenido Exclusivo para Miembros VIP
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: TRADITIONAL SEO FOR SEARCH ENGINES (GOOGLE / BING) */}
                  <div className="p-5 rounded-xl border border-blue-500/30 bg-blue-950/10 flex flex-col gap-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                      <Search size={15} /> 2. Optimización SEO (Buscadores Tradicionales - Google / Bing)
                    </div>

                    <div className="flex flex-col gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-semibold text-slate-200">Meta Título SEO (Meta Title)</label>
                          <span className={`text-[11px] font-mono ${newPost.metaTitle.length > 60 ? 'text-red-400 font-bold' : 'text-[#94A3B8]'}`}>
                            {newPost.metaTitle.length} / 60 car.
                          </span>
                        </div>
                        <input
                          type="text"
                          placeholder="Título optimizado para fragmentos de Google (50-60 caracteres)"
                          className="input-field text-sm"
                          value={newPost.metaTitle}
                          onChange={(e) => setNewPost({ ...newPost, metaTitle: e.target.value })}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-semibold text-slate-200">Meta Descripción SEO (Meta Description)</label>
                          <span className={`text-[11px] font-mono ${newPost.metaDescription.length > 160 ? 'text-red-400 font-bold' : 'text-[#94A3B8]'}`}>
                            {newPost.metaDescription.length} / 160 car.
                          </span>
                        </div>
                        <textarea
                          rows={2}
                          placeholder="Resumen atractivo con llamada a la acción para mostrarse en resultados de búsqueda (150-160 car.)"
                          className="input-field text-sm"
                          value={newPost.metaDescription}
                          onChange={(e) => setNewPost({ ...newPost, metaDescription: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-200">Palabras Clave (Keywords)</label>
                          <input
                            type="text"
                            placeholder="fotografía, lightroom, presets..."
                            className="input-field text-sm"
                            value={newPost.keywords}
                            onChange={(e) => setNewPost({ ...newPost, keywords: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-200">Tipo Schema.org (JSON-LD)</label>
                          <select
                            className="input-field text-sm cursor-pointer"
                            value={newPost.schemaType}
                            onChange={(e) => setNewPost({ ...newPost, schemaType: e.target.value as any })}
                          >
                            <option value="BlogPosting">BlogPosting (Artículo Estándar)</option>
                            <option value="TechArticle">TechArticle (Artículo Técnico/Tutorial)</option>
                            <option value="HowTo">HowTo (Guía Paso a Paso)</option>
                            <option value="Review">Review (Reseña / Análisis)</option>
                            <option value="FAQPage">FAQPage (Página de Preguntas Frecuentes)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1 text-slate-200">URL Canónica (Canonical URL)</label>
                        <input
                          type="text"
                          placeholder="https://lolaworkia.com/blog/..."
                          className="input-field text-sm font-mono"
                          value={newPost.canonicalUrl}
                          onChange={(e) => setNewPost({ ...newPost, canonicalUrl: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: GEO / AI ENGINE OPTIMIZATION (CHATGPT, PERPLEXITY, GEMINI) */}
                  <div className="p-5 rounded-xl border border-purple-500/30 bg-purple-950/10 flex flex-col gap-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                      <Sparkles size={15} /> 3. Optimización GEO (Motores de Inteligencia Artificial &amp; Respuestas Semánticas)
                    </div>

                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-slate-200">
                          🤖 Resumen TL;DR / Sintético para IA (AI Grounding Summary)
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Resumen denso y directo de 100-150 palabras para que ChatGPT, Perplexity y Gemini citen tu contenido con precisión..."
                          className="input-field text-sm"
                          value={newPost.aiSummary}
                          onChange={(e) => setNewPost({ ...newPost, aiSummary: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1 text-slate-200">
                          📌 Puntos Clave Extraíbles (Key Takeaways)
                        </label>
                        <textarea
                          rows={3}
                          placeholder="• Punto 1: Explicación clave...&#10;• Punto 2: Conclusión práctica..."
                          className="input-field text-sm"
                          value={newPost.keyTakeaways}
                          onChange={(e) => setNewPost({ ...newPost, keyTakeaways: e.target.value })}
                        />
                      </div>

                      {/* FAQ Builder for AI & Google AI Overviews */}
                      <div className="border-t border-purple-500/20 pt-4 mt-2">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                            ❓ Preguntas Frecuentes Estructuradas (FAQ Schema)
                          </label>
                          <button
                            type="button"
                            onClick={handleAddFaq}
                            className="btn-secondary py-1 px-3 text-xs flex items-center gap-1"
                          >
                            <Icons.Plus size={13} /> Añadir FAQ
                          </button>
                        </div>

                        <div className="flex flex-col gap-3">
                          {faqList.map((faq, idx) => (
                            <div key={idx} className="p-3.5 rounded-lg bg-black/40 border border-white/10 flex flex-col gap-2">
                              <div className="flex justify-between items-center">
                                <span className="text-[11px] font-bold text-slate-400">Pregunta #{idx + 1}</span>
                                {faqList.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFaq(idx)}
                                    className="text-red-400 hover:text-red-300 text-xs"
                                  >
                                    Eliminar
                                  </button>
                                )}
                              </div>
                              <input
                                type="text"
                                placeholder="¿Cuál es la pregunta clave?"
                                className="input-field text-xs mb-1"
                                value={faq.question}
                                onChange={(e) => handleFaqChange(idx, 'question', e.target.value)}
                              />
                              <input
                                type="text"
                                placeholder="Respuesta concisa y directa..."
                                className="input-field text-xs"
                                value={faq.answer}
                                onChange={(e) => handleFaqChange(idx, 'answer', e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setPostsSubView('list')}
                      className="btn-secondary w-full sm:w-auto text-xs py-2.5 px-5 flex items-center justify-center gap-2"
                    >
                      <ArrowLeft size={14} /> Volver al Catálogo
                    </button>

                    <button
                      type="submit"
                      className="btn-cyan w-full sm:w-auto text-sm py-3 px-8 font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                    >
                      {editingPostId ? '💾 Guardar Cambios de la Publicación' : '🚀 Publicar Artículo Optimizado (SEO + IA)'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GALLERY MANAGEMENT */}
      {activeTab === 'gallery' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'start' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Añadir Fotografía a Galería</h3>

            <form onSubmit={handleCreateGalleryItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Título *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Atardecer en Tokio"
                  className="input-field"
                  value={newGallery.title}
                  onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Categoría</label>
                <select
                  className="input-field"
                  value={newGallery.category}
                  onChange={(e) => setNewGallery({ ...newGallery, category: e.target.value })}
                >
                  <option value="Lookbook">Lookbook</option>
                  <option value="Viajes">Viajes</option>
                  <option value="Estilo de Vida">Estilo de Vida</option>
                  <option value="VIP Exclusive">VIP Exclusive</option>
                </select>
              </div>

              {/* Firebase Storage File Upload */}
              <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--accent-gold)' }}>
                  📸 Archivo de Imagen (Firebase Storage / Equipo)
                </label>

                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
                  <input
                    type="file"
                    accept="image/*"
                    id="gallery2dFileInput"
                    style={{ display: 'none' }}
                    onChange={handleGalleryImageFileUpload}
                    disabled={isUploadingGalleryImage}
                  />
                  <label
                    htmlFor="gallery2dFileInput"
                    className="btn-secondary"
                    style={{
                      padding: '0.6rem 1.1rem',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid var(--accent-gold)',
                      color: '#fff',
                    }}
                  >
                    <Icons.Camera size={16} /> Subir Imagen desde el Ordenador
                  </label>

                  {isUploadingGalleryImage && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                      ⚡ Subiendo a Firebase Storage...
                    </span>
                  )}
                </div>

                {uploadGalleryStatus && (
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: uploadGalleryStatus.isError ? '#fbbf24' : '#4ade80',
                      marginBottom: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    {uploadGalleryStatus.message}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>URL de Imagen HD *</label>
                  <input
                    type="text"
                    required
                    placeholder="https://..."
                    className="input-field"
                    style={{ fontSize: '0.8rem' }}
                    value={newGallery.imageUrl}
                    onChange={(e) => setNewGallery({ ...newGallery, imageUrl: e.target.value })}
                  />
                </div>

                {newGallery.imageUrl && (
                  <div style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(0,0,0,0.4)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                    <img
                      src={newGallery.imageUrl}
                      alt="Previsualización Galería"
                      style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                    />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>Imagen Seleccionada</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '260px' }}>
                        {newGallery.imageUrl}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Ubicación</label>
                <input
                  type="text"
                  placeholder="Ej. París, Francia"
                  className="input-field"
                  value={newGallery.location}
                  onChange={(e) => setNewGallery({ ...newGallery, location: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <input
                  type="checkbox"
                  id="exclusiveGalCheck"
                  checked={newGallery.isExclusive}
                  onChange={(e) => setNewGallery({ ...newGallery, isExclusive: e.target.checked })}
                />
                <label htmlFor="exclusiveGalCheck" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                  🔒 Reservado solo para Miembros VIP
                </label>
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '0.75rem' }}>
                Guardar en Galería
              </button>
            </form>
          </div>

          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Elementos en Galería ({galleryItems.length})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
              {galleryItems.map((item) => {
                const isConfirming = deletingGalleryId === item.id;
                return (
                  <div key={item.id} className="glass-panel" style={{ overflow: 'hidden', position: 'relative' }}>
                    <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                    <div style={{ padding: '0.8rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                      <div style={{ marginTop: '0.5rem' }}>
                        {isConfirming ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <button
                              type="button"
                              onClick={() => handleConfirmDeleteGallery(item.id, item.title)}
                              style={{
                                color: '#fff',
                                background: '#dc2626',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '0.25rem 0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                              }}
                            >
                              Confirmar
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingGalleryId(null)}
                              style={{
                                color: 'var(--text-muted)',
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '0.25rem 0.4rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeletingGalleryId(item.id)}
                            style={{ color: '#f87171', fontSize: '0.75rem', border: 'none', background: 'none', cursor: 'pointer' }}
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GESTIÓN DE GALERÍA 3D & ESTANCIAS (FIREBASE FIRESTORE & STORAGE BUCKET) */}
      {activeTab === 'gallery3d' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Header Banner with Room Overview & Direct 3D Gallery Link */}
          <div
            className="glass-panel"
            style={{
              padding: '2rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(9, 10, 15, 0.95) 100%)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                  <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Box size={14} /> Pabellón Virtual WebGL
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      color: 'var(--accent-gold)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      background: 'rgba(212, 175, 55, 0.1)',
                      border: '1px solid rgba(212, 175, 55, 0.2)',
                    }}
                  >
                    COLECCIÓN: gallery3d & BUCKET: gallery_3d/
                  </span>
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>
                  Gestor de Obras & Estancias Tridimensionales
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '750px', lineHeight: '1.5' }}>
                  Da de alta las imágenes y cédulas curatoriales que se exponen en las salas del museo virtual 3D. Los datos se guardan en Firebase Firestore y los archivos en el Storage Bucket.
                </p>
              </div>

              <Link
                href="/galeria"
                className="btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  padding: '0.75rem 1.4rem',
                  boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
                }}
              >
                <Globe size={16} /> Ver Galería 3D en Vivo <ExternalLink size={14} />
              </Link>
            </div>

            {/* Room Distribution Metric Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginTop: '1.8rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              {DEFAULT_VIRTUAL_ROOMS.map((room, idx) => {
                const countInRoom = (gallery3dArtworks || []).filter((a) => a.roomId === room.id).length;
                return (
                  <div
                    key={room.id}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
                        SALA 0{idx + 1}
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.1rem 0.5rem',
                          borderRadius: '10px',
                          background: 'rgba(212, 175, 55, 0.15)',
                          color: '#fff',
                          fontWeight: 700,
                        }}
                      >
                        {countInRoom} {countInRoom === 1 ? 'obra' : 'obras'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{room.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {room.atmosphere}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main 2-Column Interface: Creation Form vs Artworks Registry */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
            {/* Left Column: Artwork Registration Form */}
            <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.2rem', marginBottom: '1.8rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UploadCloud size={20} style={{ color: 'var(--accent-gold)' }} />
                  Alta de Obra para Estancia 3D
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                  Carga los metadatos completos y la textura en alta resolución.
                </p>
              </div>

              <form onSubmit={handleCreate3DArtwork} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                {/* 1. Artwork Title */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    Título de la Obra *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Metamorfosis de la Luz Sintética"
                    className="input-field"
                    value={new3DArtwork.title}
                    onChange={(e) => setNew3DArtwork({ ...new3DArtwork, title: e.target.value })}
                  />
                </div>

                {/* 2. Room Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    Estancia / Sala Virtual de Destino *
                  </label>
                  <select
                    className="input-field"
                    value={new3DArtwork.roomId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const roomObj = DEFAULT_VIRTUAL_ROOMS.find((r) => r.id === selectedId);
                      setNew3DArtwork({
                        ...new3DArtwork,
                        roomId: selectedId,
                        roomName: roomObj ? roomObj.name : selectedId,
                      });
                    }}
                  >
                    {DEFAULT_VIRTUAL_ROOMS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} — ({r.subtitle})
                      </option>
                    ))}
                    <option value="sala-personalizada">✨ Nueva Sala Personalizada</option>
                  </select>
                </div>

                {new3DArtwork.roomId === 'sala-personalizada' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                      Nombre de la Sala Personalizada
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Ala de Arte Cuántico"
                      className="input-field"
                      value={new3DArtwork.roomName}
                      onChange={(e) => setNew3DArtwork({ ...new3DArtwork, roomName: e.target.value })}
                    />
                  </div>
                )}

                {/* 3. Artist & Year Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                      Artista / Estudio Creador
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Lola Work Studio & Algoritmo"
                      className="input-field"
                      value={new3DArtwork.artist}
                      onChange={(e) => setNew3DArtwork({ ...new3DArtwork, artist: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                      Año
                    </label>
                    <input
                      type="text"
                      placeholder="2026"
                      className="input-field"
                      value={new3DArtwork.year}
                      onChange={(e) => setNew3DArtwork({ ...new3DArtwork, year: e.target.value })}
                    />
                  </div>
                </div>

                {/* 4. Medium / Computational Technique */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    Técnica / Medio Computacional
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Render Unreal Engine 5.4 & Postproceso Digital"
                    className="input-field"
                    value={new3DArtwork.medium}
                    onChange={(e) => setNew3DArtwork({ ...new3DArtwork, medium: e.target.value })}
                  />
                </div>

                {/* 5. Firebase Storage Bucket Upload Section */}
                <div
                  style={{
                    padding: '1.4rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px dashed rgba(212, 175, 55, 0.4)',
                  }}
                >
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--accent-gold)' }}>
                    Imagen / Textura para la Sala (Firebase Storage Bucket) *
                  </label>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <label
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '1.2rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <UploadCloud size={24} style={{ color: isUploading3DImage ? '#fbbf24' : 'var(--accent-gold)' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {isUploading3DImage ? 'Subiendo archivo al Bucket...' : 'Selecciona una imagen desde tu equipo'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        JPG, PNG, WebP en alta resolución (se alojará en Storage)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handle3DImageFileUpload}
                        disabled={isUploading3DImage}
                        style={{ display: 'none' }}
                      />
                    </label>

                    {upload3DStatus && (
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: upload3DStatus.isError ? '#fbbf24' : '#4ade80',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <CheckCircle2 size={14} /> {upload3DStatus.message}
                      </div>
                    )}

                    {/* Or URL input */}
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                        O ingresa una URL directa de imagen:
                      </div>
                      <input
                        type="url"
                        required
                        placeholder="https://images.unsplash.com/..."
                        className="input-field"
                        style={{ fontSize: '0.85rem' }}
                        value={new3DArtwork.imageUrl}
                        onChange={(e) => setNew3DArtwork({ ...new3DArtwork, imageUrl: e.target.value })}
                      />
                    </div>

                    {/* Preview box */}
                    {new3DArtwork.imageUrl && (
                      <div
                        style={{
                          position: 'relative',
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                          height: '140px',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                        }}
                      >
                        <img
                          src={new3DArtwork.imageUrl}
                          alt="Previsualización 3D"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '0',
                            left: '0',
                            right: '0',
                            padding: '0.4rem 0.8rem',
                            background: 'rgba(0, 0, 0, 0.75)',
                            backdropFilter: 'blur(6px)',
                            fontSize: '0.75rem',
                            color: '#fff',
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>Textura cargada</span>
                          <span style={{ color: 'var(--accent-gold)' }}>Lista para la sala</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 6. Curatorial Analysis / Artwork Concept */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    Cédula Curatorial & Análisis de la Obra en la Estancia
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe el concepto, diálogo con la luz de la sala y la poética de la obra..."
                    className="input-field"
                    value={new3DArtwork.analysis}
                    onChange={(e) => setNew3DArtwork({ ...new3DArtwork, analysis: e.target.value })}
                  />
                </div>

                {/* 7. Color Palette Picker */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    <Palette size={16} style={{ color: 'var(--accent-gold)' }} />
                    Paleta Cromática (Hex Swatches)
                  </label>

                  {/* Active Swatches */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
                    {new3DArtwork.palette.map((color) => (
                      <span
                        key={color}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.25rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.8rem',
                          color: '#fff',
                        }}
                      >
                        <span
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: color,
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                          }}
                        />
                        <span style={{ fontFamily: 'monospace' }}>{color}</span>
                        {new3DArtwork.palette.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveColorFromPalette(color)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '0 2px',
                              fontSize: '0.8rem',
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </span>
                    ))}
                  </div>

                  {/* Color Add Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                    <input
                      type="color"
                      value={customColorInput}
                      onChange={(e) => setCustomColorInput(e.target.value)}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        background: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                      }}
                    />
                    <input
                      type="text"
                      placeholder="#d4af37"
                      className="input-field"
                      style={{ width: '110px', fontSize: '0.85rem', fontFamily: 'monospace' }}
                      value={customColorInput}
                      onChange={(e) => setCustomColorInput(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleAddColorToPalette}
                      className="btn-secondary"
                      style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Plus size={14} /> Añadir Color
                    </button>
                  </div>

                  {/* Preset Palettes */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Presets rápidos:</span>
                    <button
                      type="button"
                      onClick={() => setNew3DArtwork((prev) => ({ ...prev, palette: ['#d4af37', '#8a2be2', '#0f172a'] }))}
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.7rem',
                        borderRadius: '4px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      Oro & Púrpura
                    </button>
                    <button
                      type="button"
                      onClick={() => setNew3DArtwork((prev) => ({ ...prev, palette: ['#f43f5e', '#38bdf8', '#1e1b4b'] }))}
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.7rem',
                        borderRadius: '4px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      Ciberpunk Neón
                    </button>
                    <button
                      type="button"
                      onClick={() => setNew3DArtwork((prev) => ({ ...prev, palette: ['#10b981', '#6366f1', '#18181b'] }))}
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.7rem',
                        borderRadius: '4px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      Esmeralda & Silicio
                    </button>
                    <button
                      type="button"
                      onClick={() => setNew3DArtwork((prev) => ({ ...prev, palette: ['#e2e8f0', '#64748b', '#020617'] }))}
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.7rem',
                        borderRadius: '4px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      Monocromo Zen
                    </button>
                  </div>
                </div>

                {/* 8. Exclusive Checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <input
                    type="checkbox"
                    id="exclusive3DCheck"
                    checked={new3DArtwork.isExclusive}
                    onChange={(e) => setNew3DArtwork({ ...new3DArtwork, isExclusive: e.target.checked })}
                  />
                  <label htmlFor="exclusive3DCheck" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                    🔒 Obra Exclusiva para Miembros VIP
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isUploading3DImage}
                  className="btn-primary"
                  style={{
                    padding: '0.9rem',
                    fontSize: '1rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
                  }}
                >
                  💾 Guardar Obra 3D en Firebase & Publicar en Sala
                </button>
              </form>
            </div>

            {/* Right Column: Registered 3D Artworks Live Directory */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
              <div className="glass-panel" style={{ padding: '1.8rem', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                      Obras en Salas Tridimensionales ({gallery3dArtworks?.length ?? 0})
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Sincronizadas en tiempo real con Firestore y los motores WebGL.
                    </p>
                  </div>

                  {/* Room Filter */}
                  <select
                    className="input-field"
                    style={{ width: 'auto', fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                    value={filter3DRoom}
                    onChange={(e) => setFilter3DRoom(e.target.value)}
                  >
                    <option value="all">Todas las Estancias</option>
                    {DEFAULT_VIRTUAL_ROOMS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Artworks List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '720px', overflowY: 'auto', paddingRight: '0.3rem' }}>
                  {(gallery3dArtworks || [])
                    .filter((art) => (filter3DRoom === 'all' ? true : art.roomId === filter3DRoom))
                    .map((item) => {
                      const isConfirming = deleting3DArtworkId === item.id;
                      const roomObj = DEFAULT_VIRTUAL_ROOMS.find((r) => r.id === item.roomId);

                      return (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '1rem',
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            background: 'rgba(0, 0, 0, 0.4)',
                            border: '1px solid var(--border-subtle)',
                            alignItems: 'flex-start',
                          }}
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            style={{
                              width: '90px',
                              height: '90px',
                              objectFit: 'cover',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid rgba(212, 175, 55, 0.3)',
                              flexShrink: 0,
                            }}
                          />

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                              <span
                                style={{
                                  fontSize: '0.65rem',
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '4px',
                                  background: 'rgba(212, 175, 55, 0.15)',
                                  color: 'var(--accent-gold)',
                                  fontWeight: 700,
                                }}
                              >
                                {roomObj ? roomObj.name : item.roomName || item.roomId}
                              </span>
                              {item.year && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  ({item.year})
                                </span>
                              )}
                              {item.isExclusive && (
                                <span style={{ fontSize: '0.65rem', color: '#fbbf24', fontWeight: 700 }}>
                                  🔒 VIP
                                </span>
                              )}
                            </div>

                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: '0.2rem' }}>
                              {item.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                              {item.artist} • <span style={{ color: 'var(--text-muted)' }}>{item.medium}</span>
                            </div>

                            {/* Palette preview */}
                            {item.palette && item.palette.length > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.5rem' }}>
                                {item.palette.map((hex, i) => (
                                  <span
                                    key={i}
                                    style={{
                                      width: '10px',
                                      height: '10px',
                                      borderRadius: '50%',
                                      background: hex,
                                      border: '1px solid rgba(255, 255, 255, 0.2)',
                                    }}
                                  />
                                ))}
                              </div>
                            )}

                            {/* Actions */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.4rem' }}>
                              {isConfirming ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleConfirmDelete3DArtwork(item.id, item.title)}
                                    style={{
                                      color: '#fff',
                                      background: '#dc2626',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '0.3rem 0.6rem',
                                      cursor: 'pointer',
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                    }}
                                  >
                                    Confirmar Eliminación
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleting3DArtworkId(null)}
                                    style={{
                                      color: 'var(--text-muted)',
                                      background: 'rgba(255,255,255,0.1)',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '0.3rem 0.5rem',
                                      cursor: 'pointer',
                                      fontSize: '0.75rem',
                                    }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setDeleting3DArtworkId(item.id)}
                                  style={{
                                    color: '#f87171',
                                    fontSize: '0.75rem',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    background: 'none',
                                    borderRadius: '4px',
                                    padding: '0.25rem 0.55rem',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                  }}
                                >
                                  <Trash2 size={13} /> Eliminar de Sala
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  {(gallery3dArtworks || []).length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                      <Box size={32} style={{ margin: '0 auto 0.8rem auto', opacity: 0.4 }} />
                      <p style={{ fontSize: '0.9rem' }}>No hay obras 3D registradas aún.</p>
                      <p style={{ fontSize: '0.8rem' }}>Utiliza el formulario de la izquierda para dar de alta la primera obra.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: CRÍTICA DE ARTE */}
      {/* TAB: CRÍTICA DE ARTE IA */}
      {activeTab === 'art-critique' && (
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden flex flex-col p-6 md:p-8 gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="font-syne font-bold text-2xl text-white">Crítica de Arte Visual</h2>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/30 rounded uppercase tracking-wider">
                  VISUAL CRITIQUE
                </span>
              </div>
              <p className="text-[#94A3B8] text-sm font-sans">
                Evaluación visual y técnica de obras con IA, generación de críticas estéticas y exportación a PDF.
              </p>
            </div>
          </div>

          <ArtCritiqueTool user={user as any} initialTab="critique" />
        </div>
      )}

      {/* TAB: INVESTIGACIONES / RESEARCHES IA */}
      {activeTab === 'researches' && (
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden flex flex-col p-6 md:p-8 gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 px-[15px]">
            <div className="pl-[15px]">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="font-syne font-bold text-2xl text-white">Atelier de Investigación de Artistas &amp; Researches IA</h2>
                <span className="font-mono text-[10px] px-2.5 py-1 bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/30 rounded uppercase tracking-wider font-bold">
                  RESEARCH ATELIER
                </span>
              </div>
              <p className="text-[#94A3B8] text-sm font-sans">
                Investigaciones profundas sobre artistas y movimientos culturales, generación de guiones de video para YouTube y descarga directa en formato CSV/Excel.
              </p>
            </div>
          </div>

          <div className="px-[15px]">
            <ArtCritiqueTool user={user as any} initialTab="research" />
          </div>
        </div>
      )}

      {/* TAB 3: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            Lista de Usuarios & Roles de Acceso ({usersList.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {usersList.map((u) => (
              <div
                key={u.id}
                style={{
                  padding: '1.2rem',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={u.avatarUrl} alt={u.name} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{u.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      @{u.username} • {u.email}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {u.role === 'admin' ? (
                    <span className="badge badge-admin">Rol: Administrador</span>
                  ) : (
                    <span className="badge badge-vip">Rol: Miembro VIP</span>
                  )}

                  <button
                    onClick={() => updateUserRole(u.id, u.role === 'admin' ? 'member' : 'admin')}
                    className="btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    {u.role === 'admin' ? 'Cambiar a Miembro' : 'Promover a Admin'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ANALYTICS & FINANCES */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>VISITAS TOTALES MES</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-gold)' }}>142,850</div>
            <div style={{ fontSize: '0.8rem', color: '#4ade80', marginTop: '0.4rem' }}>+18.4% vs mes anterior</div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>SUSCRIPTORES VIP ACTIVOS</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#c084fc' }}>1,480</div>
            <div style={{ fontSize: '0.8rem', color: '#4ade80', marginTop: '0.4rem' }}>+92 nuevos este mes</div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>INGRESOS MENSUALES ESTIMADOS</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#4ade80' }}>€37,000</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Membresías + Presets Shop</div>
          </div>
        </div>
      )}
    </div>
  );
}
