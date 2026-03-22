'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ref, uploadBytes } from 'firebase/storage';
import { getFirebaseStorage, getFirebaseAuth } from '@/lib/firebase';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline';

const MAX_SECONDS = 60;

interface Props {
  onResult: (result: { title: string; notes: string; category?: string }) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export default function VoiceRecordButton({ onResult, onError, disabled }: Props) {
  const [state, setState] = useState<'idle' | 'recording' | 'processing'>('idle');
  const [elapsed, setElapsed] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup au démontage
  useEffect(() => () => {
    recorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4'
        : MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        if (chunksRef.current.length === 0) { setState('idle'); return; }

        setState('processing');
        try {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
          const uid = getFirebaseAuth().currentUser?.uid;
          if (!uid) throw new Error('Non connecte');

          // Upload vers Storage
          const storagePath = `temp/${uid}/${Date.now()}.${ext}`;
          const storageRef = ref(getFirebaseStorage(), storagePath);
          await uploadBytes(storageRef, blob, { contentType: mimeType });

          // Appeler l'API voice-idea
          const res = await fetch('/api/voice-idea', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ storagePath }),
          });
          if (!res.ok) throw new Error('Transcription impossible');

          const data = await res.json();
          if (data.error) throw new Error(data.error);
          onResult(data);
        } catch (err) {
          onError?.(err instanceof Error ? err.message : 'Erreur de transcription');
        }
        setState('idle');
        setElapsed(0);
      };

      setState('recording');
      setElapsed(0);
      recorder.start(1000);

      // Timer
      timerRef.current = setInterval(() => {
        setElapsed(prev => {
          if (prev >= MAX_SECONDS - 1) { stopRecording(); return prev; }
          return prev + 1;
        });
      }, 1000);
    } catch {
      onError?.('Micro non disponible');
      setState('idle');
    }
  }, [onResult, onError, stopRecording]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (state === 'processing') {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sage" />
        <span className="text-xs">Transcription...</span>
      </div>
    );
  }

  if (state === 'recording') {
    return (
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-xs text-gray-600 font-mono">{fmt(elapsed)} / {fmt(MAX_SECONDS)}</span>
        <button type="button" onClick={stopRecording} className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center">
          <StopIcon className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    );
  }

  return (
    <button type="button" onClick={startRecording} disabled={disabled} className="p-1.5 text-gray-400 hover:text-sage transition disabled:opacity-50" aria-label="Dicter une idee">
      <MicrophoneIcon className="w-5 h-5" />
    </button>
  );
}
