'use client';

import { useState } from 'react';
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

  if (showEditor) {
    return (
      <BlogEditor
        publishing={publishing}
        onCancel={() => setShowEditor(false)}
        onPublish={async (article) => {
          const result = await publish(article);
          if (result) {
            setShowEditor(false);
            setSuccess(result.postUrl);
            refresh();
            setTimeout(() => setSuccess(null), 5000);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-sand pb-24">
      <header className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-3">
        <BookOpenIcon className="w-5 h-5 text-sage" />
        <h1 className="text-lg font-semibold text-sage flex-1">Blogue</h1>
        <button onClick={() => setShowEditor(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sage text-white">
          <PlusIcon className="w-4 h-4" /> Nouvel article
        </button>
      </header>

      <div className="px-4 pt-4 space-y-3">
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <p className="text-sm text-emerald-700 font-medium">Article publie avec succes</p>
            <a href={success} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" /> Voir sur le blog
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
            <div key={post.id} className="bg-white rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{post.title}</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {formatDate(post.firstPublishedDate)}
                    {post.published ? ' \u2022 Publie' : ' \u2022 Brouillon'}
                  </p>
                </div>
                {post.url && (
                  <a href={post.url} target="_blank" rel="noopener noreferrer"
                    className="shrink-0 p-1.5 rounded-lg text-sage bg-sage/10">
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
