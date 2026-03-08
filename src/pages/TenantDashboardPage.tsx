import { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_WORK_ORDERS } from '../data/mockData';
import { WorkOrderDetailModal } from '../components/WorkOrderDetailModal';
import { NewWorkOrderModal } from '../components/NewWorkOrderModal';
import { WorkOrder } from '../types';
import { Plus, Check, FileText } from 'lucide-react';

export function TenantDashboardPage() {
  const { user } = useAuth();
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [showNewWO, setShowNewWO] = useState(false);

  // Tenant "My Requests"
  const myWorkOrders = useMemo(() => {
    return MOCK_WORK_ORDERS.filter(wo => wo.createdById === user?.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [user?.id]);

  // Map to Tenant Flow: Created (open) -> Assigned to Staff (assigned/in_progress) -> Completed (needs_review) -> Verified (closed)
  const getTenantStatus = (status: string) => {
    switch (status) {
      case 'open': return { label: 'Created', step: 1, color: 'text-blue-400', bg: 'bg-blue-500/20' };
      case 'assigned':
      case 'in_progress': return { label: 'Assigned to Staff', step: 2, color: 'text-amber-400', bg: 'bg-amber-500/20' };
      case 'needs_review': return { label: 'Completed', step: 3, color: 'text-violet-400', bg: 'bg-violet-500/20' };
      case 'closed': return { label: 'Verified', step: 4, color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
      default: return { label: 'Created', step: 1, color: 'text-blue-400', bg: 'bg-blue-500/20' };
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Hello, {user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your maintenance requests and track progress.</p>
        </div>
        <button onClick={() => setShowNewWO(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/20">
          <Plus size={18} />
          Submit Request
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white mb-4">My Requests</h2>
        {myWorkOrders.length === 0 ? (
          <div className="glass-card py-16 flex flex-col items-center justify-center">
            <FileText size={40} className="text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">You haven't submitted any requests yet.</p>
          </div>
        ) : (
          myWorkOrders.map((wo, i) => {
            const ts = getTenantStatus(wo.status);
            return (
              <div
                key={wo.id}
                onClick={() => setSelectedWO(wo)}
                className={`glass-card-hover p-5 cursor-pointer animate-slide-up animate-slide-up-delay-${i + 1}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left info */}
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-white mb-1">{wo.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-1 mb-2">{wo.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>Submitted {new Date(wo.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{wo.property?.name} {wo.space ? `— ${wo.space.name}` : ''}</span>
                    </div>
                  </div>

                  {/* Flow Progress Bar */}
                  <div className="w-full md:w-auto min-w-[300px]">
                    <div className="flex justify-between mb-2 px-1">
                      {['Created', 'Assigned', 'Completed', 'Verified'].map((stepName, stepIdx) => {
                        const isCurrent = ts.step === stepIdx + 1;
                        const isPast = ts.step > stepIdx + 1;
                        return (
                          <div key={stepName} className="flex flex-col items-center gap-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                              isPast ? 'bg-emerald-500 text-white' :
                              isCurrent ? ts.bg + ' ' + ts.color : 'bg-white/5 text-gray-500'
                            }`}>
                              {isPast ? <Check size={12} /> : stepIdx + 1}
                            </div>
                            <span className={`text-[9px] uppercase tracking-wider font-semibold ${
                              isCurrent ? 'text-white' : isPast ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {stepName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {/* Connecting line behind circles */}
                    <div className="relative h-1 bg-white/5 rounded-full mt-[-28px] mx-4 -z-10 overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-700"
                        style={{ width: `${(Math.max(0, ts.step - 1) / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedWO && (
        <WorkOrderDetailModal workOrder={selectedWO} onClose={() => setSelectedWO(null)} />
      )}
      {showNewWO && (
        <NewWorkOrderModal onClose={() => setShowNewWO(false)} />
      )}
    </div>
  );
}
