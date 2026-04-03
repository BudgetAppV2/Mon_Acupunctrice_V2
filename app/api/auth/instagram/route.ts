import { NextRequest, NextResponse } from 'next/server';
import { signState } from '@/lib/utils/oauth-state';

const IG_APP_ID = '1224688753149053';
const REDIRECT_URI = 'https://mon-acupunctrice-v2.vercel.app/api/auth/instagram/callback';
const SCOPES = [
  'instagram_business_basic',
  'instagram_business_content_publish',
  'instagram_business_manage_messages',
  'instagram_business_manage_comments',
].join(',');

/** GET /api/auth/instagram?uid=xxx — Redirige vers Meta OAuth */
export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get('uid');

  if (!uid) {
    return NextResponse.json({ error: 'uid requis' }, { status: 400 });
  }

  const state = signState(uid);

  const url = new URL('https://www.instagram.com/oauth/authorize');
  url.searchParams.set('client_id', IG_APP_ID);
  url.searchParams.set('redirect_uri', REDIRECT_URI);
  url.searchParams.set('scope', SCOPES);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('state', state);

  return NextResponse.redirect(url.toString());
}
