'use client';

import { useRef, useState } from 'react';
import { useSubtitleStore, getVideoTracks, getSubtitleTrack, getAudioTrack, getClipAtTime } from '../lib/store';
import TrackBlock from './TrackBlock';
import AudioWaveform from './AudioWaveform';
import { FilmIcon, ChatBubbleBottomCenterTextIcon, MusicalNoteIcon, PlusIcon } from '@heroicons/react/24/outline';
import { ScissorsIcon, TrashIcon } from '@heroicons/react/24/solid';

const TRACK_ICONS: Record<string, React.ReactNode> = {
  video: <FilmIcon className="w-3.5 h-3.5" />,
  subtitle: <ChatBubbleBottomCenterTextIcon className="w-3.5 h-3.5" />,
  audio: <MusicalNoteIcon className="w-3.5 h-3.5" />,
};

export default function TracksPanel() {
  const { tracks, currentTime, duration, setCurrentTime, selectedItemId,
    updateClipTrim, splitClip, deleteClip, addVideoClip } = useSubtitleStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const addFileRef = useRef<HTMLInputElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Fix 6: Reference duration = max source duration across all clips (prevents zoom on trim)
  const allClips = tracks.filter(t => t.type === 'video').flatMap(t => t.clips ?? []);
  const maxSourceDur = allClips.length > 0 ? Math.max(...allClips.map(c => c.duration)) : 0;
  const refDuration = Math.max(duration, maxSourceDur);
  const playheadPos = refDuration > 0 ? (currentTime / refDuration) * 100 : 0;

  // A7: Check if selected clip is a video clip and playhead is inside it
  const selectedVideoClip = getVideoTracks(tracks)
    .flatMap(t => t.clips ?? [])
    .find(c => c.id === selectedItemId);
  const canSplit = !!selectedVideoClip && (() => {
    const start = selectedVideoClip.timelineStart;
    const end = start + (selectedVideoClip.trimEnd - selectedVideoClip.trimStart);
    return currentTime > start + 100 && currentTime < end - 100;
  })();

  const handlePlayheadDrag = (e: React.PointerEvent) => {
    const el = containerRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left - 50) / (rect.width - 50)));
    setCurrentTime(ratio * duration);
  };

  const handleSplit = () => {
    if (selectedItemId && canSplit) splitClip(selectedItemId, currentTime);
  };

  const handleDelete = () => {
    if (!selectedItemId) return;
    if (!confirmDelete) { setConfirmDelete(true); return; }
    deleteClip(selectedItemId);
    setConfirmDelete(false);
  };

  return (
    <div ref={containerRef} className="px-1 py-2 space-y-0.5 select-none" style={{ touchAction: 'none' }}
      onPointerMove={(e) => { if (e.buttons > 0) handlePlayheadDrag(e); }}>

      {/* A7: Toolbar for split/delete */}
      {selectedVideoClip && (
        <div className="flex items-center gap-2 px-1 pb-1">
          <button onClick={handleSplit} disabled={!canSplit}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium ${canSplit ? 'bg-white/10 text-white/70 active:bg-white/20' : 'bg-white/5 text-white/20'}`}>
            <ScissorsIcon className="w-3.5 h-3.5" /> Couper
          </button>
          <button onClick={handleDelete}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium ${confirmDelete ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/70 active:bg-white/20'}`}>
            <TrashIcon className="w-3.5 h-3.5" /> {confirmDelete ? 'Confirmer' : 'Supprimer'}
          </button>
          {confirmDelete && (
            <button onClick={() => setConfirmDelete(false)}
              className="text-[10px] text-white/30 active:text-white/60">Annuler</button>
          )}
        </div>
      )}

      {/* Video tracks */}
      {getVideoTracks(tracks).map(t => (
        <div key={t.id} className="flex items-stretch h-12">
          <div className="w-[50px] shrink-0 flex items-center gap-1 px-1 text-white/30">
            {TRACK_ICONS.video}
            <span className="text-[8px] truncate">{t.label}</span>
          </div>
          <div className="flex-1 relative bg-white/5 rounded">
            {t.clips?.map(c => {
              const clipDur = c.trimEnd - c.trimStart;
              // Show full source extent as grey zone behind the active clip
              const sourceLeft = refDuration > 0 ? (c.timelineStart / refDuration) * 100 : 0;
              const sourceWidth = refDuration > 0 ? (c.duration / refDuration) * 100 : 0;
              return (<div key={c.id}>
                {c.duration > clipDur && <div className="absolute top-1 bottom-1 rounded bg-white/5" style={{ left: `${sourceLeft}%`, width: `${sourceWidth}%` }} />}
                <TrackBlock id={c.id} trackId={t.id} label={c.file?.name?.slice(0, 12) ?? 'Clip'} startMs={c.timelineStart} endMs={c.timelineStart + clipDur}
                  duration={refDuration} color="bg-emerald-500/25" selected={selectedItemId === c.id} onTrimChange={(s, e) => updateClipTrim(c.id, s, e)} />
              </div>);
            })}
          </div>
        </div>
      ))}
      {/* Add video button */}
      <div className="px-1">
        <button onClick={() => addFileRef.current?.click()}
          className="flex items-center gap-1 px-2 py-1 text-[10px] text-white/40 border border-dashed border-white/20 rounded-md active:bg-white/10">
          <PlusIcon className="w-3 h-3" /> Ajouter video
        </button>
        <input ref={addFileRef} type="file" accept="video/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) addVideoClip(f); }} />
      </div>
      {/* Subtitle track */}
      {(() => {
        const st = getSubtitleTrack(tracks);
        if (!st?.subtitles) return null;
        return (
          <div key={st.id} className="flex items-stretch h-12">
            <div className="w-[50px] shrink-0 flex items-center gap-1 px-1 text-white/30">
              {TRACK_ICONS.subtitle}
              <span className="text-[8px] truncate">Sub</span>
            </div>
            <div className="flex-1 relative bg-white/5 rounded">
              {st.subtitles.blocks.map(b => (
                <TrackBlock key={b.id} id={b.id} trackId={st.id} label={b.text.slice(0, 15)}
                  startMs={b.startMs} endMs={b.endMs} duration={refDuration} color="bg-blue-400/25"
                  selected={selectedItemId === b.id} />
              ))}
            </div>
          </div>
        );
      })()}
      {/* Audio track with waveform (A4) */}
      {(() => {
        const at = getAudioTrack(tracks);
        if (!at) return null;
        return (
          <div key={at.id} className="flex items-stretch h-12">
            <div className="w-[50px] shrink-0 flex items-center gap-1 px-1 text-white/30">
              {TRACK_ICONS.audio}
              <span className="text-[8px] truncate">Audio</span>
            </div>
            <div className="flex-1 relative bg-white/5 rounded">
              {at.audioClips?.map(a => (
                <div key={a.id} className="absolute top-1 bottom-1 left-0 right-0 rounded bg-amber-400/25">
                  {a.blobUrl && <AudioWaveform blobUrl={a.blobUrl} width={300} height={40} />}
                  <span className="relative text-[8px] text-white/70 truncate px-1 pointer-events-none z-10">
                    {a.name.slice(0, 15)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
      {/* Playhead */}
      <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: `calc(50px + ${playheadPos}% * (100% - 50px) / 100%)`, width: 2 }}>
        <div className="w-0.5 h-full bg-emerald-400" />
      </div>
    </div>
  );
}
