import { useState, useRef, useCallback } from 'react';

export interface UseCameraCaptureReturn {
  isOpen: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  capturedImage: string | null;
  open: () => Promise<void>;
  capture: () => string | null;
  retake: () => void;
  close: () => void;
  error: string | null;
}

export function useCameraCapture(): UseCameraCaptureReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const open = useCallback(async () => {
    setError(null);
    setCapturedImage(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera not supported on this device');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      setIsOpen(true);

      // Attach stream to video element after state update
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
    } catch (err: unknown) {
      const message = err instanceof DOMException
        ? err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in your browser settings.'
          : err.name === 'NotFoundError'
          ? 'No camera found on this device'
          : `Camera error: ${err.message}`
        : 'Failed to access camera';
      setError(message);
    }
  }, []);

  const capture = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    // Pause the stream but don't stop it (allow retake)
    video.pause();
    setCapturedImage(dataUrl);
    return dataUrl;
  }, []);

  const retake = useCallback(() => {
    setCapturedImage(null);
    if (videoRef.current && streamRef.current) {
      videoRef.current.play();
    }
  }, []);

  const close = useCallback(() => {
    stopStream();
    setCapturedImage(null);
    setIsOpen(false);
    setError(null);
  }, [stopStream]);

  return { isOpen, videoRef, capturedImage, open, capture, retake, close, error };
}
