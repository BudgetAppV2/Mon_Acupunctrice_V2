'use client';

import { useEffect } from 'react';
import { setupGsap } from '@/lib/animations/setup';

export default function GsapBootstrap() {
  useEffect(() => { setupGsap(); }, []);
  return null;
}
