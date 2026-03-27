'use client';

import { useState } from 'react';

/**
 * Page de test temporaire pour valider le Web Share API avec fichiers vidéo.
 * À supprimer après validation.
 * Accès : /test-share
 */
export default function TestSharePage() {
  const [status, setStatus] = useState('');
  const [supported, setSupported] = useState<boolean | null>(null);

  const checkSupport = () => {
    const testFile = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    const canShare = !!(navigator.canShare?.({ files: [testFile] }));
    setSupported(canShare);
    setStatus(canShare ? 'Web Share files supporté!' : 'Web Share files NON supporté sur ce navigateur');
  };

  const testShareImage = async () => {
    setStatus('Création image test...');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080; canvas.height = 1920;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#5C7A5F';
      ctx.fillRect(0, 0, 1080, 1920);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 60px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Test Web Share', 540, 960);
      ctx.font = '40px sans-serif';
      ctx.fillText('Mon Acupunctrice Hub', 540, 1040);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });
      const file = new File([blob], 'test-story.png', { type: 'image/png' });

      if (navigator.canShare?.({ files: [file] })) {
        setStatus('Ouverture de la share sheet...');
        await navigator.share({ files: [file] });
        setStatus('Partage réussi!');
      } else {
        setStatus('canShare retourne false — non supporté');
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        setStatus('Annulé par l\'utilisateur (normal)');
      } else {
        setStatus(`Erreur: ${(err as Error).message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-sand p-6">
      <h1 className="text-lg font-bold text-gray-900 mb-6">Test Web Share API</h1>
      <div className="space-y-3">
        <button onClick={checkSupport}
          className="w-full py-3 bg-gray-200 rounded-xl text-sm font-medium">
          1. Vérifier le support
        </button>
        {supported !== null && (
          <p className={`text-sm ${supported ? 'text-green-600' : 'text-red-500'}`}>
            {supported ? '✅ Supporté' : '❌ Non supporté'}
          </p>
        )}
        <button onClick={testShareImage}
          className="w-full py-3 bg-sage text-white rounded-xl text-sm font-medium">
          2. Test partage IMAGE vers Instagram Stories
        </button>
      </div>
      {status && (
        <div className="mt-4 bg-white rounded-xl p-4">
          <p className="text-sm text-gray-700">{status}</p>
        </div>
      )}
      <p className="mt-6 text-xs text-gray-400 text-center">
        Page temporaire — /test-share — à supprimer après validation
      </p>
    </div>
  );
}
