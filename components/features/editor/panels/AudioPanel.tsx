'use client';

import { useState, useRef } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { useMusicSearch } from '@/lib/hooks/useMusicSearch';
import { MagnifyingGlassIcon, PlayIcon, StopIcon, ArrowDownTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';

const MOODS = ['relaxing', 'acoustic', 'ambient', 'energetic'] as const;

export default function AudioPanel() {
  const {
    audioUrl, audioName, audioVolume, voiceVolume, audioFadeIn, audioFadeOut, audioDucking,
    setAudioTrack, removeAudio, setAudioVolume, setVoiceVolume, setAudioFade, setAudioDucking,
  } = useEditorStore();
  const { tracks, loading, search } = useMusicSearch();
  const [query, setQuery] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePreview = (url: string) => {
    if (previewUrl === url) {
      audioRef.current?.pause();
      setPreviewUrl(null);
    } else {
      setPreviewUrl(url);
      if (audioRef.current) {
        audioRef.current.src = `/api/proxy-audio?url=${encodeURIComponent(url)}`;
        audioRef.current.play();
      }
    }
  };

  const importTrack = (url: string, name: string) => {
    audioRef.current?.pause();
    setPreviewUrl(null);
    setAudioTrack(`/api/proxy-audio?url=${encodeURIComponent(url)}`, name);
  };

  const handleLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAudioTrack(URL.createObjectURL(file), file.name);
  };

  // Vue contrôles quand un audio est importé
  if (audioUrl) {
    return (
      <div className="px-3 py-2 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300 truncate flex-1">{audioName || 'Audio'}</span>
          <button onClick={removeAudio} className="text-xs text-red-400 flex items-center gap-1">
            <XMarkIcon className="w-3 h-3" /> Retirer
          </button>
        </div>
        <div>
          <label className="text-xs text-gray-500">Voix : {Math.round(voiceVolume * 100)}%</label>
          <input type="range" min={0} max={1} step={0.05} value={voiceVolume} onChange={e => setVoiceVolume(+e.target.value)} className="w-full accent-sage" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Musique : {Math.round(audioVolume * 100)}%</label>
          <input type="range" min={0} max={1} step={0.05} value={audioVolume} onChange={e => setAudioVolume(+e.target.value)} className="w-full accent-sage" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500">Fade in : {audioFadeIn.toFixed(1)}s</label>
            <input type="range" min={0} max={3} step={0.5} value={audioFadeIn} onChange={e => setAudioFade(+e.target.value, audioFadeOut)} className="w-full accent-sage" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Fade out : {audioFadeOut.toFixed(1)}s</label>
            <input type="range" min={0} max={3} step={0.5} value={audioFadeOut} onChange={e => setAudioFade(audioFadeIn, +e.target.value)} className="w-full accent-sage" />
          </div>
        </div>
      </div>
    );
  }

  // Vue recherche Jamendo + import local
  return (
    <div className="px-3 py-2 space-y-2">
      <audio ref={audioRef} />
      <div className="flex gap-1">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search(query || undefined)}
          placeholder="Chercher une musique..."
          className="flex-1 bg-gray-800 text-white text-xs rounded px-2 py-1.5"
        />
        <button onClick={() => search(query || undefined)} className="bg-sage text-white p-1.5 rounded">
          <MagnifyingGlassIcon className="w-4 h-4" />
        </button>
      </div>
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {MOODS.map(m => (
          <button key={m} onClick={() => search(undefined, m)} className="shrink-0 px-2 py-0.5 rounded-full text-[10px] border border-gray-700 text-gray-400">
            {m}
          </button>
        ))}
        <label className="shrink-0 px-2 py-0.5 rounded-full text-[10px] border border-gray-700 text-gray-400 cursor-pointer">
          Fichier local
          <input type="file" accept="audio/*" onChange={handleLocalFile} className="hidden" />
        </label>
      </div>
      {loading && <p className="text-xs text-gray-500 text-center">Recherche...</p>}
      <div className="space-y-1 max-h-28 overflow-y-auto">
        {tracks.map(t => (
          <div key={t.id} className="flex items-center gap-2 py-1">
            <button onClick={() => togglePreview(t.audio)} className="text-sage shrink-0">
              {previewUrl === t.audio ? <StopIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white truncate">{t.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{t.artist}</p>
            </div>
            <button onClick={() => importTrack(t.audio, t.name)} className="text-sage shrink-0">
              <ArrowDownTrayIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
