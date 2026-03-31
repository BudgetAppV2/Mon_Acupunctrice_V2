'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useMediaRecorder } from '../lib/useMediaRecorder';
import { useSubtitleStore } from '../lib/store';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Props {
  onClose: () => void;
}

export default function CameraOverlay({ onClose }: Props) {
  const { stream, isRecording, countdown, startWebcam, startRecording, stopRecording, cleanup } = useMediaRecorder();
  const { addVideoClip } = useSubtitleStore();
  const viewfinderRef = useRef<HTMLVideoElement>(null);
  const recordingRef = useRef(false);

  // Start camera on mount
  useEffect(() => {
    startWebcam().catch(() => onClose());
    return () => cleanup();
  }, [startWebcam, cleanup, onClose]);

  // Attach stream to viewfinder
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
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 relative z-10">
        <button onClick={handleCancel} className="p-2 rounded-full bg-black/40 active:bg-black/60">
          <XMarkIcon className="w-6 h-6 text-white" />
        </button>
        {isRecording && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm text-white font-medium">REC</span>
          </div>
        )}
        <div className="w-10" />
      </div>

      {/* Viewfinder — mirrored for selfie */}
      <div className="flex-1 relative overflow-hidden">
        <video ref={viewfinderRef} autoPlay playsInline muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }} />

        {/* Countdown overlay */}
        {countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="text-8xl font-bold text-white animate-countdown"
              style={{ animation: 'countdownPulse 1s ease-out' }}>
              {countdown}
            </span>
          </div>
        )}
      </div>

      {/* Record button */}
      <div className="flex items-center justify-center py-6">
        <button onClick={handleRecord}
          className={`w-16 h-16 rounded-full border-4 border-white flex items-center justify-center transition-all ${isRecording ? 'bg-transparent' : 'bg-transparent'}`}>
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
