import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data generation
const MOCK_1M = Array.from({ length: 30 }, (_, i) => ({
  label: `Day ${i + 1}`,
  compliance: Math.floor(Math.random() * 15) + 85, // 85-100%
  volume: Math.floor(Math.random() * 40) + 10
}));

const MOCK_6M = [
  { label: 'Oct', compliance: 91, volume: 450 },
  { label: 'Nov', compliance: 93, volume: 420 },
  { label: 'Dec', compliance: 92, volume: 480 },
  { label: 'Jan', compliance: 95, volume: 390 },
  { label: 'Feb', compliance: 97, volume: 410 },
  { label: 'Mar', compliance: 96, volume: 440 },
];

const MOCK_ALL_TIME = [
  { label: '2023 Q1', compliance: 82, volume: 1100 },
  { label: '2023 Q2', compliance: 85, volume: 1250 },
  { label: '2023 Q3', compliance: 88, volume: 1300 },
  { label: '2023 Q4', compliance: 89, volume: 1400 },
  { label: '2024 Q1', compliance: 95, volume: 1200 },
];

type TimeFilter = '1M' | '6M' | 'ALL';

export function SLACompliancePage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<TimeFilter>('6M');

  const data = useMemo(() => {
    switch (filter) {
      case '1M': return MOCK_1M;
      case '6M': return MOCK_6M;
      case 'ALL': return MOCK_ALL_TIME;
    }
  }, [filter]);

  const currentCompliance = data[data.length - 1].compliance;
  const avgCompliance = Math.round(data.reduce((acc, curr) => acc + curr.compliance, 0) / data.length);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 mr-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <TrendingUp size={24} className="text-cre-400" />
              SLA Compliance History
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Historical view of preventative maintenance and reactive work order resolution speeds against Service Level Agreements.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up animate-slide-up-delay-1">
        <div className="glass-card p-6">
          <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Current Period</div>
          <div className="flex items-end gap-3">
            <span className={`text-4xl font-bold ${currentCompliance >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {currentCompliance}%
            </span>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Historical Average</div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-white">
              {avgCompliance}%
            </span>
          </div>
        </div>
        <div className="glass-card p-6 border-cre-500/20 bg-cre-500/5">
          <div className="text-sm font-semibold text-cre-400 uppercase tracking-wider mb-2">Target SLA</div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-cre-400">
              95%
            </span>
            <span className="text-xs text-gray-500 mb-1">compliance minimum</span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="glass-card p-6 animate-slide-up animate-slide-up-delay-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-lg font-semibold text-white">Compliance Trend</h2>
          
          {/* Time Filters */}
          <div className="flex items-center gap-2 p-1 bg-black/40 border border-white/10 rounded-xl">
            {(['1M', '6M', 'ALL'] as TimeFilter[]).map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filter === t 
                    ? 'bg-cre-500 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {t === 'ALL' && <Calendar size={14} />}
                {t === 'ALL' ? 'All Time' : t}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis 
                dataKey="label" 
                stroke="#ffffff40" 
                fontSize={12} 
                tickMargin={10} 
                axisLine={false} 
                tickLine={false}
              />
              <YAxis 
                domain={[0, 100]} 
                stroke="#ffffff40" 
                fontSize={12} 
                tickFormatter={(val) => val + "%"}
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0A0A0A', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '12px',
                  color: '#fff' 
                }}
                itemStyle={{ color: '#E63B2E' }}
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="compliance" 
                name="SLA Compliance"
                stroke="#E63B2E" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#0A0A0A', stroke: '#E63B2E', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#E63B2E', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
