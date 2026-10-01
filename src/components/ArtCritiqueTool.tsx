import { useEffect, useState, useRef } from "react";
import { db, storage } from "../firebase";
import { User } from "firebase/auth";
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy, deleteDoc, doc } from "firebase/firestore";
import { resizeImage } from "../utils/image";
import { handleFirestoreError, OperationType } from "../utils/error";
import Markdown from "react-markdown";
import { Loader2, X, Plus, Trash2, Sparkles, FileText, Upload, CheckCircle2 } from "lucide-react";
import { jsPDF } from "jspdf";
import ResearchAtelier from "./ResearchAtelier";

interface CritiqueDoc {
  id: string;
  userId: string;
  type: string;
  images: string[];
  critiqueText: string;
  createdAt: any;
}

interface ArtCritiqueToolProps {
  user: User;
  initialTab?: "critique" | "research" | "exhibitions";
  hideNavigationTabs?: boolean;
}

export default function ArtCritiqueTool({ user, initialTab = "critique", hideNavigationTabs = false }: ArtCritiqueToolProps) {
  const [critiques, setCritiques] = useState<CritiqueDoc[]>([]);
  const [activeTab, setActiveTab] = useState<"critique" | "research" | "exhibitions">(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  
  // Art Critique Form State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Exhibitions Management State
  const [exhibitions, setExhibitions] = useState<any[]>([]);
  const [customArtTitle, setCustomArtTitle] = useState<string>("");
  const [customArtArtist, setCustomArtArtist] = useState<string>("");
  const [customArtUrl, setCustomArtUrl] = useState<string>("");
  const [customArtDesc, setCustomArtDesc] = useState<string>("");
  const [customArtPrice, setCustomArtPrice] = useState<string>("");
  const [customArtRoom, setCustomArtRoom] = useState<string>("Ala de Innovadores");
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [savingArtwork, setSavingArtwork] = useState<boolean>(false);
  const [exhibitionsError, setExhibitionsError] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Exhibitions History
  useEffect(() => {
    const uid = user?.uid || (user as any)?.id;
    if (!user || !uid) {
      setExhibitions([]);
      return;
    }

    const q = query(
      collection(db, `users/${uid}/exhibitions`),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const docs: any[] = [];
      snapshot.forEach((docSnap) => {
        docs.push({ id: docSnap.id, ...docSnap.data() });
      });
      setExhibitions(docs);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `users/${uid}/exhibitions`);
    });

    return () => unsub();
  }, [user]);

  const handleAddArtwork = async () => {
    const uid = user?.uid || (user as any)?.id;
    if (!customArtTitle || !customArtUrl || !user || !uid) return;

    setSavingArtwork(true);
    setExhibitionsError("");

    try {
      const artworkData = {
        title: customArtTitle,
        artist: customArtArtist || "Artista Invitado",
        url: customArtUrl,
        description: customArtDesc || "Una obra colgada de manera interactiva por Lola en el espacio virtual tridimensional.",
        room: customArtRoom || "Ala de Innovadores",
        price: customArtPrice || "",
        userId: uid,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, `users/${uid}/exhibitions`), artworkData);
      
      setCustomArtTitle("");
      setCustomArtArtist("");
      setCustomArtUrl("");
      setCustomArtDesc("");
      setCustomArtPrice("");
      setCustomArtRoom("Ala de Innovadores");
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}/exhibitions`);
      setExhibitionsError("Error de Firebase: " + err.message);
    } finally {
      setSavingArtwork(false);
    }
  };

  const handleDeleteArtwork = async (artId: string) => {
    const uid = user?.uid || (user as any)?.id;
    if (!user || !uid) return;
    if (!confirm("¿Estás seguro de que deseas eliminar esta obra de la galería de Firebase?")) return;

    try {
      await deleteDoc(doc(db, `users/${uid}/exhibitions`, artId));
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `users/${uid}/exhibitions/${artId}`);
    }
  };

  // Load Critiques History
  useEffect(() => {
    const uid = user?.uid || (user as any)?.id;
    if (!user || !uid) {
      setCritiques([]);
      return;
    }

    const q = query(
      collection(db, `users/${uid}/critiques`),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const docs: CritiqueDoc[] = [];
      snapshot.forEach((docSnap) => {
        docs.push({ id: docSnap.id, ...docSnap.data() } as CritiqueDoc);
      });
      setCritiques(docs);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `users/${uid}/critiques`);
    });

    return () => unsub();
  }, [user]);

  // Art Critique Handlers
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      if (files.length + selectedFiles.length > 6) {
        setErrorMsg("Solo puedes subir un máximo de 6 imágenes a la vez.");
        return;
      }
      
      const newFiles = [...selectedFiles, ...files];
      setSelectedFiles(newFiles);

      const previews = await Promise.all(
        files.map(file => resizeImage(file, 600))
      );
      setImagePreviews(prev => [...prev, ...previews]);
      setErrorMsg("");
    }
  };

  const clearSelection = () => {
    setSelectedFiles([]);
    setImagePreviews([]);
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async () => {
    if (imagePreviews.length === 0 || !user) return;
    
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/critique", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: imagePreviews }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Error al obtener la crítica");
      }

      const data = await response.json();
      
      const uid = user?.uid || (user as any)?.id;
      if (!user || !uid) return;
      await addDoc(collection(db, `users/${uid}/critiques`), {
        userId: uid,
        type: imagePreviews.length > 1 ? "style" : "single",
        images: imagePreviews,
        critiqueText: data.critique,
        createdAt: serverTimestamp()
      });

      clearSelection();
    } catch (err: any) {
      const uid = user?.uid || (user as any)?.id;
      if (uid) handleFirestoreError(err, OperationType.WRITE, `users/${uid}/critiques`);
      setErrorMsg(err.message || "Error al generar la crítica");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCritique = async (critiqueId: string) => {
    const uid = user?.uid || (user as any)?.id;
    if (!user || !uid) return;
    if (!confirm("¿Seguro que deseas eliminar este análisis?")) return;
    try {
      await deleteDoc(doc(db, `users/${uid}/critiques/${critiqueId}`));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${uid}/critiques/${critiqueId}`);
    }
  };

  const generateCritiquePDF = (critique: CritiqueDoc) => {
    const doc = new jsPDF();
    doc.setProperties({
      title: `Crítica de Arte - ${critique.type === "style" ? "Colección" : "Individual"}`,
      subject: "Crítica de Arte",
      author: "Atelier de Crítica de Arte Lola Workia"
    });

    doc.setFont("helvetica", "normal");
    doc.setFillColor(17, 19, 31);
    doc.rect(20, 20, 170, 1.5, "fill");
    
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "bold");
    const categoryText = (critique.type === "style" ? "ANÁLISIS DE COLECCIÓN" : "CRÍTICA INDIVIDUAL").toUpperCase();
    doc.text(categoryText, 20, 28);
    
    const dateStr = critique.createdAt 
      ? new Date(critique.createdAt.toDate ? critique.createdAt.toDate() : critique.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
      : new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(dateStr, 190, 28, { align: "right" });
    
    doc.setFontSize(20);
    doc.setTextColor(248, 250, 252);
    doc.setFont("helvetica", "bold");
    doc.text("CRÍTICA DE ARTE CIBERNÉTICA", 20, 42);
    
    doc.setFillColor(79, 70, 229);
    doc.rect(20, 48, 170, 0.5, "fill");
    
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    
    const rawText = critique.critiqueText || "";
    const lines = rawText.split("\n");
    let y = 60;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const width = doc.internal.pageSize.width - 2 * margin;
    
    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i].trim();
      if (rawLine === "") {
        y += 5;
        continue;
      }
      
      let isHeader = false;
      let textToPrint = rawLine;
      let bullet = false;
      
      if (rawLine.startsWith("###")) {
        isHeader = true;
        textToPrint = rawLine.replace(/^###\s*/, "");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(17, 17, 17);
        y += 3;
      } else if (rawLine.startsWith("##")) {
        isHeader = true;
        textToPrint = rawLine.replace(/^##\s*/, "");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(17, 17, 17);
        y += 4;
      } else if (rawLine.startsWith("#")) {
        isHeader = true;
        textToPrint = rawLine.replace(/^#\s*/, "");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(17, 17, 17);
        y += 6;
      } else if (rawLine.startsWith("-") || rawLine.startsWith("*")) {
        bullet = true;
        textToPrint = "• " + rawLine.replace(/^[-*]\s*/, "");
        doc.setFont("times", "normal");
        doc.setFontSize(11);
        doc.setTextColor(40, 40, 40);
      } else {
        textToPrint = rawLine.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").replace(/\*\*/g, "");
        doc.setFont("times", "normal");
        doc.setFontSize(11);
        doc.setTextColor(40, 40, 40);
      }
      
      const splitLines = doc.splitTextToSize(textToPrint, bullet ? width - 5 : width);
      
      for (let j = 0; j < splitLines.length; j++) {
        if (y > pageHeight - margin - 15) {
          doc.addPage();
          doc.setFillColor(238, 238, 238);
          doc.rect(20, 15, 170, 0.5, "fill");
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text("CRÍTICA DE ARTE — PÁGINA " + doc.getCurrentPageInfo().pageNumber, 20, 22);
          y = 30;
        }
        
        const xPos = bullet ? margin + 4 : margin;
        doc.text(splitLines[j], xPos, y);
        y += 6;
      }
      
      if (isHeader) {
        y += 2;
      }
    }
    
    const totalPages = doc.getNumberOfPages();
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      doc.setPage(pageNum);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Lola Workia Synthetic Atelier — Página ${pageNum} de ${totalPages}`, 105, pageHeight - 10, { align: "center" });
    }
    
    const formattedDate = dateStr.replace(/\s+/g, "_").replace(/,/g, "");
    const filename = `Critica_Arte_${formattedDate}.pdf`;
    doc.save(filename);
  };

  return (
    <div className="flex flex-col gap-6 px-[15px]">
      {/* Context Subtabs Navigation conforming to HTML design */}
      {!hideNavigationTabs && (
        <div className="flex gap-8 border-b border-white/10 pb-1 font-mono text-xs uppercase tracking-wider text-[#94A3B8] overflow-x-auto custom-scrollbar px-[15px]">
          <button
            type="button"
            onClick={() => setActiveTab("critique")}
            className={`pb-3 transition-colors ${
              activeTab === "critique"
                ? "text-[#06B6D4] border-b-2 border-[#06B6D4] font-bold"
                : "hover:text-white"
            }`}
          >
            CRÍTICA DE OBRAS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("research")}
            className={`pb-3 transition-colors ${
              activeTab === "research"
                ? "text-[#06B6D4] border-b-2 border-[#06B6D4] font-bold"
                : "hover:text-white"
            }`}
          >
            INVESTIGACIÓN DE ARTISTA
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("exhibitions")}
            className={`pb-3 transition-colors ${
              activeTab === "exhibitions"
                ? "text-[#06B6D4] border-b-2 border-[#06B6D4] font-bold"
                : "hover:text-white"
            }`}
          >
            GESTIÓN DE EXPOSICIONES
          </button>
        </div>
      )}

      {/* Tab 1: CRÍTICA DE OBRAS */}
      {activeTab === "critique" && (
        <div className="flex flex-col gap-10">
          {/* Upload Section */}
          <section className="glass-panel p-6 md:p-8 bg-[#11131F]/40 border border-white/5 rounded-2xl">
            <div className="mb-6">
              <span className="font-mono text-[10px] text-[#06B6D4] uppercase tracking-widest block mb-1 font-bold">
                EVALUACIÓN VISUAL IA
              </span>
              <h3 className="font-syne font-bold text-2xl text-white">Análisis & Crítica Estética</h3>
              <p className="text-sm text-[#94A3B8] mt-1">
                Sube hasta 6 obras simultáneas para generar una crítica curatorial exhaustiva con visión computacional y modelos generativos.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {errorMsg}
              </div>
            )}

            {imagePreviews.length > 0 ? (
              <div className="space-y-6">
                <div>
                  <h4 className="font-mono text-xs text-[#94A3B8] uppercase tracking-wider mb-3">
                    Obras Seleccionadas ({imagePreviews.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                    {imagePreviews.filter(Boolean).map((src, idx) => (
                      <div key={idx} className="aspect-square bg-black/40 relative group overflow-hidden rounded-xl border border-white/10">
                        <img src={src} alt="Obra" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute bottom-1.5 left-1.5 text-[9px] text-white font-mono bg-black/70 px-1.5 py-0.5 rounded">
                          0{idx + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          disabled={isSubmitting}
                          className="absolute top-1.5 right-1.5 p-1 bg-black/80 hover:bg-red-500 text-white rounded-full transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    {imagePreviews.length < 6 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSubmitting}
                        className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-[#06B6D4]/50 bg-white/5 rounded-xl transition-all text-[#94A3B8] hover:text-white"
                      >
                        <Plus className="w-6 h-6 mb-1" />
                        <span className="font-mono text-[10px] uppercase">Añadir</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-3.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-syne font-bold text-xs uppercase tracking-wider rounded-full transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-40"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Analizando Obras...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#06B6D4]" />
                        <span>Generar Crítica Estética</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={clearSelection}
                    disabled={isSubmitting}
                    className="px-6 py-3.5 border border-white/10 hover:bg-white/5 text-[#94A3B8] hover:text-white font-mono text-xs uppercase rounded-full transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[3/1] min-h-[200px] border-2 border-dashed border-white/10 hover:border-[#06B6D4]/50 rounded-2xl flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 transition-all cursor-pointer group p-6 text-center"
              >
                <Upload className="w-8 h-8 text-[#64748B] group-hover:text-[#06B6D4] mb-3 transition-colors" />
                <h4 className="font-syne font-bold text-sm text-white uppercase tracking-wider mb-1">
                  Arrastra tus obras o haz clic para seleccionarlas
                </h4>
                <p className="font-mono text-xs text-[#64748B]">JPG, PNG o WEBP (máx. 6 imágenes)</p>
              </div>
            )}

            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </section>

          {/* History of Critiques */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-widest block mb-1">HISTORY</span>
                <h4 className="font-syne font-bold text-xl text-white">Análisis & Críticas Guardadas</h4>
              </div>
              <span className="font-mono text-xs bg-white/10 text-white px-3 py-1 rounded-full">
                {critiques.length} análisis
              </span>
            </div>

            {critiques.length === 0 ? (
              <div className="p-12 text-center text-sm text-[#94A3B8] border border-dashed border-white/10 bg-[#11131F]/30 rounded-2xl">
                El historial de críticas está vacío. Sube tus primeras obras arriba para generar una evaluación.
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {critiques.map((critique) => (
                  <div key={critique.id} className="glass-panel bg-[#13121b]/60 rounded-xl p-6 border border-white/10 space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-white/5">
                      <div>
                        <span className="font-mono text-[10px] text-[#06B6D4] uppercase tracking-widest block">
                          {critique.type === "style" ? "Análisis de Colección" : "Crítica Individual"}
                        </span>
                        {critique.createdAt && (
                          <span className="font-mono text-xs text-[#64748B]">
                            {new Date(critique.createdAt.toDate ? critique.createdAt.toDate() : critique.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => generateCritiquePDF(critique)}
                          className="px-3.5 py-1.5 rounded-full border border-white/10 hover:border-white/30 text-white font-mono text-[11px] uppercase flex items-center gap-1.5 bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#06B6D4]" />
                          <span>Exportar PDF</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCritique(critique.id)}
                          className="p-1.5 text-[#64748B] hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-1/3 shrink-0">
                        <div className={`grid gap-2 ${critique.images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                          {critique.images.filter(Boolean).map((img, idx) => (
                            <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-white/10 bg-black/50">
                              <img src={img} alt="Obra" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 prose prose-invert max-w-none text-sm text-[#F8FAFC]/90 leading-relaxed font-sans bg-[#0e0d16] p-5 rounded-xl border border-white/5">
                        <Markdown>{critique.critiqueText}</Markdown>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Tab 2: INVESTIGACIÓN DE ARTISTA (Researches Atelier) */}
      {activeTab === "research" && (
        <ResearchAtelier user={user} />
      )}

      {/* Tab 3: GESTIÓN DE EXPOSICIONES */}
      {activeTab === "exhibitions" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <div className="lg:col-span-5 glass-panel bg-[#11131F]/40 p-6 md:p-8 rounded-2xl border border-white/5 space-y-4">
            <div>
              <span className="font-mono text-[10px] text-[#06B6D4] uppercase tracking-widest block mb-1 font-bold">
                CURATOR STUDIO
              </span>
              <h3 className="font-syne font-bold text-2xl text-white">Instalar Obra en Sala 3D</h3>
              <p className="text-xs text-[#94A3B8] mt-1">
                Cuelga una nueva obra en las salas WebXR de Lola. Estará visible de inmediato en la galería 3D.
              </p>
            </div>

            {exhibitionsError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {exhibitionsError}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <div>
                <label className="font-mono text-[10px] text-[#94A3B8] uppercase block mb-1">Título de la Obra</label>
                <input
                  type="text"
                  value={customArtTitle}
                  onChange={(e) => setCustomArtTitle(e.target.value)}
                  placeholder="Ej: Metamorfosis Cuántica"
                  className="w-full px-3.5 py-2.5 bg-[#13121b] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#06B6D4]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[10px] text-[#94A3B8] uppercase block mb-1">Artista</label>
                  <input
                    type="text"
                    value={customArtArtist}
                    onChange={(e) => setCustomArtArtist(e.target.value)}
                    placeholder="Alias o Artista"
                    className="w-full px-3.5 py-2.5 bg-[#13121b] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#06B6D4]/50"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] text-[#94A3B8] uppercase block mb-1">Precio (ETH / EUR)</label>
                  <input
                    type="text"
                    value={customArtPrice}
                    onChange={(e) => setCustomArtPrice(e.target.value)}
                    placeholder="Ej. 1.2 ETH"
                    className="w-full px-3.5 py-2.5 bg-[#13121b] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#06B6D4]/50"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-[10px] text-[#94A3B8] uppercase block mb-1">Ubicación (Estancia 3D)</label>
                <select
                  value={customArtRoom}
                  onChange={(e) => setCustomArtRoom(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#13121b] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#06B6D4]/50"
                >
                  <option value="Ala de Innovadores">Ala de Innovadores</option>
                  <option value="Gran Salón Central">Gran Salón Central</option>
                  <option value="Corredor de Neón">Corredor de Neón</option>
                  <option value="Pabellón de Cristal">Pabellón de Cristal</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-[10px] text-[#94A3B8] uppercase block mb-1 font-bold">Estilo Visual (Presets)</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setCustomArtUrl("https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80")}
                    className={`p-2 rounded-lg border text-left text-[11px] font-mono flex items-center gap-2 transition-all ${
                      customArtUrl.includes("579783900882") ? "border-[#06B6D4] bg-[#06B6D4]/10 text-white" : "border-white/10 bg-white/5 text-[#94A3B8]"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span className="truncate">Líquido Abstracto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomArtUrl("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80")}
                    className={`p-2 rounded-lg border text-left text-[11px] font-mono flex items-center gap-2 transition-all ${
                      customArtUrl.includes("618005182384") ? "border-[#06B6D4] bg-[#06B6D4]/10 text-white" : "border-white/10 bg-white/5 text-[#94A3B8]"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                    <span className="truncate">Futurismo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomArtUrl("https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&auto=format&fit=crop&q=80")}
                    className={`p-2 rounded-lg border text-left text-[11px] font-mono flex items-center gap-2 transition-all ${
                      customArtUrl.includes("1563089145") ? "border-[#06B6D4] bg-[#06B6D4]/10 text-white" : "border-white/10 bg-white/5 text-[#94A3B8]"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                    <span className="truncate">Neón Generativo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomArtUrl("https://images.unsplash.com/photo-1549490349-8643362247b5?w=1200&auto=format&fit=crop&q=80")}
                    className={`p-2 rounded-lg border text-left text-[11px] font-mono flex items-center gap-2 transition-all ${
                      customArtUrl.includes("1549490349") ? "border-[#06B6D4] bg-[#06B6D4]/10 text-white" : "border-white/10 bg-white/5 text-[#94A3B8]"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span className="truncate">Escultura de Luz</span>
                  </button>
                </div>

                <input
                  type="text"
                  value={customArtUrl}
                  onChange={(e) => setCustomArtUrl(e.target.value)}
                  placeholder="O introduce una URL de imagen..."
                  className="w-full px-3 py-2 bg-[#13121b] border border-white/10 rounded-xl text-white text-[11px] font-mono focus:outline-none focus:border-[#06B6D4]/50"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] text-[#94A3B8] uppercase block mb-1">Cédula Interpretativa (Descripción)</label>
                <textarea
                  value={customArtDesc}
                  onChange={(e) => setCustomArtDesc(e.target.value)}
                  placeholder="Escribe la explicación curatorial..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-[#13121b] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#06B6D4]/50 resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleAddArtwork}
                disabled={!customArtTitle || !customArtUrl || savingArtwork || uploadingImage}
                className="w-full py-3.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-syne font-bold text-xs uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-40"
              >
                {savingArtwork ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Montando en Firebase...</span>
                  </>
                ) : (
                  <span>Montar Obra en Galería 3D</span>
                )}
              </button>
            </div>
          </div>

          {/* Exhibition Catalog List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-widest block mb-1">DATABASE</span>
                <h4 className="font-syne font-bold text-xl text-white">Obras en Exhibición ({exhibitions.length + 3})</h4>
              </div>
            </div>

            <div className="space-y-3">
              {/* Permanent collection items */}
              {[
                {
                  title: "La Persistencia de la Memoria Virtual",
                  artist: "Lola Work x Clement Cariou",
                  url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
                  room: "Ala de Arte Contemporáneo",
                  price: "1.5 ETH"
                },
                {
                  title: "Catedral Cibernética",
                  artist: "Generative Soul v4.0",
                  url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80",
                  room: "Sala Principal (Gran Salón)",
                  price: "0.8 ETH"
                },
                {
                  title: "Fluidez de Algoritmo",
                  artist: "Curaduría Lola Work",
                  url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&auto=format&fit=crop&q=80",
                  room: "Corredor Futurista",
                  price: "2.0 ETH"
                }
              ].map((art, idx) => (
                <div key={idx} className="glass-panel bg-[#13121b]/40 rounded-xl p-4 border border-white/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={art.url} alt={art.title} className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0" referrerPolicy="no-referrer" />
                    <div className="min-w-0">
                      <span className="font-mono text-[9px] text-[#06B6D4] uppercase block">Colección Permanente • {art.room}</span>
                      <h5 className="font-syne font-bold text-sm text-white truncate">{art.title}</h5>
                      <span className="font-mono text-[10px] text-[#94A3B8]">{art.artist} • {art.price}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#64748B] uppercase px-2 py-1 bg-white/5 rounded">Fijo</span>
                </div>
              ))}

              {/* Custom curated items */}
              {exhibitions.map((art) => (
                <div key={art.id} className="glass-panel bg-[#13121b]/60 rounded-xl p-4 border border-white/10 flex items-center justify-between gap-4 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={art.url} alt={art.title} className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0" referrerPolicy="no-referrer" />
                    <div className="min-w-0">
                      <span className="font-mono text-[9px] text-[#EC4899] uppercase block">Curaduría Firebase • {art.room}</span>
                      <h5 className="font-syne font-bold text-sm text-white truncate">{art.title}</h5>
                      <span className="font-mono text-[10px] text-[#94A3B8]">{art.artist} {art.price ? `• ${art.price}` : ""}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteArtwork(art.id)}
                    className="p-2 text-[#64748B] hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
