import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkOrders } from '../hooks/useWorkOrders';
import { WorkOrderDetailModal } from '../components/WorkOrderDetailModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';
import {
  WorkOrder, WorkOrderStatus, WorkOrderCategory,
  STATUS_LABELS, CATEGORY_LABELS,
} from '../types';
import { History, Download, Filter, ChevronDown } from 'lucide-react';

const TENANT_STATUS_LABELS: Record<string, string> = {
  open: 'Created',
  assigned: 'In Progress',
  in_progress: 'In Progress',
  needs_review: 'Completed',
  closed: 'Verified',
  skipped: 'Skipped',
};

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-500/20 text-blue-400',
  assigned: 'bg-amber-500/20 text-amber-400',
  in_progress: 'bg-amber-500/20 text-amber-400',
  needs_review: 'bg-violet-500/20 text-violet-400',
  closed: 'bg-emerald-500/20 text-emerald-400',
  skipped: 'bg-gray-500/20 text-gray-400',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function exportToCSV(workOrders: WorkOrder[]) {
  const headers = ['Date', 'Title', 'Category', 'Severity', 'Status', 'Property', 'Space', 'Resolved'];
  const rows = workOrders.map(wo => [
    formatDate(wo.createdAt),
    `"${wo.title.replace(/"/g, '""')}"`,
    CATEGORY_LABELS[wo.category] ?? wo.category,
    wo.severity,
    STATUS_LABELS[wo.status] ?? wo.status,
    wo.property?.name ?? '',
    wo.space?.name ?? '',
    wo.resolvedAt ? formatDate(wo.resolvedAt) : '',
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `maintenance-history-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function TenantMaintenanceHistoryPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch } = useWorkOrders({ createdById: user?.id, limit: 200 });
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<WorkOrderCategory | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  const workOrders = useMemo(() => {
    let items = data?.items ?? [];
    if (statusFilter) items = items.filter(wo => wo.status === statusFilter);
    if (categoryFilter) items = items.filter(wo => wo.category === categoryFilter);
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [data, statusFilter, categoryFilter]);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorBanner message={error?.message || 'Failed to load maintenance history'} onRetry={refetch} />;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <History size={24} className="text-cre-400" />
            Maintenance History
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Complete record of all maintenance requests for your space.
          </p>
        </div>
        <button
          onClick={() => exportToCSV(workOrders)}
          disabled={workOrders.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-cre-500 hover:bg-cre-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 animate-slide-up animate-slide-up-delay-1">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <Filter size={14} />
          Filters
          <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          {(statusFilter || categoryFilter) && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-cre-500/20 text-cre-400 rounded-full">Active</span>
          )}
        </button>

        {showFilters && (
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/5">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-semibold uppercase">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as WorkOrderStatus | '')}
                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cre-500"
              >
                <option value="">All Statuses</option>
                {Object.entries(STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-semibold uppercase">Category</label>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value as WorkOrderCategory | '')}
                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cre-500"
              >
                <option value="">All Categories</option>
                {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            {(statusFilter || categoryFilter) && (
              <button
                onClick={() => { setStatusFilter(''); setCategoryFilter(''); }}
                className="self-end px-3 py-2 text-xs text-gray-400 hover:text-white transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up animate-slide-up-delay-1">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-white">{data?.items.length ?? 0}</div>
          <div className="text-xs text-gray-500 mt-1">Total Requests</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">
            {data?.items.filter(wo => wo.status === 'closed').length ?? 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">Resolved</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">
            {data?.items.filter(wo => !['closed', 'skipped'].includes(wo.status)).length ?? 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">In Progress</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {workOrders.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">Showing</div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden animate-slide-up animate-slide-up-delay-2">
        {workOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <History size={40} className="mb-3 opacity-30" />
            <p>No maintenance requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Severity</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Resolved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {workOrders.map(wo => (
                  <tr
                    key={wo.id}
                    onClick={() => setSelectedWO(wo)}
                    className="hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{formatDate(wo.createdAt)}</td>
                    <td className="px-4 py-3 text-white font-medium">{wo.title}</td>
                    <td className="px-4 py-3 text-gray-400">{CATEGORY_LABELS[wo.category] ?? wo.category}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        wo.severity === 'immediate' ? 'bg-red-500/20 text-red-400' :
                        wo.severity === 'needs_fix_today' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {wo.severity === 'needs_fix_today' ? 'Urgent' : wo.severity === 'immediate' ? 'Emergency' : 'Minor'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[wo.status] ?? 'bg-gray-500/20 text-gray-400'}`}>
                        {TENANT_STATUS_LABELS[wo.status] ?? wo.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      {wo.resolvedAt ? formatDate(wo.resolvedAt) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedWO && (
        <WorkOrderDetailModal
          workOrder={selectedWO}
          onClose={() => setSelectedWO(null)}
        />
      )}
    </div>
  );
}
