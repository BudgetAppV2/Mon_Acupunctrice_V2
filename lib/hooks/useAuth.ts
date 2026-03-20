'use client';

import { useEffect } from 'react';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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

    // Capturer le résultat du redirect (mobile)
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          // eslint-disable-next-line no-console
          console.log('[AUTH] getRedirectResult success:', result.user.uid);
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log('[AUTH] getRedirectResult error:', err.code, err.message);
      });

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
    // Mobile (iOS/Android) : signInWithRedirect est plus fiable
    // Desktop : signInWithPopup pour une meilleure UX
    const isMobile = typeof window !== 'undefined' &&
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
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
