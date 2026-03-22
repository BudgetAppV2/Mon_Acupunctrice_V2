import { NextRequest, NextResponse } from 'next/server';
import { verifyState } from '@/lib/utils/oauth-state';
import { getAdminFirestore } from '@/lib/firebase-admin';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = 'https://mon-acupunctrice-v2.vercel.app/api/auth/youtube/callback';

/** GET /api/auth/youtube/callback — Echange le code Google pour des tokens YouTube */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const error = request.nextUrl.searchParams.get('error');
  const baseUrl = request.nextUrl.origin;

  if (error) return NextResponse.redirect(`${baseUrl}/profil?error=oauth_denied`);
  if (!code || !state) return NextResponse.redirect(`${baseUrl}/profil?error=missing_params`);

  const uid = verifyState(state);
  if (!uid) return NextResponse.redirect(`${baseUrl}/profil?error=invalid_state`);

  try {
    // 1. Échanger code → tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code, client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI, grant_type: 'authorization_code',
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokens.access_token) throw new Error(`token_exchange_failed: ${JSON.stringify(tokens)}`);

    // 2. Récupérer les infos de la chaîne YouTube
    const channelRes = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
      { headers: { Authorization: `Bearer ${tokens.access_token}` } },
    );
    const channelData = await channelRes.json();
    const channel = channelData.items?.[0];
    if (!channel) throw new Error('no_youtube_channel');

    // 3. Stocker dans Firestore
    const db = getAdminFirestore();
    await db.doc(`users/${uid}/private/tokens`).set({
      youtubeRefreshToken: tokens.refresh_token,
      youtubeUpdatedAt: new Date(),
    }, { merge: true });

    await db.doc(`users/${uid}`).set({
      youtubeChannelId: channel.id,
      youtubeChannelName: channel.snippet.title,
      youtubeStatus: 'connected',
    }, { merge: true });

    return NextResponse.redirect(`${baseUrl}/profil?connected=youtube`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.redirect(`${baseUrl}/profil?error=${encodeURIComponent(msg)}`);
  }
}
