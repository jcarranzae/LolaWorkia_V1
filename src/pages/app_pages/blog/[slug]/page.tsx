'use client';

import React, { useState } from 'react';
import { Link, useNavigation } from '@/context/NavigationContext';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/Icons';
import { Comment } from '@/types';
import { Lock, Heart, ArrowRight, MessageSquare, Sparkles, BookOpen, Key } from 'lucide-react';
import ArticleRenderer from '@/components/ArticleRenderer';

export default function SingleBlogPostPage({ slug }: { slug?: string }) {
  const { selectedBlogSlug } = useNavigation();
  const activeSlug = slug || selectedBlogSlug || 'fotografia-editorial-2026';
  const { blogPosts, user } = useAuth();
  const [likes, setLikes] = useState(482);
  const [hasLiked, setHasLiked] = useState(false);
  const [newComment, setNewComment] = useState('');

  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'c1',
      authorName: 'Dr. Alexis Vance',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      content: 'The theoretical parallels between generative latent noise and glitch bio-structures are profound.',
      date: '2 hours ago',
      isVipBadge: true,
    },
    {
      id: 'c2',
      authorName: 'Kaelen Sol',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      content: 'Inspiring curatorial perspective. The WebXR integration elevates the entire discourse.',
      date: '1 day ago',
    },
  ]);

  const post = blogPosts.find((p) => p.slug === activeSlug) || blogPosts[0];
  const isLocked = post.isExclusive && !user;

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(likes + 1);
      setHasLiked(true);
    } else {
      setLikes(likes - 1);
      setHasLiked(false);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const added: Comment = {
      id: `c-${Date.now()}`,
      authorName: user ? user.name : 'Anonymous Peer Node',
      authorAvatar: user?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
      content: newComment,
      date: 'Just now',
      isVipBadge: user ? user.role === 'member' || user.role === 'admin' : false,
    };

    setComments([added, ...comments]);
    setNewComment('');
  };

  // Structured Data Schema.org for Academic Cyberart SEO & Google AI Overviews
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': post.schemaType || 'ScholarlyArticle',
    headline: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    image: [post.imageUrl],
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    ...(post.keywords ? { keywords: post.keywords } : {}),
    ...(post.canonicalUrl ? { mainEntityOfPage: post.canonicalUrl } : {}),
  };

  return (
    <article className="container" style={{ paddingTop: '3rem', maxWidth: '880px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      {/* Back to Magazine */}
      <Link
        href="/blog"
        className="mono-meta"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--neon-cyan)',
          fontSize: '0.85rem',
          marginBottom: '2.5rem',
        }}
      >
        <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back to Magazine Dispatches
      </Link>

      {/* Header Info */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
          <span className="badge badge-cyan">{post.category}</span>
          {post.isExclusive ? (
            <span className="badge badge-magenta"><Lock size={12} /> PATRON TREATISE</span>
          ) : (
            <span className="badge badge-indigo">OPEN ACCESS</span>
          )}
          <span className="mono-meta" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{post.readTime}</span>
        </div>

        <h1 className="heading-display" style={{ fontSize: '2.4rem', marginBottom: '1.5rem', lineHeight: '1.2' }}>
          {post.title}
        </h1>

        {/* Author Bio Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', padding: '1.2rem 0' }}>
          <img
            src={post.author.avatar}
            alt={post.author.name}
            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--neon-cyan)' }}
          />
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{post.author.name}</div>
            <div className="mono-meta" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dispatched on {post.date}</div>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div style={{ marginBottom: '3rem' }}>
        <img
          src={post.imageUrl}
          alt={post.imageAlt || post.title}
          referrerPolicy="no-referrer"
          style={{
            width: '100%',
            height: '420px',
            objectFit: 'cover',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-glow)',
          }}
        />
      </div>

      {/* AI Summary / Curatorial Abstract Box (DESIGN.md §3) */}
      {post.aiSummary && !isLocked && (
        <div
          style={{
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid var(--border-glow)',
            borderRadius: 'var(--radius-md)',
            padding: '1.8rem',
            marginBottom: '2.8rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--neon-cyan)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.6rem' }} className="mono-meta">
            <Sparkles size={16} /> CURATORIAL EXECUTIVE ABSTRACT (GEO GROUNDING)
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.65', margin: 0 }}>
            {post.aiSummary}
          </p>
        </div>
      )}

      {/* Post Content */}
      <div className="glass-panel" style={{ padding: '3.2rem 2.8rem', position: 'relative', border: '1px solid var(--border-subtle)' }}>
        {isLocked ? (
          <div>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
              {post.excerpt}
            </p>

            {/* VIP Locked Overlay Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.25) 0%, rgba(8, 9, 14, 0.98) 100%)',
                border: '1px solid var(--border-glow)',
                borderRadius: 'var(--radius-md)',
                padding: '3.5rem 2rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: 'var(--neon-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.4rem auto',
                  border: '1px solid var(--border-glow)',
                }}
              >
                <Lock size={28} />
              </div>

              <h3 className="heading-card" style={{ marginBottom: '0.8rem', fontSize: '1.5rem' }}>
                PATRON-ONLY THEORETICAL TREATISE
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 2rem auto', lineHeight: '1.65' }}>
                Authenticate your collector credentials or patron pass to unlock the complete unredacted curatorial analysis.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <Link href="/login" className="btn-cyan">
                  <Key size={16} /> Authenticate Patron Pass
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '1.05rem', lineHeight: '1.95', color: 'var(--text-primary)' }}>
            <ArticleRenderer content={post.content} showTableOfContents={true} allowCopyHtml={false} />

            {/* Key Takeaways Box */}
            {post.keyTakeaways && (
              <div
                style={{
                  marginTop: '3.5rem',
                  padding: '1.8rem 2rem',
                  background: 'rgba(79, 70, 229, 0.1)',
                  borderLeft: '4px solid var(--neon-cyan)',
                  borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                }}
              >
                <div className="mono-meta" style={{ color: 'var(--neon-cyan)', marginBottom: '0.6rem' }}>
                  KEY CURATORIAL THESES & TAKEAWAYS
                </div>
                <div style={{ whiteSpace: 'pre-line', fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.65' }}>
                  {post.keyTakeaways}
                </div>
              </div>
            )}

            {/* Like & Share Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '3.5rem',
                paddingTop: '2rem',
                borderTop: '1px solid var(--border-subtle)',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <button
                onClick={handleLike}
                className={hasLiked ? 'btn-magenta' : 'btn-secondary'}
                style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem' }}
              >
                <Heart size={18} fill={hasLiked ? 'currentColor' : 'none'} />
                Endorse Essay ({likes})
              </button>

              <div className="mono-meta" style={{ color: 'var(--text-muted)' }}>
                DISCOURSE TAG: <strong style={{ color: 'var(--neon-cyan)' }}>#LolaWorkiaCyberart</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Peer Comments Section */}
      {!isLocked && (
        <section style={{ marginTop: '4rem' }}>
          <h3 className="heading-section" style={{ fontSize: '1.4rem', marginBottom: '2rem' }}>
            Peer Critical Dialogue ({comments.length})
          </h3>

          <form onSubmit={handleAddComment} style={{ marginBottom: '2.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border-subtle)' }}>
              <textarea
                placeholder="Contribute your critique or theoretical response..."
                className="input-field"
                style={{ minHeight: '100px', resize: 'vertical' }}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-cyan" style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem' }}>
                  Submit Critique
                </button>
              </div>
            </div>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
            {comments.map((comment) => (
              <div key={comment.id} className="glass-panel" style={{ padding: '1.6rem', display: 'flex', gap: '1.2rem', border: '1px solid var(--border-subtle)' }}>
                <img
                  src={comment.authorAvatar}
                  alt={comment.authorName}
                  style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--neon-cyan)' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    <strong style={{ fontSize: '0.95rem', fontFamily: 'var(--font-heading)' }}>{comment.authorName}</strong>
                    {comment.isVipBadge && <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>PATRON</span>}
                    <span className="mono-meta" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{comment.date}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
