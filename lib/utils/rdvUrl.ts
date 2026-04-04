const BASE_URL = 'https://gorendezvous.com/lasourceensoi';

type Platform = 'instagram' | 'facebook' | 'youtube' | 'blog' | 'story' | 'bio';
type Medium = 'reel' | 'caption' | 'article' | 'story' | 'description' | 'link';

export function getRdvUrl(opts?: {
  source?: Platform;
  medium?: Medium;
  campaign?: string;
}): string {
  if (!opts?.source) return BASE_URL;
  const params = new URLSearchParams();
  params.set('utm_source', opts.source);
  if (opts.medium) params.set('utm_medium', opts.medium);
  if (opts.campaign) params.set('utm_campaign', opts.campaign);
  return `${BASE_URL}?${params.toString()}`;
}

export function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
}

// For story images (text in image, not clickable)
export const RDV_URL_SHORT = 'gorendezvous.com/lasourceensoi';
export const RDV_URL_BASE = BASE_URL;
