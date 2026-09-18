import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // We are going to accept up to 50mb of json data.
  app.use(express.json({ limit: "50mb" }));
  app.use(express.static(path.join(process.cwd(), "public")));

  // High-performance image proxy with CORS headers for Three.js WebGL & Firebase Storage textures
  app.get("/api/image-proxy", async (req, res) => {
    try {
      let targetUrl = "";
      if (req.query.b64 && typeof req.query.b64 === "string") {
        targetUrl = Buffer.from(req.query.b64, "base64").toString("utf-8");
      } else if (req.query.url && typeof req.query.url === "string") {
        targetUrl = req.query.url;
      }

      if (!targetUrl || (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://"))) {
        return res.status(400).send("Invalid or missing image URL");
      }

      const response = await fetch(targetUrl);
      if (!response.ok) {
        return res.status(response.status).send(`Failed to fetch image: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type") || "image/jpeg";
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS, HEAD");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Origin");
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");

      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (err: any) {
      console.error("Image proxy error:", err);
      res.status(500).send("Image proxy failed");
    }
  });

  app.post("/api/critique", async (req, res) => {
    try {
      const { images } = req.body; // array of base64 strings (data URLs)
      
      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ error: "No images provided" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key missing" });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const parts: any[] = images.map((imageDataUrl: string) => {
        // extract base64 from "data:image/jpeg;base64,...""
        const [meta, data] = imageDataUrl.split(",");
        const mimeType = meta.split(":")[1].split(";")[0] || "image/jpeg";
        return {
          inlineData: {
            mimeType,
            data,
          },
        };
      });

      const textPrompt = images.length === 1
        ? "Acá tienes una foto de una obra de arte. Por favor haz una crítica detallada de la obra, abarcando estética, composición, uso del color, técnica y el mensaje que podría transmitir."
        : "Acá tienes varias fotos de obras de un mismo artista. Por favor haz una crítica general del estilo, temáticas recurrentes, evolución de la técnica, y cualquier patrón que resalte en su obra en conjunto.";

      parts.push({ text: textPrompt });

      const model = "gemini-3.7-flash"; // Modern high-performance Gemini 3.7 model

      const response = await ai.models.generateContent({
        model,
        contents: { parts },
        config: {
          systemInstruction: "Eres un crítico de arte experto y respetuoso, que evalúa el trabajo de forma constructiva, profunda y con un lenguaje accesible pero profesional. Responde siempre en español.",
          temperature: 0.7,
        }
      });

      res.json({ critique: response.text });
    } catch (e: any) {
      console.error(e);
      let errorMsg = e.message || "Failed to generate critique";
      if (errorMsg.includes("429") || errorMsg.includes("Quota exceeded")) {
        errorMsg = "Has alcanzado el límite de análisis de IA (Cuota excedida). Intenta de nuevo más tarde.";
      }
      res.status(500).json({ error: errorMsg });
    }
  });

  app.post("/api/artist-research", async (req, res) => {
    try {
      const { artistName } = req.body;
      
      if (!artistName || typeof artistName !== "string" || !artistName.trim()) {
        return res.status(400).json({ error: "El nombre del artista es obligatorio." });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key missing" });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const textPrompt = `Realiza una investigación profunda y sumamente detallada sobre el artista, corriente o movimiento artístico: "${artistName.trim()}".
      
Por favor, detecta inteligentemente si se trata de un artista individual, un movimiento artístico en general, o un género/corriente de arte digital (como ciberarte o net art en particular). Adapta la redacción de forma coherente según corresponda.

Genera el contenido del artículo en **código HTML5 semántico limpio, maquetado estéticamente con clases de diseño y optimizado al 100% para motores de búsqueda (SEO) y lectores humanos**.

El contenido HTML del artículo debe estar estructurado de la siguiente forma dentro de un contenedor:

\`\`\`html
<article class="monografia-container">
  <header class="monografia-header">
    <p class="lead-paragraph">
      [Párrafo introductorio de alto impacto con las palabras clave primarias, síntesis biográfica/conceptual y propuesta estética]
    </p>
  </header>

  <section id="contexto-historico" class="article-section">
    <h2>1. Contexto Histórico, Origen y Ruptura Conceptual</h2>
    <p>[Desarrollo histórico riguroso, contexto social, tecnológico o cultural que motivó el surgimiento del artista o movimiento...]</p>
    <blockquote class="curatorial-quote">
      <p>"[Cita célebre, manifiesto o reflexión curatorial memorable]"</p>
      <cite>— Curaduría Lola Workia Atelier</cite>
    </blockquote>
    <p>[Continuación y análisis profundo del contexto...]</p>
  </section>

  <section id="filosofia-manifiesto" class="article-section">
    <h2>2. Filosofía, Manifiesto y Línea de Pensamiento</h2>
    <p>[Motivaciones intelectuales, estéticas, filosóficas, políticas o tecnológicas...]</p>
    <div class="concept-callout">
      <h3>Ejes Conceptuales Fundamentales</h3>
      <ul class="cyber-list">
        <li><strong>[Concepto 1]:</strong> [Explicación detallada...]</li>
        <li><strong>[Concepto 2]:</strong> [Explicación detallada...]</li>
        <li><strong>[Concepto 3]:</strong> [Explicación detallada...]</li>
      </ul>
    </div>
  </section>

  <section id="obras-cumbre" class="article-section">
    <h2>3. Obras Cumbre y Análisis Compositivo</h2>
    <p>[Introducción a las obras maestras y su impacto...]</p>
    <div class="artwork-grid">
      <div class="artwork-card">
        <h3>[Nombre de la Obra 1] ([Año])</h3>
        <p class="artwork-meta">[Técnica / Medio • Ubicación o Soporte]</p>
        <p>[Análisis compositivo, uso de la luz/color, interactividad, tecnología y mensaje...]</p>
      </div>
      <div class="artwork-card">
        <h3>[Nombre de la Obra 2] ([Año])</h3>
        <p class="artwork-meta">[Técnica / Medio • Ubicación o Soporte]</p>
        <p>[Análisis compositivo, uso de la luz/color, interactividad, tecnología y mensaje...]</p>
      </div>
      <div class="artwork-card">
        <h3>[Nombre de la Obra 3] ([Año])</h3>
        <p class="artwork-meta">[Técnica / Medio • Ubicación o Soporte]</p>
        <p>[Análisis compositivo, uso de la luz/color, interactividad, tecnología y mensaje...]</p>
      </div>
    </div>
  </section>

  <section id="tecnica-medios" class="article-section">
    <h2>4. Técnica, Estilo, Medios y Tecnologías</h2>
    <p>[Metodología de creación, uso de la luz, paleta cromática, modelado, códigos, algoritmos, plataformas web, telecomunicaciones o hardware experimental...]</p>
  </section>

  <section id="legado-impacto" class="article-section">
    <h2>5. Legado, Evolución Contemporánea e Influencia Global</h2>
    <p>[Impacto en el arte contemporáneo, derivaciones en la era de la IA, blockchain y virtualidad, y valoración en museos físicos y digitales...]</p>
  </section>
</article>
\`\`\`

---

## Optimización Buscadores (SEO)
Genera la siguiente información optimizada para buscadores (Google, Bing, etc.) de forma que sea fácil de copiar y pegar:
- **Título Principal**: El título sugerido para un post sobre este tema.
- **Slug Permalink (URL)**: La URL amigable sugerida.
- **Resumen Corto**: Un párrafo breve de introducción (máx 160 caracteres).
- **Meta Título SEO (Meta Title)**: Máximo 60 caracteres.
- **Meta Descripción SEO (Meta Description)**: Máximo 160 caracteres.
- **5 Palabras Clave (Keywords)**: Separadas por comas.
- **Tipo Schema.org (JSON-LD)**: Sugiere el tipo de esquema más apropiado (ej. Article, Person, VisualArtwork) y proporciona un ejemplo básico de JSON-LD en un bloque de código.
- **URL Canónica (Canonical URL)**: Estructura sugerida de la URL principal.

## Optimización GEO (Motores de Inteligencia Artificial)
Genera la siguiente información optimizada para motores de búsqueda de IA (Generative Engine Optimization):
- **Resumen TL;DR / Sintético para IA (AI Grounding Summary)**: Un resumen ultra-condensado y factual que sirva como base para que una IA entienda el tema rápidamente.
- **Puntos Clave Extraíbles (Key Takeaways)**: Lista de los 5 datos más importantes y memorables.
- **5 Preguntas Frecuentes Estructuradas (FAQ Schema)**: Genera 5 preguntas comunes con sus respuestas precisas, en formato de lista y sugiriendo el marcado FAQPage.

Usa fuentes fidedignas (recomiendo usar el buscador integrado para corroborar detalles históricos precisos) y redacta con un tono de crítico de arte respetado, culto y apasionado.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: textPrompt,
        config: {
          systemInstruction: "Eres un historiador del arte experto y un crítico de renombre mundial. Realizas investigaciones rigurosas, detalladas, profundas y apasionantes sobre artistas de todas las épocas, así como de corrientes artísticas, arte digital, ciberarte y net art en particular, asegurando una precisión histórica y conceptual impecable y una sensibilidad profunda hacia la experiencia creativa. Entregas el artículo en código HTML5 semántico elegante y limpio, acompañado de sus bloques SEO/GEO. Responde siempre en español.",
          temperature: 0.6,
          tools: [{ googleSearch: {} }]
        }
      });

      let rawReport = response.text || "";
      // Strip outer ```html ... ``` if generated
      if (rawReport.startsWith("```html")) {
        rawReport = rawReport.replace(/^```html\s*/i, "").replace(/```\s*$/, "");
      }

      res.json({ report: rawReport });
    } catch (e: any) {
      console.error(e);
      let errorMsg = e.message || "Failed to generate research report";
      if (errorMsg.includes("429") || errorMsg.includes("Quota exceeded")) {
        errorMsg = "Has alcanzado el límite de análisis de IA (Cuota excedida). Intenta de nuevo más tarde.";
      }
      res.status(500).json({ error: errorMsg });
    }
  });

  app.post("/api/generate-script", async (req, res) => {
    try {
      const { artistName, researchText } = req.body;
      
      if (!artistName || !researchText) {
        return res.status(400).json({ error: "Falta el nombre del artista o el texto de la investigación." });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key missing" });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `Actúa como un experto guionista en generación de videos para Youtube. Basándote en la siguiente investigación detallada sobre el artista: "${artistName.trim()}", construye un guión de video de youtube de unos 5 minutos de duración (300 segundos).
      
El guión debe estar estructurado en secciones consecutivas de exactamente 10 segundos cada una (que es la duración máxima de un clip generado con Google Flow). Como el video dura unos 5 minutos, debes generar unas 30 secciones de intervalos de 10 segundos consecutivamente (por ejemplo, '0:00 - 0:10', '0:10 - 0:20', etc., hasta llegar a '4:50 - 5:00').

Investigación de referencia:
${researchText}

Por favor, sé extremadamente descriptivo, poético e instigador. Consigue que la narración sea fluida, asombrosa y perfecta para narradores de Youtube, sincronizando la indicación visual (B-Roll, transiciones de Google Flow, movimientos de cámara en 10s) para potenciar el relato.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction: "Eres un guionista experto en YouTube especializado en arte y cultura. Generas guiones ultra-atractivos y dinámicos estructurados perfectamente para la producción de videos. Tu respuesta debe estar estrictamente en español.",
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                tiempoSeccion: { type: Type.STRING },
                audioNarrador: { type: Type.STRING },
                visualesBroll: { type: Type.STRING }
              },
              required: ["tiempoSeccion", "audioNarrador", "visualesBroll"]
            }
          }
        }
      });

      res.json({ script: JSON.parse(response.text || "[]") });
    } catch (e: any) {
      console.error(e);
      let errorMsg = e.message || "Failed to generate video script";
      if (errorMsg.includes("429") || errorMsg.includes("Quota exceeded")) {
        errorMsg = "Has alcanzado el límite de análisis de IA (Cuota excedida). Intenta de nuevo más tarde.";
      }
      res.status(500).json({ error: errorMsg });
    }
  });

  app.post("/api/generate-article-cover", async (req, res) => {
    try {
      const { artistName, researchText } = req.body;
      
      if (!artistName || typeof artistName !== "string" || !artistName.trim()) {
        return res.status(400).json({ error: "El nombre del artista o tema es requerido." });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key missing" });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // 1. Generate specialized visual prompt & descriptive Spanish Alt text (SEO & Accessibility)
      const promptForVision = `Analiza el siguiente tema/artista/movimiento de arte: "${artistName.trim()}".
${researchText ? `Fragmento de la investigación: "${researchText.slice(0, 1000)}"` : ''}

Tu tarea es generar:
1. "imagePrompt": Un prompt en inglés altamente detallado, cinematográfico y artístico para crear una obra de arte digital o portada de museo en relación directa a este artista, su estilo pictórico, su estética, paleta de colores y corriente (ej. Cyberart, Net.art, Surrealismo, Impresionismo, etc.). Formato 16:9, calidad de galería, iluminación dramática, composición estética impecable.
2. "imageAlt": Un texto descriptivo alternativo (Alt text) en español optimizado para accesibilidad (WCAG) y SEO. Debe describir con precisión los elementos visuales, el estilo, el uso de la luz/color y la conexión temática con ${artistName.trim()} (máximo 125 caracteres).`;

      const promptResponse = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: promptForVision,
        config: {
          systemInstruction: "Eres un director de arte y curador visual de museos de arte contemporáneo y digital. Responde en formato JSON.",
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              imagePrompt: { type: Type.STRING, description: "Detailed English prompt for AI image generation" },
              imageAlt: { type: Type.STRING, description: "Descriptive Spanish alt text for accessibility and SEO" }
            },
            required: ["imagePrompt", "imageAlt"]
          }
        }
      });

      let { imagePrompt, imageAlt } = JSON.parse(promptResponse.text || "{}");
      if (!imagePrompt) {
        imagePrompt = `A stunning museum-quality artwork representing the artistic essence, palette and philosophy of ${artistName.trim()}, aesthetic composition, dramatic cinematic studio lighting, 8k resolution, fine art masterpiece, 16:9 aspect ratio.`;
      }
      if (!imageAlt) {
        imageAlt = `Composición artística y estética conceptual en homenaje a la obra de ${artistName.trim()} - Lola Workia Atelier`;
      }

      // 2. Generate cover image using gemini-3.1-flash-image
      let imageBase64 = "";
      try {
        const imgResponse = await ai.models.generateContent({
          model: "gemini-3.1-flash-image",
          contents: {
            parts: [
              { text: imagePrompt }
            ]
          },
          config: {
            imageConfig: {
              aspectRatio: "16:9",
              imageSize: "1K"
            }
          }
        });

        for (const part of imgResponse.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            imageBase64 = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
            break;
          }
        }
      } catch (imgErr: any) {
        console.warn("Image generation fallback note:", imgErr.message);
      }

      // If image generation failed due to quota/sandbox, fallback to curated artistic high-res image
      if (!imageBase64) {
        imageBase64 = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80";
      }

      res.json({
        imageBase64,
        imageAlt,
        imagePrompt
      });
    } catch (e: any) {
      console.error(e);
      let errorMsg = e.message || "Failed to generate article cover";
      if (errorMsg.includes("429") || errorMsg.includes("Quota exceeded")) {
        errorMsg = "Has alcanzado el límite de análisis de IA (Cuota excedida). Intenta de nuevo más tarde.";
      }
      res.status(500).json({ error: errorMsg });
    }
  });

  app.post("/api/recipes", async (req, res) => {
    try {
      const { images, text } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key missing" });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const parts: any[] = [];

      if (images && Array.isArray(images)) {
        images.forEach((imageDataUrl: string) => {
          const [meta, data] = imageDataUrl.split(",");
          const mimeType = meta.split(":")[1].split(";")[0] || "image/jpeg";
          parts.push({
            inlineData: {
              mimeType,
              data,
            },
          });
        });
      }

      if (text) {
        parts.push({ text: `Ingredientes o contexto: ${text}` });
      }

      if (parts.length === 0) {
         return res.status(400).json({ error: "Debes proporcionar imágenes o texto de ingredientes." });
      }

      const promptText = `
        Genera estrictamente 5 posibles recetas completas utilizando todos o algunos de los ingredientes presentes en las imágenes adjuntas y/o en el texto proporcionado.
      `;
      parts.push({ text: promptText });

      const model = "gemini-3.7-flash";

      const response = await ai.models.generateContent({
        model,
        contents: { parts },
        config: {
          systemInstruction: "Eres un chef experto y nutricionista. Generas recetas deliciosas y saludables a partir de ingredientes proporcionados. Responde siempre en español.",
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                recipeName: { type: Type.STRING },
                ingredients: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                instructions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                calories: { type: Type.STRING, description: "Calorías aproximadas por porción" },
                nutritionInfo: { type: Type.STRING, description: "Información nutricional y de salud importante" },
                imagePrompt: { type: Type.STRING, description: "A detailed prompt to generate a highly realistic and appetizing photo of the finished dish using an AI image generator. In English." }
              },
              required: ["recipeName", "ingredients", "instructions", "calories", "nutritionInfo", "imagePrompt"]
            }
          }
        }
      });

      let recipesJsonStr = response.text || "[]";
      let recipesObj = [];
      try {
        recipesObj = JSON.parse(recipesJsonStr);
      } catch (err) {
        throw new Error("Error obteniendo las recetas (formato inválido).");
      }

      const recipesWithImages = await Promise.all(recipesObj.map(async (recipe: any) => {
         let imageUrl = "";
         try {
             const imgResponse = await ai.models.generateContent({
                 model: 'gemini-3.1-flash-image',
                 contents: {
                   parts: [
                     { text: 'A high-end, professional food photography shot of ' + recipe.imagePrompt + '. Cinematic lighting, shallow depth of field, vibrant colors, 4k resolution, gourmet presentation.' }
                   ]
                 },
                 config: {
                   imageConfig: {
                       aspectRatio: "16:9",
                       imageSize: "1K"
                   }
                 }
             });
             
             for (const part of imgResponse.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                  imageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
                  console.log(`Generated image for ${recipe.recipeName} (${part.inlineData.mimeType || "image/png"})`);
                  break;
                }
             }
             if (!imageUrl) {
                console.warn(`No image part found for ${recipe.recipeName}. imgResponse parts length: ${imgResponse.candidates?.[0]?.content?.parts?.length || 0}`);
             }
         } catch (err: any) {
             console.error(`Error generating image for ${recipe.recipeName}:`, err.message);
         }

         const mdHeader = `### ${recipe.recipeName}\n\n`;
         const recipeMarkdown = `**Ingredientes:**\n` +
           recipe.ingredients.map((i: string) => `- ${i}\n`).join("") +
           `\n**Instrucciones:**\n` +
           recipe.instructions.map((i: string, idx: number) => `${idx + 1}. ${i}\n`).join("") +
           `\n**Información Nutricional:**\n` +
           `- **Calorías:** ${recipe.calories}\n` +
           `- **Salud:** ${recipe.nutritionInfo}\n\n` +
           `---\n\n`;

         return {
           recipeName: recipe.recipeName,
           md: mdHeader + "***REPLACE_IMAGE***\n\n" + recipeMarkdown,
           imageUrl: imageUrl
         };
      }));

      res.json({ recipes: recipesWithImages });
    } catch (e: any) {
      console.error(e);
      let errorMsg = e.message || "Failed to generate recipes";
      if (errorMsg.includes("429") || errorMsg.includes("Quota exceeded")) {
        errorMsg = "Has alcanzado el límite de análisis de IA (Cuota excedida). Intenta de nuevo más tarde.";
      }
      res.status(500).json({ error: errorMsg });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
