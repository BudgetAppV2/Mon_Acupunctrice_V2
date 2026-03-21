import { NextRequest, NextResponse } from 'next/server';
import { signState } from '@/lib/utils/oauth-state';

const META_APP_ID = '823305796703895';
const REDIRECT_URI = 'https://mon-acupunctrice-v2.vercel.app/api/auth/facebook/callback';
const SCOPES = 'pages_manage_posts,pages_read_engagement,pages_show_list';

/** GET /api/auth/facebook?uid=xxx — Redirige vers Facebook OAuth */
export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get('uid');

  if (!uid) {
    return NextResponse.json({ error: 'uid requis' }, { status: 400 });
  }

  const state = signState(uid);

  const url = new URL('https://www.facebook.com/v25.0/dialog/oauth');
  url.searchParams.set('client_id', META_APP_ID);
  url.searchParams.set('redirect_uri', REDIRECT_URI);
  url.searchParams.set('scope', SCOPES);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('state', state);

  return NextResponse.redirect(url.toString());
}
