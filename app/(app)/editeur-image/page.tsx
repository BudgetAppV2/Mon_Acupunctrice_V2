'use client';

import dynamic from 'next/dynamic';

const ImageEditorCanvas = dynamic(
  () => import('@/components/features/image-editor/ImageEditorCanvas'),
  { ssr: false, loading: () => <div className="flex-1 flex items-center justify-center bg-gray-800"><div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div> },
);

export default function EditeurImagePage() {
  return (
    <div className="h-[100dvh] flex flex-col bg-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-white/10 shrink-0">
        <span className="text-sm font-semibold text-white/80">Editeur d'images</span>
        <span className="text-[10px] text-white/30">1080 x 1920</span>
      </header>
      {/* Canvas */}
      <ImageEditorCanvas />
      {/* Google Fonts for canvas text (not for UI — loaded via style tag for Fabric.js access) */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Antic+Slab&family=Mulish:wght@400;600;700;800&display=swap');`}</style>
    </div>
  );
}
