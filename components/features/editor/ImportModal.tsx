'use client';

import { useRef, useEffect, useState } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { useMediaRecorder } from '@/lib/hooks/useMediaRecorder';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function ImportModal() {
  const loadVideo = useEditorStore((s) => s.loadVideo);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mirrored, setMirrored] = useState(false);

  const {
    stream, isRecording, countdown,
    startWebcam, startScreenCapture, startRecording, stopRecording, cleanup,
  } = useMediaRecorder();

  // Connecter le stream à la preview vidéo
  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  // Cleanup au démontage
  useEffect(() => () => cleanup(), [cleanup]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadVideo(f, URL.createObjectURL(f));
  };

  const handleWebcam = async () => {
    try { await startWebcam(); setMirrored(true); } catch { /* permission refusée */ }
  };

  const handleScreen = async () => {
    try { await startScreenCapture(); setMirrored(false); } catch { /* non supporté */ }
  };

  // Countdown → enregistrement → onstop → loadVideo
  const handleRecord = async () => {
    if (!stream) return;
    const result = await startRecording(stream);
    if (!result) return;
    cleanup();
    loadVideo(result.file, result.url);
  };

  const handleCancel = () => { cleanup(); setMirrored(false); };

  // --- Plein écran quand stream actif ---
  if (stream) {
    return (
      <div className="fixed inset-0 bg-black">
        <video
          ref={videoRef}
          autoPlay playsInline muted
          className={`absolute inset-0 w-full h-full object-cover ${mirrored ? 'scale-x-[-1]' : ''}`}
        />

        {/* Annuler — top-left, backdrop-blur */}
        <button
          onClick={handleCancel}
          className="absolute top-6 left-6 z-20 w-10 h-10 rounded-full bg-black/30 backdrop-blur flex items-center justify-center"
        >
          <XMarkIcon className="w-5 h-5 text-white" />
        </button>

        {/* REC indicator — pulsant en haut à droite */}
        {isRecording && (
          <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-500 font-semibold text-sm">REC</span>
          </div>
        )}

        {/* Countdown overlay — fond semi-transparent */}
        {countdown > 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30">
            <span className="text-9xl font-bold text-white drop-shadow-lg">{countdown}</span>
          </div>
        )}

        {/* Bouton record — bottom center, 80px, cercle/carré blanc */}
        {countdown === 0 && (
          <div className="absolute bottom-12 left-0 right-0 z-20 flex justify-center">
            <button
              onClick={isRecording ? stopRecording : handleRecord}
              className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center border-4 border-white"
            >
              {isRecording
                ? <div className="w-7 h-7 rounded-sm bg-white" />
                : <div className="w-14 h-14 rounded-full bg-white" />
              }
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- Modal blanche — 3 boutons ---
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl p-6 w-[320px] space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 text-center mb-4">Importer une vidéo</h2>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3 rounded-xl bg-sage text-white font-medium"
        >
          Choisir un fichier
        </button>
        <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFile} className="hidden" />
        <button onClick={handleWebcam} className="w-full py-3 rounded-xl border border-gray-300 text-gray-800 font-medium">
          Webcam
        </button>
        <button onClick={handleScreen} className="w-full py-3 rounded-xl border border-gray-300 text-gray-800 font-medium">
          Filmer écran
        </button>
      </div>
    </div>
  );
}
