'use client';

import { useState, useRef, useCallback } from 'react';

interface UseMediaRecorderOptions {
  onRecordingComplete: (file: File) => void;
}

/**
 * Hook pour la caméra et l'enregistrement vidéo.
 * Sépare l'ouverture de la caméra (preview) du démarrage de l'enregistrement
 * pour permettre un countdown avant de filmer.
 */
export function useMediaRecorder({ onRecordingComplete }: UseMediaRecorderOptions) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef(0);

  // Ouvrir la caméra sans enregistrer (pour la preview)
  const openCamera = useCallback(async () => {
    const s = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1080 }, height: { ideal: 1920 } },
      audio: true,
    });
    setStream(s);
  }, []);

  // Lancer l'enregistrement sur le stream existant
  const startRecording = useCallback(() => {
    if (!stream) return;
    chunksRef.current = [];

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
    };

    startTimeRef.current = Date.now();
    recorder.start(1000);
    setIsRecording(true);
  }, [stream, onRecordingComplete]);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    setIsRecording(false);
  }, []);

  // Libérer la caméra (stopper tous les tracks)
  const closeCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setIsRecording(false);
  }, [stream]);

  return { stream, isRecording, openCamera, startRecording, stopRecording, closeCamera };
}
