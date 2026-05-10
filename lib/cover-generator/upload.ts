import { getApps, initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

function ensureAdminApp() {
  if (getApps().length > 0) return;
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;
  // Storage bucket explicite pour eviter resolution implicite
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  initializeApp({
    ...(serviceAccount ? { credential: cert(serviceAccount as ServiceAccount) } : {}),
    ...(storageBucket ? { storageBucket } : {}),
  });
}

export async function uploadCoverPng(
  pngBuffer: Buffer,
  contentId: string,
  format: 'cover16x9' | 'story9x16',
  prefix = 'covers',
): Promise<string> {
  ensureAdminApp();
  const bucket = getStorage().bucket();
  // Préfixe `public/` pour rester cohérent avec le pattern des covers existantes
  // et avec les Storage Rules qui autorisent la lecture publique sous public/.
  const filename = `public/${prefix}/${contentId}/${format}-${Date.now()}.png`;
  const file = bucket.file(filename);

  await file.save(pngBuffer, {
    contentType: 'image/png',
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  });

  await file.makePublic();
  // URL au format Firebase Storage REST API (compatible avec next.config images
  // remotePatterns qui whitelist firebasestorage.googleapis.com/v0/b/**).
  // L'URL directe storage.googleapis.com/<bucket>/<path> retourne 403 même
  // après makePublic() pour les buckets Firebase Storage.
  const encodedPath = encodeURIComponent(filename);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media`;
}
