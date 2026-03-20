'use client';

import { useRef, useEffect, useState } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { useMediaRecorder } from '@/lib/hooks/useMediaRecorder';
import { XMarkIcon, FolderOpenIcon, VideoCameraIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

type Mode = null | 'webcam' | 'screen';

export default function ImportModal() {
  const loadVideo = useEditorStore((s) => s.loadVideo);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<Mode>(null);

  const {
    stream, isRecording, countdown,
    startWebcam, startScreenCapture, startRecording, stopRecording, cleanup,
  } = useMediaRecorder();

  // Attacher le stream à la preview — comme dans V1
  useEffect(() => {
    if (previewRef.current && stream) {
      previewRef.current.srcObject = stream;
    }
  }, [stream]);

  // Cleanup au démontage uniquement
  useEffect(() => () => cleanup(), [cleanup]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadVideo(f, URL.createObjectURL(f));
  };

  const handleWebcam = async () => {
    try { await startWebcam(); setMode('webcam'); } catch { /* permission refusée */ }
  };

  const handleScreen = async () => {
    try { await startScreenCapture(); setMode('screen'); } catch { /* non supporté */ }
  };

  // Déclenche countdown → enregistrement → resolve → loadVideo
  const handleRecord = async () => {
    if (!stream) return;
    const result = await startRecording(stream);
    if (!result) return; // annulé
    cleanup();
    loadVideo(result.file, result.url);
  };

  const handleCancel = () => {
    cleanup();
    setMode(null);
  };

  // Plein écran quand stream actif — preview 9:16 centré
  if (stream) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">

        {/* Preview plein écran — la caméra affiche sa résolution native,
           le crop 9:16 sera fait à l'export */}
        <div
          className="relative overflow-hidden w-full h-full"
        >
          <video
            ref={previewRef}
            autoPlay playsInline muted
            className={`w-full h-full object-cover ${mode === 'webcam' ? '-scale-x-100' : ''}`}
          />

          {/* Bouton Annuler — top-left */}
          <button
            onClick={handleCancel}
            className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm transition"
          >
            <XMarkIcon className="w-4 h-4" />
            Annuler
          </button>

          {/* REC indicator — top-right */}
          {isRecording && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white text-sm font-semibold">REC</span>
            </div>
          )}

          {/* Countdown — overlay centré */}
          {countdown > 0 && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
              <span className="text-9xl font-bold text-white drop-shadow-lg animate-pulse">
                {countdown}
              </span>
            </div>
          )}

          {/* Bouton record — bottom center */}
          <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center">
            {!isRecording ? (
              <button
                onClick={handleRecord}
                className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 border-4 border-white shadow-lg transition flex items-center justify-center"
              >
                <span className="w-8 h-8 rounded-full bg-white" />
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="w-20 h-20 rounded-full bg-red-600 border-4 border-white shadow-lg animate-pulse flex items-center justify-center"
              >
                <span className="w-7 h-7 rounded-md bg-white" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Modal blanche — 3 options
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 text-center mb-4">
          Importer une vidéo
        </h2>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-sage hover:bg-sage/5 transition text-left"
        >
          <FolderOpenIcon className="w-6 h-6 text-sage shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-800">Depuis l&apos;appareil</p>
            <p className="text-xs text-gray-400">MP4, MOV, WebM</p>
          </div>
        </button>
        <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFile} className="hidden" />

        <button
          onClick={handleWebcam}
          className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-sage hover:bg-sage/5 transition text-left"
        >
          <VideoCameraIcon className="w-6 h-6 text-sage shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-800">Webcam</p>
            <p className="text-xs text-gray-400">Caméra frontale avec audio</p>
          </div>
        </button>

        <button
          onClick={handleScreen}
          className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-sage hover:bg-sage/5 transition text-left"
        >
          <ComputerDesktopIcon className="w-6 h-6 text-sage shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-800">Enregistrer l&apos;écran</p>
            <p className="text-xs text-gray-400">Partage d&apos;écran avec audio</p>
          </div>
        </button>
      </div>
    </div>
  );
}
