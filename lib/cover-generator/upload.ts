import { getApps, initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

function ensureAdminApp() {
  if (getApps().length > 0) return;
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;
  initializeApp(
    serviceAccount ? { credential: cert(serviceAccount as ServiceAccount) } : {},
  );
}

export async function uploadCoverPng(
  pngBuffer: Buffer,
  contentId: string,
  format: 'cover16x9' | 'story9x16',
): Promise<string> {
  ensureAdminApp();
  const bucket = getStorage().bucket();
  const filename = `covers/${contentId}/${format}-${Date.now()}.png`;
  const file = bucket.file(filename);

  await file.save(pngBuffer, {
    contentType: 'image/png',
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  });

  await file.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${filename}`;
}
