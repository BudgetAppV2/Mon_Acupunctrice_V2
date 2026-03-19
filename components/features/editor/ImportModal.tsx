'use client';

import { useState, useRef } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { useMediaRecorder } from '@/lib/hooks/useMediaRecorder';
import { ArrowUpTrayIcon, VideoCameraIcon, StopIcon } from '@heroicons/react/24/outline';

export default function ImportModal() {
  const { setVideoFile } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'choose' | 'recording'>('choose');

  const { isRecording, startRecording, stopRecording } = useMediaRecorder({
    onRecordingComplete: (file) => setVideoFile(file),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setVideoFile(file);
  };

  const handleRecord = async () => {
    if (isRecording) {
      stopRecording();
      setMode('choose');
    } else {
      setMode('recording');
      await startRecording();
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black px-8">
      <h2 className="text-xl font-semibold text-white mb-2">Importer une vidéo</h2>
      <p className="text-sm text-gray-400 mb-8 text-center">
        Choisis un fichier ou filme directement
      </p>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        {/* Import fichier */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 py-3 px-6 bg-sage text-white rounded-xl font-medium"
        >
          <ArrowUpTrayIcon className="w-5 h-5" />
          Choisir un fichier
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Enregistrement webcam/caméra */}
        <button
          onClick={handleRecord}
          className={`flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium border ${
            isRecording
              ? 'bg-red-500 text-white border-red-500'
              : 'bg-transparent text-white border-gray-600'
          }`}
        >
          {isRecording ? (
            <>
              <StopIcon className="w-5 h-5" />
              Arrêter
            </>
          ) : (
            <>
              <VideoCameraIcon className="w-5 h-5" />
              Filmer
            </>
          )}
        </button>
      </div>

      {mode === 'recording' && !isRecording && (
        <p className="text-sm text-gray-400 mt-4">Enregistrement terminé</p>
      )}
    </div>
  );
}
