import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { db, storage } from '../firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { handleFirestoreError, OperationType } from '../utils/error';
import ArticleRenderer from './ArticleRenderer';
import { 
  Sparkles, 
  Search, 
  FileVideo, 
  Download, 
  RefreshCw, 
  Trash2, 
  Plus, 
  Minus, 
  ChevronsUpDown, 
  CheckCircle2, 
  Globe, 
  ExternalLink, 
  PlayCircle, 
  Loader2, 
  Copy,
  Check,
  Filter,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LOLA_IMAGES } from '../constants/images';
import { FAQItem } from '../types';

interface ResearchAtelierProps {
  user: User;
}

const FALLBACK_CURATED_COVERS = [
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80',
];

export default function ResearchAtelier({ user }: ResearchAtelierProps) {
  const { addBlogPost, user: authUser } = useAuth();
  const [artistName, setArtistName] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [researchError, setResearchError] = useState('');
  const [researches, setResearches] = useState<any[]>([]);
  const [expandedResearchIds, setExpandedResearchIds] = useState<Record<string, boolean>>({});
  const [researchSteps, setResearchSteps] = useState('');
  const [generatingScriptId, setGeneratingScriptId] = useState<string | null>(null);
  const [publishingArticleId, setPublishingArticleId] = useState<string | null>(null);
  const [publishingStepMsg, setPublishProgress] = useState<Record<string, string>>({});
  const [publishedArticleDetails, setPublishedArticleDetails] = useState<
    Record<string, { imageUrl: string; imageAlt: string; slug: string; inStorage: boolean; promptUsed?: string }>
  >({});
  const [publishedArticleIds, setPublishedArticleIds] = useState<Record<string, boolean>>({});
  const [publishSuccessMsg, setPublishSuccessMsg] = useState<Record<string, string>>({});
  const [scriptErrors, setScriptErrors] = useState<Record<string, string>>({});

  // Search & Filter state for Monograph Repository
  const [searchHistoryQuery, setSearchHistoryQuery] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'published' | 'with_script'>('all');
  const [deletingResearchId, setDeletingResearchId] = useState<string | null>(null);
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);

  // Load Researches History from Firestore
  useEffect(() => {
    const uid = user?.uid || (user as any)?.id;
    if (!user || !uid) {
      setResearches([]);
      return;
    }

    const q = query(
      collection(db, `users/${uid}/researches`),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const docs: any[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          docs.push({ id: docSnap.id, ...data });
        });
        setResearches(docs);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, `users/${uid}/researches`);
      }
    );

    return () => unsub();
  }, [user]);

  // Filtered researches list
  const filteredResearches = useMemo(() => {
    return researches.filter((r) => {
      const isPub = Boolean(r.isPublished || publishedArticleIds[r.id]);
      const hasScript = Boolean(r.youtubeScript);

      if (historyFilter === 'published' && !isPub) return false;
      if (historyFilter === 'with_script' && !hasScript) return false;

      const q = searchHistoryQuery.toLowerCase().trim();
      if (!q) return true;

      const matchesArtist = r.artistName?.toLowerCase().includes(q);
      const matchesText = r.researchText?.toLowerCase().includes(q);
      return matchesArtist || matchesText;
    });
  }, [researches, publishedArticleIds, historyFilter, searchHistoryQuery]);

  // Rotating realistic steps for deep research loader
  useEffect(() => {
    if (!isResearching) {
      setResearchSteps('');
      return;
    }
    const steps = [
      'Conectando con bases de datos académicas e históricas...',
      'Sintetizando el pensamiento filosófico y motivaciones estéticas...',
      'Catalogando técnicas artísticas, paletas cromáticas y medios...',
      'Analizando sus obras cumbre y aportes compositivos...',
      'Redactando monografía estructurada en HTML5 y optimización SEO/GEO...',
    ];
    let idx = 0;
    setResearchSteps(steps[0]);
    const interval = setInterval(() => {
      idx = (idx + 1) % steps.length;
      setResearchSteps(steps[idx]);
    }, 4500);
    return () => clearInterval(interval);
  }, [isResearching]);

  // Submit research query
  const handleResearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const uid = user?.uid || (user as any)?.id;
    const cleanArtistName = artistName.trim().replace(/\s+/g, ' ');
    if (!cleanArtistName || !user || !uid || isResearching) return;

    setIsResearching(true);
    setResearchError('');

    try {
      const response = await fetch('/api/artist-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistName: cleanArtistName }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Error en la investigación');
      }

      const data = await response.json();

      // Save to Firestore
      const newDoc = await addDoc(collection(db, `users/${uid}/researches`), {
        userId: uid,
        artistName: cleanArtistName,
        researchText: data.report,
        createdAt: serverTimestamp(),
        isPublished: false,
      });

      if (newDoc?.id) {
        setExpandedResearchIds((prev) => ({ ...prev, [newDoc.id]: true }));
      }

      setArtistName('');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}/researches`);
      setResearchError(err.message || 'Error al compilar la investigación');
    } finally {
      setIsResearching(false);
    }
  };

  const toggleResearchExpand = (id: string) => {
    setExpandedResearchIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleAllResearches = () => {
    const allExpanded = filteredResearches.length > 0 && filteredResearches.every((r) => expandedResearchIds[r.id]);
    const newState: Record<string, boolean> = {};
    filteredResearches.forEach((r) => {
      newState[r.id] = !allExpanded;
    });
    setExpandedResearchIds(newState);
  };

  const handleConfirmDeleteResearch = async (researchId: string) => {
    const uid = user?.uid || (user as any)?.id;
    if (!user || !uid || !researchId) return;
    try {
      await deleteDoc(doc(db, `users/${uid}/researches/${researchId}`));
      setDeletingResearchId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${uid}/researches/${researchId}`);
    }
  };

  const handleGenerateScript = async (researchId: string, name: string, researchText: string) => {
    const uid = user?.uid || (user as any)?.id;
    if (!user || !uid || generatingScriptId) return;
    setGeneratingScriptId(researchId);
    setScriptErrors((prev) => ({ ...prev, [researchId]: '' }));

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistName: name, researchText }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Error al generar el guión');
      }

      const data = await response.json();

      // Update Firestore document with JSON stringified script
      const docRef = doc(db, `users/${uid}/researches/${researchId}`);
      await updateDoc(docRef, {
        youtubeScript: JSON.stringify(data.script),
      });
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}/researches/${researchId}`);
      setScriptErrors((prev) => ({ ...prev, [researchId]: err.message || 'Error al generar el guión' }));
    } finally {
      setGeneratingScriptId(null);
    }
  };

  const downloadCSV = (name: string, scriptText: string) => {
    let scriptData: any[] = [];
    try {
      scriptData = JSON.parse(scriptText);
    } catch (e) {
      alert('Error al formatear los datos del guión.');
      return;
    }

    const escapeCSV = (str: string) => {
      if (!str) return '""';
      const escaped = str.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const headers = ['Tiempo / Sección', 'Audio (Narrador / Voz en Off)', 'Visuales / Indicaciones de Edición / B-Roll'];
    const csvRows = [headers.map(escapeCSV).join(',')];

    scriptData.forEach((row: any) => {
      const time = row.tiempoSeccion || '';
      const audio = row.audioNarrador || '';
      const visual = row.visualesBroll || '';
      csvRows.push([escapeCSV(time), escapeCSV(audio), escapeCSV(visual)].join(','));
    });

    const csvString = '\ufeff' + csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const filename = `Guion_YouTube_${name.replace(/\s+/g, '_')}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyScriptTeleprompter = (name: string, scriptText: string, researchId: string) => {
    try {
      const scriptData = JSON.parse(scriptText);
      if (!Array.isArray(scriptData)) return;

      const formatted = scriptData
        .map((row: any, idx: number) => 
          `[SECCIÓN ${idx + 1} — ${row.tiempoSeccion || '0:00'}]\nVOZ EN OFF:\n${row.audioNarrador || ''}\n\nINDICACIÓN VISUAL / B-ROLL:\n${row.visualesBroll || ''}\n`
        )
        .join('\n----------------------------------------\n\n');

      const fullText = `# GUIÓN DE PRODUCCIÓN DE VIDEO: ${name.toUpperCase()}\nLola Workia Synthetic Atelier • Duración estimada: 5 min\n\n${formatted}`;
      navigator.clipboard.writeText(fullText);
      setCopiedScriptId(researchId);
      setTimeout(() => setCopiedScriptId(null), 3000);
    } catch (e) {
      console.error('Error al copiar guión:', e);
    }
  };

  const handlePublishAsBlogPost = async (research: any) => {
    if (!research || !research.artistName || !research.researchText) return;

    setPublishingArticleId(research.id);
    setScriptErrors((prev) => ({ ...prev, [`publish_${research.id}`]: '' }));
    setPublishProgress((prev) => ({ ...prev, [research.id]: '1/3: Creando imagen artística y texto Alt con IA...' }));

    try {
      const rawName = research.artistName.trim();
      const slugRaw = rawName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const cleanSlug = research.publishedSlug || `monografia-${slugRaw || 'arte'}-${Date.now().toString().slice(-4)}`;

      const plainText = research.researchText
        .replace(/<[^>]+>/g, ' ')
        .replace(/#+\s+/g, '')
        .replace(/[*_`~>]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();

      const excerpt = plainText.length > 200 ? plainText.substring(0, 197) + '...' : plainText;

      const rawMetaTitle = `Monografía de ${rawName}: Análisis Crítico & Estética | Lola Workia`;
      const metaTitle = rawMetaTitle.length > 60 ? rawMetaTitle.substring(0, 57) + '...' : rawMetaTitle;

      const rawMetaDesc = `Estudio monográfico y análisis exhaustivo de ${rawName}. Exploración estética, técnicas visuales y contexto histórico por Lola Workia.`;
      const metaDescription = rawMetaDesc.length > 160 ? rawMetaDesc.substring(0, 157) + '...' : rawMetaDesc;

      const keywords = `${rawName.toLowerCase()}, crítica de arte, monografía artística, ciberarte, net.art, arte digital, artes visuales, Lola Workia, análisis estético`;
      const canonicalUrl = `https://lolaworkia.com/blog/${cleanSlug}`;
      const schemaType = 'TechArticle' as const;

      const aiSummary = `Monografía y análisis crítico exhaustivo sobre la obra y trayectoria de ${rawName}, destacando sus fundamentos conceptuales, innovaciones técnicas y relevancia contemporánea en el arte visual y ciberarte.`;

      const keyTakeaways = `- Estudio profundo sobre el lenguaje visual, trayectoria e innovaciones de ${rawName}.\n- Análisis de técnicas compositivas, materiales y discursos estéticos.\n- Relevancia e impacto en el ecosistema del arte digital, ciberarte y medios audiovisuales.`;

      const faqItems: FAQItem[] = [
        {
          question: `¿Cuál es el aporte estético y técnico principal de ${rawName}?`,
          answer: plainText.length > 220 ? plainText.substring(0, 217) + '...' : plainText,
        },
        {
          question: `¿Qué innovaciones introduce ${rawName} en el arte contemporáneo y digital?`,
          answer: `La investigación de ${rawName} conecta nuevos medios, experimentación técnica y reflexión crítica, influyendo de manera decisiva en las vanguardias contemporáneas.`,
        },
        {
          question: `¿Dónde consultar más monografías y análisis de arte de Lola Workia?`,
          answer: `Puedes explorar el Atelier de Investigación y las publicaciones exclusivas del blog oficial de Lola Workia.`,
        },
      ];

      // Curated contextual cover fallback distribution
      const fallbackIdx = Math.abs(rawName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % FALLBACK_CURATED_COVERS.length;
      let generatedImageUrl = FALLBACK_CURATED_COVERS[fallbackIdx];
      let generatedImageAlt = `Composición artística y estética conceptual en homenaje a la obra de ${rawName} - Lola Workia Atelier`;
      let imagePromptUsed = '';
      let isSavedInStorageBucket = false;

      try {
        const coverRes = await fetch('/api/generate-article-cover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            artistName: rawName,
            researchText: research.researchText,
          }),
        });

        if (coverRes.ok) {
          const coverData = await coverRes.json();
          if (coverData.imageBase64) {
            generatedImageUrl = coverData.imageBase64;
          }
          if (coverData.imageAlt) {
            generatedImageAlt = coverData.imageAlt;
          }
          if (coverData.imagePrompt) {
            imagePromptUsed = coverData.imagePrompt;
          }
        }
      } catch (coverGenErr: any) {
        console.warn('Cover generation API note:', coverGenErr.message);
      }

      setPublishProgress((prev) => ({ ...prev, [research.id]: '2/3: Guardando portada en el Bucket (Firebase Storage)...' }));
      if (generatedImageUrl && generatedImageUrl.startsWith('data:')) {
        try {
          const cleanSlugName = cleanSlug.replace(/[^a-zA-Z0-9_-]/g, '_');
          const storageRef = ref(storage, `blog_covers/${Date.now()}_${cleanSlugName}.png`);
          const snapshot = await uploadString(storageRef, generatedImageUrl, 'data_url');
          const downloadUrl = await getDownloadURL(snapshot.ref);
          if (downloadUrl) {
            generatedImageUrl = downloadUrl;
            isSavedInStorageBucket = true;
          }
        } catch (storageErr: any) {
          console.warn('Firebase Storage upload fallback note:', storageErr.message);
        }
      }

      setPublishProgress((prev) => ({ ...prev, [research.id]: '3/3: Guardando en Firebase Firestore con SEO y Alt Text...' }));

      const postPayload = {
        title: `Monografía e Investigación: ${rawName}`,
        slug: cleanSlug,
        excerpt,
        content: research.researchText,
        category: 'Crítica de Arte & Filosofía',
        date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
        readTime: `${Math.max(4, Math.ceil(plainText.split(/\s+/).length / 180))} min de lectura`,
        imageUrl: generatedImageUrl,
        imageAlt: generatedImageAlt,
        isExclusive: false,
        metaTitle,
        metaDescription,
        keywords,
        canonicalUrl,
        schemaType,
        aiSummary,
        keyTakeaways,
        faqItems,
        author: {
          name: authUser?.name || user.displayName || 'Lola Workia',
          avatar: authUser?.avatarUrl || LOLA_IMAGES.AVATAR,
        },
      };

      if (addBlogPost) {
        await addBlogPost(postPayload);
      } else {
        const newPostId = `post-${Date.now()}`;
        await setDoc(doc(db, 'posts', newPostId), {
          ...postPayload,
          id: newPostId,
          likes: 0,
          commentsCount: 0,
        });
      }

      // Persist the published state in Firestore on the research doc
      const uid = user?.uid || (user as any)?.id;
      if (uid && research.id) {
        try {
          await updateDoc(doc(db, `users/${uid}/researches/${research.id}`), {
            isPublished: true,
            publishedSlug: cleanSlug,
            publishedImageUrl: generatedImageUrl,
            publishedImageAlt: generatedImageAlt,
            publishedAt: serverTimestamp(),
          });
        } catch (e) {
          console.warn('Firestore updateDoc note on research publication:', e);
        }
      }

      setPublishedArticleIds((prev) => ({ ...prev, [research.id]: true }));
      setPublishedArticleDetails((prev) => ({
        ...prev,
        [research.id]: {
          imageUrl: generatedImageUrl,
          imageAlt: generatedImageAlt,
          slug: cleanSlug,
          inStorage: isSavedInStorageBucket,
          promptUsed: imagePromptUsed,
        },
      }));
      setPublishSuccessMsg((prev) => ({
        ...prev,
        [research.id]: `✓ ¡Artículo de ${rawName} publicado con éxito! Portada generada y alojada en el bucket, y texto Alt guardado en Firebase Firestore.`,
      }));
    } catch (err: any) {
      console.error('Error al publicar artículo desde monografía:', err);
      setScriptErrors((prev) => ({
        ...prev,
        [`publish_${research.id}`]: `Error al publicar artículo: ${err.message || 'Error al conectar con Firebase'}`,
      }));
    } finally {
      setPublishingArticleId(null);
      setPublishProgress((prev) => ({ ...prev, [research.id]: '' }));
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Active Feature Block conforming to Cyber Solarpunk DESIGN.md */}
      <div className="p-6 md:p-8 bg-[#11131F]/40 border border-white/10 rounded-2xl">
        <div className="bg-[#181926]/90 rounded-xl p-6 border border-white/10 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#06B6D4] to-[#4F46E5]"></div>
          <div className="flex flex-col gap-2 pl-3">
            <span className="font-mono text-[10px] text-[#06B6D4] uppercase tracking-widest font-bold">
              RESEARCH ATELIER • GEMINI 3.7 FLASH + WEB SEARCH
            </span>
            <h3 className="font-syne font-bold text-2xl text-white">Investigación de Arte y Ciberarte</h3>
            <p className="text-[#94A3B8] text-sm leading-relaxed max-w-4xl">
              Realiza monografías y análisis profundos de cualquier artista histórico, corriente estética o movimiento artístico de vanguardia, con especial enfoque en el <strong className="text-white">arte digital</strong>, <strong className="text-white">ciberarte (cyberart)</strong> y <strong className="text-white">net.art</strong> contemporáneos.
            </p>
          </div>
        </div>

        {/* Search / Action Bar */}
        <form onSubmit={handleResearchSubmit} className="mt-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full group">
            <label htmlFor="artist-research-input" className="sr-only">
              Nombre del artista, corriente o movimiento estético
            </label>
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#06B6D4] transition-colors" />
            <input
              id="artist-research-input"
              type="text"
              required
              disabled={isResearching}
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="Ej. Net_art, Ciberarte, Claude Monet, Remedios Varo, Rafael Lozano-Hemmer..."
              className="w-full bg-[#13121b] rounded-full py-3.5 pl-12 pr-4 border border-white/15 focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4] focus:outline-none text-sm text-white placeholder-[#94A3B8] transition-all shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={isResearching || !artistName.trim()}
            className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] hover:opacity-95 rounded-full font-syne font-bold text-sm text-white uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isResearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>INVESTIGANDO...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>ANALIZAR PROFUNDAMENTE</span>
              </>
            )}
          </button>
        </form>

        {/* Research Step Progress Loader */}
        {isResearching && researchSteps && (
          <div
            role="status"
            aria-live="polite"
            className="mt-4 p-4 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/30 flex items-center gap-3 text-sm text-[#06B6D4] animate-pulse"
          >
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span className="font-mono text-xs">{researchSteps}</span>
          </div>
        )}

        {/* Error Notification */}
        {researchError && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
            {researchError}
          </div>
        )}
      </div>

      {/* Research Repository Section */}
      <div className="flex flex-col gap-4">
        {/* Header & Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-4 gap-4">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-[#06B6D4] uppercase tracking-widest mb-1 font-bold">
              HISTORIAL MONOGRÁFICO
            </span>
            <h4 className="font-syne font-bold text-xl text-white">Investigaciones Archivadas</h4>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search filter in repository */}
            <div className="relative">
              <label htmlFor="repo-search-input" className="sr-only">Buscar en monografías</label>
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                id="repo-search-input"
                type="text"
                placeholder="Filtrar historial..."
                value={searchHistoryQuery}
                onChange={(e) => setSearchHistoryQuery(e.target.value)}
                className="bg-[#13121b] text-xs text-white placeholder-[#94A3B8] rounded-full pl-8 pr-3 py-1.5 border border-white/10 focus:border-[#06B6D4] focus:outline-none w-44 sm:w-56"
              />
              {searchHistoryQuery && (
                <button
                  type="button"
                  onClick={() => setSearchHistoryQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-full border border-white/10 text-[11px] font-mono">
              {[
                { id: 'all', label: 'Todas' },
                { id: 'published', label: 'Publicadas' },
                { id: 'with_script', label: 'Con Guión' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setHistoryFilter(tab.id as any)}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    historyFilter === tab.id
                      ? 'bg-[#06B6D4] text-black font-bold'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {researches.length > 0 && (
              <button
                type="button"
                onClick={toggleAllResearches}
                aria-label={filteredResearches.every((r) => expandedResearchIds[r.id]) ? 'Plegar todas las monografías' : 'Desplegar todas las monografías'}
                className="hover:text-white transition-colors flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full font-mono text-[10px] uppercase text-[#94A3B8]"
              >
                <ChevronsUpDown className="w-3.5 h-3.5" />
                <span>
                  {filteredResearches.every((r) => expandedResearchIds[r.id]) ? 'PLEGAR' : 'DESPLEGAR'}
                </span>
              </button>
            )}

            <span className="bg-white/10 text-white px-2.5 py-1 rounded-full font-mono text-[11px] font-bold">
              {filteredResearches.length} {filteredResearches.length === 1 ? 'obra' : 'obras'}
            </span>
          </div>
        </div>

        {/* List of Monograph Items */}
        {filteredResearches.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#94A3B8] border border-dashed border-white/10 bg-[#11131F]/30 rounded-2xl">
            {searchHistoryQuery || historyFilter !== 'all'
              ? 'No se encontraron monografías con los filtros actuales.'
              : 'No hay investigaciones en tu historial. Realiza una búsqueda arriba para compilar tu primera monografía de arte.'}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredResearches.map((research) => {
              const isExpanded = !!expandedResearchIds[research.id];
              const isArticlePublished = Boolean(research.isPublished || publishedArticleIds[research.id]);
              const articleSlug = research.publishedSlug || publishedArticleDetails[research.id]?.slug;
              const isConfirmingDelete = deletingResearchId === research.id;

              return (
                <div
                  key={research.id}
                  className={`glass-panel bg-[#13121b]/80 rounded-xl transition-all border ${
                    isExpanded ? 'border-[#06B6D4]/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]' : 'border-white/10 hover:border-[#06B6D4]/30'
                  } overflow-hidden`}
                >
                  {/* Card Main Bar */}
                  <div className="p-5 md:p-6 flex items-center justify-between gap-4 select-none group">
                    <button
                      type="button"
                      onClick={() => toggleResearchExpand(research.id)}
                      aria-expanded={isExpanded}
                      aria-controls={`research-content-${research.id}`}
                      className="flex items-center gap-4 md:gap-6 min-w-0 flex-1 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#06B6D4]/50 rounded-lg p-1 -m-1"
                    >
                      {/* Avatar Icon */}
                      <div className="w-12 h-12 rounded-full bg-[#06B6D4]/10 flex items-center justify-center border border-[#06B6D4]/20 text-[#06B6D4] shrink-0 group-hover:scale-105 group-hover:border-[#06B6D4]/40 transition-all">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-syne font-bold text-lg md:text-xl text-white tracking-tight truncate group-hover:text-[#06B6D4] transition-colors">
                          {research.artistName}
                        </span>
                        {research.createdAt && (
                          <span className="font-mono text-[10px] text-[#94A3B8] uppercase tracking-widest mt-1">
                            Compilado: {new Date(research.createdAt.toDate ? research.createdAt.toDate() : research.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Right side actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      {isArticlePublished && (
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Publicado</span>
                        </span>
                      )}

                      {research.youtubeScript && (
                        <button
                          type="button"
                          onClick={() => {
                            if (!isExpanded) toggleResearchExpand(research.id);
                          }}
                          className="flex items-center gap-2 px-3.5 py-1.5 md:px-4 md:py-2 bg-[#4F46E5]/15 border border-[#4F46E5]/40 rounded-full text-indigo-300 font-mono text-[10px] font-bold uppercase tracking-wider hover:bg-[#4F46E5] hover:text-white transition-all shadow-[0_0_15px_rgba(79,70,229,0.2)]"
                        >
                          <PlayCircle className="w-3.5 h-3.5 text-[#06B6D4]" />
                          <span>GUIÓN DE VIDEO</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleResearchExpand(research.id)}
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? `Plegar monografía de ${research.artistName}` : `Desplegar monografía de ${research.artistName}`}
                        className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                      >
                        {isExpanded ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </button>

                      {isConfirmingDelete ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleConfirmDeleteResearch(research.id)}
                            className="text-white bg-red-600 hover:bg-red-500 text-[11px] font-bold px-2.5 py-1 rounded transition-colors"
                            aria-label="Confirmar eliminación"
                          >
                            Confirmar
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingResearchId(null)}
                            className="text-slate-400 hover:text-white text-[11px] px-1.5 py-1 rounded bg-white/5"
                            aria-label="Cancelar eliminación"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeletingResearchId(research.id)}
                          className="w-8 h-8 rounded-full text-[#94A3B8] hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center"
                          aria-label={`Eliminar monografía de ${research.artistName}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Monograph Content */}
                  {isExpanded && (
                    <div
                      id={`research-content-${research.id}`}
                      role="region"
                      aria-labelledby={`heading-${research.id}`}
                      className="p-6 md:p-8 pt-2 border-t border-white/5 flex flex-col gap-6 bg-[#08090E]/60"
                    >
                      {/* Monograph Article */}
                      <div>
                        <span className="font-mono text-[10px] text-[#06B6D4] uppercase tracking-widest block mb-3 font-bold">
                          MONOGRAFÍA E INVESTIGACIÓN DE ARTE (FORMATO HTML5 / SEO)
                        </span>
                        <div className="bg-[#0e0d16] p-6 sm:p-8 rounded-xl border border-white/10 shadow-inner">
                          <ArticleRenderer
                            content={research.researchText}
                            showTableOfContents={false}
                            allowCopyHtml={true}
                          />
                        </div>
                      </div>

                      {/* Publishing & Video Script Action Area */}
                      <div className="pt-6 border-t border-white/10 flex flex-col gap-6">
                        {/* Publishing Progress Status */}
                        {publishingArticleId === research.id && publishingStepMsg[research.id] && (
                          <div
                            role="status"
                            aria-live="polite"
                            className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-between gap-3 text-sm animate-pulse"
                          >
                            <div className="flex items-center gap-3">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>{publishingStepMsg[research.id]}</span>
                            </div>
                            <span className="font-mono text-[10px] uppercase tracking-wider bg-amber-500/20 px-2 py-0.5 rounded">
                              PROCESANDO
                            </span>
                          </div>
                        )}

                        {/* Published Confirmation Box */}
                        {publishSuccessMsg[research.id] && (
                          <div className="p-5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-4 text-emerald-300">
                            <div className="flex items-center justify-between gap-3 pb-3 border-b border-emerald-500/20">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                <span className="font-bold text-sm text-white">{publishSuccessMsg[research.id]}</span>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full uppercase">
                                Guardado en Firebase
                              </span>
                            </div>

                            {/* Cover Preview */}
                            {publishedArticleDetails[research.id] && (
                              <div className="bg-[#11131F] rounded-lg p-4 border border-emerald-500/20 flex flex-col md:flex-row items-start gap-4">
                                <div className="w-full md:w-56 h-32 relative rounded-md overflow-hidden bg-black shrink-0 border border-white/10">
                                  <img
                                    src={publishedArticleDetails[research.id].imageUrl}
                                    alt={publishedArticleDetails[research.id].imageAlt}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 space-y-2 text-xs">
                                  <div className="flex gap-2">
                                    <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">
                                      Storage: blog_covers
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                                      Firestore: posts
                                    </span>
                                  </div>
                                  <p className="text-[#94A3B8] italic">
                                    &ldquo;{publishedArticleDetails[research.id].imageAlt}&rdquo;
                                  </p>
                                  <div className="pt-2 flex items-center justify-between">
                                    <span className="font-mono text-[#94A3B8]">
                                      /{publishedArticleDetails[research.id].slug}
                                    </span>
                                    <a
                                      href={`/blog/${publishedArticleDetails[research.id].slug}`}
                                      className="inline-flex items-center gap-1 text-[#06B6D4] hover:underline font-mono"
                                    >
                                      <span>Ver en Blog</span>
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Errors */}
                        {scriptErrors[`publish_${research.id}`] && (
                          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            {scriptErrors[`publish_${research.id}`]}
                          </div>
                        )}
                        {scriptErrors[research.id] && (
                          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            {scriptErrors[research.id]}
                          </div>
                        )}

                        {/* Action Buttons Panel */}
                        <div className="bg-[#181926]/70 rounded-xl p-5 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-white font-syne font-bold text-base">
                              <FileVideo className="w-4 h-4 text-[#06B6D4]" />
                              <span>Publicación en Blog &amp; Producción de Video</span>
                            </div>
                            <p className="text-xs text-[#94A3B8]">
                              Publica en el Blog con metadatos SEO / Schema.org y GEO para ChatGPT/Perplexity, o genera el guión de 5 min para YouTube.
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 shrink-0">
                            {/* Publish to blog button */}
                            {isArticlePublished && articleSlug ? (
                              <a
                                href={`/blog/${articleSlug}`}
                                className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-syne font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Ver en Blog</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handlePublishAsBlogPost(research)}
                                disabled={publishingArticleId !== null}
                                className="px-5 py-2.5 rounded-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-syne font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-40"
                              >
                                {publishingArticleId === research.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    <span>Publicando...</span>
                                  </>
                                ) : (
                                  <>
                                    <Globe className="w-4 h-4" />
                                    <span>Publicar en Blog</span>
                                  </>
                                )}
                              </button>
                            )}

                            {/* Generate or View Video Script button */}
                            {!research.youtubeScript ? (
                              <button
                                type="button"
                                onClick={() => handleGenerateScript(research.id, research.artistName, research.researchText)}
                                disabled={generatingScriptId !== null}
                                className="px-5 py-2.5 rounded-full bg-[#06B6D4]/15 hover:bg-[#06B6D4] text-[#06B6D4] hover:text-black border border-[#06B6D4]/40 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.2)] disabled:opacity-40"
                              >
                                {generatingScriptId === research.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Creando Guión...</span>
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle className="w-4 h-4" />
                                    <span>Generar Guión</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleCopyScriptTeleprompter(research.artistName, research.youtubeScript, research.id)}
                                  className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
                                  title="Copiar texto formateado para locutor o teleprompter"
                                >
                                  {copiedScriptId === research.id ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      <span className="text-emerald-400">Copiado</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Copiar Guión</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => downloadCSV(research.artistName, research.youtubeScript)}
                                  className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
                                  title="Descargar archivo CSV estructurado para Excel / Hojas de cálculo"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>CSV</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Interactive Video Script Table when generated */}
                        {research.youtubeScript && (
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <PlayCircle className="w-4 h-4 text-[#06B6D4]" />
                                <span className="font-syne font-bold text-sm text-white">
                                  Guión de Producción de Video (YouTube ~30 Secciones de 10s)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleGenerateScript(research.id, research.artistName, research.researchText)}
                                disabled={generatingScriptId !== null}
                                className="text-xs font-mono text-[#94A3B8] hover:text-[#06B6D4] flex items-center gap-1.5 transition-colors"
                              >
                                <RefreshCw className={`w-3 h-3 ${generatingScriptId === research.id ? 'animate-spin' : ''}`} />
                                <span>Regenerar Guión</span>
                              </button>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0e0d16]">
                              <table className="min-w-full divide-y divide-white/10 text-xs">
                                <thead className="bg-[#181926]/90 text-[#94A3B8] font-mono uppercase tracking-wider">
                                  <tr>
                                    <th scope="col" className="px-4 py-3 text-left font-bold w-32 border-r border-white/10">Tiempo</th>
                                    <th scope="col" className="px-4 py-3 text-left font-bold border-r border-white/10">Audio / Voz en Off</th>
                                    <th scope="col" className="px-4 py-3 text-left font-bold">Visuales &amp; B-Roll</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-[#F8FAFC]">
                                  {(() => {
                                    try {
                                      const rows = JSON.parse(research.youtubeScript);
                                      if (!Array.isArray(rows)) return null;
                                      return rows.map((row: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                                          <td className="px-4 py-3 font-mono border-r border-white/5 whitespace-nowrap align-top">
                                            <span className="bg-[#06B6D4]/15 text-[#06B6D4] px-2 py-0.5 rounded font-bold">
                                              {row.tiempoSeccion || '0:00'}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 leading-relaxed border-r border-white/5 align-top text-white">
                                            {row.audioNarrador}
                                          </td>
                                          <td className="px-4 py-3 text-slate-300 align-top">
                                            {row.visualesBroll}
                                          </td>
                                        </tr>
                                      ));
                                    } catch (e) {
                                      return (
                                        <tr>
                                          <td colSpan={3} className="px-4 py-6 text-center text-red-400 font-mono">
                                            Error al procesar el guión. Prueba a regenerarlo.
                                          </td>
                                        </tr>
                                      );
                                    }
                                  })()}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
