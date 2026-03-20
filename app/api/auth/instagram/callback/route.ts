import { NextRequest, NextResponse } from 'next/server';
import { verifyState } from '@/lib/utils/oauth-state';
import { getAdminFirestore } from '@/lib/firebase-admin';

const META_CLIENT_ID = '823305796703895';
const REDIRECT_URI = 'https://mon-acupunctrice-v2.vercel.app/api/auth/instagram/callback';

/** GET /api/auth/instagram/callback — Echange le code OAuth pour un token long-lived */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const error = request.nextUrl.searchParams.get('error');
  const baseUrl = request.nextUrl.origin;

  if (error) return NextResponse.redirect(`${baseUrl}/profil?error=oauth_denied`);
  if (!code || !state) return NextResponse.redirect(`${baseUrl}/profil?error=missing_params`);

  const uid = verifyState(state);
  if (!uid) return NextResponse.redirect(`${baseUrl}/profil?error=invalid_state`);

  const secret = process.env.META_APP_SECRET;
  if (!secret) return NextResponse.redirect(`${baseUrl}/profil?error=server_config`);

  try {
    // 1. Code → short-lived token
    const tokenRes = await fetch('https://graph.facebook.com/v25.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: META_CLIENT_ID, client_secret: secret, redirect_uri: REDIRECT_URI, code }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error('token_exchange_failed');

    // 2. Short-lived → long-lived token (60 jours)
    const longRes = await fetch(
      `https://graph.facebook.com/v25.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${META_CLIENT_ID}&client_secret=${secret}&fb_exchange_token=${tokenData.access_token}`,
    );
    const longData = await longRes.json();
    if (!longData.access_token) throw new Error('long_lived_exchange_failed');

    const expiresAt = new Date(Date.now() + (longData.expires_in || 5184000) * 1000);

    // 3. Recuperer les pages Facebook
    const pagesRes = await fetch(`https://graph.facebook.com/v25.0/me/accounts?access_token=${longData.access_token}`);
    const pagesData = await pagesRes.json();
    const page = pagesData.data?.[0];
    if (!page) throw new Error('no_facebook_page');

    // 4. Recuperer l'Instagram Business Account
    const igRes = await fetch(`https://graph.facebook.com/v25.0/${page.id}?fields=instagram_business_account&access_token=${longData.access_token}`);
    const igData = await igRes.json();
    const igId = igData.instagram_business_account?.id;
    if (!igId) throw new Error('no_instagram_account');

    // 5. Sauvegarder dans Firestore (Admin SDK — bypass rules)
    const db = getAdminFirestore();
    await db.doc(`users/${uid}/private/tokens`).set({
      metaAccessToken: longData.access_token,
      metaTokenExpiresAt: expiresAt,
      updatedAt: new Date(),
    });
    await db.doc(`users/${uid}`).set({
      metaInstagramId: igId,
      metaStatus: 'connected',
      metaTokenExpiresAt: expiresAt,
      facebookPageId: page.id,
      facebookPageName: page.name,
    }, { merge: true });

    return NextResponse.redirect(`${baseUrl}/profil?connected=instagram`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.redirect(`${baseUrl}/profil?error=${encodeURIComponent(msg)}`);
  }
}
