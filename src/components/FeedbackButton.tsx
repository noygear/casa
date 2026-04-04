import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquarePlus, X, Star, Send, CheckCircle, Loader2 } from 'lucide-react';

const FEEDBACK_TYPES = ['Bug', 'Feature Request', 'Enjoy', 'Other'] as const;

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

function StarRating({ rating, hoverRating, onRate, onHover, onLeave }: {
  rating: number;
  hoverRating: number;
  onRate: (n: number) => void;
  onHover: (n: number) => void;
  onLeave: () => void;
}) {
  const active = hoverRating || rating;
  return (
    <div className="flex gap-1" onMouseLeave={onLeave}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onRate(n)}
          onMouseEnter={() => onHover(n)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            size={28}
            className={n <= active
              ? 'fill-amber-400 text-amber-400 transition-colors'
              : 'text-gray-600 transition-colors'
            }
          />
        </button>
      ))}
    </div>
  );
}

export function FeedbackButton() {
  const { user } = useAuth();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [status, setStatus] = useState<SubmitStatus>('idle');

  const resetForm = () => {
    setFeedbackType('');
    setDescription('');
    setRating(0);
    setHoverRating(0);
    setStatus('idle');
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!feedbackType || !description.trim() || rating === 0) return;

    setStatus('submitting');
    try {
      const sheetUrl = import.meta.env.VITE_FEEDBACK_SHEET_URL;
      if (!sheetUrl) throw new Error('Feedback URL not configured');

      await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackType,
          description: description.trim(),
          rating,
          userName: user?.name ?? 'Unknown',
          userEmail: user?.email ?? 'Unknown',
          userRole: user?.role ?? 'Unknown',
          currentPage: location.pathname,
        }),
      });

      setStatus('success');
      setTimeout(handleClose, 1500);
    } catch {
      setStatus('error');
    }
  };

  const isValid = feedbackType && description.trim() && rating > 0;

  return (
    <>
      {/* Floating Button — full FAB on desktop, slim edge tab on mobile */}
      {!isOpen && (
        <>
          {/* Desktop: full rounded button */}
          <button
            onClick={() => setIsOpen(true)}
            className="hidden md:flex fixed bottom-6 right-6 z-40 items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-cre-500 to-cre-600 text-white text-sm font-medium shadow-lg shadow-cre-500/25 hover:shadow-cre-500/40 hover:scale-105 transition-all duration-200"
            id="feedback-button"
          >
            <MessageSquarePlus size={18} />
            Feedback
          </button>
          {/* Mobile: slim vertical edge tab */}
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center w-7 py-3 rounded-l-lg bg-cre-600/90 text-white shadow-lg shadow-black/20 transition-all duration-200 active:bg-cre-500"
            id="feedback-button-mobile"
          >
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ writingMode: 'vertical-rl' }}>
              Feedback
            </span>
          </button>
        </>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Card */}
          <div className="relative w-full max-w-lg max-h-[90vh] bg-cre-950 border border-white/10 rounded-2xl shadow-2xl flex flex-col animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cre-500/10 flex items-center justify-center">
                  <MessageSquarePlus size={18} className="text-cre-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Send Feedback</h2>
                  <p className="text-xs text-gray-500">Help us improve Casa</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center py-8 animate-scale-in">
                  <CheckCircle size={48} className="text-emerald-400 mb-3" />
                  <p className="text-lg font-medium text-white">Thank you!</p>
                  <p className="text-sm text-gray-400 mt-1">Your feedback has been submitted.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Feedback Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Feedback Type
                    </label>
                    <select
                      value={feedbackType}
                      onChange={(e) => setFeedbackType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cre-500/50 appearance-none cursor-pointer transition-colors"
                    >
                      <option value="" disabled className="bg-cre-950">Select type...</option>
                      {FEEDBACK_TYPES.map((type) => (
                        <option key={type} value={type} className="bg-cre-950">{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell us what's on your mind..."
                      rows={5}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cre-500/50 resize-none transition-colors"
                    />
                  </div>

                  {/* Star Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Overall Experience
                    </label>
                    <StarRating
                      rating={rating}
                      hoverRating={hoverRating}
                      onRate={setRating}
                      onHover={setHoverRating}
                      onLeave={() => setHoverRating(0)}
                    />
                  </div>

                  {/* Error */}
                  {status === 'error' && (
                    <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">
                      Something went wrong. Please try again.
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!isValid || status === 'submitting'}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cre-500 text-white text-sm font-medium hover:bg-cre-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {status === 'submitting' ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                      {status === 'submitting' ? 'Sending...' : 'Submit'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
