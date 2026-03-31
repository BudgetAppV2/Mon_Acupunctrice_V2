'use client';

import { use } from 'react';
import EditorV2Layout from '@/components/features/editor-v2/EditorV2Layout';

export default function EditorV2Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EditorV2Layout itemId={id} />;
}
