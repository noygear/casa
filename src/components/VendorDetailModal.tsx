import { useState, useMemo } from 'react';
import { X, TrendingUp, Calendar, Building2, DollarSign } from 'lucide-react';
import { Vendor } from '../types';
import { MOCK_WORK_ORDERS, MOCK_PROPERTIES } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { subDays, startOfMonth, format, isAfter } from 'date-fns';

interface VendorDetailModalProps {
  vendor: Vendor;
  onClose: () => void;
}

type Timeframe = '30days' | '12months' | 'ytd' | 'all';

export function VendorDetailModal({ vendor, onClose }: VendorDetailModalProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('12months');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');

  // Filter to only closed work orders for this vendor
  const vendorOrders = useMemo(() => {
    return MOCK_WORK_ORDERS.filter(wo => wo.vendorId === vendor.id && wo.status === 'closed' && wo.cost !== null);
  }, [vendor.id]);

  // Apply filters
  const filteredOrders = useMemo(() => {
    let result = vendorOrders;

    // Apply property filter
    if (propertyFilter !== 'all') {
      result = result.filter(wo => wo.propertyId === propertyFilter);
    }

    // Apply time filter
    const now = new Date();
    if (timeframe === '30days') {
      const cutOff = subDays(now, 30);
      result = result.filter(wo => isAfter(new Date(wo.resolvedAt || wo.createdAt), cutOff));
    } else if (timeframe === '12months') {
      const cutOff = subDays(now, 365);
      result = result.filter(wo => isAfter(new Date(wo.resolvedAt || wo.createdAt), cutOff));
    } else if (timeframe === 'ytd') {
      const cutOff = new Date(now.getFullYear(), 0, 1);
      result = result.filter(wo => isAfter(new Date(wo.resolvedAt || wo.createdAt), cutOff));
    }

    return result.sort((a, b) => new Date(b.resolvedAt || b.createdAt).getTime() - new Date(a.resolvedAt || a.createdAt).getTime());
  }, [vendorOrders, timeframe, propertyFilter]);

  // Aggregate data for Recharts
  const chartData = useMemo(() => {
    const dataMap = new Map<string, number>();

    filteredOrders.forEach(wo => {
      const date = new Date(wo.resolvedAt || wo.createdAt);
      let key = '';
      if (timeframe === '30days') {
        key = format(date, 'MMM dd');
      } else {
        const monthStart = startOfMonth(date);
        key = format(monthStart, 'MMM yyyy');
      }
      
      const current = dataMap.get(key) || 0;
      dataMap.set(key, current + (wo.cost || 0));
    });

    // Convert map to array and sort chronologically
    return Array.from(dataMap.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  }, [filteredOrders, timeframe]);

  const totalSpent = useMemo(() => filteredOrders.reduce((sum, wo) => sum + (wo.cost || 0), 0), [filteredOrders]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 drop-shadow-2xl">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-cre-950 border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold text-white">{vendor.companyName}</h2>
            <p className="text-sm text-gray-400">Vendor Analytics & Expenditure</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Controls & Summary */}
          <div className="flex flex-col lg:flex-row gap-6 justify-between">
            <div className="flex items-center gap-4">
              <div className="glass-card px-5 py-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <DollarSign size={24} />
                </div>
                <div>
                  <div className="text-sm text-gray-400 font-medium tracking-wide uppercase">Total Spend</div>
                  <div className="text-2xl font-bold text-white">
                    ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  value={timeframe}
                  onChange={e => setTimeframe(e.target.value as Timeframe)}
                  className="pl-9 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cre-500/50 appearance-none cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <option value="30days" className="bg-cre-950">Last 30 Days</option>
                  <option value="ytd" className="bg-cre-950">Year to Date</option>
                  <option value="12months" className="bg-cre-950">Last 12 Months</option>
                  <option value="all" className="bg-cre-950">All Time</option>
                </select>
              </div>
              <div className="relative">
                <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  value={propertyFilter}
                  onChange={e => setPropertyFilter(e.target.value)}
                  className="pl-9 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cre-500/50 appearance-none cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <option value="all" className="bg-cre-950">All Properties</option>
                  {MOCK_PROPERTIES.map(p => (
                    <option key={p.id} value={p.id} className="bg-cre-950">{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
              <TrendingUp size={16} className="text-cre-400" />
              Expenditure Trend
            </h3>
            {chartData.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#9ca3af" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10} 
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `$${value}`}
                      dx={-10}
                    />
                    <Tooltip 
                      cursor={{ fill: '#ffffff05' }}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff10', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#38bdf8' }}
                      formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Spent'] as [string, string]}
                    />
                    <Bar dataKey="total" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-gray-500">
                <DollarSign size={32} className="mb-2 opacity-50" />
                <p>No expenditure data for this period.</p>
              </div>
            )}
          </div>

          {/* Work Orders List */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Completed Work Orders</h3>
            <div className="overflow-x-auto rounded-xl border border-white/5">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white/5 text-gray-400 font-medium">
                  <tr>
                    <th className="px-6 py-4">Date Resolved</th>
                    <th className="px-6 py-4">Property</th>
                    <th className="px-6 py-4 w-full">Task</th>
                    <th className="px-6 py-4 text-right">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.length > 0 ? filteredOrders.map(wo => (
                    <tr key={wo.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-gray-300">
                        {wo.resolvedAt ? format(new Date(wo.resolvedAt), 'MMM dd, yyyy') : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-gray-300">{wo.property?.name}</td>
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{wo.title}</div>
                      </td>
                      <td className="px-6 py-4 text-emerald-400 font-semibold text-right">
                        ${wo.cost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No work orders found for the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
