import { NextRequest, NextResponse } from 'next/server';
import { verifyState } from '@/lib/utils/oauth-state';
import { getAdminFirestore } from '@/lib/firebase-admin';

const IG_APP_ID = '1224688753149053';
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
    // 1. Code → short-lived token (Instagram API)
    const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: IG_APP_ID, client_secret: secret, grant_type: 'authorization_code', redirect_uri: REDIRECT_URI, code }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error(`token_exchange_failed: ${JSON.stringify(tokenData)}`);

    // 2. Short-lived → long-lived token (60 jours)
    const longRes = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${secret}&access_token=${tokenData.access_token}`,
    );
    const longData = await longRes.json();
    if (!longData.access_token) throw new Error(`long_lived_exchange_failed: ${JSON.stringify(longData)}`);

    const expiresAt = new Date(Date.now() + (longData.expires_in || 5184000) * 1000);

    // 3. Obtenir le bon ID Instagram via Graph API (user_id = legacy ID requis pour publier)
    const meRes = await fetch(`https://graph.instagram.com/v25.0/me?fields=user_id,username&access_token=${longData.access_token}`);
    const meData = await meRes.json();
    const igId = meData.user_id || String(tokenData.user_id);

    // 5. Sauvegarder dans Firestore (Admin SDK — bypass rules)
    const db = getAdminFirestore();
    await db.doc(`users/${uid}/private/tokens`).set({
      metaAccessToken: longData.access_token,
      metaTokenExpiresAt: expiresAt,
      updatedAt: new Date(),
    }, { merge: true });
    await db.doc(`users/${uid}`).set({
      metaInstagramId: igId,
      metaStatus: 'connected',
      metaTokenExpiresAt: expiresAt,
    }, { merge: true });

    return NextResponse.redirect(`${baseUrl}/profil?connected=instagram`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.redirect(`${baseUrl}/profil?error=${encodeURIComponent(msg)}`);
  }
}
