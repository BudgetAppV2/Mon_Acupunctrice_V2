'use client';

import { useState, useEffect, useCallback } from 'react';

interface BlogPost {
  id: string;
  title: string;
  published: boolean;
  hasUnpublishedChanges: boolean;
  firstPublishedDate: string | null;
  url: string | null;
  coverImage: string | null;
}

export function useBlogArticles() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/blog/list');
      if (res.ok) {
        const data = await res.json() as { posts?: BlogPost[] };
        setPosts(data.posts || []);
      }
    } catch { /* fetch failed */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { posts, loading, refresh };
}

interface PublishBlogParams {
  title: string;
  content: string;
  category?: string;
  ctaUrl?: string;
  faqs?: { question: string; answer: string }[];
  coverImageUrl?: string;
}

export function usePublishBlog() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ postId: string; postUrl: string; status?: string; reviewUrl?: string } | null>(null);

  const publish = useCallback(async (params: PublishBlogParams) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/blog/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error || 'Publication echouee');
      }
      const data = await res.json() as { postId: string; postUrl: string; status?: string; reviewUrl?: string };
      setResult(data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur';
      setError(msg);
      return null;
    } finally { setLoading(false); }
  }, []);

  return { publish, loading, error, result };
}
