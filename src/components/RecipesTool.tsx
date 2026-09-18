import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { User } from "firebase/auth";
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy, deleteDoc, doc } from "firebase/firestore";
import { resizeImage, resizeBase64Image } from "../utils/image";
import { handleFirestoreError, OperationType } from "../utils/error";
import Markdown from "react-markdown";
import { Loader2, X, Plus, Trash2, Utensils } from "lucide-react";

interface RecipeDoc {
  id: string;
  userId: string;
  images: string[];
  ingredientsText: string;
  recipesText: string;
  createdAt: any;
}

interface RecipesToolProps {
  user: User;
}

export default function RecipesTool({ user }: RecipesToolProps) {
  const [recipesHistory, setRecipesHistory] = useState<RecipeDoc[]>([]);
  
  // Form State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [ingredientsText, setIngredientsText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const uid = (user as any)?.uid || (user as any)?.id;
    if (!user || !uid) {
      setRecipesHistory([]);
      return;
    }

    const q = query(
      collection(db, `users/${uid}/recipes`),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const docs: RecipeDoc[] = [];
      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() } as RecipeDoc);
      });
      setRecipesHistory(docs);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `users/${uid}/recipes`);
    });

    return () => unsub();
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      if (files.length + selectedFiles.length > 6) {
        setErrorMsg("Solo puedes subir un mágico de 6 imágenes a la vez.");
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
    setIngredientsText("");
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
    if ((imagePreviews.length === 0 && !ingredientsText.trim()) || !user) {
        setErrorMsg("Debes subir al menos una imagen o escribir algunos ingredientes.");
        return;
    }
    
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: imagePreviews, text: ingredientsText }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Error al obtener las recetas");
      }

      const data = await response.json();
      
      try {
        for (const recipe of data.recipes) {
           let finalMd = recipe.md;
           let recipeImage = "";
           
           if (recipe.imageUrl) {
               try {
                  recipeImage = await resizeBase64Image(recipe.imageUrl, 800);
                  finalMd = finalMd.replace("***REPLACE_IMAGE***", `![${recipe.recipeName}](${recipeImage})\n\n`);
               } catch (e) {
                  console.error("Error resizing image", e);
                  finalMd = finalMd.replace("***REPLACE_IMAGE***", "\n\n*(Error al procesar la imagen)*\n\n");
               }
           } else {
               finalMd = finalMd.replace("***REPLACE_IMAGE***", "\n\n*(No se pudo generar la imagen)*\n\n");
           }
           
           // Save each recipe individually to avoid Firestore document size limits (1 MiB)
           const uid = (user as any)?.uid || (user as any)?.id;
           if (!uid) continue;
           await addDoc(collection(db, `users/${uid}/recipes`), {
             userId: uid,
             images: recipeImage ? [recipeImage] : [], // Store the generated recipe image here
             ingredientsImages: imagePreviews, // Store original input images in a separate field if needed
             ingredientsText,       
             recipesText: finalMd,  
             createdAt: serverTimestamp()
           });
        }
      } catch (firestoreError: any) {
        const uid = (user as any)?.uid || (user as any)?.id;
        if (uid) handleFirestoreError(firestoreError, OperationType.WRITE, `users/${uid}/recipes`);
      }

      clearSelection();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Ocurrió un error inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteRecipe = async (recipeId: string) => {
    const uid = (user as any)?.uid || (user as any)?.id;
    if (!user || !uid) return;
    if (!confirm("¿Seguro que deseas eliminar estas recetas?")) return;
    try {
      await deleteDoc(doc(db, `users/${uid}/recipes/${recipeId}`));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${uid}/recipes/${recipeId}`);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Upload Section */}
      <section className="mb-16">
        <div className="mb-8">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[#999999] mb-2">Cocina Creativa</h2>
          <h3 className="text-2xl font-light tracking-tight text-[#111111]">Generador de Recetas</h3>
          <p className="text-[#777777] text-[13px] leading-relaxed mt-2">
            Sube imágenes de tus ingredientes o platos y/o descríbelos aquí. Generaremos 5 recetas saludables incluyendo información nutricional y calorías aproximadas.
          </p>
        </div>

        <div className="space-y-8">
          {errorMsg && (
            <div className="bg-[#FAFAFA] border border-[#EEEEEE] text-[#111111] px-4 py-3 rounded-sm text-[13px]">
              {errorMsg}
            </div>
          )}

          <div className="space-y-6">
            <div>
               <label className="text-[11px] uppercase tracking-widest text-[#888888] font-medium mb-3 block">Ingredientes o platos (opcional si subes fotos)</label>
               <textarea
                 value={ingredientsText}
                 onChange={(e) => setIngredientsText(e.target.value)}
                 disabled={isSubmitting}
                 placeholder="Ej: Tengo tomates, cebolla, dos huevos y algo de queso..."
                 className="w-full bg-[#FFFFFF] border border-[#EEEEEE] text-[#1A1A1A] p-4 text-[13px] rounded-sm focus:outline-none focus:border-[#BBBBBB] transition-colors resize-none h-24 font-serif"
               />
            </div>

            {imagePreviews.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-[11px] uppercase tracking-widest text-[#888888] font-medium mb-2">Imágenes Seleccionadas ({imagePreviews.length})</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {imagePreviews.filter(Boolean).map((src, idx) => (
                    <div key={idx} className="aspect-square bg-[#EEEEEE] relative group overflow-hidden rounded-sm border border-[#EEEEEE]">
                      <img src={src || undefined} alt="Vista previa" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <button 
                        onClick={() => removeImage(idx)}
                        disabled={isSubmitting}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 text-[#1A1A1A] rounded-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  
                  {imagePreviews.length < 6 && (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting}
                      className="aspect-square flex flex-col items-center justify-center border border-dashed border-[#DDDDDD] bg-[#FAFAFA] hover:bg-[#F5F5F5] rounded-sm transition-colors text-[#AAAAAA] hover:text-[#888888]"
                    >
                      <Plus className="w-6 h-6 mb-3" />
                      <span className="text-[10px] uppercase tracking-widest">Añadir</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
                <div className="space-y-2">
                  <h2 className="text-[11px] uppercase tracking-widest text-[#888888] font-medium mb-2">Imágenes</h2>
                  <div 
                    className="aspect-[4/1] min-h-[150px] border border-dashed border-[#DDDDDD] rounded-sm flex flex-col items-center justify-center bg-[#FAFAFA] hover:bg-[#F5F5F5] transition-colors cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Utensils className="w-6 h-6 text-[#BBBBBB] mb-4 group-hover:text-[#888888] transition-colors" />
                    <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#AAAAAA] mb-1 group-hover:text-[#888888]">Subir ingredientes o clic aquí</h3>
                  </div>
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

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[#EEEEEE]">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || (imagePreviews.length === 0 && !ingredientsText.trim())}
                className="flex-1 sm:flex-none px-8 py-4 bg-[#1A1A1A] hover:bg-[#333333] text-white text-[11px] uppercase tracking-[0.2em] font-medium rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creando Recetas y Fotos...</span>
                  </>
                ) : (
                  <span>Generar 5 Recetas</span>
                )}
              </button>
              <button
                onClick={clearSelection}
                disabled={isSubmitting || (imagePreviews.length === 0 && !ingredientsText.trim())}
                className="px-8 py-4 border border-[#EEEEEE] text-[#999999] hover:text-[#111111] text-[11px] uppercase tracking-[0.2em] font-medium rounded-sm transition-colors disabled:opacity-50"
              >
                Limpiar todo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Previous Recipes */}
      <section>
        <div className="mb-10 pb-4 border-b border-[#EEEEEE] flex justify-between items-end">
          <div>
            <span className="text-[10px] text-[#BBBBBB] uppercase tracking-widest block mb-1 font-semibold">History</span>
            <h2 className="text-2xl font-light tracking-tight text-[#111111]">Recetas Anteriores</h2>
          </div>
        </div>
        
        {recipesHistory.length === 0 ? (
          <div className="p-12 text-center text-[13px] text-[#999999] border border-[#EEEEEE] bg-[#FAFAFA] rounded-sm">
            El historial de recetas está vacío.
          </div>
        ) : (
          <div className="space-y-16">
            {recipesHistory.map((recipe) => (
              <article key={recipe.id} className="pb-16 border-b border-[#F5F5F5] last:border-0 last:pb-0">
                <div className="mb-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-[#BBBBBB] uppercase tracking-widest block mb-2 font-semibold">
                        Lote de Recetas Generadas
                      </span>
                      {recipe.createdAt && (
                        <span className="text-[12px] text-[#888888] uppercase tracking-wider">
                          {new Date(recipe.createdAt.toDate()).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => deleteRecipe(recipe.id)}
                      className="p-2 text-[#BBBBBB] hover:text-red-500 hover:bg-red-50 transition-colors rounded-sm"
                      title="Eliminar recetas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-12">
                  <div className="w-full md:w-1/3 shrink-0">
                     {recipe.ingredientsText && (
                        <div className="mb-6 p-4 bg-[#FAFAFA] border border-[#EEEEEE] rounded-sm text-[13px] text-[#444444] font-serif italic relative">
                            <span className="absolute -top-3 left-4 bg-[#FAFAFA] px-2 text-[10px] uppercase tracking-widest text-[#BBBBBB] font-sans">Notas</span>
                            "{recipe.ingredientsText}"
                        </div>
                     )}
                    {recipe.images?.length > 0 && (
                      <div className={`grid gap-3 ${recipe.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {recipe.images.filter(Boolean).map((img, idx) => (
                          <div key={idx} className="aspect-square bg-[#EEEEEE] relative group overflow-hidden rounded-sm border border-[#EEEEEE]">
                            <img src={img || undefined} alt="Ingrediente" className="w-full h-full object-cover" loading="lazy" />
                            <div className="absolute inset-0 bg-black/5"></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full md:w-2/3">
                    <div className="prose prose-p:font-serif prose-p:text-[#444444] prose-p:text-[14px] prose-p:leading-relaxed prose-headings:font-sans prose-headings:text-[#111111] prose-headings:font-light prose-headings:tracking-tight prose-a:text-[#111111] prose-img:rounded-sm prose-img:w-full prose-img:object-cover prose-img:aspect-[16/9] prose-img:bg-[#EEEEEE] prose-img:border prose-img:border-[#EEEEEE] prose-img:my-8 max-w-none">
                      <Markdown components={{ img: ({node, ...props}) => props.src ? <img {...props} /> : null }}>
                        {recipe.recipesText}
                      </Markdown>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
