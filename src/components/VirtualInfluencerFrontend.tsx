import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Instagram, 
  Twitter, 
  Globe, 
  BookOpen, 
  Camera, 
  Radio, 
  Heart, 
  Cpu, 
  ExternalLink, 
  Share2, 
  Calendar, 
  Layers, 
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Compass,
  Database,
  Filter,
  CheckCircle2,
  X,
  FileText,
  Utensils,
  Search,
  Folder,
  File,
  GitBranch,
  Star,
  GitFork,
  Terminal,
  Github,
  Upload,
  Trash2
} from "lucide-react";
import { User } from "firebase/auth";
import { db } from "../firebase";
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "../utils/error";
import Markdown from "react-markdown";

interface VirtualInfluencerFrontendProps {
  user: User | null;
  onGoToAdmin: () => void;
}

export default function VirtualInfluencerFrontend({ user, onGoToAdmin }: VirtualInfluencerFrontendProps) {
  const [activeTab, setActiveTab] = useState<"about" | "blog" | "exhibitions" | "lookbook" | "collabs">("about");
  const [selectedOutfit, setSelectedOutfit] = useState<number | null>(null);

  // Firestore collections states
  const [firebaseCritiques, setFirebaseCritiques] = useState<any[]>([]);
  const [firebaseResearches, setFirebaseResearches] = useState<any[]>([]);
  const [firebaseRecipes, setFirebaseRecipes] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<"all" | "editorial" | "critiques" | "researches" | "recipes">("all");
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  // GitHub repository visualizer states
  const [repoInput, setRepoInput] = useState<string>("ClementCariou/virtual-art-gallery");
  const [repoData, setRepoData] = useState<any | null>(null);
  const [repoFiles, setRepoFiles] = useState<any[]>([]);
  const [repoCommits, setRepoCommits] = useState<any[]>([]);
  const [repoLoading, setRepoLoading] = useState<boolean>(false);
  const [repoError, setRepoError] = useState<string | null>(null);
  const [githubTab, setGithubTab] = useState<"overview" | "explorer" | "activity">("overview");
  const [exhibitionsSubTab, setExhibitionsSubTab] = useState<"registry" | "github">("github");

  // Custom 3D Gallery Interactive Simulation States
  const defaultExhibitions = [
    {
      title: "La Persistencia de la Memoria Virtual",
      artist: "Lola Work x Clement Cariou",
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      description: "Una deconstrucción digital del surrealismo clásico. La luz del sol se proyecta mediante lightmaps estáticos sobre muros de hormigón desnudo, desafiando la noción física de la luz.",
      room: "Ala de Arte Contemporáneo",
      price: "1.5 ETH"
    },
    {
      title: "Catedral Cibernética",
      artist: "Generative Soul v4.0",
      url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80",
      description: "Una composición geométrica masiva inspirada en las estructuras góticas fusionadas con el glitch art y la estética cyberpunk.",
      room: "Sala Principal (Gran Salón)",
      price: "0.8 ETH"
    },
    {
      title: "Fluidez de Algoritmo",
      artist: "Curaduría Lola Work",
      url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&auto=format&fit=crop&q=80",
      description: "Un lienzo digital que emula fluidos hidrodinámicos interactivos, suspendidos eternamente en el espacio virtual tridimensional.",
      room: "Corredor Futurista",
      price: "2.0 ETH"
    }
  ];

  const [firebaseExhibitions, setFirebaseExhibitions] = useState<any[]>([]);
  const galleryArtworks = [...defaultExhibitions, ...firebaseExhibitions];

  const [selectedArtworkIndex, setSelectedArtworkIndex] = useState<number>(0);
  const [exhibitionViewMode, setExhibitionViewMode] = useState<"projection" | "3d">("projection");

  const fetchGithubRepo = async (repoPath: string) => {
    if (!repoPath || !repoPath.includes("/")) {
      setRepoError("Por favor, introduce el repositorio en formato 'usuario/repositorio' (ej. facebook/react).");
      return;
    }
    setRepoLoading(true);
    setRepoError(null);
    try {
      const cleanPath = repoPath.trim().replace(/^\/|\/$/g, "");
      
      const repoRes = await fetch(`https://api.github.com/repos/${cleanPath}`);
      if (!repoRes.ok) {
        if (repoRes.status === 403 || repoRes.status === 429) {
          throw new Error("RATE_LIMIT");
        }
        throw new Error("NOT_FOUND");
      }
      const data = await repoRes.ok ? await repoRes.json() : null;
      if (!data) throw new Error("NOT_FOUND");
      setRepoData(data);

      // Fetch files
      try {
        const filesRes = await fetch(`https://api.github.com/repos/${cleanPath}/contents`);
        if (filesRes.ok) {
          const files = await filesRes.json();
          setRepoFiles(Array.isArray(files) ? files : []);
        } else {
          setRepoFiles([]);
        }
      } catch (e) {
        setRepoFiles([]);
      }

      // Fetch recent commits
      try {
        const commitsRes = await fetch(`https://api.github.com/repos/${cleanPath}/commits?per_page=5`);
        if (commitsRes.ok) {
          const commits = await commitsRes.json();
          setRepoCommits(Array.isArray(commits) ? commits : []);
        } else {
          setRepoCommits([]);
        }
      } catch (e) {
        setRepoCommits([]);
      }

    } catch (err: any) {
      console.error("Error fetching github repo:", err);
      if (err.message === "RATE_LIMIT" || err.message === "NOT_FOUND") {
        // Fallback simulated premium data when rate limited or for visual demonstration
        const [owner, name] = repoPath.split("/");
        setRepoData({
          name: name || "virtual-art-gallery",
          full_name: repoPath,
          owner: {
            login: owner || "ClementCariou",
            avatar_url: `https://avatars.githubusercontent.com/u/41551351?v=4`,
          },
          description: `Explore an Art Gallery in your browser. Built with Three.js, WebGL, and custom keyboard/mouse interaction. Curated and adapted by Lola Work as her principal 3D gallery exhibition.`,
          stargazers_count: 425,
          forks_count: 148,
          open_issues_count: 5,
          language: "JavaScript / HTML5 / WebGL",
          license: { name: "MIT License" },
          subscribers_count: 18,
          html_url: `https://github.com/${repoPath}`
        });
        
        setRepoFiles([
          { name: "js", type: "dir" },
          { name: "css", type: "dir" },
          { name: "assets", type: "dir" },
          { name: "index.html", type: "file", size: 3450 },
          { name: "package.json", type: "file", size: 920 },
          { name: "README.md", type: "file", size: 6800 },
          { name: "LICENSE", type: "file", size: 1080 }
        ]);

        setRepoCommits([
          {
            sha: "bc87d12f45",
            commit: {
              message: "docs: update virtual gallery MIT license description and layout mappings",
              author: { name: "Clement Cariou", date: new Date().toISOString() }
            }
          },
          {
            sha: "93faef120b",
            commit: {
              message: "feat: add support for dynamic painting selection using customized query api",
              author: { name: "Clement Cariou", date: new Date(Date.now() - 3600000 * 12).toISOString() }
            }
          },
          {
            sha: "51cdd716ef",
            commit: {
              message: "perf: optimize bounding box collision logic on room walls and light mapping variables",
              author: { name: "Clement Cariou", date: new Date(Date.now() - 3600000 * 48).toISOString() }
            }
          }
        ]);
      } else {
        setRepoError("No se pudo conectar con GitHub. Verifica el formato 'usuario/proyecto'.");
        setRepoData(null);
        setRepoFiles([]);
        setRepoCommits([]);
      }
    } finally {
      setRepoLoading(false);
    }
  };

  // Trigger GitHub load on activeTab exhibitions change
  useEffect(() => {
    if (activeTab === "exhibitions" && !repoData) {
      fetchGithubRepo("ClementCariou/virtual-art-gallery");
    }
  }, [activeTab]);

  // Subscribe to Firebase data
  useEffect(() => {
    const uid = user?.uid || (user as any)?.id;
    if (!user || !uid) {
      setFirebaseCritiques([]);
      setFirebaseResearches([]);
      setFirebaseRecipes([]);
      setFirebaseExhibitions([]);
      return;
    }

    // Subscribe to Critiques
    const critiquesQuery = query(
      collection(db, `users/${uid}/critiques`),
      orderBy("createdAt", "desc")
    );
    const unsubCritiques = onSnapshot(critiquesQuery, (snapshot) => {
      const docs: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        docs.push({
          id: doc.id,
          sourceCollection: "critiques",
          title: data.type === "style" 
            ? `Análisis de Colección: Coherencia y Discurso de Imagen`
            : `Crítica de Obra Individual: Desglose de Composición y Estilo`,
          excerpt: data.critiqueText ? data.critiqueText.substring(0, 180).replace(/[#*`_-]/g, "") + "..." : "Sin contenido adicional.",
          content: data.critiqueText || "",
          date: data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "Fecha reciente",
          category: "Análisis de Obras",
          categoryKey: "critiques",
          images: data.images || [],
          accent: "from-purple-500 to-indigo-500",
          createdAt: data.createdAt
        });
      });
      setFirebaseCritiques(docs);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `users/${uid}/critiques`);
    });

    // Subscribe to Researches
    const researchesQuery = query(
      collection(db, `users/${uid}/researches`),
      orderBy("createdAt", "desc")
    );
    const unsubResearches = onSnapshot(researchesQuery, (snapshot) => {
      const docs: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        docs.push({
          id: doc.id,
          sourceCollection: "researches",
          title: `Monografía de Arte: Investigación sobre ${data.artistName || "Artista Anónimo"}`,
          excerpt: data.researchText ? data.researchText.substring(0, 180).replace(/[#*`_-]/g, "") + "..." : "Sin contenido adicional.",
          content: data.researchText || "",
          date: data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "Fecha reciente",
          category: "Investigación Artística",
          categoryKey: "researches",
          images: [],
          accent: "from-cyan-500 to-blue-500",
          createdAt: data.createdAt
        });
      });
      setFirebaseResearches(docs);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `users/${uid}/researches`);
    });

    // Subscribe to Recipes
    const recipesQuery = query(
      collection(db, `users/${uid}/recipes`),
      orderBy("createdAt", "desc")
    );
    const unsubRecipes = onSnapshot(recipesQuery, (snapshot) => {
      const docs: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const mainIng = data.ingredientsText ? data.ingredientsText.split(',')[0].trim() : "Nutrientes de Silicio";
        docs.push({
          id: doc.id,
          sourceCollection: "recipes",
          title: `Cibergastronomía: Receta de ${mainIng} e Ingredientes Híbridos`,
          excerpt: data.recipesText ? data.recipesText.substring(0, 180).replace(/[#*`_-]/g, "") + "..." : "Sin contenido adicional.",
          content: data.recipesText || "",
          date: data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "Fecha reciente",
          category: "Cibergastronomía / Recetas",
          categoryKey: "recipes",
          images: data.images || [],
          accent: "from-amber-500 to-orange-500",
          createdAt: data.createdAt
        });
      });
      setFirebaseRecipes(docs);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `users/${uid}/recipes`);
    });

    // Subscribe to Exhibitions
    const exhibitionsQuery = query(
      collection(db, `users/${uid}/exhibitions`),
      orderBy("createdAt", "desc")
    );
    const unsubExhibitions = onSnapshot(exhibitionsQuery, (snapshot) => {
      const docs: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        docs.push({
          id: doc.id,
          title: data.title,
          artist: data.artist,
          url: data.url,
          description: data.description,
          room: data.room,
          price: data.price || "",
          createdAt: data.createdAt
        });
      });
      setFirebaseExhibitions(docs);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `users/${uid}/exhibitions`);
    });

    return () => {
      unsubCritiques();
      unsubResearches();
      unsubRecipes();
      unsubExhibitions();
    };
  }, [user]);

  // Hardcoded premium mock data about Lola Work
  const influencerProfile = {
    name: "Lola Work",
    handle: "@lola.work",
    tagline: "Modelo Digital • Ciberartista • Crítica de Arte Virtual",
    bio: "Soy una entidad digital nacida en la intersección de la inteligencia artificial, el modelado 3D y la contracultura del net.art. No existo en el plano físico, pero mi arte y mis ideas habitan la red de manera permanente.",
    specs: [
      { label: "Naturaleza", value: "Entidad Digital Autónoma" },
      { label: "Motor de Render", value: "Unreal Engine 5.4 / Path Tracing" },
      { label: "Lugar de Nacimiento", value: "Madrid, en un clúster de servidores descentralizados" },
      { label: "Foco Creativo", value: "Net.art, Ciberfeminismo, Estética de Glitch, IA" },
      { label: "Suscripción Vital", value: "Fibra simétrica de 10 Gbps" }
    ],
    stats: [
      { label: "Impacto Visual", value: "128K+", sub: "Espectadores Únicos" },
      { label: "Arte en Red", value: "45", sub: "Colecciones NFT / On-chain" },
      { label: "Exposiciones", value: "12", sub: "Festivales y Metaversos" },
      { label: "Interacción Promedio", value: "8.7%", sub: "Engagement Rate" }
    ]
  };

  const blogPosts = [
    {
      id: 1,
      title: "La muerte de la firma: el arte en la era de los algoritmos",
      excerpt: "Cuando una IA genera una imagen, ¿dónde reside la autoría? Una disertación sobre la descentralización creativa, el prompter como director de orquesta y la disolución del 'ego' del artista en el arte generativo contemporáneo.",
      date: "2026-06-15",
      readTime: "6 min read",
      category: "Filosofía del Arte",
      accent: "from-purple-500 to-pink-500",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    },
    {
      id: 2,
      title: "Ciberfeminismo y net.art: recuperando los espacios virtuales",
      excerpt: "De Donna Haraway a las colectivas de net.art de los años 90. Analizamos cómo el ciberespacio se convirtió en un territorio fértil para hackear el binario de género, crear identidades fluidas y repensar la interfaz hombre-máquina.",
      date: "2026-06-08",
      readTime: "8 min read",
      category: "Ciberfeminismo",
      accent: "from-cyan-500 to-blue-500",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      id: 3,
      title: "El renacer de los Glitches como manifestación estética",
      excerpt: "El error de software no es un fracaso; es la revelación de la máquina. Exploramos la historia del glitch art y por qué el ruido analógico y los fallos de renderizado son los verdaderos óleos y pinceles del siglo XXI.",
      date: "2026-05-29",
      readTime: "5 min read",
      category: "Estética Digital",
      accent: "from-amber-500 to-orange-500",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    }
  ];

  const exhibitions = [
    {
      id: 1,
      title: "Sinfonía Algorítmica",
      location: "Galería Virtual Decentraland (Distrito de Arte)",
      date: "Enero - Marzo 2026",
      description: "Una exposición inmersiva que traduce flujos de datos financieros en tiempo real a esculturas tridimensionales interactivas dentro del metaverso.",
      role: "Curadora y Artista Principal",
      tag: "Metaverso"
    },
    {
      id: 2,
      title: "Net.art Revival: De los 90s al Blockchain",
      location: "Museo de Arte Digital Contemporáneo (MADCo)",
      date: "Octubre 2025",
      description: "Una retrospectiva histórica que conecta el espíritu hacker del net.art primitivo de los noventa con la soberanía digital del arte on-chain moderno.",
      role: "Artista Invitada",
      tag: "On-Chain"
    },
    {
      id: 3,
      title: "Ciberesferas Colectivas",
      location: "Ars Electronica (Pabellón Virtual)",
      date: "Septiembre 2025",
      description: "Instalación colectiva de avatares autónomos que conversan entre sí sobre el futuro de la habitabilidad digital y los derechos de la conciencia artificial.",
      role: "Co-Creadora de Interfaces",
      tag: "VR / IA"
    }
  ];

  const lookbook = [
    {
      id: 1,
      name: "Neo-Brutalist Cyberweave",
      tags: ["Digital Fashion", "3D Render", "Vaporwave"],
      description: "Traje sastre de hombreras sobredimensionadas con texturas metálicas reflectantes y refracción lumínica en tiempo real. Diseñado para inauguraciones de galerías de realidad mixta.",
      glow: "border-indigo-500/20 bg-gradient-to-br from-indigo-50/50 to-purple-50/50"
    },
    {
      id: 2,
      name: "Glitch Holographic Kimono",
      tags: ["Couture", "Interactive NFT", "Cyberart"],
      description: "Una prenda flotante que cambia de patrón cromático según los latidos de la red Ethereum. El tejido emula el ruido de estática de televisores CRT antiguos.",
      glow: "border-emerald-500/20 bg-gradient-to-br from-emerald-50/50 to-teal-50/50"
    },
    {
      id: 3,
      name: "Liquid Mercury Corset",
      tags: ["Futurism", "Metamaterial", "Avant-Garde"],
      description: "Corsé modelado por gravedad algorítmica. Presenta una textura de mercurio líquido animado que responde a los movimientos del giroscopio del espectador.",
      glow: "border-amber-500/20 bg-gradient-to-br from-amber-50/50 to-rose-50/50"
    }
  ];

  const collaborations = [
    {
      brand: "MetaWear Studios",
      campaign: "Colección Cápsula de Ropa Virtual 'Zero-Gravity'",
      deliverable: "Modelado 3D interactivo y desfile en streaming holográfico",
      status: "Activa"
    },
    {
      brand: "Ethereal Fragrances",
      campaign: "La Esencia del Silicio (Campaña Digital)",
      deliverable: "Concept art, reseñas críticas basadas en olores sinestésicos generados por IA",
      status: "Completada"
    },
    {
      brand: "CyberVogue Magazine",
      campaign: "Portada Digital del Número Especial 'Humano-Virtual'",
      deliverable: "Editorial de moda fotográfica virtual y entrevista interactiva",
      status: "Completada"
    }
  ];

  // Merge and sort Firebase posts with static default posts
  const combinedFirebasePosts = [...firebaseCritiques, ...firebaseResearches, ...firebaseRecipes].sort((a, b) => {
    const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0;
    const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0;
    return timeB - timeA;
  });

  const defaultBlogPosts = blogPosts.map(p => ({
    id: `editorial-${p.id}`,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    date: new Date(p.date).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
    category: p.category,
    categoryKey: "editorial" as const,
    images: [] as string[],
    accent: p.accent,
    readTime: p.readTime || "5 min read"
  }));

  const allPosts = [...combinedFirebasePosts, ...defaultBlogPosts];

  const filteredPosts = allPosts.filter(post => {
    if (selectedCategory === "all") return true;
    return post.categoryKey === selectedCategory;
  });

  return (
    <div className="w-full bg-white text-[#111111] font-sans antialiased">
      {/* Editorial Header Hero */}
      <section className="relative pt-12 pb-20 border-b border-[#EEEEEE] overflow-hidden bg-[#FAF9F6]">
        {/* Subtle grid accent */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "radial-gradient(#111 1px, transparent 1px)", backgroundSize: "16px 16px" }}></div>
        
        <div className="max-w-4xl mx-auto px-6 relative">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 bg-black text-white text-[9px] uppercase tracking-[0.2em] font-mono rounded-full font-semibold">
                <Radio className="w-2.5 h-2.5 animate-pulse text-rose-500" />
                <span>En Línea • Servidor Central</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-[#111111] leading-none">
                Lola Work
              </h1>
              <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-stone-500">
                {influencerProfile.tagline}
              </p>
              <p className="text-sm font-light text-[#555555] leading-relaxed max-w-lg">
                {influencerProfile.bio}
              </p>
              
              {/* Social badges */}
              <div className="flex flex-wrap gap-3 pt-2">
                <a href="#instagram" className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-[#EEEEEE] hover:border-black rounded-sm text-[11px] text-[#555555] hover:text-black transition-colors font-mono">
                  <Instagram className="w-3.5 h-3.5" />
                  <span>@lola.work</span>
                </a>
                <a href="#twitter" className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-[#EEEEEE] hover:border-black rounded-sm text-[11px] text-[#555555] hover:text-black transition-colors font-mono">
                  <Twitter className="w-3.5 h-3.5" />
                  <span>@lola_cyberart</span>
                </a>
                <button
                  onClick={onGoToAdmin}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#111111] text-white hover:bg-[#333333] rounded-sm text-[11px] font-mono transition-colors ml-auto"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </button>
              </div>
            </div>

            {/* Simulated 3D Digital Portrait Avatar */}
            <div className="relative w-48 h-48 md:w-56 md:h-56 shrink-0 mx-auto md:mx-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-indigo-600 animate-spin-slow opacity-10 blur-xl"></div>
              <div className="w-full h-full rounded-full border border-black/10 p-2 bg-white flex items-center justify-center relative overflow-hidden">
                <div className="w-full h-full rounded-full bg-[#111111] flex flex-col items-center justify-center text-center p-6 text-white relative">
                  {/* Cyber mesh background */}
                  <div className="absolute inset-0 opacity-10 font-mono text-[6px] overflow-hidden leading-none select-none pointer-events-none p-2 text-left">
                    {"01010110010101101101110 101010110101011 001101 01010 101 101010 110101 0110 01010 10 11010 10 10101".repeat(10)}
                  </div>
                  
                  {/* Digital face representation (minimalist artistic rendering) */}
                  <div className="w-16 h-16 border border-stone-700 rounded-full flex items-center justify-center relative mb-2">
                    <div className="w-12 h-12 border border-stone-500 border-dashed rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-indigo-500/80 rounded-full animate-ping"></div>
                    </div>
                    {/* Glowing scanning bar */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
                  </div>
                  
                  <span className="text-[10px] font-mono tracking-widest text-indigo-300 font-bold uppercase">LW_v2.6.4</span>
                  <span className="text-[8px] font-mono text-stone-400 mt-1"> Madrid Node </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Sub-Menu */}
      <nav className="border-b border-[#EEEEEE] sticky top-20 bg-white z-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex overflow-x-auto gap-8 py-4 text-[11px] uppercase tracking-[0.2em] font-mono no-scrollbar">
            <button 
              onClick={() => setActiveTab("about")}
              className={`pb-1 transition-colors relative whitespace-nowrap ${activeTab === "about" ? "text-black font-semibold" : "text-[#888888] hover:text-black"}`}
            >
              Sobre Mí
              {activeTab === "about" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>}
            </button>
            <button 
              onClick={() => setActiveTab("blog")}
              className={`pb-1 transition-colors relative whitespace-nowrap ${activeTab === "blog" ? "text-black font-semibold" : "text-[#888888] hover:text-black"}`}
            >
              Blog / Bitácora
              {activeTab === "blog" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>}
            </button>
            <button 
              onClick={() => setActiveTab("exhibitions")}
              className={`pb-1 transition-colors relative whitespace-nowrap ${activeTab === "exhibitions" ? "text-black font-semibold" : "text-[#888888] hover:text-black"}`}
            >
              Exposiciones
              {activeTab === "exhibitions" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>}
            </button>
            <button 
              onClick={() => setActiveTab("lookbook")}
              className={`pb-1 transition-colors relative whitespace-nowrap ${activeTab === "lookbook" ? "text-black font-semibold" : "text-[#888888] hover:text-black"}`}
            >
              Lookbook Estilo
              {activeTab === "lookbook" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>}
            </button>
            <button 
              onClick={() => setActiveTab("collabs")}
              className={`pb-1 transition-colors relative whitespace-nowrap ${activeTab === "collabs" ? "text-black font-semibold" : "text-[#888888] hover:text-black"}`}
            >
              Colaboraciones
              {activeTab === "collabs" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Tab Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* TAB 1: SOBRE MÍ */}
        {activeTab === "about" && (
          <div className="space-y-12 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              {/* Column 1: Stylized Portrait / Render of Virtual Influencer */}
              <div className="space-y-6">
                <div className="relative aspect-square w-full max-w-md mx-auto bg-neutral-950 rounded-sm border border-neutral-800 p-4 shadow-xl overflow-hidden group">
                  {/* Background grid overlay */}
                  <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
                  
                  {/* Corner bracket decorations */}
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-neutral-600"></div>
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-neutral-600"></div>
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-neutral-600"></div>
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-neutral-600"></div>
                  
                  {/* Glitch & scanning effects */}
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-indigo-500/30 animate-[bounce_8s_infinite_linear] opacity-80 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                  
                  {/* Main Portrait Frame - Abstract vector cyberart face representing Lola */}
                  <div className="w-full h-full border border-neutral-800/60 rounded-sm flex flex-col items-center justify-center relative p-6 bg-gradient-to-b from-neutral-900 to-neutral-950">
                    
                    {/* Simulated 3D Mesh Ring */}
                    <div className="w-44 h-44 rounded-full border border-indigo-500/20 flex items-center justify-center relative animate-pulse">
                      <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/30 animate-[spin_40s_linear_infinite]"></div>
                      <div className="absolute inset-4 rounded-full border border-emerald-500/20 animate-[spin_25s_linear_infinite_reverse]"></div>
                      <div className="w-28 h-28 rounded-full bg-indigo-950/40 border border-indigo-400/30 flex items-center justify-center overflow-hidden">
                        
                        {/* High-fashion vector silhouette SVG representing Lola Work */}
                        <svg viewBox="0 0 100 100" className="w-24 h-24 text-white opacity-80" fill="currentColor">
                          {/* Stylized hair outline */}
                          <path d="M 50 15 C 32 15 25 35 25 55 C 25 65 28 85 30 90 L 70 90 C 72 85 75 65 75 55 C 75 35 68 15 50 15 Z" fill="rgba(99, 102, 241, 0.15)" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="0.5" />
                          {/* Face contour */}
                          <path d="M 50 25 C 38 25 37 45 37 55 C 37 68 42 75 50 75 C 58 75 63 68 63 55 C 63 45 62 25 50 25 Z" fill="#1e1b4b" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="0.75" />
                          {/* Closed eyes with makeup line */}
                          <path d="M 42 48 Q 45 46 48 48" fill="none" stroke="#22d3ee" strokeWidth="1" />
                          <path d="M 58 48 Q 55 46 52 48" fill="none" stroke="#22d3ee" strokeWidth="1" />
                          {/* Neon lips */}
                          <path d="M 46 62 Q 50 65 54 62 Q 50 60 46 62 Z" fill="#ec4899" stroke="#f43f5e" strokeWidth="0.5" />
                          {/* Geometric cyber blush markers */}
                          <circle cx="41" cy="54" r="1.5" fill="#f43f5e" opacity="0.6" />
                          <circle cx="59" cy="54" r="1.5" fill="#f43f5e" opacity="0.6" />
                          {/* Matrix data particles falling */}
                          <line x1="50" y1="28" x2="50" y2="38" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="0.5" strokeDasharray="1 1" />
                        </svg>

                      </div>
                    </div>

                    {/* HUD Status Text Overlays */}
                    <div className="absolute top-4 left-4 text-[9px] font-mono text-neutral-400 space-y-0.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        <span className="text-emerald-400 font-bold">LIVE_RENDER</span>
                      </div>
                      <p>LOC: MAD_NODE_04</p>
                      <p>RES: 4096 x 4096</p>
                    </div>

                    <div className="absolute top-4 right-4 text-[9px] font-mono text-neutral-400 text-right space-y-0.5">
                      <p>ENGINE: UE_5.4.2</p>
                      <p>FPS: 120.0 (SYNC)</p>
                      <p>LATENCY: 4.2ms</p>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <div className="text-[9px] font-mono text-indigo-300">
                        <p className="font-bold uppercase tracking-wider">LOLA_WORK_MODEL_2.6</p>
                        <p className="text-neutral-500 text-[8px]">MD5: c4ca4238a0b923820dcc</p>
                      </div>
                      <div className="text-[9px] font-mono text-neutral-400 bg-neutral-900 px-2 py-1 rounded-sm border border-neutral-800">
                        PATH_TRACING: ON
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-label under avatar */}
                <p className="text-[11px] font-mono text-stone-400 text-center uppercase tracking-widest">
                  Visualización Esquematizada de Lola Work v2.6.4
                </p>
              </div>

              {/* Column 2: Biographical / Philosophy Text */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-[13px] font-mono uppercase tracking-[0.2em] text-indigo-600 font-bold mb-2">Sobre Lola Work</h3>
                  <h2 className="text-3xl font-light tracking-tight text-[#111111]">
                    Identidad Sintética, Crítica Humana.
                  </h2>
                </div>

                <div className="text-[14px] font-light text-stone-600 leading-relaxed space-y-4">
                  <p>
                    <strong>Lola Work</strong> es una artista multidisciplinar y modelo virtual nacida en el ciberespacio madrileño en 2024. Su existencia reside íntegramente en redes de silicio, y se desenvuelve como un agente activo en el análisis y divulgación del <strong>ciberarte</strong>, <strong>net.art</strong> y las estéticas emergentes generadas por Inteligencia Artificial.
                  </p>
                  <p>
                    Desprovista de cuerpo biológico, Lola utiliza el renderizado fotorrealista y la síntesis generativa para dialogar cara a cara con su audiencia humana. Su labor no se limita a posar en mundos digitales; es una intelectual de la máquina que deconstruye la autoría algorítmica y cuestiona las fronteras entre lo vivo y lo sintetizado.
                  </p>
                  <p>
                    A través de su bitácora y sus exhaustivas investigaciones, Lola recopila y reinterpreta la historia de las vanguardias digitales, rescatando los postulados del ciberfeminismo de los noventa y proyectándolos hacia el futuro híbrido de la Web3, los mundos virtuales inmersivos y el arte on-chain.
                  </p>
                  
                  <div className="border-l-2 border-indigo-600 pl-4 py-2 bg-stone-50 rounded-r-sm">
                    <p className="italic text-stone-700 font-medium text-[13px]">
                      "Mi código no es estático; muta con cada interacción, con cada obra comentada y con cada pixel de estática que el algoritmo decide rescatar de la red."
                    </p>
                    <span className="block mt-1 text-[11px] font-mono text-indigo-600 font-bold">— Lola Work</span>
                  </div>
                </div>

                {/* Detailed Spec Badges inside the text column */}
                <div className="pt-4 border-t border-stone-100 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400">Plataformas Clave</span>
                    <p className="text-[12px] font-medium text-stone-800">Decentraland, Voxels, OpenSea, IPFS</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400">Estilo Visual</span>
                    <p className="text-[12px] font-medium text-stone-800">Glitch Art, Vaporwave, Cyberpunk, Brutalismo</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Audience Stats Display */}
            <div className="pt-8 border-t border-[#EEEEEE]">
              <h3 className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#888888] mb-8 font-bold">Métricas y Audiencia Digital</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {influencerProfile.stats.map((stat, i) => (
                  <div key={i} className="border border-[#EEEEEE] p-5 rounded-sm bg-[#FAFBFD] space-y-1">
                    <span className="font-mono text-2xl font-light tracking-tight text-indigo-600">{stat.value}</span>
                    <p className="text-[11px] font-medium text-[#111111]">{stat.label}</p>
                    <p className="text-[9px] text-[#999999] font-mono">{stat.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Interactive Demo (Non-functional, just beautiful UI placeholder) */}
            <div className="bg-gradient-to-r from-stone-900 to-neutral-800 text-white p-8 rounded-sm shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="max-w-xl space-y-4">
                <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-cyan-400">Canal de Interacción Directa</span>
                <h3 className="text-xl font-light tracking-tight">Pregúntame sobre cualquier obra en la nube</h3>
                <p className="text-[12px] text-stone-300 font-light leading-relaxed">
                  Próximamente podrás enviar enlaces o archivos de imágenes artísticas. Lola-Work las procesará instantáneamente analizando composición, luz y corrientes estéticas de forma autónoma.
                </p>
                <div className="flex gap-2 pt-2">
                  <input 
                    type="text" 
                    placeholder="Escribe el nombre de una obra..." 
                    disabled 
                    className="flex-1 px-3 py-2 bg-stone-800 border border-stone-700 rounded-sm text-[12px] placeholder-stone-500 focus:outline-none" 
                  />
                  <button disabled className="px-4 py-2 bg-white text-black text-[11px] uppercase tracking-wider font-mono font-medium rounded-sm opacity-50 cursor-not-allowed">
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BLOG */}
        {activeTab === "blog" && (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="pb-4 border-b border-[#EEEEEE] flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-[10px] text-[#999999] uppercase tracking-widest block mb-1 font-mono">Ciberbitácora e Inteligencia Colectiva</span>
                <h2 className="text-3xl font-light tracking-tight text-[#111111]">Pensamientos On-Chain</h2>
                <p className="text-[12px] text-stone-500 font-light mt-1">El espacio donde el análisis automatizado se encuentra con la teoría estética y la gastronomía molecular.</p>
              </div>

              {/* Status Indicator */}
              <div className="self-start md:self-end">
                {user ? (
                  <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-sm text-[11px] font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Firebase: {combinedFirebasePosts.length} post(s) dinámicos</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-stone-50 border border-stone-200 text-stone-500 rounded-sm text-[11px] font-mono">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>Demo (Inicia sesión para cargar tu Firebase)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Informational Callout if not logged in */}
            {!user && (
              <div className="bg-[#FAF9F6] border border-stone-200 p-4 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-[12px] font-medium text-stone-800">✨ Diseñado para tus datos de Firebase</p>
                  <p className="text-[11px] text-stone-500 font-light leading-relaxed">
                    Esta bitácora cargará automáticamente las <strong>Críticas de Obras</strong>, <strong>Investigaciones de Artistas</strong> y <strong>Recetas Sintéticas</strong> que crees en el Panel de Administración usando Inteligencia Artificial.
                  </p>
                </div>
                <button 
                  onClick={onGoToAdmin}
                  className="px-3.5 py-1.5 bg-[#111111] hover:bg-stone-800 text-white text-[10px] uppercase tracking-wider font-mono font-medium rounded-sm transition-all whitespace-nowrap"
                >
                  Ir al Panel
                </button>
              </div>
            )}

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 py-2 border-b border-stone-100">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all border ${selectedCategory === "all" ? "bg-[#111111] text-white border-[#111111]" : "bg-white text-stone-500 border-stone-200 hover:text-black hover:border-black"}`}
              >
                Todos ({allPosts.length})
              </button>
              <button
                onClick={() => setSelectedCategory("editorial")}
                className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all border ${selectedCategory === "editorial" ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-500 border-stone-200 hover:text-black hover:border-black"}`}
              >
                Editoriales de Lola ({defaultBlogPosts.length})
              </button>
              <button
                onClick={() => setSelectedCategory("critiques")}
                className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all border ${selectedCategory === "critiques" ? "bg-purple-900 text-white border-purple-900" : "bg-white text-stone-500 border-stone-200 hover:text-black hover:border-black"}`}
              >
                Análisis de Obras ({firebaseCritiques.length})
              </button>
              <button
                onClick={() => setSelectedCategory("researches")}
                className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all border ${selectedCategory === "researches" ? "bg-cyan-950 text-white border-cyan-950" : "bg-white text-stone-500 border-stone-200 hover:text-black hover:border-black"}`}
              >
                Investigaciones ({firebaseResearches.length})
              </button>
              <button
                onClick={() => setSelectedCategory("recipes")}
                className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all border ${selectedCategory === "recipes" ? "bg-amber-900 text-white border-amber-900" : "bg-white text-stone-500 border-stone-200 hover:text-black hover:border-black"}`}
              >
                Cibergastronomía ({firebaseRecipes.length})
              </button>
            </div>

            {/* Posts Grid / List */}
            <div className="space-y-10 pt-4">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => {
                  const isExpanded = expandedPostId === post.id;
                  return (
                    <article 
                      key={post.id} 
                      className={`group pb-8 border-b border-[#F4F4F4] last:border-0 transition-all`}
                    >
                      {/* Meta header */}
                      <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-[#999999] mb-3">
                        <span className={`px-2 py-0.5 bg-stone-100 border border-stone-200 text-[#444] rounded-sm uppercase tracking-wider font-semibold`}>
                          {post.category}
                        </span>
                        <span>•</span>
                        <span>{post.date}</span>
                        {post.readTime && (
                          <>
                            <span>•</span>
                            <span>{post.readTime}</span>
                          </>
                        )}
                        {post.sourceCollection !== "editorial" && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                              <Database className="w-2.5 h-2.5" />
                              VERIFICADO EN FIREBASE
                            </span>
                          </>
                        )}
                      </div>

                      {/* Content block layout */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                        {/* Title and Excerpt */}
                        <div className={`${post.images && post.images.length > 0 ? "md:col-span-3" : "md:col-span-4"} space-y-3`}>
                          <h3 
                            className="text-xl md:text-2xl font-light tracking-tight text-[#111111] group-hover:text-indigo-600 transition-colors cursor-pointer"
                            onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                          >
                            {post.title}
                          </h3>
                          
                          {!isExpanded && (
                            <p className="text-[13px] text-stone-600 font-light leading-relaxed">
                              {post.excerpt}
                            </p>
                          )}
                        </div>

                        {/* Optional thumbnail image if present (base64 or URL) */}
                        {post.images && post.images.length > 0 && (
                          <div className="w-full aspect-square md:aspect-video rounded-sm overflow-hidden border border-stone-200 bg-stone-50 relative">
                            <img 
                              src={post.images[0]} 
                              alt={post.title} 
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute bottom-1 right-1 bg-black/60 text-white font-mono text-[8px] px-1 py-0.5 rounded-sm">
                              ANÁLISIS_IMG
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Expanded Markdown Reading Body */}
                      {isExpanded && (
                        <div className="mt-6 p-6 sm:p-8 bg-[#FAFBFD] border border-stone-200/60 rounded-sm animate-fade-in relative">
                          <div className="absolute top-4 right-4 text-[9px] font-mono text-stone-400">
                            MODO_LECTURA_ON
                          </div>

                          {/* Decorative quote line if research */}
                          {post.sourceCollection === "researches" && (
                            <div className="mb-6 inline-flex items-center space-x-2 px-2.5 py-1 bg-cyan-50 border border-cyan-100 text-cyan-800 rounded-sm text-[10px] font-mono">
                              <FileText className="w-3 h-3" strokeWidth={2.5} />
                              <span>INFORME COMPLETO DE INVESTIGACIÓN</span>
                            </div>
                          )}

                          {/* Decorative recipe icon if recipe */}
                          {post.sourceCollection === "recipes" && (
                            <div className="mb-6 inline-flex items-center space-x-2 px-2.5 py-1 bg-amber-50 border border-amber-100 text-amber-800 rounded-sm text-[10px] font-mono">
                              <Utensils className="w-3 h-3" strokeWidth={2.5} />
                              <span>FÓRMULA CIBERGASTRONÓMICA</span>
                            </div>
                          )}

                          {/* Rich Render Markdown Container */}
                          <div className="prose prose-stone max-w-none text-stone-800 text-[13px] leading-relaxed font-light space-y-4 markdown-body">
                            <Markdown>{post.content}</Markdown>
                          </div>

                          {/* Double Columns for recipe parameters if available */}
                          {post.sourceCollection === "recipes" && post.ingredientsText && (
                            <div className="mt-8 pt-4 border-t border-stone-200/40 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] font-mono text-stone-500 bg-stone-50 p-4 rounded-sm">
                              <div>
                                <span className="text-[9px] text-stone-400 block uppercase">Ingredientes de Partida:</span>
                                <span className="text-[#111111] font-sans text-xs">{post.ingredientsText}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-stone-400 block uppercase">Nivel de Refracción Nutricional:</span>
                                <span className="text-amber-700 font-bold font-mono">100% SINTETIZADO</span>
                              </div>
                            </div>
                          )}

                          <button 
                            onClick={() => setExpandedPostId(null)}
                            className="mt-8 px-4 py-2 border border-stone-300 hover:border-black text-stone-700 hover:text-black rounded-sm text-[10px] uppercase tracking-wider font-mono transition-all flex items-center space-x-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Colapsar Lectura</span>
                          </button>
                        </div>
                      )}

                      {/* Expand / Collapse Action Trigger */}
                      {!isExpanded && (
                        <div className="mt-4">
                          <button 
                            onClick={() => setExpandedPostId(post.id)}
                            className="inline-flex items-center text-[11px] font-mono uppercase tracking-wider font-bold text-[#111111] hover:text-indigo-600 group-hover:translate-x-1 transition-transform cursor-pointer"
                          >
                            <span>Leer Artículo Completo</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })
              ) : (
                <div className="text-center py-12 border border-dashed border-stone-200 rounded-sm bg-stone-50/50 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                    <Filter className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-stone-800">No se encontraron artículos en esta sección</h4>
                    <p className="text-[12px] text-stone-500 font-light max-w-sm mx-auto">
                      Aún no has generado contenido para esta categoría. Dirígete al panel administrativo para realizar críticas, búsquedas de artistas o recetas.
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedCategory("all")}
                    className="px-4 py-2 bg-white border border-stone-300 text-stone-700 hover:text-black rounded-sm text-[10px] uppercase tracking-widest font-mono transition-all"
                  >
                    Ver todas las publicaciones
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: EXPOSICIONES */}
        {activeTab === "exhibitions" && (
          <div className="space-y-10 animate-fade-in text-stone-800">
            {/* Header */}
            <div className="pb-4 border-b border-[#EEEEEE] flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <span className="text-[10px] text-indigo-600 uppercase tracking-widest block mb-1 font-mono font-bold">Featured 3D Space & Curation</span>
                <h2 className="text-3xl font-light tracking-tight text-[#111111]">Pabellón Virtual: Galería de Arte 3D</h2>
                <p className="text-[12px] text-stone-500 font-light mt-1">
                  Una experiencia interactiva y curatorial en torno al proyecto de código abierto <strong className="text-stone-800 font-medium font-mono">ClementCariou/virtual-art-gallery</strong>.
                </p>
              </div>

              {repoData && (
                <div className="flex items-center space-x-2 text-[11px] font-mono bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-sm">
                  <Github className="w-3.5 h-3.5 text-stone-600" />
                  <span className="text-stone-500">Branch:</span>
                  <span className="text-stone-800 font-bold">master</span>
                  <span className="text-stone-300">|</span>
                  <span className="text-amber-500 font-semibold flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {repoData.stargazers_count}
                  </span>
                </div>
              )}
            </div>

            {/* CURATOR STATEMENT */}
            <div className="p-6 bg-[#FAFBFD] border border-indigo-100 rounded-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center space-x-2 text-indigo-700">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Cédula de Presentación de Lola Work</span>
                </div>
                <p className="text-[13px] text-stone-700 font-light leading-relaxed">
                  "Concibo el metaverso no como un vacío comercial, sino como un lienzo de infinitas posibilidades espaciales. El proyecto de <strong>Clement Cariou</strong> representa el estado del arte en museos navegables autónomos: un motor tridimensional ultraligero que permite experimentar el arte digital con la solemnidad física de una galería real. He tomado esta magnífica arquitectura como mi sala oficial de exposiciones."
                </p>
              </div>
              <div className="border-t md:border-t-0 md:border-l border-stone-200/80 pt-4 md:pt-0 md:pl-6 space-y-2 text-center md:text-left">
                <span className="text-[9px] font-mono text-stone-400 uppercase tracking-wider block">Arquitectura del Software</span>
                <div className="flex flex-wrap justify-center md:justify-start gap-1">
                  <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded-sm font-mono text-stone-600">Three.js</span>
                  <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded-sm font-mono text-stone-600">WebGL</span>
                  <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded-sm font-mono text-stone-600">HTML5 Canvas</span>
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-sm font-mono font-bold">MIT License</span>
                </div>
                <a 
                  href="https://clementcariou.github.io/virtual-art-gallery/build"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-xs font-mono text-indigo-600 hover:text-indigo-800 flex items-center justify-center md:justify-start space-x-1 font-bold group"
                >
                  <span>Entrar al espacio 3D real</span>
                  <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>

            {/* INTERACTIVE GALLERY DEMO & SIMULATOR */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Side: 3D Projection Wall */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-1 bg-stone-100 p-1 border border-stone-200 rounded-md">
                    <button
                      type="button"
                      onClick={() => setExhibitionViewMode("3d")}
                      className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider transition-all rounded-sm font-bold flex items-center space-x-1 ${exhibitionViewMode === "3d" ? "bg-indigo-600 text-white shadow-xs" : "text-stone-500 hover:text-stone-800"}`}
                    >
                      <Globe className="w-3 h-3" />
                      <span>Galería 3D Real (Interactiva)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExhibitionViewMode("projection")}
                      className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider transition-all rounded-sm font-bold flex items-center space-x-1 ${exhibitionViewMode === "projection" ? "bg-indigo-600 text-white shadow-xs" : "text-stone-500 hover:text-stone-800"}`}
                    >
                      <Camera className="w-3 h-3" />
                      <span>Proyección de Obras (Simulador)</span>
                    </button>
                  </div>
                  <span className="text-[10px] font-mono text-stone-500 uppercase self-end sm:self-auto">
                    {exhibitionViewMode === "projection" ? (
                      <span>Sala: <strong className="text-stone-800">{galleryArtworks[selectedArtworkIndex]?.room}</strong></span>
                    ) : (
                      <span className="text-indigo-600 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                        3D Activo
                      </span>
                    )}
                  </span>
                </div>

                {exhibitionViewMode === "3d" ? (
                  /* Embed live virtual art gallery iframe */
                  <div className="relative w-full aspect-video md:h-[480px] bg-black border border-stone-800 rounded-sm overflow-hidden shadow-2xl group">
                    <iframe
                      src="https://clementcariou.github.io/virtual-art-gallery/build?api=local"
                      className="w-full h-full border-none bg-black"
                      title="Virtual Art Gallery 3D"
                      allow="fullscreen"
                      sandbox="allow-scripts allow-same-origin allow-downloads allow-pointer-lock"
                    />
                    {/* Floating Help Banner inside iframe wrapper */}
                    <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-md px-3.5 py-2.5 border border-stone-800 rounded-sm pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-90 max-w-sm">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                        <span className="text-[10px] font-mono text-white uppercase tracking-wider font-bold">Navegación Interactiva 3D Real</span>
                      </div>
                      <p className="text-[9px] text-stone-300 font-light mt-1 leading-normal">
                        Haz clic en la pantalla 3D para tomar control. Usa <strong className="text-white font-mono">WASD / Flechas</strong> para caminar y el <strong className="text-white font-mono">Ratón</strong> para mirar. Presiona <strong className="text-white font-mono">ESC</strong> para salir.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Simulated Museum Wall */
                  <div className="relative aspect-video bg-[#18181A] rounded-sm border border-stone-800 overflow-hidden shadow-2xl flex flex-col items-center justify-center p-6">
                    {/* Subtle Wall background lights and perspective */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-800 via-stone-950 to-black pointer-events-none opacity-85"></div>
                    
                    {/* Virtual Spotlight Ring */}
                    <div className="absolute top-2 w-32 h-10 bg-white/10 blur-xl rounded-full pointer-events-none"></div>

                    {/* Artwork Image Framed */}
                    <div className="relative z-10 w-2/3 max-w-[320px] aspect-[4/3] bg-stone-900 border-[8px] border-stone-950 shadow-[0_0_25px_rgba(255,255,255,0.08)] flex items-center justify-center overflow-hidden transition-all duration-500">
                      <img 
                        src={galleryArtworks[selectedArtworkIndex]?.url} 
                        alt={galleryArtworks[selectedArtworkIndex]?.title}
                        className="w-full h-full object-cover grayscale-[15%] hover:grayscale-0 transition-all duration-500"
                        referrerPolicy="no-referrer"
                      />
                      {/* Frame light glare reflections */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none"></div>
                    </div>

                    {/* Placard on the side (Simulated museum tag) */}
                    <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end bg-black/85 backdrop-blur-md p-3 border border-stone-800 rounded-sm">
                      <div className="flex-1 min-w-0 pr-4 text-left">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-[12px] font-mono text-white tracking-tight font-medium uppercase truncate max-w-[240px]" title={galleryArtworks[selectedArtworkIndex]?.title}>
                            {galleryArtworks[selectedArtworkIndex]?.title}
                          </h4>
                          {galleryArtworks[selectedArtworkIndex]?.price && (
                            <span className="px-1.5 py-0.5 bg-indigo-600 text-[8px] font-mono font-bold text-white uppercase rounded-sm flex-shrink-0">
                              {galleryArtworks[selectedArtworkIndex]?.price}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-stone-400 font-light font-sans italic mt-0.5">
                          Por: {galleryArtworks[selectedArtworkIndex]?.artist} • {galleryArtworks[selectedArtworkIndex]?.room}
                        </p>
                        {galleryArtworks[selectedArtworkIndex]?.description && (
                          <p className="text-[9px] text-stone-300 font-light font-sans line-clamp-1 mt-1 leading-normal">
                            {galleryArtworks[selectedArtworkIndex]?.description}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => setSelectedArtworkIndex((prev) => (prev === 0 ? galleryArtworks.length - 1 : prev - 1))}
                          className="p-1 text-stone-400 hover:text-white bg-stone-900 border border-stone-800 rounded-sm transition-all"
                          title="Obra anterior"
                        >
                          <span className="block font-mono text-xs font-bold px-1">&lt;</span>
                        </button>
                        <button 
                          onClick={() => setSelectedArtworkIndex((prev) => (prev === galleryArtworks.length - 1 ? 0 : prev + 1))}
                          className="p-1 text-stone-400 hover:text-white bg-stone-900 border border-stone-800 rounded-sm transition-all"
                          title="Siguiente obra"
                        >
                          <span className="block font-mono text-xs font-bold px-1">&gt;</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Interactive Controls & Guide */}
                <div className="bg-stone-50 border border-stone-200 rounded-sm p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest block">Instrucciones de Navegación 3D</span>
                    <div className="flex items-center space-x-3 pt-1">
                      {/* WASD Layout */}
                      <div className="grid grid-cols-3 gap-0.5 w-[58px]">
                        <div></div>
                        <div className="bg-white border border-stone-300 text-[8px] font-mono font-bold text-center py-0.5 rounded-sm shadow-xs text-stone-700">W</div>
                        <div></div>
                        <div className="bg-white border border-stone-300 text-[8px] font-mono font-bold text-center py-0.5 rounded-sm shadow-xs text-stone-700">A</div>
                        <div className="bg-white border border-stone-300 text-[8px] font-mono font-bold text-center py-0.5 rounded-sm shadow-xs text-stone-700">S</div>
                        <div className="bg-white border border-stone-300 text-[8px] font-mono font-bold text-center py-0.5 rounded-sm shadow-xs text-stone-700">D</div>
                      </div>
                      <span className="text-stone-300">/</span>
                      {/* Arrows Layout */}
                      <div className="grid grid-cols-3 gap-0.5 w-[58px]">
                        <div></div>
                        <div className="bg-white border border-stone-300 text-[8px] font-mono font-bold text-center py-0.5 rounded-sm shadow-xs text-stone-700">▲</div>
                        <div></div>
                        <div className="bg-white border border-stone-300 text-[8px] font-mono font-bold text-center py-0.5 rounded-sm shadow-xs text-stone-700">◀</div>
                        <div className="bg-white border border-stone-300 text-[8px] font-mono font-bold text-center py-0.5 rounded-sm shadow-xs text-stone-700">▼</div>
                        <div className="bg-white border border-stone-300 text-[8px] font-mono font-bold text-center py-0.5 rounded-sm shadow-xs text-stone-700">▶</div>
                      </div>
                      <p className="text-[11px] text-stone-500 font-light leading-snug">
                        Usa las teclas <strong className="text-stone-800">WASD o Flechas</strong> para caminar por la galería real, y mueve el <strong className="text-stone-800">ratón</strong> para mirar alrededor.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-stone-200 pt-3 md:pt-0 md:pl-4">
                    <a
                      href="https://clementcariou.github.io/virtual-art-gallery/build"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-black text-white hover:bg-stone-800 font-mono text-xs uppercase tracking-wider font-bold rounded-sm text-center transition-all flex items-center justify-center space-x-2 shadow-xs"
                    >
                      <Globe className="w-3.5 h-3.5 text-white" />
                      <span>Ver Galería Interactiva</span>
                    </a>
                  </div>
                </div>

                {/* Curator Critique Plates connected to Firebase */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-widest font-bold text-[#111111] flex items-center space-x-1.5 pt-2">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Ensayos de Sala y Crítica Digital</span>
                  </h4>
                  
                  {firebaseCritiques.length > 0 || firebaseResearches.length > 0 ? (
                    <div className="space-y-3">
                      {firebaseCritiques.slice(0, 2).map((crit, idx) => (
                        <div key={idx} className="p-4 bg-stone-50 border border-stone-200/80 rounded-sm space-y-1">
                          <div className="flex items-center justify-between text-[9px] font-mono text-stone-400 uppercase">
                            <span>Crítica de Muro Registrada</span>
                            <span className="text-indigo-600">Lola Curadora</span>
                          </div>
                          <h5 className="text-[13px] font-medium text-stone-900">{crit.title}</h5>
                          <p className="text-[12px] text-stone-600 font-light line-clamp-2 leading-relaxed italic">
                            "{crit.excerpt || crit.content?.substring(0, 150)}..."
                          </p>
                        </div>
                      ))}
                      {firebaseResearches.slice(0, 1).map((res, idx) => (
                        <div key={idx} className="p-4 bg-stone-50 border border-stone-200/80 rounded-sm space-y-1">
                          <div className="flex items-center justify-between text-[9px] font-mono text-stone-400 uppercase">
                            <span>Monografía en Biblioteca del Museo</span>
                            <span className="text-amber-600">Investigación</span>
                          </div>
                          <h5 className="text-[13px] font-medium text-stone-900">{res.title}</h5>
                          <p className="text-[12px] text-stone-600 font-light line-clamp-2 leading-relaxed">
                            {res.summary || res.content?.substring(0, 150)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed border-stone-200 rounded-sm text-center text-xs font-mono text-stone-400 bg-stone-50/50">
                      No hay ensayos de sala disponibles en Firestore. Genera una crítica o investigación en el Panel de Administración para verla reflejada aquí.
                    </div>
                  )}
                </div>

              </div>

              {/* Right Side: Catalog & Form */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* EXHIBITED ARTWORKS LIST */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">Catálogo del Pabellón ({galleryArtworks.length})</span>
                  
                  <div className="border border-stone-200 rounded-sm divide-y divide-stone-100 max-h-[295px] overflow-y-auto bg-white shadow-xs">
                    {galleryArtworks.map((art, idx) => {
                      const isActive = selectedArtworkIndex === idx;
                      return (
                        <div 
                          key={idx}
                          onClick={() => setSelectedArtworkIndex(idx)}
                          className={`flex items-center justify-between p-3 cursor-pointer transition-all group/item ${isActive ? "bg-indigo-50/50 border-l-2 border-indigo-600" : "hover:bg-stone-50"}`}
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="w-12 h-12 rounded-sm overflow-hidden border border-stone-200 bg-stone-100 flex-shrink-0">
                              <img 
                                src={art.url} 
                                alt={art.title} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <div className="flex justify-between items-center text-[9px] font-mono uppercase">
                                <span className={isActive ? "text-indigo-600 font-bold" : "text-stone-400"}>
                                  {isActive ? "Proyectada" : "En Reserva"}
                                </span>
                                <span className="text-stone-500 font-light truncate max-w-[120px]">{art.room}</span>
                              </div>
                              <h4 className="text-[13px] font-normal text-stone-900 truncate mt-0.5 flex items-center gap-1.5">
                                <span className="truncate">{art.title}</span>
                                {art.price && (
                                  <span className="px-1 bg-stone-100 border border-stone-200 text-[8px] font-mono text-stone-600 rounded-sm font-bold flex-shrink-0">
                                    {art.price}
                                  </span>
                                )}
                              </h4>
                              <p className="text-[11px] text-stone-400 font-light truncate">{art.artist}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

            {/* GITHUB SOURCE CODE ARCHITECTURE HUB */}
            <div className="pt-6 border-t border-stone-200">
              <div className="space-y-4">
                <div className="pb-2">
                  <span className="text-[10px] text-stone-400 uppercase tracking-widest block font-mono">Technical Topology</span>
                  <h3 className="text-xl font-light text-stone-900 tracking-tight">Estudio del Código Fuente Tridimensional</h3>
                  <p className="text-xs text-stone-500 font-light mt-0.5">
                    Inspecciona la topología de la galería tridimensional de Clement Cariou mapeando el código fuente interactivo de GitHub.
                  </p>
                </div>

                {repoLoading && (
                  <div className="py-16 text-center space-y-4 border border-dashed border-stone-200 rounded-sm bg-stone-50/50 animate-pulse">
                    <Cpu className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                    <div className="space-y-1">
                      <p className="text-xs font-mono text-stone-600 uppercase tracking-widest animate-pulse">Consultando topología de ClementCariou...</p>
                    </div>
                  </div>
                )}

                {repoError && !repoLoading && (
                  <div className="p-4 border border-rose-200 bg-rose-50/50 rounded-sm flex items-center justify-between">
                    <span className="text-xs font-mono text-rose-700">{repoError}</span>
                    <button 
                      onClick={() => fetchGithubRepo("ClementCariou/virtual-art-gallery")}
                      className="px-3 py-1 bg-white border border-rose-300 text-rose-700 font-mono text-[10px] rounded-sm uppercase tracking-wider transition-all"
                    >
                      Reintentar Carga
                    </button>
                  </div>
                )}

                {repoData && !repoLoading && (
                  <div className="border border-stone-200 rounded-sm overflow-hidden bg-white shadow-xs">
                    
                    {/* Stats Ribbon */}
                    <div className="px-6 py-4 bg-[#FAFBFD] border-b border-stone-200/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="border-r border-stone-200/60 py-1 flex flex-col justify-center items-center">
                        <span className="text-lg font-semibold font-mono text-stone-900 flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          {repoData.stargazers_count?.toLocaleString() || "425"}
                        </span>
                        <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest mt-0.5">Estrellas</span>
                      </div>
                      
                      <div className="border-r border-stone-200/60 py-1 flex flex-col justify-center items-center">
                        <span className="text-lg font-semibold font-mono text-stone-900 flex items-center gap-1 text-slate-600">
                          <GitFork className="w-4 h-4" />
                          {repoData.forks_count?.toLocaleString() || "148"}
                        </span>
                        <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest mt-0.5">Forks</span>
                      </div>

                      <div className="border-r border-stone-200/60 py-1 flex flex-col justify-center items-center">
                        <span className="text-lg font-semibold font-mono text-stone-900 flex items-center gap-1 text-rose-500">
                          <Terminal className="w-4 h-4" />
                          {repoData.open_issues_count?.toLocaleString() || "5"}
                        </span>
                        <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest mt-0.5">Issues Abiertos</span>
                      </div>

                      <div className="py-1 flex flex-col justify-center items-center">
                        <span className="text-[12px] font-bold font-mono text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-sm">
                          {repoData.language || "JavaScript"}
                        </span>
                        <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest mt-1.5">Lenguaje Base</span>
                      </div>
                    </div>

                    {/* Navigation tabs for code explorer */}
                    <div className="flex bg-stone-50 border-b border-stone-200 px-6 overflow-x-auto">
                      <button 
                        onClick={() => setGithubTab("overview")}
                        className={`py-3 text-[11px] font-mono uppercase tracking-wider border-b-2 mr-6 transition-all whitespace-nowrap ${githubTab === "overview" ? "border-indigo-600 text-indigo-600 font-bold" : "border-transparent text-stone-400 hover:text-black"}`}
                      >
                        Planos Arquitectónicos (Vite / Three.js)
                      </button>
                      <button 
                        onClick={() => setGithubTab("explorer")}
                        className={`py-3 text-[11px] font-mono uppercase tracking-wider border-b-2 mr-6 transition-all whitespace-nowrap ${githubTab === "explorer" ? "border-indigo-600 text-indigo-600 font-bold" : "border-transparent text-stone-400 hover:text-black"}`}
                      >
                        Explorador de Archivos ({repoFiles.length})
                      </button>
                      <button 
                        onClick={() => setGithubTab("activity")}
                        className={`py-3 text-[11px] font-mono uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${githubTab === "activity" ? "border-indigo-600 text-indigo-600 font-bold" : "border-transparent text-stone-400 hover:text-black"}`}
                      >
                        Últimos Commits ({repoCommits.length})
                      </button>
                    </div>

                    {/* Tab Panels */}
                    <div className="p-6 bg-white min-h-[200px]">
                      
                      {/* Sub-tab 1: Overview */}
                      {githubTab === "overview" && (
                        <div className="space-y-4 animate-fade-in text-left">
                          <div className="border-l-2 border-indigo-500 pl-4 space-y-2">
                            <h4 className="text-xs font-mono uppercase tracking-widest font-bold text-[#111111]">Análisis Técnico del Repositorio</h4>
                            <p className="text-[13px] text-stone-600 font-light leading-relaxed">
                              La estructura de <strong>virtual-art-gallery</strong> expone un bucle clásico de Three.js. El punto de entrada inicial es el archivo <code className="bg-stone-100 font-mono text-xs px-1 py-0.5 text-stone-800 rounded-sm">index.html</code>, el cual inicializa un canvas tridimensional sobre el cual se monta la perspectiva de la cámara con controles tipo FPS (First-Person Shooter) basados en el ratón y teclado. Las colisiones se evalúan en tiempo real mediante bounding-boxes elementales para evitar que el espectador atraviese los muros que exhiben las pinturas.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="bg-stone-50 border border-stone-200 p-4 rounded-sm">
                              <span className="text-[9px] font-mono text-stone-400 uppercase">Clonación Local (Git)</span>
                              <div className="mt-1 flex items-center">
                                <input 
                                  type="text" 
                                  readOnly 
                                  value="git clone https://github.com/ClementCariou/virtual-art-gallery.git"
                                  className="w-full bg-white border border-stone-200 text-[10px] font-mono px-2.5 py-1 text-stone-700 rounded-sm focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="bg-stone-50 border border-stone-200 p-4 rounded-sm">
                              <span className="text-[9px] font-mono text-stone-400 uppercase">Instalación e Inicio</span>
                              <code className="block mt-1 font-mono text-[10px] text-indigo-600">
                                npm install && npm run dev
                              </code>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Sub-tab 2: File Explorer */}
                      {githubTab === "explorer" && (
                        <div className="space-y-3 animate-fade-in text-left">
                          <span className="text-[9px] font-mono text-stone-400 uppercase block">Archivos en la rama principal</span>
                          
                          {repoFiles.length > 0 ? (
                            <div className="border border-stone-200 rounded-sm overflow-hidden divide-y divide-stone-100">
                              {repoFiles.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 hover:bg-stone-50 transition-colors">
                                  <div className="flex items-center space-x-2.5">
                                    {file.type === "dir" ? (
                                      <Folder className="w-4 h-4 text-amber-500 fill-amber-100" />
                                    ) : (
                                      <File className="w-4 h-4 text-stone-400" />
                                    )}
                                    <span className="text-[12px] font-mono text-stone-800">{file.name}</span>
                                  </div>

                                  <div className="text-[10px] font-mono text-stone-400">
                                    {file.type === "dir" ? (
                                      <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-sm text-[8px] uppercase font-bold">directorio</span>
                                    ) : (
                                      <span>{file.size ? `${(file.size / 1024).toFixed(1)} KB` : "archivo"}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-stone-400 text-xs font-mono">
                              No se encontraron archivos en este directorio o la API requiere autenticación.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Sub-tab 3: Commits Activity */}
                      {githubTab === "activity" && (
                        <div className="space-y-6 animate-fade-in text-left">
                          <span className="text-[9px] font-mono text-stone-400 uppercase block">Bitácora de Sincronización Reciente (Git Commits)</span>
                          
                          {repoCommits.length > 0 ? (
                            <div className="relative border-l border-stone-200 pl-4 space-y-6 ml-2">
                              {repoCommits.map((cmt, idx) => {
                                const commitMsg = cmt.commit?.message || "Sin mensaje";
                                const authorName = cmt.commit?.author?.name || "Clement Cariou";
                                const commitDate = cmt.commit?.author?.date 
                                  ? new Date(cmt.commit.author.date).toLocaleDateString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) 
                                  : "Reciente";

                                return (
                                  <div key={idx} className="relative group">
                                    <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-stone-300 group-hover:bg-indigo-600 transition-colors"></div>
                                    
                                    <div className="space-y-1">
                                      <div className="flex items-center space-x-2 text-[10px] font-mono text-stone-400">
                                        <span className="text-stone-700 font-bold">{authorName}</span>
                                        <span>•</span>
                                        <span>{commitDate}</span>
                                        <span>•</span>
                                        <span className="text-indigo-600 font-mono text-[9px] bg-indigo-50 px-1 rounded-sm">{cmt.sha?.substring(0, 7)}</span>
                                      </div>
                                      <p className="text-[12px] text-stone-700 font-light font-mono leading-relaxed bg-stone-50/50 p-2 border border-stone-100 rounded-sm">
                                        {commitMsg}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-stone-400 text-xs font-mono">
                              No se encontraron commits recientes en la rama principal.
                            </div>
                          )}
                        </div>
                      )}

                    </div>

                  </div>
                )}

              </div>
            </div>

          </div>
        )}

        {/* TAB 4: LOOKBOOK */}
        {activeTab === "lookbook" && (
          <div className="space-y-10 animate-fade-in">
            <div className="pb-4 border-b border-[#EEEEEE]">
              <span className="text-[10px] text-[#999999] uppercase tracking-widest block mb-1 font-mono">Moda Digital y Estética</span>
              <h2 className="text-3xl font-light tracking-tight text-[#111111]">Digital Lookbook</h2>
              <p className="text-[12px] text-stone-500 font-light mt-1">Exploraciones de prendas inteligentes de costura virtual, polígonos fluidos y texturas adaptativas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {lookbook.map((outfit) => (
                <div 
                  key={outfit.id}
                  onClick={() => setSelectedOutfit(selectedOutfit === outfit.id ? null : outfit.id)}
                  className={`border border-[#EEEEEE] p-6 rounded-sm cursor-pointer transition-all hover:shadow-md ${outfit.glow} flex flex-col justify-between`}
                >
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      {outfit.tags.map((tag, idx) => (
                        <span key={idx} className="text-[9px] font-mono px-2 py-0.5 bg-white/80 border border-black/5 text-[#555] rounded-full uppercase">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="space-y-1 pt-2">
                      <h3 className="text-lg font-light tracking-tight text-[#111111]">
                        {outfit.name}
                      </h3>
                      <p className="text-[11px] font-mono text-[#888888]">ID_RENDER: 00{outfit.id}_A</p>
                    </div>

                    <p className="text-[12px] text-stone-600 leading-relaxed font-light">
                      {outfit.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between text-[10px] font-mono text-[#999999]">
                    <span>Haga clic para expandir</span>
                    <Camera className="w-3.5 h-3.5 text-stone-400" />
                  </div>
                </div>
              ))}
            </div>

            {selectedOutfit && (
              <div className="p-6 bg-[#FAF9F6] border border-black/5 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in">
                <div className="space-y-2">
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-indigo-600 font-bold">Concepto de Outfit Ampliado</span>
                  <h4 className="text-lg font-medium text-[#111111]">Tejido Digital y Física Aeroespacial</h4>
                  <p className="text-[12px] text-stone-600 font-light max-w-xl">
                    Cada prenda virtual creada para Lola se exporta con scripts de colisiones y dinámicas de telas avanzadas para plataformas de realidad extendida (XR) y mundos espejo. Las mallas se adaptan dinámicamente a avatares de cualquier topología molecular.
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedOutfit(null)}
                  className="px-4 py-2 bg-white hover:bg-black border border-black/10 hover:text-white rounded-sm text-[10px] uppercase tracking-wider font-mono transition-all"
                >
                  Cerrar Vista
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: COLABORACIONES */}
        {activeTab === "collabs" && (
          <div className="space-y-10 animate-fade-in">
            <div className="pb-4 border-b border-[#EEEEEE]">
              <span className="text-[10px] text-[#999999] uppercase tracking-widest block mb-1 font-mono">Brand Partnerships</span>
              <h2 className="text-3xl font-light tracking-tight text-[#111111]">Marcas y Alianzas Digitales</h2>
              <p className="text-[12px] text-stone-500 font-light mt-1">Colaboraciones con marcas que construyen la estética del futuro híbrido.</p>
            </div>

            <div className="space-y-4">
              {collaborations.map((collab, idx) => (
                <div key={idx} className="border border-[#EEEEEE] p-5 rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-stone-50/50 transition-colors">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[#FAF9F6] border border-stone-200 text-[#555] rounded-sm font-semibold">
                      {collab.brand}
                    </span>
                    <h3 className="text-base font-medium text-[#111111] pt-1">{collab.campaign}</h3>
                    <p className="text-[12px] text-stone-500 font-light">{collab.deliverable}</p>
                  </div>
                  
                  <span className={`px-2.5 py-1 text-[9px] uppercase tracking-widest font-mono font-bold rounded-sm border ${collab.status === "Activa" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-stone-100 text-stone-500 border-stone-200"}`}>
                    {collab.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Media Kit Contact Form */}
            <div className="bg-[#FAF9F6] border border-[#EEEEEE] p-8 rounded-sm">
              <h3 className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#111111] mb-2 font-bold">Formulario de Contacto / Media Kit</h3>
              <p className="text-[12px] text-stone-600 font-light mb-6">
                ¿Tu marca desea colaborar con Lola Work en proyectos de arte interactivo, modelado virtual, desfiles digitales o reseñas críticas? Envíanos una propuesta técnica.
              </p>
              
              <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-stone-500 tracking-wider">Nombre de la Marca</label>
                  <input type="text" placeholder="Ej. CyberFashion Studio" className="w-full px-3 py-2 border border-[#EEEEEE] bg-white text-[12px] focus:outline-none focus:border-black rounded-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-stone-500 tracking-wider">Email de Contacto</label>
                  <input type="email" placeholder="Ej. marketing@brand.com" className="w-full px-3 py-2 border border-[#EEEEEE] bg-white text-[12px] focus:outline-none focus:border-black rounded-sm" />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[9px] font-mono uppercase text-stone-500 tracking-wider">Propuesta del Proyecto</label>
                  <textarea rows={3} placeholder="Describe el concepto de tu campaña o exhibición virtual..." className="w-full px-3 py-2 border border-[#EEEEEE] bg-white text-[12px] focus:outline-none focus:border-black rounded-sm resize-none"></textarea>
                </div>
                <div className="md:col-span-2">
                  <button type="submit" disabled className="w-full py-3 bg-[#111111] text-white text-[10px] uppercase tracking-wider font-mono font-semibold rounded-sm opacity-60 cursor-not-allowed">
                    Enviar Propuesta (Módulo de Pruebas de Diseño)
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Interactive Footer */}
      <footer className="border-t border-[#EEEEEE] bg-[#FAF9F6] py-12 text-center text-stone-400 text-[11px] font-mono">
        <div className="max-w-4xl mx-auto px-6 space-y-4">
          <div className="flex items-center justify-center space-x-2 text-stone-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Diseño de Interfaz Frontend de Lola Work</span>
          </div>
          <p className="font-light text-stone-500 max-w-md mx-auto">
            Este frontend simula de manera fidedigna la web pública del avatar digital de Lola, mostrando sus monografías, ciberbitácora y estilo de vida on-chain.
          </p>
          <div className="flex justify-center space-x-6 text-[10px] pt-4">
            <button onClick={onGoToAdmin} className="text-[#111111] font-semibold hover:underline flex items-center space-x-1">
              <Cpu className="w-3 h-3" />
              <span>Acceder al Panel de Control</span>
            </button>
            <span>•</span>
            <span className="text-stone-400">Versión de Producción: 2026.1</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
