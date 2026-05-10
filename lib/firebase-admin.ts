import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;

  // M2A bugfix : storageBucket doit être inclus dans l'init globale.
  // Sinon, race condition : si firebase-admin.ts est importé en premier
  // (par un endpoint Firestore), upload.ts voit getApps().length > 0 et
  // bypass son propre init → l'app n'a jamais de bucket → tous les uploads
  // Storage échouent avec "Bucket name not specified or invalid".
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  return initializeApp({
    ...(serviceAccount ? { credential: cert(serviceAccount as ServiceAccount) } : {}),
    ...(storageBucket ? { storageBucket } : {}),
  });
}

/** Firestore via Admin SDK — bypass les security rules (server-side only) */
export function getAdminFirestore() {
  getAdminApp();
  return getFirestore();
}
