'use client';

import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useContentItems } from '@/lib/hooks/useContentItems';
import { useUpdateContentItem } from '@/lib/hooks/useUpdateContentItem';
import BlitzSession from '@/components/features/blitz/BlitzSession';

export default function BlitzPage() {
  const router = useRouter();
  const { data, loading, error } = useContentItems({ status: 'ready_to_shoot' });
  const { updateItem } = useUpdateContentItem();

  const handleMarkShot = async (id: string) => {
    await updateItem(id, { workflowState: 'shot' });
  };

  return (
    <div className="min-h-screen bg-sand">
      <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
        <button onClick={() => router.back()} className="text-gray-500" aria-label="Retour">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-sage">Mode Blitz</h1>
      </header>

      <div className="pt-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage" />
          </div>
        ) : error ? (
          <div className="text-center py-20 px-4">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        ) : (
          <BlitzSession items={data} onMarkShot={handleMarkShot} />
        )}
      </div>
    </div>
  );
}
