'use client';

import dynamic from 'next/dynamic';

const ImageEditorLayout = dynamic(
  () => import('@/components/features/image-editor/ImageEditorLayout'),
  { ssr: false, loading: () => <div className="h-[100dvh] flex items-center justify-center bg-gray-900"><div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div> },
);

export default function EditeurImagePage() {
  return (
    <>
      <ImageEditorLayout />
      {/* Google Fonts for Fabric.js canvas text rendering (ctx.font) */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Antic+Slab&family=Mulish:wght@400;600;700;800&display=swap');`}</style>
    </>
  );
}
