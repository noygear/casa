import { WorkOrder, STATUS_LABELS, CATEGORY_LABELS } from '../types';
import { StatusChip } from './StatusChip';
import { SeverityBadge } from './SeverityBadge';
import { SLABadge } from './SLABadge';
import { computeSLAStatus } from '../domain/slaTracker';
import { getAvailableTransitions } from '../domain/workOrderStateMachine';
import { useAuth } from '../contexts/AuthContext';
import { useVendors } from '../hooks/useVendors';
import { useUpdateWorkOrder, useUploadPhoto } from '../hooks/useWorkOrders';
import { useGPSCapture } from '../hooks/useGPSCapture';
import { X, MapPin, Building2, User, Clock, Camera, ChevronRight, Shield, History, DollarSign, ImagePlus, FileText, UserCheck, Navigation, Loader2, AlertTriangle, Download } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface WorkOrderDetailModalProps {
  workOrder: WorkOrder;
  onClose: () => void;
}

export function WorkOrderDetailModal({ workOrder, onClose }: WorkOrderDetailModalProps) {
  const { user } = useAuth();
  const { data: vendorsData } = useVendors();
  const updateWorkOrder = useUpdateWorkOrder();
  const uploadPhoto = useUploadPhoto();

  const vendors = vendorsData?.items || [];

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
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignVendorId, setAssignVendorId] = useState(vendors[0]?.id ?? '');
  const [targetStatus, setTargetStatus] = useState<WorkOrder['status'] | null>(null);
  const [memo, setMemo] = useState('');
  const [cost, setCost] = useState('');
  const [beforePhotoFile, setBeforePhotoFile] = useState<File | null>(null);
  const [beforePhotoPreview, setBeforePhotoPreview] = useState<string | null>(null);
  const [afterPhotoFile, setAfterPhotoFile] = useState<File | null>(null);
  const [afterPhotoPreview, setAfterPhotoPreview] = useState<string | null>(null);
  const beforeFileInputRef = useRef<HTMLInputElement>(null);
  const afterFileInputRef = useRef<HTMLInputElement>(null);
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Invoice state
  const [invoicePreview, setInvoicePreview] = useState<string | null>(null);
  const [invoiceFileName, setInvoiceFileName] = useState('');
  const invoiceFileInputRef = useRef<HTMLInputElement>(null);

  // GPS & start photo state
  const [showStartPhotoForm, setShowStartPhotoForm] = useState(false);
  const [startPhotoFile, setStartPhotoFile] = useState<File | null>(null);
  const [startPhotoPreview, setStartPhotoPreview] = useState<string | null>(null);
  const startFileInputRef = useRef<HTMLInputElement>(null);
  const gps = useGPSCapture();
  const completionGps = useGPSCapture();

  // Set default vendor when vendors load
  useEffect(() => {
    if (vendors.length > 0 && !assignVendorId) {
      setAssignVendorId(vendors[0].id);
    }
  }, [vendors, assignVendorId]);

  const handleStartFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setStartPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => setStartPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (showStartPhotoForm) gps.requestPosition();
  }, [showStartPhotoForm]);
  useEffect(() => {
    if (showCompletionForm) completionGps.requestPosition();
  }, [showCompletionForm]);

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

  const handleInvoiceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setTransitionError('Invoice file must be under 5 MB');
      return;
    }
    setInvoiceFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setInvoicePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAssignSubmit = async () => {
    setTransitionError(null);
    setIsSubmitting(true);
    try {
      await updateWorkOrder.mutateAsync({
        id: workOrder.id,
        status: 'assigned',
        vendorId: assignVendorId,
      });
      onClose();
    } catch (err: any) {
      setTransitionError(err.response?.data?.message || err.message || 'Assignment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVendorSubmit = async () => {
    setTransitionError(null);
    setIsSubmitting(true);
    try {
      // Upload photos first
      if (beforePhotoPreview) {
        await uploadPhoto.mutateAsync({
          workOrderId: workOrder.id,
          url: beforePhotoPreview,
          type: 'before',
          caption: 'Before Service',
          ...(completionGps.position ? {
            gpsLatitude: completionGps.position.latitude,
            gpsLongitude: completionGps.position.longitude,
            gpsAccuracy: completionGps.position.accuracy,
          } : {}),
        });
      }
      if (afterPhotoPreview) {
        await uploadPhoto.mutateAsync({
          workOrderId: workOrder.id,
          url: afterPhotoPreview,
          type: 'after',
          caption: memo || 'After Service',
          ...(completionGps.position ? {
            gpsLatitude: completionGps.position.latitude,
            gpsLongitude: completionGps.position.longitude,
            gpsAccuracy: completionGps.position.accuracy,
          } : {}),
        });
      }

      // Upload invoice if attached
      if (invoicePreview) {
        await uploadPhoto.mutateAsync({
          workOrderId: workOrder.id,
          url: invoicePreview,
          type: 'invoice',
          caption: invoiceFileName || 'Invoice',
        });
      }

      // Then transition status
      await updateWorkOrder.mutateAsync({
        id: workOrder.id,
        status: targetStatus as WorkOrder['status'],
        cost: cost ? parseFloat(cost) : undefined,
        comment: memo || undefined,
      });
      onClose();
    } catch (err: any) {
      setTransitionError(err.response?.data?.message || err.message || 'Transition failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartPhotoSubmit = async () => {
    setTransitionError(null);
    setIsSubmitting(true);
    try {
      // Upload start photo
      if (startPhotoPreview) {
        await uploadPhoto.mutateAsync({
          workOrderId: workOrder.id,
          url: startPhotoPreview,
          type: 'start',
          caption: 'On-site arrival',
          ...(gps.position ? {
            gpsLatitude: gps.position.latitude,
            gpsLongitude: gps.position.longitude,
            gpsAccuracy: gps.position.accuracy,
          } : {}),
        });
      }

      // Transition to in_progress
      await updateWorkOrder.mutateAsync({
        id: workOrder.id,
        status: 'in_progress',
      });
      onClose();
    } catch (err: any) {
      setTransitionError(err.response?.data?.message || err.message || 'Transition failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickTransition = async (status: WorkOrder['status']) => {
    setTransitionError(null);
    setIsSubmitting(true);
    try {
      await updateWorkOrder.mutateAsync({
        id: workOrder.id,
        status,
      });
      onClose();
    } catch (err: any) {
      setTransitionError(err.response?.data?.message || err.message || 'Transition failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const gpsStatusLabel = (gpsState: typeof gps) => {
    if (gpsState.isLoading) return { text: 'Acquiring GPS...', color: 'text-amber-400', icon: Loader2 };
    if (gpsState.position) return { text: `GPS locked (±${Math.round(gpsState.position.accuracy)}m)`, color: 'text-emerald-400', icon: Navigation };
    if (gpsState.error === 'PERMISSION_DENIED') return { text: 'Location permission denied. Enable in browser settings.', color: 'text-rose-400', icon: AlertTriangle };
    if (gpsState.error) return { text: 'GPS unavailable — photo will save without location.', color: 'text-amber-400', icon: AlertTriangle };
    return { text: 'GPS not started', color: 'text-gray-500', icon: Navigation };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

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
          {transitionError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">
              {transitionError}
            </div>
          )}
          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h4>
            <p className="text-sm text-gray-300 leading-relaxed">{workOrder.description}</p>
          </div>

          {/* Location & Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                Evidence & Documents ({workOrder.photos.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {workOrder.photos.map(photo => (
                  <div key={photo.id} className="relative rounded-xl overflow-hidden border border-white/10 group">
                    {photo.type === 'invoice' ? (
                      <a
                        href={photo.url}
                        download={photo.caption || 'invoice'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center h-32 bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
                      >
                        <FileText size={32} className="text-amber-400 mb-2" />
                        <span className="text-xs text-amber-400 font-medium truncate max-w-[90%]">
                          {photo.caption || 'Invoice'}
                        </span>
                        <span className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                          <Download size={10} /> Download
                        </span>
                      </a>
                    ) : (
                      <img src={photo.url} alt={photo.caption || 'Evidence'} className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-105" />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-white capitalize">{photo.type}</span>
                          {photo.gps && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-400" title={`${photo.gps.latitude.toFixed(4)}, ${photo.gps.longitude.toFixed(4)} (±${Math.round(photo.gps.accuracy)}m)`}>
                              <Navigation size={8} />
                              GPS
                            </span>
                          )}
                        </div>
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

          {/* Vendor Assignment Form */}
          {showAssignForm && (
            <div className="pt-4 border-t border-white/5 animate-slide-up">
              <div className="glass-card border-cre-500/20 p-5 bg-cre-500/5">
                <h4 className="text-sm font-semibold text-cre-400 mb-4 flex items-center gap-2">
                  <UserCheck size={16} /> Assign to Vendor
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-2">Select Vendor</label>
                    <select
                      value={assignVendorId}
                      onChange={e => setAssignVendorId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-cre-500/50 appearance-none cursor-pointer"
                    >
                      {vendors.map(v => (
                        <option key={v.id} value={v.id} className="bg-cre-950 text-white">{v.companyName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleAssignSubmit}
                      disabled={!assignVendorId || isSubmitting}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-cre-500 text-white text-sm font-semibold hover:bg-cre-600 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? 'Assigning...' : 'Confirm Assignment'}
                    </button>
                    <button
                      onClick={() => setShowAssignForm(false)}
                      className="px-4 py-2.5 rounded-xl bg-white/5 text-gray-300 text-sm font-medium hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Start Photo Form (assigned → in_progress) */}
          {showStartPhotoForm && (
            <div className="pt-4 border-t border-white/5 animate-slide-up">
              <div className="glass-card border-cre-500/20 p-5 bg-cre-500/5">
                <h4 className="text-sm font-semibold text-cre-400 mb-4 flex items-center gap-2">
                  <Camera size={16} /> On-Site Arrival Photo
                </h4>
                <p className="text-xs text-gray-400 mb-4">
                  Take a GPS-tagged photo to prove you are on-site before starting work.
                </p>

                <div className="space-y-4">
                  {(() => {
                    const status = gpsStatusLabel(gps);
                    const Icon = status.icon;
                    return (
                      <div className={`flex items-center gap-2 text-xs ${status.color}`}>
                        <Icon size={14} className={gps.isLoading ? 'animate-spin' : ''} />
                        <span>{status.text}</span>
                        {(gps.error === 'TIMEOUT' || gps.error === 'POSITION_UNAVAILABLE') && (
                          <button onClick={gps.requestPosition} className="ml-2 px-2 py-0.5 rounded bg-white/5 text-gray-300 hover:bg-white/10 text-[10px] font-medium">
                            Retry GPS
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  <div>
                    <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-2">Arrival Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      ref={startFileInputRef}
                      onChange={handleStartFileChange}
                    />
                    <button
                      onClick={() => startFileInputRef.current?.click()}
                      className={`w-full h-[60px] flex items-center justify-center gap-2 px-3 rounded-lg border text-sm transition-all overflow-hidden relative ${startPhotoPreview ? 'border-cre-500/30' : 'bg-white/5 border-white/10 border-dashed text-gray-400 hover:text-white hover:bg-white/10'}`}
                    >
                      {startPhotoPreview ? (
                        <>
                          <div className="absolute inset-0">
                            <img src={startPhotoPreview} alt="Start photo preview" className="w-full h-full object-cover opacity-40 mix-blend-overlay" />
                          </div>
                          <span className="relative z-10 text-cre-400 font-medium">Arrival Photo Attached</span>
                        </>
                      ) : (
                        <>
                          <Camera size={20} />
                          <span>Take Arrival Photo</span>
                        </>
                      )}
                    </button>
                  </div>

                  {!gps.position && !gps.isLoading && !gps.error && (
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-400">
                      GPS is acquiring your location. The photo will include location data when available.
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleStartPhotoSubmit}
                      disabled={!startPhotoFile || isSubmitting}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-cre-500 text-white text-sm font-semibold hover:bg-cre-600 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? 'Starting...' : 'Start Work'}
                    </button>
                    <button
                      onClick={() => { setShowStartPhotoForm(false); gps.reset(); }}
                      className="px-4 py-2.5 rounded-xl bg-white/5 text-gray-300 text-sm font-medium hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vendor Completion Form */}
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
                    <div>
                      <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-2">Invoice (Optional)</label>
                      <input
                        type="file"
                        accept=".pdf,image/jpeg,image/png"
                        className="hidden"
                        ref={invoiceFileInputRef}
                        onChange={handleInvoiceFileChange}
                      />
                      <button
                        onClick={() => invoiceFileInputRef.current?.click()}
                        className={`w-full h-[38px] flex items-center justify-center gap-2 px-3 rounded-lg border text-sm transition-all ${
                          invoicePreview
                            ? 'border-amber-500/30 text-amber-400 bg-amber-500/5'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {invoicePreview ? (
                          <span className="font-medium truncate">{invoiceFileName}</span>
                        ) : (
                          <>
                            <FileText size={16} />
                            Attach Invoice
                          </>
                        )}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-2">Before Photo</label>
                        <input type="file" accept="image/*" className="hidden" ref={beforeFileInputRef} onChange={handleBeforeFileChange} />
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
                        <input type="file" accept="image/*" className="hidden" ref={afterFileInputRef} onChange={handleAfterFileChange} />
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

                  {(() => {
                    const status = gpsStatusLabel(completionGps);
                    const Icon = status.icon;
                    return (
                      <div className={`flex items-center gap-2 text-xs ${status.color}`}>
                        <Icon size={14} className={completionGps.isLoading ? 'animate-spin' : ''} />
                        <span>{status.text}</span>
                        {(completionGps.error === 'TIMEOUT' || completionGps.error === 'POSITION_UNAVAILABLE') && (
                          <button onClick={completionGps.requestPosition} className="ml-2 px-2 py-0.5 rounded bg-white/5 text-gray-300 hover:bg-white/10 text-[10px] font-medium">
                            Retry GPS
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleVendorSubmit}
                      disabled={!memo || (!beforePhotoFile && !afterPhotoFile) || isSubmitting || !!(workOrder.isInspection && targetStatus === 'needs_review' && (!beforePhotoFile || !afterPhotoFile))}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-cre-500 text-white text-sm font-semibold hover:bg-cre-600 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : `Submit Record & ${STATUS_LABELS[targetStatus as keyof typeof STATUS_LABELS]}`}
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
          {availableTransitions.length > 0 && !showCompletionForm && !showAssignForm && !showStartPhotoForm && (
            <div className="pt-4 border-t border-white/5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Actions</h4>
              <div className="flex flex-wrap gap-2">
                {availableTransitions.map(status => (
                  <button
                    key={status}
                    disabled={isSubmitting}
                    onClick={() => {
                      if (status === 'in_progress' && workOrder.status === 'assigned') {
                        setShowStartPhotoForm(true);
                      } else if ((status === 'closed' || status === 'needs_review') && workOrder.status === 'in_progress') {
                        setTargetStatus(status);
                        setShowCompletionForm(true);
                      } else if (status === 'assigned') {
                        setShowAssignForm(true);
                      } else {
                        handleQuickTransition(status);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
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
