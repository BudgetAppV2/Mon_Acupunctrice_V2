'use client';

import { LinkIcon, CheckCircleIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Props {
  uid: string;
  metaStatus: string | null;
  metaTokenExpiresAt: Date | null;
}

/** Bouton de connexion Instagram OAuth — 3 etats (deconnecte, connecte, expire) */
export default function InstagramConnectButton({ uid, metaStatus, metaTokenExpiresAt }: Props) {
  const isExpired = metaStatus === 'expired' || (metaTokenExpiresAt && metaTokenExpiresAt < new Date());
  const isConnected = metaStatus === 'connected' && !isExpired;

  const connect = () => {
    window.location.href = `/api/auth/instagram?uid=${uid}`;
  };

  if (isConnected) {
    return (
      <div className="bg-white rounded-xl p-3 mb-6">
        <div className="flex items-center gap-3">
          <CheckCircleIcon className="w-5 h-5 text-green-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Instagram connecte</p>
            {metaTokenExpiresAt && (
              <p className="text-[10px] text-gray-500">
                Expire le {metaTokenExpiresAt.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>
          <button onClick={connect} className="flex items-center gap-1 text-xs text-gray-500">
            <ArrowPathIcon className="w-3.5 h-3.5" /> Reconnecter
          </button>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <button onClick={connect} className="w-full flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-3 mb-6">
        <ExclamationTriangleIcon className="w-5 h-5 text-red-500 shrink-0" />
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-red-700">Connexion expiree</p>
          <p className="text-[10px] text-red-500">Tap pour reconnecter Instagram</p>
        </div>
      </button>
    );
  }

  return (
    <button onClick={connect} className="w-full flex items-center gap-3 bg-sage text-white rounded-xl p-3 mb-6">
      <LinkIcon className="w-5 h-5 shrink-0" />
      <span className="text-sm font-medium">Connecter Instagram</span>
    </button>
  );
}
