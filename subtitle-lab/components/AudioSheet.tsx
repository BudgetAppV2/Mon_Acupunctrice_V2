'use client';

import { useRef } from 'react';
import { useSubtitleStore, getAudioTrack } from '../lib/store';
import { XMarkIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';

export default function AudioSheet() {
  const { tracks, voiceVolume, audioVolume, audioDucking,
    addAudioClip, removeAudioClip, setVoiceVolume, setAudioVolume,
    setAudioDucking, setAudioFade } = useSubtitleStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const audioTrack = getAudioTrack(tracks);
  const audioClip = audioTrack?.audioClips?.[0] ?? null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) addAudioClip(f, f.name);
  };

  return (
    <div className="px-3 py-2 space-y-3">
      <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Audio</p>

      {!audioClip ? (
        <button onClick={() => fileRef.current?.click()}
          className="w-full py-3 rounded-lg border border-dashed border-white/15 text-white/40 text-[11px] flex items-center justify-center gap-2 active:bg-white/5">
          <MusicalNoteIcon className="w-4 h-4" />
          Fichier local
        </button>
      ) : (
        <div className="space-y-3">
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
