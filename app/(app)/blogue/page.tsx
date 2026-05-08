'use client';

import { useState, useEffect } from 'react';
import { useBlogArticles, usePublishBlog } from '@/lib/hooks/useBlogArticles';
import { PlusIcon, ArrowTopRightOnSquareIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import BlogEditor from '@/components/features/blog/BlogEditor';

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const months = ['jan', 'fev', 'mar', 'avr', 'mai', 'jun', 'jul', 'aou', 'sep', 'oct', 'nov', 'dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function BloguePage() {
  const { posts, loading, refresh } = useBlogArticles();
  const { publish, loading: publishing } = usePublishBlog();
  const [showEditor, setShowEditor] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Auto-open editor if there's a pending draft with content or exported images
  useEffect(() => {
    const hasExport = !!localStorage.getItem('editor-export-blog');
    const draft = localStorage.getItem('blog-editor-draft');
    const hasDraft = draft ? (() => { try { const d = JSON.parse(draft); return !!(d.title || d.htmlContent); } catch { return false; } })() : false;
    if (hasExport || hasDraft) setShowEditor(true);
  }, []);

  if (showEditor) {
    return (
      <BlogEditor
        publishing={publishing}
        onCancel={() => setShowEditor(false)}
        onPublish={async (article) => {
          const result = await publish(article);
          if (result) {
            setShowEditor(false);
            setSuccess(result.reviewUrl || '/contenu');
            refresh();
            setTimeout(() => setSuccess(null), 8000);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-sand pb-24">
      <header className="sticky top-0 z-10 px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-3">
        <BookOpenIcon className="w-5 h-5 text-sage" />
        <h1 className="text-lg font-semibold text-sage flex-1">Blogue</h1>
        <button onClick={() => setShowEditor(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sage text-white">
          <PlusIcon className="w-4 h-4" /> Nouvel article
        </button>
      </header>

      <div className="px-4 pt-4 space-y-3">
        {success && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p className="text-sm text-amber-700 font-medium">Article soumis pour review</p>
            <a href={success}
              className="flex items-center gap-1 text-xs text-amber-600 mt-1">
              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" /> Voir dans le Hub
            </a>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-sage/30 border-t-sage rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <BookOpenIcon className="w-12 h-12 text-sage/40 mb-4" />
            <h2 className="text-base font-semibold text-gray-900 mb-1">Aucun article</h2>
            <p className="text-sm text-gray-400 text-center">
              Ecris ton premier article de blog pour attirer des visiteurs sur ton site.
            </p>
          </div>
        ) : (
          posts.map(post => (
            <a key={post.id} href={post.url || '#'} target="_blank" rel="noopener noreferrer"
              className="bg-white rounded-xl p-3 flex items-center gap-3 active:bg-gray-50 transition">
              {/* Thumbnail */}
              {post.coverImage ? (
                <img src={post.coverImage} alt="" className="w-12 h-12 object-cover rounded-lg shrink-0" />
              ) : (
                <div className="w-12 h-12 bg-sage/10 rounded-lg shrink-0 flex items-center justify-center">
                  <BookOpenIcon className="w-5 h-5 text-sage/40" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">{post.title}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-gray-400">
                    Publie {formatDate(post.firstPublishedDate)}
                    {post.hasUnpublishedChanges ? ' \u2022 Modifie' : ''}
                  </span>
                </div>
              </div>
              <ArrowTopRightOnSquareIcon className="w-4 h-4 text-sage/50 shrink-0" />
            </a>
          ))
        )}
      </div>
    </div>
  );
}
