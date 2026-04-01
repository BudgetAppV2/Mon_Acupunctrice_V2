'use client';

import { useRef, useState } from 'react';
import { useEditorV2Store, getAudioTrack } from '@/lib/store/useEditorV2Store';
import { useMusicSearch } from '@/lib/hooks/useMusicSearch';
import { XMarkIcon, MusicalNoteIcon, MagnifyingGlassIcon, PlayIcon, StopIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const MOODS = ['relaxing', 'acoustic', 'ambient', 'energetic'] as const;

export default function AudioSheet() {
  const { tracks, voiceVolume, audioVolume, audioDucking,
    addAudioClip, removeAudioClip, setVoiceVolume, setAudioVolume,
    setAudioDucking, setAudioFade } = useEditorV2Store();
  const { tracks: jamTracks, loading, search } = useMusicSearch();
  const [query, setQuery] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const previewRef = useRef<HTMLAudioElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const audioTrack = getAudioTrack(tracks);
  const audioClip = audioTrack?.audioClips?.[0] ?? null;

  const togglePreview = (url: string) => {
    if (previewUrl === url) {
      previewRef.current?.pause();
      setPreviewUrl(null);
    } else {
      setPreviewUrl(url);
      if (previewRef.current) {
        previewRef.current.src = `/api/proxy-audio?url=${encodeURIComponent(url)}`;
        previewRef.current.play();
      }
    }
  };

  const importJamendo = async (url: string, name: string) => {
    previewRef.current?.pause();
    setPreviewUrl(null);
    setImporting(true);
    try {
      const proxyUrl = `/api/proxy-audio?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl);
      const blob = await res.blob();
      const file = new File([blob], `${name}.mp3`, { type: 'audio/mpeg' });
      addAudioClip(file, name);
    } catch { /* import failed */ }
    finally { setImporting(false); }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) addAudioClip(f, f.name);
  };

  // Controls view when audio is loaded
  if (audioClip) {
    return (
      <div className="px-3 py-2 space-y-3">
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Audio</p>
        <div className="flex items-center gap-2">
          <MusicalNoteIcon className="w-4 h-4 text-amber-400/60 shrink-0" />
          <span className="text-[11px] text-white/60 truncate flex-1">{audioClip.name}</span>
          <button onClick={() => removeAudioClip(audioClip.id)}
            className="p-1 rounded-full bg-white/5 active:bg-white/15">
            <XMarkIcon className="w-3.5 h-3.5 text-white/40" />
          </button>
        </div>

        <SliderRow label="Voix" value={voiceVolume} onChange={setVoiceVolume} />
        <SliderRow label="Musique" value={audioVolume} onChange={setAudioVolume} />

        <div className="grid grid-cols-2 gap-2">
          <FadeSlider label="Fade in" value={audioClip.fadeIn}
            onChange={(v) => setAudioFade(audioClip.id, v, audioClip.fadeOut)} />
          <FadeSlider label="Fade out" value={audioClip.fadeOut}
            onChange={(v) => setAudioFade(audioClip.id, audioClip.fadeIn, v)} />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/30">Auto-ducking</span>
          <button onClick={() => setAudioDucking(!audioDucking)}
            className={`w-9 h-5 rounded-full transition-colors relative ${audioDucking ? 'bg-emerald-500' : 'bg-white/10'}`}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${audioDucking ? 'left-[18px]' : 'left-0.5'}`} />
          </button>
          <span className="text-[9px] text-white/20">(export seulement)</span>
        </div>
      </div>
    );
  }

  // Search + import view
  return (
    <div className="px-3 py-2 space-y-2">
      <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Audio</p>
      <audio ref={previewRef} />

      {/* Search bar */}
      <div className="flex gap-1">
        <input value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search(query || undefined)}
          placeholder="Chercher une musique..."
          className="flex-1 bg-white/5 border border-white/10 text-white text-[11px] rounded px-2 py-1.5 focus:outline-none" />
        <button onClick={() => search(query || undefined)}
          className="bg-emerald-500 text-white p-1.5 rounded active:bg-emerald-600">
          <MagnifyingGlassIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Moods + local file */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {MOODS.map(m => (
          <button key={m} onClick={() => search(undefined, m)}
            className="shrink-0 px-2 py-0.5 rounded-full text-[10px] border border-white/10 text-white/40 active:border-white/30 active:text-white/70">
            {m}
          </button>
        ))}
        <label className="shrink-0 px-2 py-0.5 rounded-full text-[10px] border border-white/10 text-white/40 cursor-pointer active:border-white/30">
          Fichier local
          <input type="file" accept="audio/*" onChange={handleFile} className="hidden" />
        </label>
      </div>

      {/* Loading */}
      {loading && <p className="text-[10px] text-white/30 text-center py-1">Recherche...</p>}
      {importing && <p className="text-[10px] text-emerald-400/60 text-center py-1">Import...</p>}

      {/* Results */}
      <div className="space-y-0.5 max-h-32 overflow-y-auto">
        {jamTracks.map(t => (
          <div key={t.id} className="flex items-center gap-2 py-1">
            <button onClick={() => togglePreview(t.audio)} className="text-emerald-400 shrink-0">
              {previewUrl === t.audio ? <StopIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-white/70 truncate">{t.name}</p>
              <p className="text-[9px] text-white/30 truncate">{t.artist}</p>
            </div>
            <button onClick={() => importJamendo(t.audio, t.name)} className="text-emerald-400 shrink-0">
              <ArrowDownTrayIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Fallback local file button when no search results */}
      {jamTracks.length === 0 && !loading && (
        <button onClick={() => fileRef.current?.click()}
          className="w-full py-3 rounded-lg border border-dashed border-white/15 text-white/40 text-[11px] flex items-center justify-center gap-2 active:bg-white/5">
          <MusicalNoteIcon className="w-4 h-4" />
          Fichier local
        </button>
      )}
      <input ref={fileRef} type="file" accept="audio/*" onChange={handleFile} className="hidden" />
    </div>
  );
}

function SliderRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-[10px] text-white/30 font-medium">{label}</label>
        <span className="text-[10px] text-white/30">{Math.round(value * 100)}%</span>
      </div>
      <input type="range" min={0} max={100} value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="w-full accent-emerald-400 h-1.5" />
    </div>
  );
}

function FadeSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-[10px] text-white/30 font-medium">{label}</label>
        <span className="text-[10px] text-white/30">{value}s</span>
      </div>
      <input type="range" min={0} max={3} step={0.5} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-emerald-400 h-1.5" />
    </div>
  );
}
