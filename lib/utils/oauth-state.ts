import { createHmac } from 'crypto';

const SECRET = process.env.OAUTH_STATE_SECRET || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'fallback-dev-secret';

/** Signe le uid dans un state parameter OAuth (HMAC-SHA256) */
export function signState(uid: string): string {
  const sig = createHmac('sha256', SECRET).update(uid).digest('hex').slice(0, 16);
  return `${uid}.${sig}`;
}

/** Verifie le state et retourne le uid, ou null si invalide */
export function verifyState(state: string): string | null {
  const [uid, sig] = state.split('.');
  if (!uid || !sig) return null;
  const expected = createHmac('sha256', SECRET).update(uid).digest('hex').slice(0, 16);
  return sig === expected ? uid : null;
}
