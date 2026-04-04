import { useState, useCallback } from 'react';
import { useWorkOrders, useUpdateWorkOrder } from '../hooks/useWorkOrders';
import { useRecurringTemplates, useUpdateTemplate } from '../hooks/useRecurringTemplates';
import { useProperties } from '../hooks/useProperties';
import { usePreferredVendorMappings } from '../hooks/usePreferredVendorMappings';
import { useVendors } from '../hooks/useVendors';
import { WorkOrderCard } from '../components/WorkOrderCard';
import { WorkOrderDetailModal } from '../components/WorkOrderDetailModal';
import { NewWorkOrderModal } from '../components/NewWorkOrderModal';
import { RecurringTemplateModal } from '../components/RecurringTemplateModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';
import type { WorkOrder, RecurringTemplate, Severity, WorkOrderCategory } from '../types';
import { CATEGORY_LABELS } from '../types';
import { Search, Filter, SlidersHorizontal, Plus, X, RepeatIcon as Repeat, Building2, Wrench, ToggleLeft, ToggleRight, Info, Zap, Pencil, Power } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { findPreferredVendor } from '../domain/autoAssigner';

type TabType = 'unassigned' | 'active' | 'closed' | 'recurring';

const SEVERITY_SORT_ORDER: Record<Severity, number> = {
  immediate: 0,
  needs_fix_today: 1,
  minor: 2,
};

