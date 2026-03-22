'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store/useAuthStore';

/** Lit le profil utilisateur (users/{uid}) — categories custom + meta Instagram */
export function useUserProfile() {
  const uid = useAuthStore((s) => s.user?.uid);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [metaStatus, setMetaStatus] = useState<string | null>(null);
  const [metaInstagramId, setMetaInstagramId] = useState<string | null>(null);
  const [metaTokenExpiresAt, setMetaTokenExpiresAt] = useState<Date | null>(null);
  const [facebookStatus, setFacebookStatus] = useState<string | null>(null);
  const [facebookPageId, setFacebookPageId] = useState<string | null>(null);
  const [facebookPageName, setFacebookPageName] = useState<string | null>(null);
  const [youtubeStatus, setYoutubeStatus] = useState<string | null>(null);
  const [youtubeChannelId, setYoutubeChannelId] = useState<string | null>(null);
  const [youtubeChannelName, setYoutubeChannelName] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    const db = getFirebaseFirestore();
    const unsub = onSnapshot(doc(db, 'users', uid), (snap) => {
      const data = snap.data();
      setCustomCategories(data?.customCategories || []);
      setMetaStatus(data?.metaStatus || null);
      setMetaInstagramId(data?.metaInstagramId || null);
      setMetaTokenExpiresAt(data?.metaTokenExpiresAt?.toDate() || null);
      setFacebookStatus(data?.facebookStatus || null);
      setFacebookPageId(data?.facebookPageId || null);
      setFacebookPageName(data?.facebookPageName || null);
      setYoutubeStatus(data?.youtubeStatus || null);
      setYoutubeChannelId(data?.youtubeChannelId || null);
      setYoutubeChannelName(data?.youtubeChannelName || null);
    });
    return unsub;
  }, [uid]);

  const updateCustomCategories = async (cats: string[]) => {
    if (!uid) return;
    const db = getFirebaseFirestore();
    await setDoc(doc(db, 'users', uid), { customCategories: cats }, { merge: true });
  };

  return {
    customCategories, updateCustomCategories,
    metaStatus, metaInstagramId, metaTokenExpiresAt,
    facebookStatus, facebookPageId, facebookPageName,
    youtubeStatus, youtubeChannelId, youtubeChannelName,
  };
}
