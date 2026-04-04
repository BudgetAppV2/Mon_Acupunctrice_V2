'use client';

import { useState, useEffect } from 'react';

interface BlogPostStats {
  id: string;
  title: string;
  date: string | null;
  url: string | null;
  image: string | null;
  views: number;
  likes: number;
  comments: number;
}

interface BlogTotals {
  views: number;
  likes: number;
  comments: number;
  posts: number;
}

export function useBlogStats() {
  const [posts, setPosts] = useState<BlogPostStats[]>([]);
  const [totals, setTotals] = useState<BlogTotals>({ views: 0, likes: 0, comments: 0, posts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blog/stats')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setPosts(data.posts || []);
          setTotals(data.totals || { views: 0, likes: 0, comments: 0, posts: 0 });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { posts, totals, loading };
}
