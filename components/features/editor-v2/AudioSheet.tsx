'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useEditorV2Store, getAudioTrack } from '@/lib/store/useEditorV2Store';
import { useMusicSearch } from '@/lib/hooks/useMusicSearch';
import { XMarkIcon, MusicalNoteIcon, MagnifyingGlassIcon, PlayIcon, StopIcon, ArrowDownTrayIcon, SparklesIcon } from '@heroicons/react/24/outline';

const MOODS = ['relaxing', 'acoustic', 'ambient', 'energetic'] as const;

const PRESETS = [
  { label: 'Zen', prompt: 'Genre: Ambient, Meditation Style: Instrumental, Soft Mood: Calm, Peaceful, piano and nature sounds' },
  { label: 'Bien-etre', prompt: 'Genre: New Age, Wellness Style: Instrumental, Warm Mood: Soothing, Healing, soft strings' },
  { label: 'Energique', prompt: 'Genre: Pop, Upbeat Style: Instrumental, Dynamic Mood: Energetic, Positive, modern beat' },
  { label: 'Cinematique', prompt: 'Genre: Cinematic, Orchestral Style: Instrumental, Epic Mood: Dramatic, Emotional' },
] as const;

type Tab = 'library' | 'generate';
type GenState = 'idle' | 'generating' | 'done' | 'error';

