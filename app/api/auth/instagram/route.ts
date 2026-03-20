import { NextRequest, NextResponse } from 'next/server';
import { signState } from '@/lib/utils/oauth-state';

const META_CLIENT_ID = '823305796703895';
const REDIRECT_URI = 'https://mon-acupunctrice-v2.vercel.app/api/auth/instagram/callback';
const SCOPES = [
  'instagram_business_basic',
  'instagram_business_content_publish',
  'pages_manage_posts',
  'pages_read_engagement',
  'instagram_manage_insights',
].join(',');

/** GET /api/auth/instagram?uid=xxx — Redirige vers Meta OAuth */
export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get('uid');

  if (!uid) {
    return NextResponse.json({ error: 'uid requis' }, { status: 400 });
  }

  const state = signState(uid);

  const url = new URL('https://www.facebook.com/v25.0/dialog/oauth');
  url.searchParams.set('client_id', META_CLIENT_ID);
  url.searchParams.set('redirect_uri', REDIRECT_URI);
  url.searchParams.set('scope', SCOPES);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('state', state);

  return NextResponse.redirect(url.toString());
}