export function WorkOrdersPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const { data: workOrdersData, isLoading, isError, error, refetch } = useWorkOrders();
  const { data: mappingsData } = usePreferredVendorMappings();
  const { data: vendorsData } = useVendors();
  const { data: templatesData } = useRecurringTemplates();
  const { data: propertiesData } = useProperties();
  const updateWorkOrder = useUpdateWorkOrder();
  const updateTemplate = useUpdateTemplate();

  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [showNewWO, setShowNewWO] = useState(false);
  const [templateModal, setTemplateModal] = useState<{ mode: 'create' | 'edit'; template?: RecurringTemplate } | null>(null);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<WorkOrderCategory | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const statusParam = searchParams.get('status');
    if (statusParam === 'closed' || statusParam === 'skipped') return 'closed';
    if (statusParam === 'assigned' || statusParam === 'in_progress' || statusParam === 'needs_review') return 'active';
    // Vendors default to "active" (they can't see unassigned)
    if (user?.role === 'vendor') return 'active';
    return 'unassigned';
  });
  const [autoAssign, setAutoAssign] = useState(() => {
    return localStorage.getItem('casa_auto_assign') === 'true';
  });
  const [showAutoAssignTooltip, setShowAutoAssignTooltip] = useState(false);

  const toggleAutoAssign = useCallback(() => {
    setAutoAssign(prev => {
      const next = !prev;
      localStorage.setItem('casa_auto_assign', String(next));
      return next;
    });
  }, []);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorBanner message={error?.message || 'Failed to load work orders'} onRetry={refetch} />;

  const workOrders = workOrdersData?.items || [];
  const mappings = mappingsData || [];
  const vendors = vendorsData?.items || [];
  const recurringTemplates = templatesData || [];
  const propertiesMap = new Map((propertiesData?.items ?? []).map(p => [p.id, p.name]));

  // Auto-assign logic for new work orders
  const handleNewWOCreated = () => {
    if (autoAssign) {
      // Find newly created open orders without a vendor and try to auto-assign
      const openUnassigned = workOrders.filter(wo => wo.status === 'open' && !wo.vendorId);
      for (const wo of openUnassigned) {
        const vendor = findPreferredVendor(wo.propertyId, wo.category, mappings, vendors);
        if (vendor) {
          updateWorkOrder.mutate({
            id: wo.id,
            status: 'assigned',
            vendorId: vendor.id,
            comment: 'Auto-assigned to preferred vendor',
          });
        }
      }
    }
    refetch();
  };

  const isVendor = user?.role === 'vendor';

  const baseOrders = user?.role === 'tenant'
    ? workOrders.filter(wo => wo.createdById === user.id)
    : isVendor
    ? workOrders.filter(wo => wo.assignedToId === user.id || wo.vendorId === user.vendorId)
    : workOrders;

  const applySearchAndFilters = (orders: WorkOrder[]) => {
    let result = orders;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(wo =>
        wo.title.toLowerCase().includes(q) ||
        wo.description.toLowerCase().includes(q) ||
        wo.property?.name.toLowerCase().includes(q) ||
        wo.space?.name.toLowerCase().includes(q)
      );
    }
    if (severityFilter !== 'all') {
      result = result.filter(wo => wo.severity === severityFilter);
    }
    if (categoryFilter !== 'all') {
      result = result.filter(wo => wo.category === categoryFilter);
    }
    return result;
  };

  const unassignedOrders = (() => {
    const orders = baseOrders.filter(wo => wo.status === 'open' && !wo.vendorId);
    return applySearchAndFilters(orders).sort((a, b) => {
      const sevDiff = SEVERITY_SORT_ORDER[a.severity] - SEVERITY_SORT_ORDER[b.severity];
      if (sevDiff !== 0) return sevDiff;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  })();

  const activeOrders = (() => {
    const orders = baseOrders.filter(wo =>
      wo.status === 'assigned' || wo.status === 'in_progress' || wo.status === 'needs_review'
    );
    return applySearchAndFilters(orders).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  })();

  const closedOrders = (() => {
    const orders = baseOrders.filter(wo => wo.status === 'closed' || wo.status === 'skipped');
    return applySearchAndFilters(orders).sort((a, b) => {
      const aDate = a.resolvedAt || a.updatedAt;
      const bDate = b.resolvedAt || b.updatedAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
  })();

  const currentOrders = activeTab === 'unassigned' ? unassignedOrders
    : activeTab === 'active' ? activeOrders
    : activeTab === 'closed' ? closedOrders
    : [];

  const activeFilters = [severityFilter, categoryFilter].filter(f => f !== 'all').length;

  const filteredTemplates = (() => {
    if (!search) return recurringTemplates;
    const q = search.toLowerCase();
    return recurringTemplates.filter(rt =>
      rt.name.toLowerCase().includes(q) ||
      rt.description.toLowerCase().includes(q)
    );
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Work Orders</h1>
          <p className="text-sm text-gray-400 mt-1">
            {activeTab === 'recurring'
              ? `${filteredTemplates.length} templates`
              : `${currentOrders.length} work orders`}
          </p>
        </div>
        {!isVendor && (
          activeTab === 'recurring' ? (
            <button
              onClick={() => setTemplateModal({ mode: 'create' })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cre-500 to-cre-600 text-white text-sm font-semibold hover:from-cre-400 hover:to-cre-500 transition-all shadow-lg shadow-cre-500/20"
            >
              <Plus size={16} />
              New Template
            </button>
          ) : (
            <button
              onClick={() => setShowNewWO(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cre-500 to-cre-600 text-white text-sm font-semibold hover:from-cre-400 hover:to-cre-500 transition-all shadow-lg shadow-cre-500/20"
              id="create-work-order-btn"
            >
              <Plus size={16} />
              New Work Order
            </button>
          )
        )}
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3 animate-slide-up animate-slide-up-delay-1">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search work orders..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cre-500/50 focus:ring-1 focus:ring-cre-500/20 transition-all"
            id="search-work-orders"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
            showFilters || activeFilters > 0
              ? 'bg-cre-500/10 border-cre-500/20 text-cre-400'
              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
          }`}
          id="toggle-filters"
        >
          <SlidersHorizontal size={16} />
          Filters
          {activeFilters > 0 && (
            <span className="w-5 h-5 rounded-full bg-cre-500 text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-black/40 p-1 rounded-xl w-fit animate-slide-up animate-slide-up-delay-1 border border-white/5">
        {!isVendor && (
          <button
            onClick={() => setActiveTab('unassigned')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'unassigned' ? 'bg-cre-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Unassigned
            {unassignedOrders.length > 0 && (
              <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                activeTab === 'unassigned' ? 'bg-white/20 text-white' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {unassignedOrders.length}
              </span>
            )}
          </button>
        )}
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'active' ? 'bg-cre-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Active
          {activeOrders.length > 0 && (
            <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
              activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-cre-500/20 text-cre-400'
            }`}>
              {activeOrders.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('closed')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'closed' ? 'bg-cre-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Closed
        </button>
        {!isVendor && (
          <button
            onClick={() => setActiveTab('recurring')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'recurring' ? 'bg-cre-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Repeat size={14} />
            Recurring
          </button>
        )}
      </div>

      {/* Auto-assign toggle (Unassigned tab only, PM/AM only) */}
      {activeTab === 'unassigned' && (user?.role === 'property_manager' || user?.role === 'asset_manager') && (
        <div className="flex items-center gap-3 animate-slide-up">
          <button
            onClick={toggleAutoAssign}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              autoAssign
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            {autoAssign ? <ToggleRight size={16} className="text-emerald-400" /> : <ToggleLeft size={16} className="text-gray-500" />}
            {autoAssign ? <Zap size={12} className="text-emerald-400" /> : null}
            Auto-assign to preferred vendors
          </button>
          <div className="relative">
            <button
              onMouseEnter={() => setShowAutoAssignTooltip(true)}
              onMouseLeave={() => setShowAutoAssignTooltip(false)}
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              <Info size={14} />
            </button>
            {showAutoAssignTooltip && (
              <div className="absolute left-6 top-1/2 -translate-y-1/2 z-50 w-64 p-3 rounded-lg bg-cre-950 border border-white/10 text-xs text-gray-300 shadow-xl">
                When enabled, new work orders are automatically assigned to your preferred vendor for that category and property. Configure preferred vendors in the Vendors tab.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && activeTab !== 'recurring' && (
        <div className="glass-card p-5 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-500" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filters</span>
            </div>
            {activeFilters > 0 && (
              <button
                onClick={() => { setSeverityFilter('all'); setCategoryFilter('all'); }}
                className="flex items-center gap-1 text-xs text-cre-400 hover:text-cre-300"
              >
                <X size={12} />
                Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-2">Severity</label>
              <select
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value as Severity | 'all')}
                className="w-full px-3 py-2 rounded-lg bg-cre-950 border border-white/10 text-sm text-white focus:outline-none focus:border-cre-500/50 appearance-none cursor-pointer"
                id="filter-severity"
              >
                <option value="all" className="bg-cre-950 text-white">All Severities</option>
                <option value="minor" className="bg-cre-950 text-white">Minor</option>
                <option value="needs_fix_today" className="bg-cre-950 text-white">Needs Fix Today</option>
                <option value="immediate" className="bg-cre-950 text-white">Immediate</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value as WorkOrderCategory | 'all')}
                className="w-full px-3 py-2 rounded-lg bg-cre-950 border border-white/10 text-sm text-white focus:outline-none focus:border-cre-500/50 appearance-none cursor-pointer"
                id="filter-category"
              >
                <option value="all" className="bg-cre-950 text-white">All Categories</option>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value} className="bg-cre-950 text-white">{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Tab Grid */}
      {activeTab === 'recurring' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
          {filteredTemplates.map(rt => (
            <div key={rt.id} className={`glass-card p-6 flex flex-col justify-between ${!rt.isActive ? 'opacity-50' : ''}`}>
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="text-white font-semibold truncate">{rt.name}</h3>
                    {!rt.isActive && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-500/20 text-gray-400 uppercase shrink-0">
                        Inactive
                      </span>
                    )}
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-cre-500/20 text-cre-300 uppercase shrink-0 ml-2">
                    {rt.frequency}
                  </span>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2 mb-4">{rt.description}</p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Wrench size={14} className="text-gray-400" />
                    <span className="truncate">{CATEGORY_LABELS[rt.category]}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Building2 size={14} className="text-gray-400" />
                    <span className="truncate">{propertiesMap.get(rt.propertyId) ?? rt.propertyId}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                <button
                  onClick={() => setTemplateModal({ mode: 'edit', template: rt })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Pencil size={12} />
                  Edit
                </button>
                <button
                  onClick={() => updateTemplate.mutate({ id: rt.id, isActive: !rt.isActive })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    rt.isActive
                      ? 'text-amber-400 hover:bg-amber-500/10'
                      : 'text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  <Power size={12} />
                  {rt.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
          {filteredTemplates.length === 0 && (
            <div className="col-span-full glass-card py-16 flex flex-col items-center justify-center">
              <Search size={40} className="text-gray-600 mb-3" />
              <p className="text-sm text-gray-400">No recurring templates found</p>
            </div>
          )}
        </div>
      )}

      {/* Work Order Grid */}
      {activeTab !== 'recurring' && (
        <>
          {currentOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentOrders.map(wo => (
                <WorkOrderCard key={wo.id} workOrder={wo} onClick={setSelectedWO} />
              ))}
            </div>
          ) : (
            <div className="glass-card py-16 flex flex-col items-center justify-center">
              <Search size={40} className="text-gray-600 mb-3" />
              <p className="text-sm text-gray-400">
                {activeTab === 'unassigned' ? 'No unassigned work orders' :
                 activeTab === 'active' ? 'No active work orders' :
                 'No closed work orders'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {activeTab === 'unassigned' ? 'All tickets have been assigned' :
                 'Try adjusting your filters or search terms'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedWO && (
        <WorkOrderDetailModal
          workOrder={selectedWO}
          onClose={() => {
            refetch();
            setSelectedWO(null);
          }}
        />
      )}

      {showNewWO && (
        <NewWorkOrderModal
          onClose={() => setShowNewWO(false)}
          onSubmit={handleNewWOCreated}
        />
      )}

      {templateModal && (
        <RecurringTemplateModal
          mode={templateModal.mode}
          template={templateModal.template}
          onClose={() => setTemplateModal(null)}
        />
      )}
    </div>
  );
}
