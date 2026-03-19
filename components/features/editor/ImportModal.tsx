'use client';

import { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { useMediaRecorder } from '@/lib/hooks/useMediaRecorder';
import { ArrowUpTrayIcon, VideoCameraIcon, StopIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

type ImportMode = 'choose' | 'preview' | 'countdown' | 'recording';

function formatElapsed(s: number): string {
  const m = Math.floor(s / 60);
  return `${m.toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

export default function ImportModal() {
  const { setVideoFile } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [mode, setMode] = useState<ImportMode>('choose');
  const [countdown, setCountdown] = useState(3);
  const [elapsed, setElapsed] = useState(0);

  const { stream, isRecording, openCamera, startRecording, stopRecording, closeCamera } =
    useMediaRecorder({
      onRecordingComplete: (file) => { closeCamera(); setVideoFile(file); },
    });

  // Connecter le stream au <video> pour la preview live
  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  // Cleanup caméra + countdown au démontage
  useEffect(() => {
    return () => {
      closeCamera();
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [closeCamera]);

  // Timer pour afficher la durée d'enregistrement
  useEffect(() => {
    if (mode !== 'recording') return;
    setElapsed(0);
    const timer = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, [mode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setVideoFile(file);
  };

  const handleOpenCamera = async () => {
    try {
      await openCamera();
      setMode('preview');
    } catch { /* permission refusée ou caméra indisponible */ }
  };

  const handleStartCountdown = () => {
    setMode('countdown');
    let count = 3;
    setCountdown(count);
    countdownRef.current = setInterval(() => {
      count--;
      if (count === 0) {
        clearInterval(countdownRef.current!);
        countdownRef.current = null;
        setMode('recording');
        startRecording();
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const handleStop = () => { stopRecording(); setMode('choose'); };

  const handleBack = () => {
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    closeCamera();
    setMode('choose');
  };

  // --- Mode caméra : preview / countdown / recording ---
  if (mode !== 'choose') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col">
        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />

        <button onClick={handleBack} className="absolute top-4 left-4 z-20 text-white p-2">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>

        {mode === 'countdown' && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="text-8xl font-bold text-white drop-shadow-lg">{countdown}</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center pb-12">
          {mode === 'preview' && (
            <button onClick={handleStartCountdown} className="py-3 px-8 bg-sage text-white rounded-xl font-semibold">
              Démarrer
            </button>
          )}
          {mode === 'recording' && (
            <>
              <span className="text-white font-mono text-lg mb-3">{formatElapsed(elapsed)}</span>
              <button onClick={handleStop} className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center">
                <StopIcon className="w-8 h-8 text-white" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // --- Mode choix : fichier ou caméra ---
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black px-8">
      <h2 className="text-xl font-semibold text-white mb-2">Importer une vidéo</h2>
      <p className="text-sm text-gray-400 mb-8 text-center">Choisis un fichier ou filme directement</p>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 py-3 px-6 bg-sage text-white rounded-xl font-medium"
        >
          <ArrowUpTrayIcon className="w-5 h-5" />
          Choisir un fichier
        </button>
        <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
        <button
          onClick={handleOpenCamera}
          className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium border bg-transparent text-white border-gray-600"
        >
          <VideoCameraIcon className="w-5 h-5" />
          Filmer
        </button>
      </div>
    </div>
  );
}
