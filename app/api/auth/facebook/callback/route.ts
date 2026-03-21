import { NextRequest, NextResponse } from 'next/server';
import { verifyState } from '@/lib/utils/oauth-state';
import { getAdminFirestore } from '@/lib/firebase-admin';

const META_APP_ID = '823305796703895';
const REDIRECT_URI = 'https://mon-acupunctrice-v2.vercel.app/api/auth/facebook/callback';

/** GET /api/auth/facebook/callback — Echange le code OAuth Facebook pour un Page Access Token */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const error = request.nextUrl.searchParams.get('error');
  const baseUrl = request.nextUrl.origin;

  if (error) return NextResponse.redirect(`${baseUrl}/profil?error=oauth_denied`);
  if (!code || !state) return NextResponse.redirect(`${baseUrl}/profil?error=missing_params`);

  const uid = verifyState(state);
  if (!uid) return NextResponse.redirect(`${baseUrl}/profil?error=invalid_state`);

  const secret = process.env.META_FB_APP_SECRET;
  if (!secret) return NextResponse.redirect(`${baseUrl}/profil?error=server_config`);

  try {
    // 1. Code → short-lived user token
    const tokenRes = await fetch('https://graph.facebook.com/v25.0/oauth/access_token?' + new URLSearchParams({
      client_id: META_APP_ID, client_secret: secret, redirect_uri: REDIRECT_URI, code,
    }));
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error(`token_exchange_failed: ${JSON.stringify(tokenData)}`);

    // 2. Short-lived → long-lived user token (60 jours)
    const longRes = await fetch('https://graph.facebook.com/v25.0/oauth/access_token?' + new URLSearchParams({
      grant_type: 'fb_exchange_token', client_id: META_APP_ID, client_secret: secret, fb_exchange_token: tokenData.access_token,
    }));
    const longData = await longRes.json();
    if (!longData.access_token) throw new Error(`long_lived_exchange_failed: ${JSON.stringify(longData)}`);

    // 3. Lister les Pages Facebook de l'utilisateur
    const pagesRes = await fetch(`https://graph.facebook.com/v25.0/me/accounts?access_token=${longData.access_token}`);
    const pagesData = await pagesRes.json();
    const page = pagesData.data?.[0];
    if (!page) throw new Error(`no_facebook_page: got ${JSON.stringify(pagesData).slice(0, 200)}`);

    // Le Page Access Token est long-lived par défaut quand il vient d'un long-lived user token
    const db = getAdminFirestore();
    await db.doc(`users/${uid}/private/tokens`).set({
      facebookPageAccessToken: page.access_token,
      facebookUpdatedAt: new Date(),
    }, { merge: true });

    await db.doc(`users/${uid}`).set({
      facebookPageId: page.id,
      facebookPageName: page.name,
      facebookStatus: 'connected',
    }, { merge: true });

    return NextResponse.redirect(`${baseUrl}/profil?connected=facebook`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.redirect(`${baseUrl}/profil?error=${encodeURIComponent(msg)}`);
  }
}
