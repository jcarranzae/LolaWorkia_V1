import React, { useMemo, useState } from 'react';
import Markdown from 'react-markdown';
import { List, Check, Copy, Sparkles, BookOpen } from 'lucide-react';

interface ArticleRendererProps {
  content: string;
  className?: string;
  showTableOfContents?: boolean;
  allowCopyHtml?: boolean;
}

interface TocItem {
  id: string;
  title: string;
}

export default function ArticleRenderer({
  content,
  className = '',
  showTableOfContents = true,
  allowCopyHtml = false,
}: ArticleRendererProps) {
  const [copied, setCopied] = useState(false);

  // Clean and prepare HTML or Markdown content
  const { cleanContent, isHtml, tocItems } = useMemo(() => {
    if (!content) return { cleanContent: '', isHtml: false, tocItems: [] };

    // Strip markdown code fences if wrapped (e.g. ```html ... ```)
    let processed = content.trim();
    if (processed.startsWith('```html')) {
      processed = processed.replace(/^```html\s*/i, '').replace(/```\s*$/, '');
    } else if (processed.startsWith('```')) {
      processed = processed.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }

    // Detect if content contains HTML tags
    const htmlRegex = /<(article|section|h2|h3|p|div|blockquote|ul|ol|table|figure)[^>]*>/i;
    const detectedHtml = htmlRegex.test(processed);

    // Extract table of contents (TOC) from H2 elements or Markdown ## headers
    const toc: TocItem[] = [];

    if (detectedHtml) {
      // Extract from HTML <h2> tags
      const h2Regex = /<h2(?:\s+id="([^"]*)")?[^>]*>(.*?)<\/h2>/gi;
      let match;
      let index = 0;
      while ((match = h2Regex.exec(processed)) !== null) {
        const rawTitle = match[2].replace(/<[^>]+>/g, '').trim();
        const id = match[1] || `section-${index}-${rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        toc.push({ id, title: rawTitle });
        index++;
      }
    } else {
      // Extract from Markdown ## headers
      const mdH2Regex = /^##\s+(.+)$/gm;
      let match;
      let index = 0;
      while ((match = mdH2Regex.exec(processed)) !== null) {
        const rawTitle = match[1].replace(/[*_`]/g, '').trim();
        const id = `section-${index}-${rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        toc.push({ id, title: rawTitle });
        index++;
      }
    }

    return { cleanContent: processed, isHtml: detectedHtml, tocItems: toc };
  }, [content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!cleanContent) return null;

  return (
    <div className={`article-renderer-wrapper ${className}`}>
      {/* Optional Copy Action bar */}
      {allowCopyHtml && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.2rem' }}>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              color: 'var(--neon-cyan)',
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'HTML Copiado' : 'Copiar Formato HTML'}
          </button>
        </div>
      )}

      {/* Table of Contents for Long-form SEO Reading */}
      {showTableOfContents && tocItems.length > 1 && (
        <nav aria-label="Tabla de Contenidos" className="monografia-toc">
          <div className="monografia-toc-title">
            <List size={16} /> Índice de la Monografía
          </div>
          <ul className="monografia-toc-list">
            {tocItems.map((item, idx) => (
              <li key={idx}>
                <a
                  href={`#${item.id}`}
                  className="monografia-toc-link"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(item.id);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                >
                  <span style={{ color: 'var(--neon-cyan)', fontSize: '0.75rem' }}>◈</span>
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Render HTML or Markdown */}
      {isHtml ? (
        <div
          className="monografia-container blog-article-body"
          dangerouslySetInnerHTML={{ __html: cleanContent }}
        />
      ) : (
        <div className="monografia-container blog-article-body">
          <Markdown>{cleanContent}</Markdown>
        </div>
      )}
    </div>
  );
}
