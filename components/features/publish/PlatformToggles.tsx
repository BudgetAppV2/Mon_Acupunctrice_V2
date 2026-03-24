'use client';

interface Props {
  facebookPageId: string | null;
  youtubeChannelId: string | null;
  metaStatus: string | null;
  alsoFacebook: boolean;
  alsoYoutube: boolean;
  alsoStory: boolean;
  onToggleFacebook: () => void;
  onToggleYoutube: () => void;
  onToggleStory: () => void;
}

function Toggle({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={onToggle} className={`relative w-10 h-6 rounded-full transition ${checked ? 'bg-sage' : 'bg-gray-300'}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  );
}

/** Toggles Facebook + Story Instagram + YouTube dans le flux de publication */
export default function PlatformToggles({
  facebookPageId, youtubeChannelId, metaStatus,
  alsoFacebook, alsoYoutube, alsoStory,
  onToggleFacebook, onToggleYoutube, onToggleStory,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
        {facebookPageId ? (
          <>
            <span className="text-sm text-gray-700">Publier aussi sur Facebook</span>
            <Toggle checked={alsoFacebook} onToggle={onToggleFacebook} />
          </>
        ) : (
          <span className="text-xs text-gray-400">Connecte Facebook dans Profil</span>
        )}
      </div>
      {/* Story visible seulement si Instagram est connecté */}
      {metaStatus === 'connected' && (
        <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
          <span className="text-sm text-gray-700">Publier aussi en Story Instagram</span>
          <Toggle checked={alsoStory} onToggle={onToggleStory} />
        </div>
      )}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
        {youtubeChannelId ? (
          <>
            <span className="text-sm text-gray-700">Publier aussi sur YouTube</span>
            <Toggle checked={alsoYoutube} onToggle={onToggleYoutube} />
          </>
        ) : (
          <span className="text-xs text-gray-400">Connecte YouTube dans Profil</span>
        )}
      </div>
    </div>
  );
}
