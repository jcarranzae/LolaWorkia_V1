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
import ResearchAtelier from '@/components/ResearchAtelier';
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
  Edit,
  Edit3,
  Bold,
  Italic,
  List,
  Heading2,
  Heading3,
  Quote,
  Code,
  Type,
  ArrowLeft,
  Filter,
  Image as ImageIcon,
  MapPin,
  Camera
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
    updateGalleryItem,
    deleteGalleryItem,
    addGallery3DArtwork,
    updateGallery3DArtwork,
    deleteGallery3DArtwork,
    updateUserRole,
    addCategory,
    deleteCategory,
  } = useAuth();

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [deletingGalleryId, setDeletingGalleryId] = useState<string | null>(null);
  const [editing3DArtworkId, setEditing3DArtworkId] = useState<string | null>(null);
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

  const [gallerySubView, setGallerySubView] = useState<'list' | 'editor'>('list');
  const [gallerySearchQuery, setGallerySearchQuery] = useState('');
  const [selectedGalleryCategory, setSelectedGalleryCategory] = useState('All');

  const [gallery3DSubView, setGallery3DSubView] = useState<'list' | 'editor'>('list');
  const [artwork3DSearchQuery, setArtwork3DSearchQuery] = useState('');

  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUserRoleFilter, setSelectedUserRoleFilter] = useState<'all' | 'admin' | 'member'>('all');
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<'7d' | '30d' | '1y'>('30d');

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

  const filteredGalleryItems = useMemo(() => {
    return galleryItems.filter((item) => {
      const matchesCat = selectedGalleryCategory === 'All' || item.category === selectedGalleryCategory;
      const q = gallerySearchQuery.toLowerCase().trim();
      if (!q) return matchesCat;
      const matchesTitle = item.title?.toLowerCase().includes(q);
      const matchesLoc = item.location?.toLowerCase().includes(q);
      const matchesCam = item.cameraInfo?.toLowerCase().includes(q);
      return matchesCat && (matchesTitle || matchesLoc || matchesCam);
    });
  }, [galleryItems, selectedGalleryCategory, gallerySearchQuery]);

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
    palette: ['#06B6D4', '#4F46E5', '#08090E'],
    isExclusive: false,
  });

  const [customColorInput, setCustomColorInput] = useState('#06B6D4');
  const [isUploading3DImage, setIsUploading3DImage] = useState(false);
  const [upload3DStatus, setUpload3DStatus] = useState<{ message: string; isError?: boolean } | null>(null);
  const [filter3DRoom, setFilter3DRoom] = useState<string>('all');

  const filtered3DArtworks = useMemo(() => {
    return (gallery3dArtworks || []).filter((art) => {
      const matchesRoom = filter3DRoom === 'all' || art.roomId === filter3DRoom;
      const q = artwork3DSearchQuery.toLowerCase().trim();
      if (!q) return matchesRoom;
      const matchesTitle = art.title?.toLowerCase().includes(q);
      const matchesArtist = art.artist?.toLowerCase().includes(q);
      const matchesMedium = art.medium?.toLowerCase().includes(q);
      return matchesRoom && (matchesTitle || matchesArtist || matchesMedium);
    });
  }, [gallery3dArtworks, filter3DRoom, artwork3DSearchQuery]);

  const filteredUsersList = useMemo(() => {
    return (usersList || []).filter((u) => {
      const matchesRole = selectedUserRoleFilter === 'all' || u.role === selectedUserRoleFilter;
      const q = userSearchQuery.toLowerCase().trim();
      if (!q) return matchesRole;
      const matchesName = u.name?.toLowerCase().includes(q);
      const matchesEmail = u.email?.toLowerCase().includes(q);
      const matchesUsername = u.username?.toLowerCase().includes(q);
      return matchesRole && (matchesName || matchesEmail || matchesUsername);
    });
  }, [usersList, selectedUserRoleFilter, userSearchQuery]);

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

  const resetGalleryForm = () => {
    setEditingGalleryId(null);
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
  };

  const handleEditGalleryClick = (item: any) => {
    setEditingGalleryId(item.id);
    setNewGallery({
      title: item.title || '',
      category: item.category || 'Lookbook',
      imageUrl: item.imageUrl || '',
      location: item.location || '',
      cameraInfo: item.cameraInfo || '',
      isExclusive: !!item.isExclusive,
      aspectRatio: item.aspectRatio || 'portrait',
      date: item.date || new Date().toISOString().split('T')[0],
    });
    setUploadGalleryStatus(null);
    setGallerySubView('editor');
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  const handleCreateGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGallery.title || !newGallery.imageUrl) return;

    if (editingGalleryId) {
      await updateGalleryItem(editingGalleryId, newGallery);
      setActionFeedback({
        message: `¡Fotografía "${newGallery.title}" actualizada con éxito en la galería!`,
        type: 'success',
      });
    } else {
      await addGalleryItem(newGallery);
      setActionFeedback({
        message: `¡Fotografía "${newGallery.title}" guardada en Firebase y añadida a la galería con éxito!`,
        type: 'success',
      });
    }
    setTimeout(() => setActionFeedback(null), 5000);

    resetGalleryForm();
    setGallerySubView('list');
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

  const reset3DArtworkForm = () => {
    setEditing3DArtworkId(null);
    setNew3DArtwork({
      title: '',
      roomId: 'gran-salon',
      roomName: 'Sala Principal (Gran Salón)',
      artist: 'Lola Work Studio & IA',
      year: '2026',
      medium: 'Modelado 3D & Redes Generativas Latentes',
      imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
      analysis: 'Composición volumétrica con iluminación especular calculada para diálogo espacial en el pabellón tridimensional.',
      palette: ['#06B6D4', '#4F46E5', '#08090E'],
      isExclusive: false,
    });
    setUpload3DStatus(null);
  };

  const handleEdit3DArtworkClick = (artwork: Gallery3DArtwork) => {
    setEditing3DArtworkId(artwork.id);
    setNew3DArtwork({
      title: artwork.title || '',
      roomId: artwork.roomId || 'gran-salon',
      roomName: artwork.roomName || 'Sala Principal (Gran Salón)',
      artist: artwork.artist || 'Lola Work Studio',
      year: artwork.year || '2026',
      medium: artwork.medium || 'Modelado 3D & Redes Generativas',
      imageUrl: artwork.imageUrl || '',
      analysis: artwork.analysis || '',
      palette: artwork.palette && artwork.palette.length > 0 ? artwork.palette : ['#06B6D4', '#4F46E5'],
      isExclusive: !!artwork.isExclusive,
    });
    setUpload3DStatus(null);
    setGallery3DSubView('editor');
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  const handleCreate3DArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!new3DArtwork.title || !new3DArtwork.imageUrl) {
      setActionFeedback({ message: 'Por favor completa el título y la imagen de la obra 3D.', type: 'error' });
      setTimeout(() => setActionFeedback(null), 5000);
      return;
    }

    const roomObj = DEFAULT_VIRTUAL_ROOMS.find((r) => r.id === new3DArtwork.roomId);
    const artworkPayload = {
      title: new3DArtwork.title,
      roomId: new3DArtwork.roomId,
      roomName: roomObj ? roomObj.name : new3DArtwork.roomName,
      artist: new3DArtwork.artist || 'Lola Work Studio',
      year: new3DArtwork.year || '2026',
      medium: new3DArtwork.medium || 'Modelado 3D & Redes Generativas',
      imageUrl: new3DArtwork.imageUrl,
      analysis: new3DArtwork.analysis || 'Obra interactiva expuesta en el pabellón tridimensional.',
      palette: new3DArtwork.palette.length > 0 ? new3DArtwork.palette : ['#06B6D4', '#4F46E5'],
      isExclusive: new3DArtwork.isExclusive,
    };

    if (editing3DArtworkId) {
      await updateGallery3DArtwork(editing3DArtworkId, artworkPayload);
      setActionFeedback({
        message: `¡Obra 3D "${new3DArtwork.title}" actualizada con éxito en Firebase!`,
        type: 'success',
      });
    } else {
      await addGallery3DArtwork(artworkPayload);
      setActionFeedback({
        message: `¡Obra 3D "${new3DArtwork.title}" guardada en Firebase y expuesta en ${roomObj?.name || new3DArtwork.roomId}!`,
        type: 'success',
      });
    }
    setTimeout(() => setActionFeedback(null), 5000);

    reset3DArtworkForm();
    setGallery3DSubView('list');
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
              <span className="font-mono text-[10px] px-2.5 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded uppercase tracking-wider font-bold flex items-center gap-1.5" title="Sincronizado con proyecto lolaworkai">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Firebase: Conectado
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

      {/* TAB 2: GALLERY MANAGEMENT (2D EDITORIAL CATALOG) */}
      {activeTab === 'gallery' && (
        <div className="flex flex-col gap-8">
          {gallerySubView === 'list' ? (
            <div className="flex flex-col gap-6">
              {/* Top Action Bar */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/10">
                <div>
                  <h2 className="text-xl font-bold font-syne text-white flex items-center gap-2">
                    <Icons.Camera size={22} className="text-[#06B6D4]" />
                    Catálogo Editorial Fotográfico ({galleryItems.length})
                  </h2>
                  <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
                    Fotografías en alta resolución publicadas en el catálogo 2D y la galería web de Lola Workia.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    resetGalleryForm();
                    setGallerySubView('editor');
                  }}
                  className="btn-cyan py-2.5 px-5 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0"
                >
                  <Plus size={16} /> Nueva Fotografía
                </button>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Buscar por título, ubicación o cámara..."
                    value={gallerySearchQuery}
                    onChange={(e) => setGallerySearchQuery(e.target.value)}
                    className="input-field text-xs sm:text-sm pl-10 py-2 w-full"
                  />
                  {gallerySearchQuery && (
                    <button
                      type="button"
                      onClick={() => setGallerySearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
                  {['All', 'Lookbook', 'Viajes', 'Estilo de Vida', 'VIP Exclusive'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedGalleryCategory(cat)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors border ${
                        selectedGalleryCategory === cat
                          ? 'bg-[#06B6D4]/20 border-[#06B6D4] text-[#06B6D4] font-bold'
                          : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {cat === 'All' ? 'Todas' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photos Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredGalleryItems.map((item) => {
                  const isConfirming = deletingGalleryId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="glass-panel rounded-xl overflow-hidden border border-white/10 flex flex-col group transition-all duration-300 hover:border-[#06B6D4]/40"
                    >
                      <div className="relative aspect-[4/3] bg-black/40 overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[#06B6D4] border border-[#06B6D4]/40 font-bold uppercase">
                            {item.category}
                          </span>
                        </div>
                        {item.isExclusive && (
                          <div className="absolute top-2 right-2">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 backdrop-blur-md text-amber-300 border border-amber-500/40 font-bold">
                              🔒 VIP
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                        <div>
                          <h4 className="font-syne font-bold text-sm text-white truncate" title={item.title}>
                            {item.title}
                          </h4>
                          {(item.location || item.cameraInfo) && (
                            <p className="text-[11px] text-[#94A3B8] mt-1 flex items-center gap-1 truncate">
                              {item.location && <span>📍 {item.location}</span>}
                              {item.location && item.cameraInfo && <span>•</span>}
                              {item.cameraInfo && <span>📷 {item.cameraInfo}</span>}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditGalleryClick(item)}
                            className="text-xs text-[#06B6D4] hover:text-[#38BDF8] flex items-center gap-1 font-semibold transition-colors"
                          >
                            <Edit size={13} /> Editar
                          </button>

                          {isConfirming ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleConfirmDeleteGallery(item.id, item.title)}
                                className="text-white bg-red-600 hover:bg-red-500 text-[11px] font-bold px-2 py-1 rounded transition-colors"
                              >
                                Confirmar
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingGalleryId(null)}
                                className="text-slate-400 hover:text-white text-[11px] px-1.5 py-1 rounded bg-white/5"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeletingGalleryId(item.id)}
                              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                            >
                              <Trash2 size={13} /> Eliminar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredGalleryItems.length === 0 && (
                <div className="glass-panel p-12 rounded-2xl text-center text-[#94A3B8] border border-white/10">
                  <ImageIcon size={36} className="mx-auto mb-3 opacity-40 text-[#06B6D4]" />
                  <p className="font-semibold text-white">No se encontraron fotografías</p>
                  <p className="text-xs mt-1 text-slate-400">
                    {gallerySearchQuery || selectedGalleryCategory !== 'All'
                      ? 'Prueba a cambiar los filtros o el término de búsqueda.'
                      : 'Añade la primera fotografía con el botón superior.'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Subview: Gallery Editor */
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 max-w-4xl mx-auto w-full">
              <div className="border-b border-white/10 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold font-syne text-white flex items-center gap-2">
                    {editingGalleryId ? (
                      <>
                        <Edit size={20} className="text-amber-400" /> Modificar Fotografía en Galería
                      </>
                    ) : (
                      <>
                        <Plus size={20} className="text-[#06B6D4]" /> Añadir Fotografía al Catálogo
                      </>
                    )}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
                    Configura la imagen en alta resolución, categoría y parámetros de exposición.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    resetGalleryForm();
                    setGallerySubView('list');
                  }}
                  className="btn-secondary py-2 px-4 text-xs flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <ArrowLeft size={14} /> Cancelar y Volver
                </button>
              </div>

              <form onSubmit={handleCreateGalleryItem} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1 text-slate-200">
                      Título de la Fotografía *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Atardecer en Tokio - Niebla de Neón"
                      className="input-field text-sm"
                      value={newGallery.title}
                      onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-200">
                      Categoría *
                    </label>
                    <select
                      className="input-field text-sm cursor-pointer"
                      value={newGallery.category}
                      onChange={(e) => setNewGallery({ ...newGallery, category: e.target.value })}
                    >
                      <option value="Lookbook">Lookbook</option>
                      <option value="Viajes">Viajes</option>
                      <option value="Estilo de Vida">Estilo de Vida</option>
                      <option value="VIP Exclusive">VIP Exclusive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-200">
                      Proporción de Aspecto
                    </label>
                    <select
                      className="input-field text-sm cursor-pointer"
                      value={newGallery.aspectRatio}
                      onChange={(e) => setNewGallery({ ...newGallery, aspectRatio: e.target.value as any })}
                    >
                      <option value="portrait">Vertical (Portrait - 4:5)</option>
                      <option value="landscape">Horizontal (Landscape - 16:9)</option>
                      <option value="square">Cuadrado (Square - 1:1)</option>
                    </select>
                  </div>
                </div>

                {/* Image Upload Box */}
                <div className="p-5 rounded-xl border border-[#06B6D4]/30 bg-black/30 flex flex-col gap-4">
                  <label className="block text-xs font-bold text-[#06B6D4] uppercase tracking-wider font-mono">
                    📸 Imagen en Alta Resolución (Firebase Storage / Archivo Local)
                  </label>

                  <div className="flex gap-3 items-center flex-wrap">
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
                      className="btn-cyan py-2.5 px-4 text-xs cursor-pointer inline-flex items-center gap-2 font-bold"
                    >
                      <Camera size={15} /> Subir Imagen desde el Ordenador
                    </label>

                    {isUploadingGalleryImage && (
                      <span className="text-xs text-[#06B6D4] font-semibold animate-pulse">
                        ⚡ Subiendo a Firebase Storage...
                      </span>
                    )}
                  </div>

                  {uploadGalleryStatus && (
                    <div
                      className={`text-xs font-medium ${
                        uploadGalleryStatus.isError ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {uploadGalleryStatus.message}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1">URL Directa de Imagen HD *</label>
                    <input
                      type="url"
                      required
                      placeholder="https://images.unsplash.com/..."
                      className="input-field text-xs font-mono"
                      value={newGallery.imageUrl}
                      onChange={(e) => setNewGallery({ ...newGallery, imageUrl: e.target.value })}
                    />
                  </div>

                  {newGallery.imageUrl && (
                    <div className="flex items-center gap-4 p-3 bg-black/40 rounded-xl border border-white/10">
                      <img
                        src={newGallery.imageUrl}
                        alt="Previsualización"
                        className="w-20 h-16 object-cover rounded-lg border border-white/20"
                      />
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-white">Imagen Seleccionada</div>
                        <div className="text-[11px] text-[#94A3B8] truncate max-w-sm">
                          {newGallery.imageUrl}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-200">
                      Ubicación de la Captura
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Kioto, Japón"
                      className="input-field text-sm"
                      value={newGallery.location}
                      onChange={(e) => setNewGallery({ ...newGallery, location: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-200">
                      Información de Cámara / Setup
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Sony A7IV 35mm f/1.4"
                      className="input-field text-sm"
                      value={newGallery.cameraInfo}
                      onChange={(e) => setNewGallery({ ...newGallery, cameraInfo: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-black/20 border border-white/10">
                  <input
                    type="checkbox"
                    id="exclusiveGalCheck"
                    className="rounded border-white/20 text-[#06B6D4] focus:ring-0"
                    checked={newGallery.isExclusive}
                    onChange={(e) => setNewGallery({ ...newGallery, isExclusive: e.target.checked })}
                  />
                  <label htmlFor="exclusiveGalCheck" className="text-xs font-semibold text-slate-200 cursor-pointer">
                    🔒 Contenido Exclusivo para Miembros VIP
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      resetGalleryForm();
                      setGallerySubView('list');
                    }}
                    className="btn-secondary w-full sm:w-auto text-xs py-2.5 px-5 flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={14} /> Cancelar y Volver
                  </button>

                  <button
                    type="submit"
                    className="btn-cyan w-full sm:w-auto text-sm py-3 px-8 font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  >
                    {editingGalleryId ? '💾 Actualizar Fotografía en Catálogo' : '🚀 Guardar Fotografía en Galería'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GESTIÓN DE GALERÍA 3D & ESTANCIAS */}
      {activeTab === 'gallery3d' && (
        <div className="flex flex-col gap-8">
          {/* Header Banner */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-[#06B6D4]/30 bg-gradient-to-br from-[#06B6D4]/10 via-[#11131F] to-[#08090E]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="font-mono text-[10px] px-2.5 py-1 bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30 rounded uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <Box size={14} /> Pabellón Virtual WebGL
                  </span>
                  <span className="font-mono text-[10px] px-2.5 py-1 bg-purple-500/15 text-purple-300 border border-purple-500/30 rounded uppercase tracking-wider font-bold">
                    COLECCIÓN: gallery3d
                  </span>
                </div>
                <h2 className="font-syne font-bold text-2xl text-white mb-1">
                  Gestión de Obras &amp; Estancias Tridimensionales
                </h2>
                <p className="text-[#94A3B8] text-xs sm:text-sm max-w-2xl leading-relaxed">
                  Supervisa y da de alta las obras, texturas y cédulas curatoriales expuestas en las salas del museo 3D WebGL. Sincronizado en tiempo real con Firebase Firestore y Storage.
                </p>
              </div>

              <Link
                href="/galeria"
                className="btn-cyan py-2.5 px-5 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0"
              >
                <Globe size={16} /> Ver Galería 3D en Vivo <ExternalLink size={14} />
              </Link>
            </div>

            {/* Room Distribution Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
              {DEFAULT_VIRTUAL_ROOMS.map((room, idx) => {
                const countInRoom = (gallery3dArtworks || []).filter((a) => a.roomId === room.id).length;
                return (
                  <div
                    key={room.id}
                    className="p-3.5 rounded-xl bg-black/30 border border-white/10 hover:border-[#06B6D4]/30 transition-colors"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-mono text-[#06B6D4] font-bold">
                        SALA 0{idx + 1}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#06B6D4]/10 text-[#06B6D4] font-bold">
                        {countInRoom} {countInRoom === 1 ? 'obra' : 'obras'}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-white truncate">{room.name}</div>
                    <div className="text-[11px] text-[#94A3B8] mt-0.5 truncate">{room.atmosphere}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {gallery3DSubView === 'list' ? (
            <div className="flex flex-col gap-6">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-xl">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      type="text"
                      placeholder="Buscar obra 3D por título, artista o técnica..."
                      value={artwork3DSearchQuery}
                      onChange={(e) => setArtwork3DSearchQuery(e.target.value)}
                      className="input-field text-xs sm:text-sm pl-10 py-2 w-full"
                    />
                    {artwork3DSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setArtwork3DSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <select
                    className="input-field text-xs sm:text-sm py-2 sm:w-56 cursor-pointer"
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

                <button
                  type="button"
                  onClick={() => {
                    reset3DArtworkForm();
                    setGallery3DSubView('editor');
                  }}
                  className="btn-cyan py-2.5 px-5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0"
                >
                  <Plus size={16} /> Añadir Obra a Sala 3D
                </button>
              </div>

              {/* Artworks Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered3DArtworks.map((item) => {
                  const isConfirming = deleting3DArtworkId === item.id;
                  const roomObj = DEFAULT_VIRTUAL_ROOMS.find((r) => r.id === item.roomId);

                  return (
                    <div
                      key={item.id}
                      className="glass-panel rounded-2xl overflow-hidden border border-white/10 flex flex-col group hover:border-[#06B6D4]/40 transition-all duration-300"
                    >
                      <div className="relative aspect-[16/10] bg-black/40 overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[#06B6D4] border border-[#06B6D4]/40 font-bold">
                            {roomObj ? roomObj.name : item.roomName || item.roomId}
                          </span>
                        </div>
                        {item.isExclusive && (
                          <div className="absolute top-2.5 right-2.5">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 backdrop-blur-md text-amber-300 border border-amber-500/40 font-bold">
                              🔒 VIP
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-syne font-bold text-base text-white truncate" title={item.title}>
                              {item.title}
                            </h4>
                            {item.year && (
                              <span className="text-xs font-mono text-[#94A3B8]">({item.year})</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 font-medium truncate">
                            {item.artist} • <span className="text-[#94A3B8]">{item.medium}</span>
                          </p>

                          {item.analysis && (
                            <p className="text-xs text-[#94A3B8] mt-2 line-clamp-2 leading-relaxed">
                              {item.analysis}
                            </p>
                          )}

                          {item.palette && item.palette.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/5">
                              <span className="text-[10px] font-mono text-[#94A3B8] mr-1">Paleta:</span>
                              {item.palette.map((hex, i) => (
                                <span
                                  key={i}
                                  className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                                  style={{ backgroundColor: hex }}
                                  title={hex}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit3DArtworkClick(item)}
                            className="text-xs text-[#06B6D4] hover:text-[#38BDF8] flex items-center gap-1.5 font-semibold transition-colors"
                          >
                            <Edit size={14} /> Modificar
                          </button>

                          {isConfirming ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleConfirmDelete3DArtwork(item.id, item.title)}
                                className="text-white bg-red-600 hover:bg-red-500 text-xs font-bold px-2.5 py-1 rounded transition-colors"
                              >
                                Confirmar
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleting3DArtworkId(null)}
                                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-white/5"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleting3DArtworkId(item.id)}
                              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                            >
                              <Trash2 size={14} /> Eliminar de Sala
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filtered3DArtworks.length === 0 && (
                <div className="glass-panel p-12 rounded-2xl text-center text-[#94A3B8] border border-white/10">
                  <Box size={36} className="mx-auto mb-3 opacity-40 text-[#06B6D4]" />
                  <p className="font-semibold text-white">No hay obras 3D encontradas</p>
                  <p className="text-xs mt-1 text-slate-400">
                    {artwork3DSearchQuery || filter3DRoom !== 'all'
                      ? 'No hay obras que coincidan con los filtros seleccionados.'
                      : 'Utiliza el botón superior para dar de alta la primera obra en el pabellón 3D.'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Subview: 3D Artwork Editor */
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 max-w-4xl mx-auto w-full">
              <div className="border-b border-white/10 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold font-syne text-white flex items-center gap-2">
                    {editing3DArtworkId ? (
                      <>
                        <Edit size={20} className="text-amber-400" /> Modificar Obra 3D Existente
                      </>
                    ) : (
                      <>
                        <UploadCloud size={20} className="text-[#06B6D4]" /> Alta de Obra para Estancia Tridimensional
                      </>
                    )}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
                    Carga los metadatos curatoriales, la paleta cromática y la textura en alta resolución para el motor 3D.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    reset3DArtworkForm();
                    setGallery3DSubView('list');
                  }}
                  className="btn-secondary py-2 px-4 text-xs flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <ArrowLeft size={14} /> Cancelar y Volver
                </button>
              </div>

              <form onSubmit={handleCreate3DArtwork} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1 text-slate-200">
                      Título de la Obra *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Metamorfosis de la Luz Sintética"
                      className="input-field text-sm"
                      value={new3DArtwork.title}
                      onChange={(e) => setNew3DArtwork({ ...new3DArtwork, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-200">
                      Estancia / Sala Virtual de Destino *
                    </label>
                    <select
                      className="input-field text-sm cursor-pointer"
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
                      <label className="block text-xs font-semibold mb-1 text-slate-200">
                        Nombre de la Sala Personalizada
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Ala de Arte Cuántico"
                        className="input-field text-sm"
                        value={new3DArtwork.roomName}
                        onChange={(e) => setNew3DArtwork({ ...new3DArtwork, roomName: e.target.value })}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-200">
                      Artista / Estudio Creador
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Lola Work Studio & Algoritmo"
                      className="input-field text-sm"
                      value={new3DArtwork.artist}
                      onChange={(e) => setNew3DArtwork({ ...new3DArtwork, artist: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-200">
                      Año de Creación
                    </label>
                    <input
                      type="text"
                      placeholder="2026"
                      className="input-field text-sm"
                      value={new3DArtwork.year}
                      onChange={(e) => setNew3DArtwork({ ...new3DArtwork, year: e.target.value })}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1 text-slate-200">
                      Técnica / Medio Computacional
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Render Unreal Engine 5.4 & Postproceso Digital"
                      className="input-field text-sm"
                      value={new3DArtwork.medium}
                      onChange={(e) => setNew3DArtwork({ ...new3DArtwork, medium: e.target.value })}
                    />
                  </div>
                </div>

                {/* Storage Upload Box */}
                <div className="p-5 rounded-xl border border-[#06B6D4]/30 bg-black/30 flex flex-col gap-4">
                  <label className="block text-xs font-bold text-[#06B6D4] uppercase tracking-wider font-mono">
                    🖼️ Textura / Imagen para la Sala 3D (Firebase Storage Bucket) *
                  </label>

                  <div className="flex gap-3 items-center flex-wrap">
                    <input
                      type="file"
                      accept="image/*"
                      id="artwork3dFileInput"
                      style={{ display: 'none' }}
                      onChange={handle3DImageFileUpload}
                      disabled={isUploading3DImage}
                    />
                    <label
                      htmlFor="artwork3dFileInput"
                      className="btn-cyan py-2.5 px-4 text-xs cursor-pointer inline-flex items-center gap-2 font-bold"
                    >
                      <UploadCloud size={16} /> Subir Textura desde el Equipo
                    </label>

                    {isUploading3DImage && (
                      <span className="text-xs text-[#06B6D4] font-semibold animate-pulse">
                        ⚡ Subiendo al Bucket de Storage...
                      </span>
                    )}
                  </div>

                  {upload3DStatus && (
                    <div
                      className={`text-xs font-medium ${
                        upload3DStatus.isError ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {upload3DStatus.message}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1">O ingresa una URL directa de textura HD:</label>
                    <input
                      type="url"
                      required
                      placeholder="https://images.unsplash.com/..."
                      className="input-field text-xs font-mono"
                      value={new3DArtwork.imageUrl}
                      onChange={(e) => setNew3DArtwork({ ...new3DArtwork, imageUrl: e.target.value })}
                    />
                  </div>

                  {new3DArtwork.imageUrl && (
                    <div className="flex items-center gap-4 p-3 bg-black/40 rounded-xl border border-white/10">
                      <img
                        src={new3DArtwork.imageUrl}
                        alt="Previsualización 3D"
                        className="w-24 h-16 object-cover rounded-lg border border-white/20"
                      />
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-white">Textura Lista para Render 3D</div>
                        <div className="text-[11px] text-[#94A3B8] truncate max-w-sm">
                          {new3DArtwork.imageUrl}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Curatorial Analysis */}
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-200">
                    Cédula Curatorial &amp; Concepto de la Obra en Sala
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe el concepto, iluminación y diálogo espacial en la sala 3D..."
                    className="input-field text-sm"
                    value={new3DArtwork.analysis}
                    onChange={(e) => setNew3DArtwork({ ...new3DArtwork, analysis: e.target.value })}
                  />
                </div>

                {/* Color Palette Picker */}
                <div className="p-5 rounded-xl border border-white/10 bg-black/20 flex flex-col gap-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-[#06B6D4] uppercase tracking-wider font-mono">
                    <Palette size={16} /> Paleta Cromática de la Estancia
                  </label>

                  {/* Active Swatches */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {new3DArtwork.palette.map((color) => (
                      <span
                        key={color}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white"
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/30"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-mono text-[11px]">{color}</span>
                        {new3DArtwork.palette.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveColorFromPalette(color)}
                            className="text-slate-400 hover:text-white p-0.5 ml-1 text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </span>
                    ))}
                  </div>

                  {/* Add Color Input */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <input
                      type="color"
                      value={customColorInput}
                      onChange={(e) => setCustomColorInput(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-white/20 p-1"
                    />
                    <input
                      type="text"
                      placeholder="#06B6D4"
                      className="input-field text-xs font-mono w-28"
                      value={customColorInput}
                      onChange={(e) => setCustomColorInput(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleAddColorToPalette}
                      className="btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Plus size={14} /> Añadir Color
                    </button>
                  </div>

                  {/* Presets */}
                  <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-white/5">
                    <span className="text-[11px] text-[#94A3B8]">Presets rápidos:</span>
                    {[
                      { name: 'Cyber Solarpunk', colors: ['#06B6D4', '#4F46E5', '#08090E'] },
                      { name: 'Neón Sintético', colors: ['#f43f5e', '#38bdf8', '#1e1b4b'] },
                      { name: 'Esmeralda Cuántica', colors: ['#10b981', '#6366f1', '#18181b'] },
                      { name: 'Monocromo Zen', colors: ['#f8fafc', '#64748b', '#020617'] },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setNew3DArtwork((prev) => ({ ...prev, palette: preset.colors }))}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-black/20 border border-white/10">
                  <input
                    type="checkbox"
                    id="exclusive3DCheck"
                    className="rounded border-white/20 text-[#06B6D4] focus:ring-0"
                    checked={new3DArtwork.isExclusive}
                    onChange={(e) => setNew3DArtwork({ ...new3DArtwork, isExclusive: e.target.checked })}
                  />
                  <label htmlFor="exclusive3DCheck" className="text-xs font-semibold text-slate-200 cursor-pointer">
                    🔒 Obra Exclusiva para Miembros VIP
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      reset3DArtworkForm();
                      setGallery3DSubView('list');
                    }}
                    className="btn-secondary w-full sm:w-auto text-xs py-2.5 px-5 flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={14} /> Cancelar y Volver
                  </button>

                  <button
                    type="submit"
                    className="btn-cyan w-full sm:w-auto text-sm py-3 px-8 font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  >
                    {editing3DArtworkId ? '💾 Actualizar Obra en Firestore' : '🚀 Guardar Obra 3D en Firebase'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CRÍTICA DE ARTE IA */}
      {activeTab === 'art-critique' && (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden flex flex-col p-6 md:p-8 gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="font-syne font-bold text-2xl text-white">Crítica de Arte Visual</h2>
                <span className="font-mono text-[10px] px-2.5 py-1 bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30 rounded uppercase tracking-wider font-bold">
                  VISUAL CRITIQUE
                </span>
              </div>
              <p className="text-[#94A3B8] text-xs sm:text-sm">
                Evaluación visual y técnica de obras con IA, generación de críticas estéticas curatoriales y exportación a PDF.
              </p>
            </div>
          </div>

          <ArtCritiqueTool user={user as any} initialTab="critique" hideNavigationTabs={true} />
        </div>
      )}

      {/* TAB 5: INVESTIGACIONES / RESEARCHES IA */}
      {activeTab === 'researches' && (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden flex flex-col p-6 md:p-8 gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="font-syne font-bold text-2xl text-white">Atelier de Investigación de Artistas &amp; Researches IA</h2>
                <span className="font-mono text-[10px] px-2.5 py-1 bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30 rounded uppercase tracking-wider font-bold">
                  RESEARCH ATELIER
                </span>
              </div>
              <p className="text-[#94A3B8] text-xs sm:text-sm">
                Investigaciones profundas sobre artistas y movimientos culturales, generación de guiones de video para YouTube y descarga directa en formato CSV/Excel.
              </p>
            </div>
          </div>

          <ResearchAtelier user={user as any} />
        </div>
      )}

      {/* TAB 6: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <h3 className="text-xl font-bold font-syne text-white flex items-center gap-2">
                <Icons.User size={22} className="text-[#06B6D4]" />
                Lista de Usuarios &amp; Roles de Acceso ({usersList.length})
              </h3>
              <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
                Administra los privilegios de los miembros y la asignación de roles en la plataforma.
              </p>
            </div>
          </div>

          {/* Search & Role Filter */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Buscar por nombre, usuario o email..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="input-field text-xs sm:text-sm pl-10 py-2 w-full"
              />
              {userSearchQuery && (
                <button
                  type="button"
                  onClick={() => setUserSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {[
                { label: 'Todos', value: 'all' },
                { label: 'Administradores', value: 'admin' },
                { label: 'Miembros VIP', value: 'member' },
              ].map((rf) => (
                <button
                  key={rf.value}
                  type="button"
                  onClick={() => setSelectedUserRoleFilter(rf.value as any)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors border ${
                    selectedUserRoleFilter === rf.value
                      ? 'bg-[#06B6D4]/20 border-[#06B6D4] text-[#06B6D4] font-bold'
                      : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {rf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Users List */}
          <div className="flex flex-col gap-3">
            {filteredUsersList.map((u) => (
              <div
                key={u.id}
                className="p-4 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between flex-wrap gap-4 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`}
                    alt={u.name}
                    className="w-11 h-11 rounded-full object-cover border border-white/20"
                  />
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      {u.name}
                      {u.role === 'admin' && (
                        <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/40 font-bold uppercase">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#94A3B8] mt-0.5">
                      @{u.username} • {u.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {u.role === 'admin' ? (
                    <span className="font-mono text-[11px] px-3 py-1 rounded-full bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30 font-bold">
                      Rol: Administrador
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold">
                      Rol: Miembro VIP
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => updateUserRole(u.id, u.role === 'admin' ? 'member' : 'admin')}
                    className="btn-secondary py-1.5 px-3 text-xs font-semibold cursor-pointer"
                  >
                    {u.role === 'admin' ? 'Degradar a Miembro' : 'Promover a Admin'}
                  </button>
                </div>
              </div>
            ))}

            {filteredUsersList.length === 0 && (
              <div className="p-8 text-center text-[#94A3B8] border border-white/10 rounded-xl">
                No se encontraron usuarios con ese criterio.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: ANALYTICS & FINANCES */}
      {activeTab === 'analytics' && (
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/10">
            <div>
              <h2 className="text-xl font-bold font-syne text-white flex items-center gap-2">
                <Icons.BarChart size={22} className="text-[#06B6D4]" />
                Métricas, Rendimiento &amp; Estado de la Plataforma
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
                Resumen de actividad editorial, interacción de la audiencia y sincronización de recursos.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
              {[
                { id: '7d', label: '7 Días' },
                { id: '30d', label: '30 Días' },
                { id: '1y', label: '1 Año' },
              ].map((tf) => (
                <button
                  key={tf.id}
                  type="button"
                  onClick={() => setAnalyticsTimeframe(tf.id as any)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    analyticsTimeframe === tf.id
                      ? 'bg-[#06B6D4] text-black font-bold'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-[#06B6D4]/5 to-transparent">
              <div className="text-xs font-mono uppercase tracking-wider text-[#06B6D4] mb-2 font-bold">
                PUBLICACIONES BLOG
              </div>
              <div className="text-3xl font-bold font-syne text-white">{blogPosts.length}</div>
              <div className="text-xs text-emerald-400 mt-2 font-medium flex items-center gap-1">
                <Check size={14} /> 100% Optimizadas SEO &amp; GEO
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/5 to-transparent">
              <div className="text-xs font-mono uppercase tracking-wider text-indigo-400 mb-2 font-bold">
                CATÁLOGO 2D &amp; 3D
              </div>
              <div className="text-3xl font-bold font-syne text-white">
                {galleryItems.length + (gallery3dArtworks?.length ?? 0)}
              </div>
              <div className="text-xs text-[#94A3B8] mt-2">
                {galleryItems.length} en 2D • {gallery3dArtworks?.length ?? 0} en Salas 3D
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/5 to-transparent">
              <div className="text-xs font-mono uppercase tracking-wider text-purple-400 mb-2 font-bold">
                USUARIOS REGISTRADOS
              </div>
              <div className="text-3xl font-bold font-syne text-white">{usersList.length}</div>
              <div className="text-xs text-emerald-400 mt-2 font-medium">
                +{usersList.filter((u) => u.role === 'admin').length} Administradores activos
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/5 to-transparent">
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-2 font-bold">
                INGRESOS ESTIMADOS
              </div>
              <div className="text-3xl font-bold font-syne text-emerald-400">
                €{analyticsTimeframe === '7d' ? '8,450' : analyticsTimeframe === '30d' ? '37,000' : '412,000'}
              </div>
              <div className="text-xs text-[#94A3B8] mt-2">
                Membresías VIP + Presets Shop
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
