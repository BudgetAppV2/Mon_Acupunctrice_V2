'use client';

import { useState, useRef, useCallback } from 'react';

export interface RecordingResult { file: File; url: string }

/**
 * Hook caméra + enregistrement.
 * startWebcam/startScreenCapture ouvrent le stream (preview).
 * startRecording(stream) lance le countdown 3-2-1 puis le MediaRecorder.
 * La Promise se résout quand recorder.onstop se déclenche avec {file, url}.
 */
export function useMediaRecorder() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef(0);
  const cancelledRef = useRef(false);

  const startWebcam = useCallback(async () => {
    // Demander la resolution la plus haute possible — Safari iOS respecte ideal
    const s = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: true,
    });
    streamRef.current = s;
    setStream(s);
    return s;
  }, []);

  const startScreenCapture = useCallback(async () => {
    const s = await navigator.mediaDevices.getDisplayMedia({ video: true });
    streamRef.current = s;
    setStream(s);
    return s;
  }, []);

  const startRecording = useCallback(async (s: MediaStream): Promise<RecordingResult | null> => {
    cancelledRef.current = false;

    // Countdown 3-2-1
    for (let i = 3; i > 0; i--) {
      if (cancelledRef.current) { setCountdown(0); return null; }
      setCountdown(i);
      await new Promise(r => setTimeout(r, 1000));
    }
    if (cancelledRef.current) { setCountdown(0); return null; }
    setCountdown(0);
    setIsRecording(true);

    // Préférer MP4 — Safari iOS supporte mal le playback WebM même si
    // isTypeSupported('video/webm') retourne true sur certaines versions
    const mimeType = MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4'
      : MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9'
      : 'video/webm';

    return new Promise<RecordingResult | null>((resolve) => {
      chunksRef.current = [];
      const recorder = new MediaRecorder(s, { mimeType });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        setIsRecording(false);
        if (cancelledRef.current) { resolve(null); return; }
        const isWebm = mimeType.includes('webm');
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const dur = Date.now() - startTimeRef.current;
        let fixed = blob;
        if (isWebm) {
          try {
            const mod = await import('fix-webm-duration');
            fixed = await (mod.default || mod)(blob, dur);
          } catch { /* continuer sans correction */ }
        }
        const ext = isWebm ? 'webm' : 'mp4';
        const file = new File([fixed], `recording.${ext}`, { type: mimeType });
        resolve({ file, url: URL.createObjectURL(fixed) });
      };

      startTimeRef.current = Date.now();
      recorder.start(1000);
    });
  }, []);

  const stopRecording = useCallback(() => { recorderRef.current?.stop(); }, []);

  const cleanup = useCallback(() => {
    cancelledRef.current = true;
    recorderRef.current?.stop();
    // Utiliser la ref pour éviter la dépendance sur stream
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setStream(null);
    setIsRecording(false);
    setCountdown(0);
  }, []); // Pas de dépendance — utilise les refs

  return {
    stream, isRecording, countdown,
    startWebcam, startScreenCapture, startRecording, stopRecording, cleanup,
  };
}
