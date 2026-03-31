import { useState } from 'react';
import { X, RefreshCw, AlertCircle, MapPin } from 'lucide-react';
import { useProperties } from '../hooks/useProperties';
import { useVendors } from '../hooks/useVendors';
import { useCreateTemplate, useUpdateTemplate } from '../hooks/useRecurringTemplates';
import {
  RecurringTemplate, WorkOrderCategory, Severity, MaintenanceFrequency,
  CATEGORY_LABELS,
} from '../types';

const FREQUENCY_LABELS: Record<MaintenanceFrequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annually: 'Annually',
  custom: 'Custom',
};

interface RecurringTemplateModalProps {
  mode: 'create' | 'edit';
  template?: RecurringTemplate;
  onClose: () => void;
}

export function RecurringTemplateModal({ mode, template, onClose }: RecurringTemplateModalProps) {
  const { data: propertiesData } = useProperties();
  const { data: vendorsData } = useVendors();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();

  const [name, setName] = useState(template?.name ?? '');
  const [description, setDescription] = useState(template?.description ?? '');
  const [propertyId, setPropertyId] = useState(template?.propertyId ?? '');
  const [spaceId, setSpaceId] = useState(template?.spaceId ?? '');
  const [category, setCategory] = useState<WorkOrderCategory>(template?.category ?? 'general');
  const [severity, setSeverity] = useState<Severity>(template?.severity ?? 'minor');
  const [frequency, setFrequency] = useState<MaintenanceFrequency>(template?.frequency ?? 'monthly');
  const [customDays, setCustomDays] = useState<string>(template?.customDays?.toString() ?? '');
  const [vendorId, setVendorId] = useState(template?.vendorId ?? '');
  const [isActive, setIsActive] = useState(template?.isActive ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const properties = propertiesData?.items ?? [];
  const selectedProperty = properties.find(p => p.id === propertyId);
  const spaces = selectedProperty?.spaces ?? [];
  const vendors = vendorsData?.items ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        await createTemplate.mutateAsync({
          name,
          description,
          category,
          severity,
          frequency,
          customDays: frequency === 'custom' ? parseInt(customDays, 10) : undefined,
          propertyId,
          spaceId: spaceId || undefined,
          vendorId: vendorId || undefined,
        });
      } else if (template) {
        await updateTemplate.mutateAsync({
          id: template.id,
          name,
          description,
          severity,
          frequency,
          customDays: frequency === 'custom' ? parseInt(customDays, 10) : null,
          vendorId: vendorId || null,
          isActive,
        });
      }
      onClose();
    } catch (err) {
      console.error(`Failed to ${mode} template:`, err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 drop-shadow-2xl">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[90vh] bg-cre-950 border border-white/10 rounded-2xl shadow-2xl flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cre-500/20 text-cre-400 flex items-center justify-center">
              <RefreshCw size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {mode === 'create' ? 'New Recurring Template' : 'Edit Template'}
              </h2>
              <p className="text-sm text-gray-400">
                {mode === 'create' ? 'Set up a recurring maintenance schedule.' : 'Update template settings.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Template Name</label>
              <input
                required
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., HVAC Filter Replacement"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cre-500/50"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What needs to be done each cycle..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cre-500/50 resize-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <select
                    required
                    value={propertyId}
                    onChange={e => { setPropertyId(e.target.value); setSpaceId(''); }}
                    disabled={mode === 'edit'}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cre-500/50 appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="" className="bg-cre-950 text-gray-400">Select Property...</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id} className="bg-cre-950 text-white">{p.name}</option>
                    ))}
                  </select>
                </div>
                <select
                  value={spaceId}
                  onChange={e => setSpaceId(e.target.value)}
                  disabled={!propertyId || mode === 'edit'}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cre-500/50 appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="" className="bg-cre-950 text-gray-400">Select Space (Optional)...</option>
                  {spaces.map(s => (
                    <option key={s.id} value={s.id} className="bg-cre-950 text-white">{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category + Severity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  required
                  value={category}
                  onChange={e => setCategory(e.target.value as WorkOrderCategory)}
                  disabled={mode === 'edit'}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cre-500/50 appearance-none cursor-pointer disabled:opacity-50"
                >
                  {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                    <option key={val} value={val} className="bg-cre-950 text-white">{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Severity</label>
                <div className="relative">
                  <AlertCircle size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                  <select
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

            {/* Frequency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Frequency</label>
                <select
                  required
                  value={frequency}
                  onChange={e => setFrequency(e.target.value as MaintenanceFrequency)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cre-500/50 appearance-none cursor-pointer"
                >
                  {Object.entries(FREQUENCY_LABELS).map(([val, label]) => (
                    <option key={val} value={val} className="bg-cre-950 text-white">{label}</option>
                  ))}
                </select>
              </div>
              {frequency === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Every N Days</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={customDays}
                    onChange={e => setCustomDays(e.target.value)}
                    placeholder="e.g., 14"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cre-500/50"
                  />
                </div>
              )}
            </div>

            {/* Vendor */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Assigned Vendor (Optional)</label>
              <select
                value={vendorId}
                onChange={e => setVendorId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cre-500/50 appearance-none cursor-pointer"
              >
                <option value="" className="bg-cre-950 text-gray-400">No vendor assigned</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id} className="bg-cre-950 text-white">{v.companyName}</option>
                ))}
              </select>
            </div>

            {/* Active toggle (edit mode only) */}
            {mode === 'edit' && (
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <div className="text-sm font-medium text-white">Active</div>
                  <div className="text-xs text-gray-500">Inactive templates stop generating work orders</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${isActive ? 'bg-emerald-500' : 'bg-gray-600'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${isActive ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
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
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-cre-500 text-white text-sm font-semibold hover:bg-cre-600 transition-colors shadow-lg shadow-cre-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Template' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
