import { useState, useMemo } from 'react';
import { MOCK_PROPERTIES, MOCK_SPACES, MOCK_WORK_ORDERS } from '../data/mockData';
import { PropertyIngestionModal } from '../components/PropertyIngestionModal';
import { useAuth } from '../contexts/AuthContext';
import { Building2, MapPin, Layers, Wrench, Search, Filter, Plus } from 'lucide-react';

export function PropertiesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [properties, setProperties] = useState(MOCK_PROPERTIES);

  const propertyTypes = useMemo(() => {
    const types = new Set(properties.map(p => p.type));
    return Array.from(types);
  }, [properties]);

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const matchesSearch = search === '' || 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.address.toLowerCase().includes(search.toLowerCase()) ||
        p.city.toLowerCase().includes(search.toLowerCase());
      
      const matchesType = typeFilter === 'all' || p.type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [properties, search, typeFilter]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Properties</h1>
          <p className="text-sm text-gray-400 mt-1">{filteredProperties.length} active assets</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {(user?.role === 'property_manager' || user?.role === 'asset_manager') && (
            <button
              onClick={() => setShowAddProperty(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cre-500 to-cre-600 text-white text-sm font-semibold hover:from-cre-400 hover:to-cre-500 transition-all shadow-lg shadow-cre-500/20"
            >
              <Plus size={16} />
              Add Property
            </button>
          )}
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search properties..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cre-500/50"
            />
          </div>
          <div className="relative">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="pl-9 pr-8 py-2 rounded-xl bg-cre-950 border border-white/10 text-sm text-white focus:outline-none focus:border-cre-500/50 appearance-none cursor-pointer"
            >
              <option value="all" className="bg-cre-950">All Types</option>
              {propertyTypes.map(type => (
                <option key={type} value={type} className="bg-cre-950">{type}</option>
              ))}
            </select>
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Property Cards */}
      <div className="space-y-6">
        {filteredProperties.map((property, pi) => {
          const spaces = MOCK_SPACES.filter(s => s.propertyId === property.id);
          const suites = spaces.filter(s => s.type === 'suite');
          const commonAreas = spaces.filter(s => s.type === 'common_area');
          const openWOs = MOCK_WORK_ORDERS.filter(
            wo => wo.propertyId === property.id && wo.status !== 'closed' && wo.status !== 'skipped'
          ).length;

          return (
            <div key={property.id} className={`glass-card overflow-hidden animate-slide-up animate-slide-up-delay-${pi + 1}`}>
              {/* Property Header */}
              <div className="p-6 border-b border-white/5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-cre-500/10 flex items-center justify-center shrink-0">
                      <Building2 size={24} className="text-cre-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">{property.name}</h2>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                        <MapPin size={13} className="text-gray-500" />
                        {property.address}, {property.city}, {property.state} {property.zipCode}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 text-xs font-medium text-cre-400 bg-cre-500/10 border border-cre-500/15 rounded-lg">
                        {property.type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Property Stats */}
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Layers size={12} className="text-gray-500" />
                    <span><strong className="text-white">{spaces.length}</strong> Spaces</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Building2 size={12} className="text-gray-500" />
                    <span><strong className="text-white">{suites.length}</strong> Suites</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Wrench size={12} className="text-gray-500" />
                    <span className={openWOs > 0 ? 'text-amber-400' : ''}>
                      <strong className={openWOs > 0 ? 'text-amber-400' : 'text-white'}>{openWOs}</strong> Open WOs
                    </span>
                  </div>
                  {property.totalSqFt && (
                    <div className="text-xs text-gray-400">
                      <strong className="text-white">{property.totalSqFt.toLocaleString()}</strong> sq ft
                    </div>
                  )}
                  {property.yearBuilt && (
                    <div className="text-xs text-gray-400">
                      Built <strong className="text-white">{property.yearBuilt}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Spaces List */}
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {/* Suites */}
                  {suites.map(space => (
                    <div key={space.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                          <Building2 size={14} className="text-violet-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{space.name}</div>
                          {space.tenantName && (
                            <div className="text-[11px] text-gray-500">{space.tenantName}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {space.floor != null && (
                          <span className="text-[10px] text-gray-500">Floor {space.floor}</span>
                        )}
                        {space.sqFt && (
                          <div className="text-[10px] text-gray-600">{space.sqFt.toLocaleString()} sf</div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Common Areas */}
                  {commonAreas.map(space => (
                    <div key={space.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <Layers size={14} className="text-emerald-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{space.name}</div>
                          <div className="text-[11px] text-emerald-500/60">Common Area</div>
                        </div>
                      </div>
                      <div className="text-right">
                        {space.floor != null && (
                          <span className="text-[10px] text-gray-500">
                            {space.floor < 0 ? `B${Math.abs(space.floor)}` : `Floor ${space.floor}`}
                          </span>
                        )}
                        {space.sqFt && (
                          <div className="text-[10px] text-gray-600">{space.sqFt.toLocaleString()} sf</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {filteredProperties.length === 0 && (
          <div className="glass-card py-16 flex flex-col items-center justify-center animate-scale-in">
            <Building2 size={40} className="text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">No properties found matching your search</p>
          </div>
        )}
      </div>

      {showAddProperty && (
        <PropertyIngestionModal
          onClose={() => setShowAddProperty(false)}
          onSubmit={() => setProperties([...MOCK_PROPERTIES])}
        />
      )}
    </div>
  );
}
