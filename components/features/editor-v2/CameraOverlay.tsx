'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useMediaRecorder } from '@/lib/editor-v2/useMediaRecorder';
import { useEditorV2Store } from '@/lib/store/useEditorV2Store';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Props {
  onClose: () => void;
}

export default function CameraOverlay({ onClose }: Props) {
  const { stream, isRecording, countdown, startWebcam, startRecording, stopRecording, cleanup } = useMediaRecorder();
  const { addVideoClip } = useEditorV2Store();
  const viewfinderRef = useRef<HTMLVideoElement>(null);
  const recordingRef = useRef(false);

  // Start webcam on mount — onClose excluded from deps to avoid re-fire on parent re-render
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const mountedRef = useRef(false);
  useEffect(() => {
    console.log('[CAMERA] useEffect fired', { alreadyMounted: mountedRef.current, startWebcam: typeof startWebcam, cleanup: typeof cleanup });
    if (mountedRef.current) {
      console.log('[CAMERA] SKIPPING — already mounted (effect re-fired due to dep change)');
      return;
    }
    mountedRef.current = true;
    console.log('[CAMERA] startWebcam called');
    startWebcam().then(() => {
      console.log('[CAMERA] startWebcam resolved OK');
    }).catch((err) => {
      console.log('[CAMERA] startWebcam FAILED', err);
      onCloseRef.current();
    });
    return () => {
      console.log('[CAMERA] cleanup called');
      cleanup();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startWebcam, cleanup]);

  useEffect(() => {
    if (viewfinderRef.current && stream) {
      viewfinderRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleRecord = useCallback(async () => {
    if (!stream) return;
    if (recordingRef.current) {
      stopRecording();
      recordingRef.current = false;
      return;
    }
    recordingRef.current = true;
    const result = await startRecording(stream);
    recordingRef.current = false;
    if (result) {
      addVideoClip(result.file);
      onClose();
    }
  }, [stream, startRecording, stopRecording, addVideoClip, onClose]);

  const handleCancel = useCallback(() => {
    cleanup();
    onClose();
  }, [cleanup, onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {/* Video fills the ENTIRE screen — no flex, no containers */}
      <video ref={viewfinderRef} autoPlay playsInline muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }} />

      {/* Controls overlaid on top of video */}
      {/* Close button — top left */}
      <button onClick={handleCancel}
        className="absolute top-[env(safe-area-inset-top,12px)] left-4 z-10 p-2 rounded-full bg-black/40 active:bg-black/60"
        style={{ marginTop: 12 }}>
        <XMarkIcon className="w-6 h-6 text-white" />
      </button>

      {/* REC indicator — top center */}
      {isRecording && (
        <div className="absolute top-[env(safe-area-inset-top,12px)] left-1/2 -translate-x-1/2 z-10 flex items-center gap-2"
          style={{ marginTop: 16 }}>
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm text-white font-medium">REC</span>
        </div>
      )}

      {/* Countdown — center */}
      {countdown > 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30">
          <span className="text-8xl font-bold text-white" style={{ animation: 'countdownPulse 1s ease-out' }}>
            {countdown}
          </span>
        </div>
      )}

      {/* Record button — bottom center */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 20px), 20px)', paddingTop: 16 }}>
        <button onClick={handleRecord}
          className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center">
          {isRecording ? (
            <div className="w-6 h-6 rounded-sm bg-red-500" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-red-500" />
          )}
        </button>
      </div>

      <style>{`
        @keyframes countdownPulse {
          0% { transform: scale(1.5); opacity: 1; }
          100% { transform: scale(1); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
