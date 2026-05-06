'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';

export default function AdminFloatingButton() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
    });
    return unsubscribe;
  }, []);

  if (!isAdmin) return null;

  return (
    <a
      href="/calendrier"
      className="fixed bottom-4 right-4 z-50 bg-gray-900/80 text-white text-xs px-3 py-2 rounded-full shadow-lg hover:bg-gray-900 transition-colors backdrop-blur-sm"
    >
      Hub admin
    </a>
  );
}
