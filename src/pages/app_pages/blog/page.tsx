'use client';

import React, { useState } from 'react';
import { Link } from '@/context/NavigationContext';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/Icons';
import { SEOHead } from '@/components/SEOHead';

export default function BlogListPage() {
  const { blogPosts, user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const blogCollectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': 'https://lolaworkia.com/blog#collection',
    name: 'Cyberart Dispatches — Lola Workia Magazine',
    description: 'Ensayos críticos, tratados teóricos e investigaciones curatoriales sobre estética post-digital, algoritmos generativos y ciberarte.',
    url: 'https://lolaworkia.com/blog',
    inLanguage: 'es-ES',
    publisher: {
      '@type': 'Organization',
      name: 'Lola Workia',
      url: 'https://lolaworkia.com',
    },
    blogPost: blogPosts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `https://lolaworkia.com/blog/${p.slug}`,
      datePublished: p.date,
      image: p.imageUrl,
    })),
  };

  const vanguardCategories = [
    'All',
    'Generative AI',
    'Net Art',
    'Post-Digital',
    'Glitch Aesthetics',
    'WebXR & Metaverse',
    'Patron Only'
  ];

  const filteredPosts = blogPosts.filter((post) => {
    let matchesCategory = true;
    if (selectedCategory === 'Patron Only') {
      matchesCategory = post.isExclusive === true;
    } else if (selectedCategory !== 'All') {
      matchesCategory = post.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                        selectedCategory.toLowerCase().includes(post.category.toLowerCase());
    }

    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container" style={{ paddingTop: '3rem' }}>
      <SEOHead
        title="Cyberart Dispatches & Revista de Vanguardia"
        description="Ensayos críticos, tratados teóricos e investigaciones curatoriales sobre estética post-digital, algoritmos generativos, WebXR y fotografía por Lola Workia."
        canonicalUrl="https://lolaworkia.com/blog"
        ogType="website"
        jsonLd={blogCollectionSchema}
      />
      
      {/* Page Header (DESIGN.md §3 /magazine) */}
      <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 3.8rem auto' }}>
        <span className="badge badge-violet" style={{ marginBottom: '1rem' }}>
          <Icons.FileText size={14} /> Vanguard Magazine & Critical Discourse
        </span>
        <h1 className="heading-display" style={{ marginBottom: '1rem' }}>
          CYBERART <span className="gradient-text-cyber">DISPATCHES</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.65' }}>
          Critical essays, theoretical treatises, and curatorial investigations exploring post-digital aesthetics, generative algorithms, and bio-digitalism.
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1.2rem 1.6rem',
          marginBottom: '3rem',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.2rem',
          border: '1px solid var(--border-glow)',
        }}
      >
        {/* Category Pills conforming to DESIGN.md §3 */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {vanguardCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? 'btn-cyan' : 'btn-secondary'}
              style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
            >
              {cat === 'Patron Only' && <Icons.Lock size={12} style={{ marginRight: '4px' }} />}
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '280px' }}>
          <Icons.Search
            size={16}
            color="var(--neon-cyan)"
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search theoretical essays..."
            className="input-field"
            style={{ paddingLeft: '2.5rem', fontSize: '0.88rem' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Blog Cards Grid */}
      {filteredPosts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Icons.Search size={36} style={{ marginBottom: '1rem', color: 'var(--neon-cyan)' }} />
          <h3 className="heading-card">No Curatorial Papers Found</h3>
          <p style={{ marginTop: '0.4rem', color: 'var(--text-muted)' }}>Try adjusting your search criteria or select another vanguard category.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '2.2rem' }}>
          {filteredPosts.map((post) => {
            const isLocked = post.isExclusive && !user;

            return (
              <div
                key={post.id}
                className="glass-panel"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {/* Post Image with scanline accent */}
                <div
                  style={{
                    height: '240px',
                    backgroundImage: `url(${post.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                  }}
                >
                  {post.isExclusive ? (
                    <span className="badge badge-magenta" style={{ position: 'absolute', top: '15px', right: '15px' }}>
                      <Icons.Lock size={12} /> PATRON ESSAY
                    </span>
                  ) : (
                    <span className="badge badge-cyan" style={{ position: 'absolute', top: '15px', right: '15px' }}>
                      OPEN DISCOURSE
                    </span>
                  )}
                </div>

                {/* Post Body */}
                <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        color: 'var(--neon-cyan)',
                        marginBottom: '0.8rem',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      <span className="badge badge-indigo" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>{post.category}</span>
                      <span>{post.readTime}</span>
                    </div>

                    <h2 className="heading-card" style={{ marginBottom: '0.8rem', lineHeight: '1.3' }}>
                      {post.title}
                    </h2>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                      {post.excerpt}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--neon-cyan)' }}
                      />
                      <span className="mono-meta" style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{post.date}</span>
                    </div>

                    <Link
                      href={`/blog/${post.slug}`}
                      className={isLocked ? 'btn-magenta' : 'btn-cyan'}
                      style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
                    >
                      {isLocked ? (
                        <>
                          <Icons.Lock size={13} /> Unlock Paper
                        </>
                      ) : (
                        <>
                          Read Essay <Icons.ArrowRight size={13} />
                        </>
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
