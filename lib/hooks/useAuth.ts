'use client';

import { useEffect } from 'react';
import {
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store/useAuthStore';

const provider = new GoogleAuthProvider();

export function useAuth() {
  const { user, loading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setUser, setLoading]);

  const signInWithGoogle = async () => {
    const auth = getFirebaseAuth();
    // PWA standalone sur iOS bloque les popups → utiliser redirect
    const isStandalone = typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
       (window.navigator as unknown as { standalone?: boolean }).standalone === true);
    if (isStandalone) {
      await signInWithRedirect(auth, provider);
    } else {
      await signInWithPopup(auth, provider);
    }
  };

  const signOut = async () => {
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
  };

  return { user, loading, signInWithGoogle, signOut };
}