export default function AudioSheet() {
  const { tracks, voiceVolume, audioVolume, audioDucking,
    addAudioClip, removeAudioClip, setVoiceVolume, setAudioVolume,
    setAudioDucking, setAudioFade } = useEditorV2Store();
  const { tracks: jamTracks, loading, search } = useMusicSearch();
  const [tab, setTab] = useState<Tab>('library');
  const [query, setQuery] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const previewRef = useRef<HTMLAudioElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // TemPolor state
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<'TemPolor i3' | 'TemPolor i3.5'>('TemPolor i3.5');
  const [genState, setGenState] = useState<GenState>('idle');
  const [genError, setGenError] = useState<string | null>(null);
  const [genElapsed, setGenElapsed] = useState(0);
  const [genResult, setGenResult] = useState<{ title: string; audioUrl: string; duration: number } | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const audioTrack = getAudioTrack(tracks);
  const audioClip = audioTrack?.audioClips?.[0] ?? null;

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    };
  }, []);

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

  const importGenerated = async (audioUrl: string, title: string) => {
    previewRef.current?.pause();
    setPreviewUrl(null);
    setImporting(true);
    try {
      const res = await fetch(`/api/proxy-audio?url=${encodeURIComponent(audioUrl)}`);
      const blob = await res.blob();
      const file = new File([blob], `${title}.mp3`, { type: 'audio/mpeg' });
      addAudioClip(file, title);
    } catch { /* import failed */ }
    finally { setImporting(false); }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) addAudioClip(f, f.name);
  };

  const generate = useCallback(async () => {
    if (!prompt.trim()) return;
    setGenState('generating');
    setGenError(null);
    setGenResult(null);
    setGenElapsed(0);

    // Elapsed timer
    const startTime = Date.now();
    elapsedRef.current = setInterval(() => setGenElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);

    try {
      const res = await fetch('/api/tempolor/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), model }),
      });
      if (!res.ok) throw new Error('Generation echouee');
      const data = await res.json() as { data?: { item_ids?: string[] } };
      const itemIds = data.data?.item_ids;
      if (!itemIds?.length) throw new Error('Pas d\'item_ids retournes');

      // Poll for status
      pollingRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch('/api/tempolor/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item_ids: itemIds }),
          });
          if (!statusRes.ok) return;
          const statusData = await statusRes.json() as {
            data?: { instrumentals?: { item_id: string; status: string; title: string; audio_url: string; duration: number }[] }
          };
          const instrumental = statusData.data?.instrumentals?.[0];
          if (!instrumental) return;

          if (instrumental.status === 'succeeded') {
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (elapsedRef.current) clearInterval(elapsedRef.current);
            setGenState('done');
            setGenResult({ title: instrumental.title, audioUrl: instrumental.audio_url, duration: instrumental.duration });
          } else if (instrumental.status === 'failed') {
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (elapsedRef.current) clearInterval(elapsedRef.current);
            setGenState('error');
            setGenError('La generation a echoue');
          }
        } catch { /* polling error — continue */ }
      }, 3000);
    } catch (err) {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
      setGenState('error');
      setGenError(err instanceof Error ? err.message : 'Erreur');
    }
  }, [prompt, model]);

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
        <div className="flex gap-4 justify-center py-1">
          <VerticalFader label="Voix" value={voiceVolume} onChange={setVoiceVolume} color="emerald" />
          <VerticalFader label="Musique" value={audioVolume} onChange={setAudioVolume} color="amber" />
        </div>
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

  return (
    <div className="px-3 py-2 space-y-2">
      <audio ref={previewRef} />

      {/* Tab toggle */}
      <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
        <button onClick={() => setTab('library')}
          className={`flex-1 py-1 rounded-md text-[10px] font-medium transition ${tab === 'library' ? 'bg-emerald-500/20 text-emerald-300' : 'text-white/40'}`}>
          Bibliotheque
        </button>
        <button onClick={() => setTab('generate')}
          className={`flex-1 py-1 rounded-md text-[10px] font-medium transition flex items-center justify-center gap-1 ${tab === 'generate' ? 'bg-emerald-500/20 text-emerald-300' : 'text-white/40'}`}>
          <SparklesIcon className="w-3 h-3" /> Generer
        </button>
      </div>

      {/* Library tab (Jamendo) */}
      {tab === 'library' && (
        <>
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
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {MOODS.map(m => (
              <button key={m} onClick={() => search(undefined, m)}
                className="shrink-0 px-2 py-0.5 rounded-full text-[10px] border border-white/10 text-white/40 active:border-white/30">
                {m}
              </button>
            ))}
            <label className="shrink-0 px-2 py-0.5 rounded-full text-[10px] border border-white/10 text-white/40 cursor-pointer">
              Fichier local
              <input type="file" accept="audio/*" onChange={handleFile} className="hidden" />
            </label>
          </div>
          {loading && <p className="text-[10px] text-white/30 text-center py-1">Recherche...</p>}
          {importing && <p className="text-[10px] text-emerald-400/60 text-center py-1">Import...</p>}
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
          {jamTracks.length === 0 && !loading && (
            <button onClick={() => fileRef.current?.click()}
              className="w-full py-3 rounded-lg border border-dashed border-white/15 text-white/40 text-[11px] flex items-center justify-center gap-2 active:bg-white/5">
              <MusicalNoteIcon className="w-4 h-4" /> Fichier local
            </button>
          )}
        </>
      )}

      {/* Generate tab (TemPolor) */}
      {tab === 'generate' && (
        <>
          {/* Prompt presets */}
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {PRESETS.map(p => (
              <button key={p.label} onClick={() => setPrompt(p.prompt)}
                className="shrink-0 px-2 py-0.5 rounded-full text-[10px] border border-white/10 text-white/40 active:border-emerald-400/40 active:text-emerald-300">
                {p.label}
              </button>
            ))}
          </div>

          {/* Prompt textarea */}
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
            placeholder="Decrivez la musique souhaitee..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 text-white text-[11px] rounded-lg px-2 py-1.5 focus:outline-none resize-none" />

          {/* Model selector */}
          <div className="flex gap-1">
            {(['TemPolor i3', 'TemPolor i3.5'] as const).map(m => (
              <button key={m} onClick={() => setModel(m)}
                className={`flex-1 py-1 rounded text-[10px] font-medium border transition ${model === m ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' : 'border-white/10 text-white/40'}`}>
                {m === 'TemPolor i3' ? 'i3 (2min)' : 'i3.5 (4.5min)'}
              </button>
            ))}
          </div>

          {/* Generate button */}
          {genState === 'idle' && (
            <button onClick={generate} disabled={!prompt.trim()}
              className={`w-full py-2 rounded-lg text-[11px] font-medium flex items-center justify-center gap-2 transition-colors ${
                prompt.trim() ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 active:bg-emerald-500/25'
                : 'bg-white/5 border border-white/10 text-white/25'
              }`}>
              <SparklesIcon className="w-4 h-4" /> Generer
            </button>
          )}

          {/* Generating state */}
          {genState === 'generating' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2 py-2">
                <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                <span className="text-[11px] text-emerald-300">Generation en cours... {genElapsed}s</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400/40 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          )}

          {/* Error state */}
          {genState === 'error' && (
            <div className="space-y-1.5">
              <p className="text-[10px] text-red-400/80 text-center">{genError}</p>
              <button onClick={() => setGenState('idle')}
                className="w-full py-1.5 rounded-lg border border-white/10 text-white/40 text-[10px]">
                Reessayer
              </button>
            </div>
          )}

          {/* Done state */}
          {genState === 'done' && genResult && (
            <div className="space-y-1.5 bg-white/5 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white/70 truncate">{genResult.title}</p>
                  <p className="text-[9px] text-white/30">{Math.floor(genResult.duration / 60)}:{(genResult.duration % 60).toString().padStart(2, '0')}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => togglePreview(genResult.audioUrl)}
                  className="flex-1 py-1.5 rounded-lg border border-white/10 text-white/50 text-[10px] flex items-center justify-center gap-1">
                  {previewUrl === genResult.audioUrl ? <><StopIcon className="w-3.5 h-3.5" /> Stop</> : <><PlayIcon className="w-3.5 h-3.5" /> Preview</>}
                </button>
                <button onClick={() => { importGenerated(genResult.audioUrl, genResult.title); setGenState('idle'); setGenResult(null); }}
                  className="flex-1 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] flex items-center justify-center gap-1">
                  <ArrowDownTrayIcon className="w-3.5 h-3.5" /> Ajouter
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <input ref={fileRef} type="file" accept="audio/*" onChange={handleFile} className="hidden" />
    </div>
  );
}

function VerticalFader({ label, value, onChange, color = 'emerald' }: {
  label: string; value: number; onChange: (v: number) => void; color?: 'emerald' | 'amber';
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const updateFromPointer = (e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const y = 1 - (e.clientY - rect.top) / rect.height;
    onChange(Math.max(0, Math.min(1, y)));
  };
  const onDown = (e: React.PointerEvent) => {
    e.stopPropagation(); e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    updateFromPointer(e);
  };
  const onMove = (e: React.PointerEvent) => { if (e.buttons === 0) return; updateFromPointer(e); };
  const fillColor = color === 'amber' ? 'bg-amber-400' : 'bg-emerald-400';
  const pct = Math.round(value * 100);

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] text-white/30">{pct}%</span>
      <div ref={containerRef} className="relative w-12 h-28 cursor-ns-resize"
        style={{ touchAction: 'none' }}
        onPointerDown={onDown} onPointerMove={onMove}>
        {/* Track background */}
        <div className="absolute left-1/2 -translate-x-1/2 w-[3px] h-full bg-white/10 rounded-full" />
        {/* Track filled */}
        <div className={`absolute left-1/2 -translate-x-1/2 w-[3px] bottom-0 rounded-full ${fillColor}/60`}
          style={{ height: `${pct}%` }} />
        {/* Thumb — fader knob */}
        <div className="absolute left-1/2 w-10 h-3 rounded-sm pointer-events-none
          bg-gradient-to-b from-white/95 to-white/80
          shadow-[0_1px_3px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.3)]"
          style={{ bottom: `${pct}%`, transform: 'translate(-50%, 50%)' }}>
          <div className="absolute top-1/2 left-2 right-2 h-px bg-black/20" />
        </div>
      </div>
      <span className="text-[10px] text-white/40 font-medium">{label}</span>
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
