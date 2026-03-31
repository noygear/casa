import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Loader2 size={32} className="text-cre-500 animate-spin" />
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}
