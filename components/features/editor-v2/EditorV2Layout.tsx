'use client';

interface Props { itemId: string }

export default function EditorV2Layout({ itemId }: Props) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0f0f0f]">
      <p className="text-white/50 text-sm font-mono">Editor V2 — {itemId}</p>
    </div>
  );
}
