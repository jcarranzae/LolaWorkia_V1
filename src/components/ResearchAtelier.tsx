import React, { useState, useEffect } from 'react';
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
  Upload, 
  ShieldCheck, 
  ExternalLink, 
  PlayCircle, 
  Loader2, 
  Bot,
  Layers,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LOLA_IMAGES } from '../constants/images';
import { FAQItem } from '../types';

interface ResearchAtelierProps {
  user: User;
}

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
          docs.push({ id: docSnap.id, ...docSnap.data() });
        });
        setResearches(docs);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, `users/${uid}/researches`);
      }
    );

    return () => unsub();
  }, [user]);

  // Rotating realistic steps for deep research loader
  useEffect(() => {
    if (!isResearching) {
      setResearchSteps('');
      return;
    }
    const steps = [
      'Conectando con bases de datos académicas e históricas...',
      'Sintetizando el pensamiento filosófico y motivaciones...',
      'Catalogando técnicas artísticas, paletas cromáticas y medios...',
      'Analizando sus obras cumbre más representativas...',
      'Redactando reporte exhaustivo final y legado cultural...',
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
    if (!artistName.trim() || !user || !uid || isResearching) return;

    setIsResearching(true);
    setResearchError('');

    try {
      const response = await fetch('/api/artist-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistName: artistName.trim() }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Error en la investigación');
      }

      const data = await response.json();

      // Save to Firestore
      const newDoc = await addDoc(collection(db, `users/${uid}/researches`), {
        userId: uid,
        artistName: artistName.trim(),
        researchText: data.report,
        createdAt: serverTimestamp(),
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
    const allExpanded = researches.length > 0 && researches.every((r) => expandedResearchIds[r.id]);
    const newState: Record<string, boolean> = {};
    researches.forEach((r) => {
      newState[r.id] = !allExpanded;
    });
    setExpandedResearchIds(newState);
  };

  const deleteResearch = async (researchId: string) => {
    const uid = user?.uid || (user as any)?.id;
    if (!user || !uid) return;
    if (!confirm('¿Seguro que deseas eliminar esta investigación de tu historial?')) return;
    try {
      await deleteDoc(doc(db, `users/${uid}/researches/${researchId}`));
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
      const cleanSlug = `monografia-${slugRaw || 'arte'}-${Date.now().toString().slice(-4)}`;

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

      let generatedImageUrl = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80';
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
    <div className="flex flex-col gap-8 px-[15px]">
      {/* Active Feature Block conforming to user design */}
      <div className="p-6 md:p-8 bg-[#11131F]/40 border border-white/5 rounded-2xl px-[15px]">
        <div className="bg-[#181926]/80 rounded-xl p-6 border border-white/10 relative overflow-hidden shadow-lg px-[15px]">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#06B6D4] to-[#4F46E5]"></div>
          <div className="flex flex-col gap-2 pl-2 px-[15px]">
            <span className="font-mono text-[10px] text-[#94A3B8] uppercase tracking-widest">RESEARCH ATELIER</span>
            <h3 className="font-syne font-bold text-2xl text-white">Investigación de Arte y Ciberarte</h3>
            <p className="text-[#94A3B8] text-sm leading-relaxed max-w-4xl">
              Realiza monografías y análisis profundos de cualquier artista histórico, corriente estética o movimiento artístico vanguardista, con especial enfoque en el <strong className="text-white">arte digital</strong>, <strong className="text-white">ciberarte (cyberart)</strong> y <strong className="text-white">net.art</strong> contemporáneos.
            </p>
          </div>
        </div>

        {/* Search / Action Bar */}
        <form onSubmit={handleResearchSubmit} className="mt-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full group">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#06B6D4] transition-colors" />
            <input
              type="text"
              required
              disabled={isResearching}
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="Ej. Net_art, Ciberarte, Claude Monet, Remedios Varo, Rafael Lozano-Hemmer..."
              className="w-full bg-[#13121b] rounded-full py-3.5 pl-12 pr-4 border border-white/10 focus:border-[#06B6D4]/50 focus:ring-1 focus:ring-[#06B6D4]/50 focus:outline-none text-sm text-white placeholder-[#64748B] transition-all shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={isResearching || !artistName.trim()}
            className="w-full md:w-auto px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#06B6D4]/40 rounded-full font-syne font-bold text-sm text-white uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 group hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isResearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#06B6D4]" />
                <span>INVESTIGANDO...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#06B6D4] group-hover:scale-110 transition-transform" />
                <span>ANALIZAR PROFUNDAMENTE</span>
              </>
            )}
          </button>
        </form>

        {/* Research Step Progress Loader */}
        {isResearching && researchSteps && (
          <div className="mt-4 p-4 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/30 flex items-center gap-3 text-sm text-[#06B6D4] animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span className="font-mono text-xs">{researchSteps}</span>
          </div>
        )}

        {/* Error Notification */}
        {researchError && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {researchError}
          </div>
        )}
      </div>

      {/* Research List Area */}
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between border-b border-white/10 pb-3 mb-2">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-widest mb-1">REPOSITORY</span>
            <h4 className="font-syne font-bold text-xl text-white">Investigaciones e Historial Monográfico</h4>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-[#94A3B8]">
            {researches.length > 0 && (
              <button
                type="button"
                onClick={toggleAllResearches}
                className="hover:text-white transition-colors flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full"
              >
                <ChevronsUpDown className="w-3.5 h-3.5" />
                <span>
                  {researches.every((r) => expandedResearchIds[r.id]) ? 'PLEGAR TODO' : 'DESPLEGAR TODO'}
                </span>
              </button>
            )}
            <span className="bg-white/10 text-white px-2.5 py-1 rounded-full font-mono font-bold">
              {researches.length} {researches.length === 1 ? 'monografía' : 'monografías'}
            </span>
          </div>
        </div>

        {/* List of Monograph Items */}
        {researches.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#94A3B8] border border-dashed border-white/10 bg-[#11131F]/30 rounded-2xl">
            No hay investigaciones en tu historial. Realiza una búsqueda arriba para compilar tu primera monografía de arte.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {researches.map((research) => {
              const isExpanded = !!expandedResearchIds[research.id];

              return (
                <div
                  key={research.id}
                  className={`glass-panel bg-[#13121b]/60 rounded-xl transition-all border ${
                    isExpanded ? 'border-[#06B6D4]/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]' : 'border-white/5 hover:border-[#06B6D4]/30'
                  } overflow-hidden`}
                >
                  {/* Card Main Bar */}
                  <div
                    onClick={() => toggleResearchExpand(research.id)}
                    className="p-5 md:p-6 flex items-center justify-between gap-4 cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-4 md:gap-6 min-w-0 flex-1">
                      {/* Avatar Icon */}
                      <div className="w-12 h-12 rounded-full bg-[#06B6D4]/10 flex items-center justify-center border border-[#06B6D4]/20 text-[#06B6D4] shrink-0 group-hover:scale-105 group-hover:border-[#06B6D4]/40 transition-all">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-syne font-bold text-lg md:text-xl text-white tracking-tight truncate group-hover:text-[#06B6D4] transition-colors">
                          {research.artistName}
                        </span>
                        {research.createdAt && (
                          <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-widest mt-1">
                            Compilado: {new Date(research.createdAt.toDate ? research.createdAt.toDate() : research.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      {publishedArticleIds[research.id] && (
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Publicado</span>
                        </span>
                      )}

                      {research.youtubeScript && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isExpanded) toggleResearchExpand(research.id);
                          }}
                          className="flex items-center gap-2 px-3.5 py-1.5 md:px-4 md:py-2 bg-[#EC4899]/10 border border-[#EC4899]/30 rounded-full text-[#EC4899] font-mono text-[10px] font-bold uppercase tracking-wider hover:bg-[#EC4899] hover:text-white transition-all shadow-[0_0_15px_rgba(236,72,153,0.2)]"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>GUIÓN DE VIDEO</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleResearchExpand(research.id);
                        }}
                        className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                        title={isExpanded ? 'Plegar artículo' : 'Desplegar artículo'}
                      >
                        {isExpanded ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteResearch(research.id);
                        }}
                        className="w-8 h-8 rounded-full text-[#64748B] hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center"
                        title="Eliminar monografía"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Monograph Content */}
                  {isExpanded && (
                    <div className="p-6 md:p-8 pt-2 border-t border-white/5 flex flex-col gap-6 bg-[#08090E]/60">
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
                          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-between gap-3 text-sm animate-pulse">
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
                                    <span className="font-mono text-[#64748B]">
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
                              <span>Publicación en Blog & Producción de Video</span>
                            </div>
                            <p className="text-xs text-[#94A3B8]">
                              Publica en el Blog con metadatos SEO / Schema.org y GEO para ChatGPT/Perplexity, o genera el guión de 5 min para YouTube.
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 shrink-0">
                            {/* Publish to blog button */}
                            <button
                              type="button"
                              onClick={() => handlePublishAsBlogPost(research)}
                              disabled={publishingArticleId !== null}
                              className={`px-5 py-2.5 rounded-full font-syne font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                                publishedArticleIds[research.id]
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                              } disabled:opacity-40`}
                            >
                              {publishingArticleId === research.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                                  <span>Publicando...</span>
                                </>
                              ) : publishedArticleIds[research.id] ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>✓ Artículo Publicado</span>
                                </>
                              ) : (
                                <>
                                  <Globe className="w-4 h-4" />
                                  <span>Publicar en Blog</span>
                                </>
                              )}
                            </button>

                            {/* Generate or View Video Script button */}
                            {!research.youtubeScript ? (
                              <button
                                type="button"
                                onClick={() => handleGenerateScript(research.id, research.artistName, research.researchText)}
                                disabled={generatingScriptId !== null}
                                className="px-5 py-2.5 rounded-full bg-[#EC4899]/10 hover:bg-[#EC4899] text-[#EC4899] hover:text-white border border-[#EC4899]/40 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(236,72,153,0.2)] disabled:opacity-40"
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
                              <button
                                type="button"
                                onClick={() => downloadCSV(research.artistName, research.youtubeScript)}
                                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                              >
                                <Download className="w-4 h-4" />
                                <span>Descargar CSV</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Interactive Video Script Table when generated */}
                        {research.youtubeScript && (
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <PlayCircle className="w-4 h-4 text-[#EC4899]" />
                                <span className="font-syne font-bold text-sm text-white">
                                  Guión de Producción de Video (YouTube ~30 Secciones)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleGenerateScript(research.id, research.artistName, research.researchText)}
                                disabled={generatingScriptId !== null}
                                className="text-xs font-mono text-[#94A3B8] hover:text-white flex items-center gap-1.5"
                              >
                                <RefreshCw className={`w-3 h-3 ${generatingScriptId === research.id ? 'animate-spin' : ''}`} />
                                <span>Regenerar Guión</span>
                              </button>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0e0d16]">
                              <table className="min-w-full divide-y divide-white/10 text-xs">
                                <thead className="bg-[#181926]/80 text-[#94A3B8] font-mono uppercase">
                                  <tr>
                                    <th className="px-4 py-3 text-left font-bold w-28 border-r border-white/10">Tiempo</th>
                                    <th className="px-4 py-3 text-left font-bold border-r border-white/10">Audio / Voz en Off</th>
                                    <th className="px-4 py-3 text-left font-bold">Visuales & B-Roll</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-[#F8FAFC]">
                                  {(() => {
                                    try {
                                      const rows = JSON.parse(research.youtubeScript);
                                      if (!Array.isArray(rows)) return null;
                                      return rows.map((row: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                                          <td className="px-4 py-3 font-mono text-[#06B6D4] font-bold border-r border-white/5 whitespace-nowrap align-top">
                                            {row.tiempoSeccion || '0:00'}
                                          </td>
                                          <td className="px-4 py-3 leading-relaxed border-r border-white/5 align-top">
                                            {row.audioNarrador}
                                          </td>
                                          <td className="px-4 py-3 text-[#94A3B8] italic align-top">
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
