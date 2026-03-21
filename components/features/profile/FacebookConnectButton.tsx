'use client';

import { LinkIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Props {
  uid: string;
  facebookStatus: string | null;
  facebookPageName: string | null;
}

/** Bouton de connexion Facebook OAuth — 3 etats (deconnecte, connecte, erreur) */
export default function FacebookConnectButton({ uid, facebookStatus, facebookPageName }: Props) {
  const isConnected = facebookStatus === 'connected';

  const connect = () => {
    window.location.href = `/api/auth/facebook?uid=${uid}`;
  };

  if (isConnected) {
    return (
      <div className="bg-white rounded-xl p-3 mb-6">
        <div className="flex items-center gap-3">
          <CheckCircleIcon className="w-5 h-5 text-green-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Facebook connecte</p>
            {facebookPageName && (
              <p className="text-[10px] text-gray-500">Page : {facebookPageName}</p>
            )}
          </div>
          <button onClick={connect} className="flex items-center gap-1 text-xs text-gray-500">
            <ArrowPathIcon className="w-3.5 h-3.5" /> Reconnecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <button onClick={connect} className="w-full flex items-center gap-3 bg-[#1877F2] text-white rounded-xl p-3 mb-6">
      <LinkIcon className="w-5 h-5 shrink-0" />
      <span className="text-sm font-medium">Connecter Facebook</span>
    </button>
  );
}
