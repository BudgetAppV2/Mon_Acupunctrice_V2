'use client';

import { useState, useRef, useCallback } from 'react';

interface UseMediaRecorderOptions {
  onRecordingComplete: (file: File) => void;
}

/**
 * Hook pour enregistrer une vidéo via la webcam/caméra.
 * Gère automatiquement le format (webm sur Chrome, mp4 sur Safari)
 * et corrige les métadonnées de durée webm via fix-webm-duration.
 */
export function useMediaRecorder({ onRecordingComplete }: UseMediaRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef(0);

  const startRecording = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1080 }, height: { ideal: 1920 } },
      audio: true,
    });
    chunksRef.current = [];

    // Chrome = webm, Safari = mp4
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

    const recorder = new MediaRecorder(stream, { mimeType });
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      const isWebm = mimeType.includes('webm');
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const duration = Date.now() - startTimeRef.current;

      // Corriger la durée incorrecte des fichiers webm (bug MediaRecorder)
      let fixedBlob = blob;
      if (isWebm) {
        try {
          const mod = await import('fix-webm-duration');
          fixedBlob = await (mod.default || mod)(blob, duration);
        } catch { /* continuer sans correction */ }
      }

      const ext = isWebm ? 'webm' : 'mp4';
      onRecordingComplete(new File([fixedBlob], `recording.${ext}`, { type: mimeType }));
      stream.getTracks().forEach((t) => t.stop());
    };

    startTimeRef.current = Date.now();
    recorder.start(1000);
    setIsRecording(true);
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    setIsRecording(false);
  }, []);

  return { isRecording, startRecording, stopRecording };
}
