import React, { useEffect } from 'react';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  jsonLd?: object | object[];
}

const DEFAULT_TITLE = 'Lola Workia — Ciberarte, Galería Virtual & Revista de Vanguardia Digital';
const DEFAULT_DESCRIPTION = 'Revista de vanguardia, ensayos críticos sobre estética post-digital, arte generativo, WebXR y fotografía editorial por Lola Workia.';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80';
const SITE_NAME = 'Lola Workia';

function setOrUpdateMeta(selector: string, attr: string, value: string, createTag: () => HTMLElement) {
  let element = document.head.querySelector(selector) as HTMLElement | null;
  if (!element && value) {
    element = createTag();
    document.head.appendChild(element);
  }
  if (element) {
    if (value) {
      element.setAttribute(attr, value);
    } else {
      element.remove();
    }
  }
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  canonicalUrl,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  author = 'Lola Workia',
  publishedTime,
  modifiedTime,
  jsonLd,
}) => {
  useEffect(() => {
    // 1. Document Title
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    document.title = fullTitle;

    // 2. Standard Meta Description
    setOrUpdateMeta('meta[name="description"]', 'content', description, () => {
      const meta = document.createElement('meta');
      meta.name = 'description';
      return meta;
    });

    // 3. Keywords
    if (keywords) {
      setOrUpdateMeta('meta[name="keywords"]', 'content', keywords, () => {
        const meta = document.createElement('meta');
        meta.name = 'keywords';
        return meta;
      });
    }

    // 4. Canonical URL
    const finalCanonical = canonicalUrl || (typeof window !== 'undefined' ? window.location.href.split('#')[0] : '');
    setOrUpdateMeta('link[rel="canonical"]', 'href', finalCanonical, () => {
      const link = document.createElement('link');
      link.rel = 'canonical';
      return link;
    });

    // 5. Open Graph Meta Tags
    setOrUpdateMeta('meta[property="og:title"]', 'content', fullTitle, () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:title');
      return meta;
    });

    setOrUpdateMeta('meta[property="og:description"]', 'content', description, () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:description');
      return meta;
    });

    setOrUpdateMeta('meta[property="og:image"]', 'content', ogImage, () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:image');
      return meta;
    });

    setOrUpdateMeta('meta[property="og:url"]', 'content', finalCanonical, () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:url');
      return meta;
    });

    setOrUpdateMeta('meta[property="og:type"]', 'content', ogType, () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:type');
      return meta;
    });

    setOrUpdateMeta('meta[property="og:site_name"]', 'content', SITE_NAME, () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:site_name');
      return meta;
    });

    setOrUpdateMeta('meta[property="og:locale"]', 'content', 'es_ES', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:locale');
      return meta;
    });

    // 6. Article-specific OG tags
    if (ogType === 'article') {
      if (author) {
        setOrUpdateMeta('meta[property="article:author"]', 'content', author, () => {
          const meta = document.createElement('meta');
          meta.setAttribute('property', 'article:author');
          return meta;
        });
      }
      if (publishedTime) {
        setOrUpdateMeta('meta[property="article:published_time"]', 'content', publishedTime, () => {
          const meta = document.createElement('meta');
          meta.setAttribute('property', 'article:published_time');
          return meta;
        });
      }
      if (modifiedTime) {
        setOrUpdateMeta('meta[property="article:modified_time"]', 'content', modifiedTime, () => {
          const meta = document.createElement('meta');
          meta.setAttribute('property', 'article:modified_time');
          return meta;
        });
      }
    }

    // 7. Twitter Card Meta Tags
    setOrUpdateMeta('meta[name="twitter:card"]', 'content', 'summary_large_image', () => {
      const meta = document.createElement('meta');
      meta.name = 'twitter:card';
      return meta;
    });

    setOrUpdateMeta('meta[name="twitter:title"]', 'content', fullTitle, () => {
      const meta = document.createElement('meta');
      meta.name = 'twitter:title';
      return meta;
    });

    setOrUpdateMeta('meta[name="twitter:description"]', 'content', description, () => {
      const meta = document.createElement('meta');
      meta.name = 'twitter:description';
      return meta;
    });

    setOrUpdateMeta('meta[name="twitter:image"]', 'content', ogImage, () => {
      const meta = document.createElement('meta');
      meta.name = 'twitter:image';
      return meta;
    });

    // 8. JSON-LD Dynamic Injection
    const SCRIPT_ID = 'seo-dynamic-jsonld';
    let scriptTag = document.head.querySelector(`#${SCRIPT_ID}`) as HTMLScriptElement | null;
    if (jsonLd) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = SCRIPT_ID;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLd);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Cleanup custom JSON-LD on unmount
      const existingScript = document.head.querySelector(`#${SCRIPT_ID}`);
      if (existingScript) existingScript.remove();
    };
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, author, publishedTime, modifiedTime, jsonLd]);

  return null;
};

export default SEOHead;
