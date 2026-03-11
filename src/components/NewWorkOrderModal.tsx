import { useState } from 'react';
import { X, Wrench, MapPin, AlertCircle } from 'lucide-react';
import { MOCK_PROPERTIES, MOCK_SPACES, MOCK_WORK_ORDERS } from '../data/mockData';
import { CATEGORY_LABELS, Severity } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface NewWorkOrderModalProps {
  onClose: () => void;
  onSubmit?: () => void;
}

const SEVERITY_SLA: Record<Severity, { responseMin: number; resolveMin: number }> = {
  immediate: { responseMin: 60, resolveMin: 240 },
  needs_fix_today: { responseMin: 240, resolveMin: 1440 },
  minor: { responseMin: 480, resolveMin: 2880 },
};

export function NewWorkOrderModal({ onClose, onSubmit }: NewWorkOrderModalProps) {
  const { user } = useAuth();
  const [propertyId, setPropertyId] = useState('');
  const [spaceId, setSpaceId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [severity, setSeverity] = useState<Severity>('minor');

  const spaces = MOCK_SPACES.filter(s => s.propertyId === propertyId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const property = MOCK_PROPERTIES.find(p => p.id === propertyId);
    const space = spaceId ? MOCK_SPACES.find(s => s.id === spaceId) : undefined;
    const sla = SEVERITY_SLA[severity];
    const now = new Date().toISOString();

    MOCK_WORK_ORDERS.push({
      id: `wo-${Date.now()}`,
      title,
      description,
      category: category as any,
      severity,
      status: 'open',
      isInspection: false,
      cost: null,
      propertyId,
      property,
      spaceId: spaceId || null,
      space,
      createdById: user!.id,
      createdBy: user!,
      slaResponseMin: sla.responseMin,
      slaResolveMin: sla.resolveMin,
      createdAt: now,
      updatedAt: now,
      photos: [],
      auditLog: [],
    });

    onSubmit?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 drop-shadow-2xl">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-cre-950 border border-white/10 rounded-2xl shadow-2xl flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cre-500/20 text-cre-400 flex items-center justify-center">
              <Wrench size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">New Work Order</h2>
              <p className="text-sm text-gray-400">Submit a new maintenance or repair request.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <select
                    required
                    value={propertyId}
                    onChange={e => { setPropertyId(e.target.value); setSpaceId(''); }}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cre-500/50 appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-cre-950 text-gray-400">Select Property...</option>
                    {MOCK_PROPERTIES.map(p => (
                      <option key={p.id} value={p.id} className="bg-cre-950 text-white">{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <select
                    value={spaceId}
                    onChange={e => setSpaceId(e.target.value)}
                    disabled={!propertyId}
                    className="w-full pl-4 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cre-500/50 appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="" className="bg-cre-950 text-gray-400">Select Space (Optional)...</option>
                    {spaces.map(s => (
                      <option key={s.id} value={s.id} className="bg-cre-950 text-white">{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  required
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cre-500/50 appearance-none cursor-pointer"
                >
                  {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                    <option key={val} value={val} className="bg-cre-950 text-white">{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Urgency</label>
                <div className="relative">
                  <AlertCircle size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                  <select
                    required
                    value={severity}
                    onChange={e => setSeverity(e.target.value as Severity)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cre-500/50 appearance-none cursor-pointer"
                  >
                    <option value="minor" className="bg-cre-950 text-white">Minor / Routine</option>
                    <option value="needs_fix_today" className="bg-cre-950 text-white">Needs Fix Today</option>
                    <option value="immediate" className="bg-cre-950 text-white">Immediate / Critical</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Issue Title</label>
              <input
                required
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Brief description of the problem..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cre-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Details</label>
              <textarea
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Provide as much detail as possible..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cre-500/50 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
