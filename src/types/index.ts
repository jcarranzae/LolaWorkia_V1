export type UserRole = 'member' | 'admin';

export interface User {
  id: string;
  uid?: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  subscribedSince?: string;
  plan?: 'Free' | 'VIP Club' | 'Pro Creator';
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  readTime: string;
  imageUrl: string;
  imageAlt?: string;
  isExclusive: boolean;
  author: {
    name: string;
    avatar: string;
  };
  likes: number;
  commentsCount: number;

  // SEO Optimization Fields (Buscadores Google/Bing)
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  canonicalUrl?: string;
  schemaType?: 'BlogPosting' | 'TechArticle' | 'HowTo' | 'Review' | 'FAQPage';

  // AI & GEO Optimization Fields (ChatGPT, Perplexity, Gemini, AI Overviews)
  aiSummary?: string;
  keyTakeaways?: string;
  faqItems?: FAQItem[];
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  aspectRatio?: 'portrait' | 'landscape' | 'square';
  isExclusive: boolean;
  location?: string;
  cameraInfo?: string;
  likes: number;
  date: string;
}

export interface Gallery3DArtwork {
  id: string;
  title: string;
  roomId: string;
  roomName?: string;
  artist: string;
  year: string;
  medium: string;
  imageUrl: string;
  analysis: string;
  palette: string[];
  isExclusive?: boolean;
  priceEth?: string;
  editionSize?: string;
  createdAt?: string;
}

export interface VirtualRoom {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  atmosphere: string;
  bgGradient?: string;
}

export interface PresetProduct {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  discountPrice?: number;
  category: 'Lightroom' | 'Merchandise' | 'E-Book' | 'LUTs';
  rating: number;
  reviewsCount: number;
  beforeImage: string;
  afterImage: string;
  features: string[];
  isExclusiveVipFree?: boolean;
}

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  date: string;
  isVipBadge?: boolean;
}

export interface ContactSubmission {
  type: 'pr' | 'fan';
  name: string;
  email: string;
  brandOrCompany?: string;
  budget?: string;
  message: string;
}
