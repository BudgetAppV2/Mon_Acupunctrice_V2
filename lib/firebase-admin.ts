import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;

  return initializeApp(
    serviceAccount ? { credential: cert(serviceAccount as ServiceAccount) } : {},
  );
}

/** Firestore via Admin SDK — bypass les security rules (server-side only) */
export function getAdminFirestore() {
  getAdminApp();
  return getFirestore();
}
