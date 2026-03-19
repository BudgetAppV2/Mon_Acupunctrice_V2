'use client';

import { use } from 'react';
import EditorLayout from '@/components/features/editor/EditorLayout';

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EditorLayout itemId={id} />;
}
