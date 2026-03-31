import { useState, useCallback } from 'react';
import { GPSCoordinate } from '../types';

export type GPSError = 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED';

interface UseGPSCaptureReturn {
  position: GPSCoordinate | null;
  error: GPSError | null;
  isLoading: boolean;
  requestPosition: () => void;
  reset: () => void;
}

export function useGPSCapture(): UseGPSCaptureReturn {
  const [position, setPosition] = useState<GPSCoordinate | null>(null);
  const [error, setError] = useState<GPSError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('NOT_SUPPORTED');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPosition(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          capturedAt: new Date().toISOString(),
        });
        setIsLoading(false);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('PERMISSION_DENIED');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('POSITION_UNAVAILABLE');
            break;
          case err.TIMEOUT:
            setError('TIMEOUT');
            break;
          default:
            setError('POSITION_UNAVAILABLE');
        }
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, []);

  const reset = useCallback(() => {
    setPosition(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { position, error, isLoading, requestPosition, reset };
}
