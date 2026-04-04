import { useEffect } from 'react';
import { X, Camera, RotateCcw, Check, AlertTriangle } from 'lucide-react';
import { useCameraCapture } from '../hooks/useCameraCapture';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onCancel: () => void;
  gpsLabel?: string;
  gpsColor?: string;
}

export function CameraCapture({ onCapture, onCancel, gpsLabel, gpsColor }: CameraCaptureProps) {
  const camera = useCameraCapture();

  // Open camera on mount
  useEffect(() => {
    camera.open();
    return () => camera.close();
  }, []);

  const handleCapture = () => {
    camera.capture();
  };

  const handleConfirm = () => {
    if (camera.capturedImage) {
      onCapture(camera.capturedImage);
      camera.close();
    }
  };

  const handleRetake = () => {
    camera.retake();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-sm">
        <button
          onClick={() => { camera.close(); onCancel(); }}
          className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={24} />
        </button>
        {gpsLabel && (
          <span className={`text-xs font-medium px-3 py-1 rounded-full bg-black/50 ${gpsColor || 'text-gray-400'}`}>
            {gpsLabel}
          </span>
        )}
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Camera feed / Preview / Error */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        {camera.error ? (
          <div className="flex flex-col items-center gap-4 px-8 text-center">
            <AlertTriangle size={48} className="text-amber-400" />
            <p className="text-white/80 text-sm">{camera.error}</p>
            <button
              onClick={() => { camera.close(); onCancel(); }}
              className="px-6 py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
            >
              Close
            </button>
          </div>
        ) : camera.capturedImage ? (
          <img
            src={camera.capturedImage}
            alt="Captured"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <video
            ref={camera.videoRef}
            autoPlay
            playsInline
            muted
            className="max-w-full max-h-full object-contain"
          />
        )}
      </div>

      {/* Bottom controls */}
      {!camera.error && (
        <div className="flex items-center justify-center gap-8 px-4 py-6 bg-black/80 backdrop-blur-sm">
          {camera.capturedImage ? (
            <>
              <button
                onClick={handleRetake}
                className="flex flex-col items-center gap-1.5 text-white/70 hover:text-white transition-colors"
              >
                <div className="w-14 h-14 rounded-full border-2 border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <RotateCcw size={24} />
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider">Retake</span>
              </button>
              <button
                onClick={handleConfirm}
                className="flex flex-col items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/30">
                  <Check size={28} className="text-white" />
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider">Use Photo</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleCapture}
              className="flex flex-col items-center gap-1.5 text-white"
            >
              <div className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center hover:bg-white/10 transition-colors" style={{ width: 72, height: 72 }}>
                <Camera size={28} />
              </div>
              <span className="text-[10px] font-medium uppercase tracking-wider">Capture</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
