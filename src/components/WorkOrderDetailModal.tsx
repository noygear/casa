import { WorkOrder, STATUS_LABELS, CATEGORY_LABELS } from '../types';
import { StatusChip } from './StatusChip';
import { SeverityBadge } from './SeverityBadge';
import { SLABadge } from './SLABadge';
import { computeSLAStatus } from '../domain/slaTracker';
import { getAvailableTransitions } from '../domain/workOrderStateMachine';
import { useAuth } from '../contexts/AuthContext';
import { X, MapPin, Building2, User, Clock, Camera, ChevronRight, Shield, History, DollarSign, ImagePlus, FileText } from 'lucide-react';
import { useState, useRef } from 'react';

interface WorkOrderDetailModalProps {
  workOrder: WorkOrder;
  onClose: () => void;
}

export function WorkOrderDetailModal({ workOrder, onClose }: WorkOrderDetailModalProps) {
  const { user } = useAuth();
  const sla = workOrder.slaResponseMin && workOrder.slaResolveMin
    ? computeSLAStatus({
        createdAt: workOrder.createdAt,
        respondedAt: workOrder.respondedAt,
        resolvedAt: workOrder.resolvedAt,
        slaResponseMin: workOrder.slaResponseMin,
        slaResolveMin: workOrder.slaResolveMin,
      })
    : null;

  const availableTransitions = user
    ? getAvailableTransitions(workOrder.status, user.role)
    : [];

  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [targetStatus, setTargetStatus] = useState<WorkOrder['status'] | null>(null);
  const [memo, setMemo] = useState('');
  const [cost, setCost] = useState('');
  const [beforePhotoFile, setBeforePhotoFile] = useState<File | null>(null);
  const [beforePhotoPreview, setBeforePhotoPreview] = useState<string | null>(null);
  const [afterPhotoFile, setAfterPhotoFile] = useState<File | null>(null);
  const [afterPhotoPreview, setAfterPhotoPreview] = useState<string | null>(null);
  const beforeFileInputRef = useRef<HTMLInputElement>(null);
  const afterFileInputRef = useRef<HTMLInputElement>(null);

  const handleBeforeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBeforePhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => setBeforePhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAfterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAfterPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => setAfterPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Simplified mutation since we are using mock data
  const handleVendorSubmit = () => {
    // In a real app this would call an API/mutation
    workOrder.status = targetStatus as WorkOrder['status'];
    if (cost) workOrder.cost = parseFloat(cost);
    
    const newPhotos = [];
    if (beforePhotoPreview) {
      newPhotos.push({
        id: `ph-vendor-before-${Date.now()}`,
        workOrderId: workOrder.id,
        url: beforePhotoPreview,
        type: 'before' as const,
        caption: 'Before Service',
        uploadedAt: new Date().toISOString()
      });
    }
    if (afterPhotoPreview) {
      newPhotos.push({
        id: `ph-vendor-after-${Date.now()}`,
        workOrderId: workOrder.id,
        url: afterPhotoPreview,
        type: 'after' as const,
        caption: memo || 'After Service',
        uploadedAt: new Date().toISOString()
      });
    }

    if (newPhotos.length > 0) {
      if (!workOrder.photos) {
        workOrder.photos = newPhotos;
      } else {
        workOrder.photos.push(...newPhotos);
      }
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card p-0 animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between p-6 pb-4 border-b border-white/5 bg-cre-950/80 backdrop-blur-xl rounded-t-2xl">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-3 mb-2">
              <StatusChip status={workOrder.status} />
              {workOrder.status !== 'closed' && (
                <SeverityBadge severity={workOrder.severity} size="sm" />
              )}
            </div>
            <h2 className="text-lg font-bold text-white leading-tight">{workOrder.title}</h2>
            <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-medium text-cre-400 bg-cre-500/10 border border-cre-500/15 rounded-md uppercase tracking-wider">
              {CATEGORY_LABELS[workOrder.category]}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            id="close-work-order-modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h4>
            <p className="text-sm text-gray-300 leading-relaxed">{workOrder.description}</p>
          </div>

          {/* Location & Assignment */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-surface p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Location</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Building2 size={14} className="text-cre-400" />
                  {workOrder.property?.name || '—'}
                </div>
                {workOrder.space && (
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <MapPin size={14} className="text-cre-400" />
                    {workOrder.space.name}
                    {workOrder.space.floor != null && (
                      <span className="text-xs text-gray-500">Floor {workOrder.space.floor}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="glass-surface p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Assignment</h4>
              <div className="space-y-2">
                {workOrder.assignedTo ? (
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <User size={14} className="text-cre-400" />
                    {workOrder.assignedTo.name}
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">Unassigned</span>
                )}
                {workOrder.vendor && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Building2 size={14} className="text-gray-500" />
                    {workOrder.vendor.companyName}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SLA Status */}
          {sla && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">SLA Status</h4>
              <div className="flex flex-wrap gap-3">
                <SLABadge elapsedMin={sla.responseElapsedMin} targetMin={sla.responseTargetMin} label="Response" />
                <SLABadge elapsedMin={sla.resolveElapsedMin} targetMin={sla.resolveTargetMin} label="Resolve" />
              </div>
            </div>
          )}

          {/* Inspection Correction Loop */}
          {workOrder.isInspection && (
            <div className="glass-surface p-4 border-violet-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={16} className="text-violet-400" />
                <h4 className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                  Inspection Correction Loop
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Before</p>
                  {workOrder.photos?.some(p => p.type === 'before') ? (
                    <div className="w-full h-32 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <Camera size={24} className="text-gray-600" />
                    </div>
                  ) : (
                    <div className="w-full h-32 rounded-lg bg-white/5 border border-dashed border-amber-500/30 flex flex-col items-center justify-center gap-1.5">
                      <Camera size={20} className="text-amber-500/50" />
                      <span className="text-[10px] text-amber-500/50 font-medium uppercase">Required</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">After</p>
                  {workOrder.photos?.some(p => p.type === 'after') ? (
                    <div className="w-full h-32 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <Camera size={24} className="text-gray-600" />
                    </div>
                  ) : (
                    <div className="w-full h-32 rounded-lg bg-white/5 border border-dashed border-amber-500/30 flex flex-col items-center justify-center gap-1.5">
                      <Camera size={20} className="text-amber-500/50" />
                      <span className="text-[10px] text-amber-500/50 font-medium uppercase">Required</span>
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-3 text-[11px] text-gray-500 leading-relaxed">
                This inspection work order requires both "before" and "after" photos to transition to Needs Review. 
                Property Managers must verify correction quality before closing.
              </p>
            </div>
          )}

          {/* Evidence Photos */}
          {workOrder.photos && workOrder.photos.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Evidence Photos ({workOrder.photos.length})
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {workOrder.photos.map(photo => (
                  <div key={photo.id} className="relative rounded-xl overflow-hidden border border-white/10 group">
                    <img src={photo.url} alt={photo.caption || 'Evidence'} className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-white capitalize">{photo.type}</span>
                        <span className="text-[10px] text-gray-400">{new Date(photo.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit Trail */}
          {workOrder.auditLog && workOrder.auditLog.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <History size={14} className="text-gray-500" />
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Audit Trail</h4>
              </div>
              <div className="space-y-0">
                {workOrder.auditLog.map((log, i) => (
                  <div key={log.id} className="flex items-start gap-3 py-2.5">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-cre-500 mt-1" />
                      {i < workOrder.auditLog!.length - 1 && (
                        <div className="w-px h-full bg-white/5 min-h-[20px]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-400">{STATUS_LABELS[log.fromStatus as keyof typeof STATUS_LABELS] || log.fromStatus}</span>
                        <ChevronRight size={10} className="text-gray-600" />
                        <span className="text-white font-medium">{STATUS_LABELS[log.toStatus as keyof typeof STATUS_LABELS] || log.toStatus}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock size={10} className="text-gray-600" />
                        <span className="text-[10px] text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vendor Completion Form overlay/section */}
          {showCompletionForm && (
            <div className="pt-4 border-t border-white/5 animate-slide-up">
              <div className="glass-card border-cre-500/20 p-5 bg-cre-500/5">
                <h4 className="text-sm font-semibold text-cre-400 mb-4 flex items-center gap-2">
                  <FileText size={16} /> Complete Service Record
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-2">Service Memo</label>
                    <textarea 
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      placeholder="Describe the work performed..."
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cre-500/50 resize-none h-20"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-2">Total Cost</label>
                      <div className="relative">
                        <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                          type="number" 
                          value={cost}
                          onChange={(e) => setCost(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-8 pr-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cre-500/50"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-2">Before Photo</label>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          ref={beforeFileInputRef}
                          onChange={handleBeforeFileChange}
                        />
                        <button 
                          onClick={() => beforeFileInputRef.current?.click()}
                          className={`w-full h-[38px] flex items-center justify-center gap-2 px-3 rounded-lg border text-sm transition-all overflow-hidden relative ${beforePhotoPreview ? 'border-cre-500/30' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
                        >
                          {beforePhotoPreview ? (
                            <>
                              <div className="absolute inset-0">
                                 <img src={beforePhotoPreview} alt="Preview Before" className="w-full h-full object-cover opacity-40 mix-blend-overlay" />
                              </div>
                              <span className="relative z-10 text-cre-400 font-medium">Before Attached</span>
                            </>
                          ) : (
                            <>
                              <ImagePlus size={16} />
                              Upload
                            </>
                          )}
                        </button>
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-2">After Photo</label>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          ref={afterFileInputRef}
                          onChange={handleAfterFileChange}
                        />
                        <button 
                          onClick={() => afterFileInputRef.current?.click()}
                          className={`w-full h-[38px] flex items-center justify-center gap-2 px-3 rounded-lg border text-sm transition-all overflow-hidden relative ${afterPhotoPreview ? 'border-emerald-500/30' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
                        >
                          {afterPhotoPreview ? (
                            <>
                              <div className="absolute inset-0">
                                 <img src={afterPhotoPreview} alt="Preview After" className="w-full h-full object-cover opacity-40 mix-blend-overlay" />
                              </div>
                              <span className="relative z-10 text-emerald-400 font-medium">After Attached</span>
                            </>
                          ) : (
                            <>
                              <ImagePlus size={16} />
                              Upload
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleVendorSubmit}
                      disabled={!memo || (!beforePhotoFile || !afterPhotoFile) && targetStatus !== 'needs_review'}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-cre-500 text-white text-sm font-semibold hover:bg-cre-600 transition-all disabled:opacity-50"
                    >
                      Submit Record & {STATUS_LABELS[targetStatus as keyof typeof STATUS_LABELS]}
                    </button>
                    <button
                      onClick={() => { setShowCompletionForm(false); setTargetStatus(null); }}
                      className="px-4 py-2.5 rounded-xl bg-white/5 text-gray-300 text-sm font-medium hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {availableTransitions.length > 0 && !showCompletionForm && (
            <div className="pt-4 border-t border-white/5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Actions</h4>
              <div className="flex flex-wrap gap-2">
                {availableTransitions.map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      if (user?.role === 'vendor' && (status === 'closed' || status === 'needs_review')) {
                        setTargetStatus(status);
                        setShowCompletionForm(true);
                      } else {
                        // Standard bypass for PMs
                        workOrder.status = status;
                        onClose();
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      status === 'closed'
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : status === 'in_progress' && workOrder.status === 'needs_review'
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20 hover:bg-rose-500/25'
                        : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                    }`}
                    id={`transition-to-${status}`}
                  >
                    {status === 'in_progress' && workOrder.status === 'needs_review'
                      ? '↩ Reject & Reopen'
                      : status === 'closed' 
                      ? 'Close Now'
                      : `→ ${STATUS_LABELS[status]}`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
