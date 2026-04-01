import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ScatterChart, Scatter, Cell } from 'recharts';
import { DashboardData } from '../../utils/dataProcessor';
import { DecisionCard } from '../DecisionCard';
import { useInView } from '../../hooks/useInView';
import { Crown, User, Mail, ChevronDown, ChevronUp, Info, Focus } from 'lucide-react';

// ── Custom scatter tooltip showing User ID ───────────────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */
const ScatterTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{
      backgroundColor: '#020617',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '12px',
      padding: '12px 16px',
      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.8)',
      color: '#f8fafc',
      minWidth: '160px',
    }}>
      <p style={{ color: '#a5b4fc', fontWeight: 700, marginBottom: '6px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Customer #{d.userId}
      </p>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
        <p style={{ color: '#cbd5e1', fontSize: '12px', marginBottom: '3px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Orders:</span> <span style={{ color: '#fff', fontWeight: 600 }}>{d.x}</span>
        </p>
        <p style={{ color: '#cbd5e1', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Total Spent:</span> <span style={{ color: '#34d399', fontWeight: 600 }}>${d.y.toLocaleString()}</span>
        </p>
      </div>
    </div>
  );
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export const CustomerSegments: React.FC<{ data: DashboardData }> = ({ data }) => {
  const { customers } = data;
  const [chart1Ref, chart1Visible] = useInView({ threshold: 0.3 });
  const [chart2Ref, chart2Visible] = useInView({ threshold: 0.3 });
  const [visibleCount, setVisibleCount] = useState(5);

  const vipCustomers = useMemo(() =>
    customers
      .filter(c => c.isHighValue)
      .sort((a, b) => b.totalSpent - a.totalSpent),
    [customers]
  );

  const ordVsSpent = useMemo(() => {
    return customers.map(c => ({
      x: c.totalOrders,
      y: parseFloat(c.totalSpent.toFixed(2)),
      userId: c.userId,
      segment: c.spendingSegment,
    }));
  }, [customers]);

  const segmentColors: Record<string, string> = {
    'Low': '#94a3b8',
    'Medium': '#60a5fa',
    'High': '#8b5cf6'
  };

  const featureImportance = [
    { name: 'Total Orders', value: 41.5 },
    { name: 'Avg Order Value', value: 17.7 },
    { name: 'Avg Discount', value: 9.6 },
    { name: 'Orders Per Day', value: 9.0 },
    { name: 'Completed Ords', value: 6.7 },
    { name: 'Coupon Rate', value: 5.4 }
  ];

  const tooltipStyle = {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    backdropFilter: 'blur(8px)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#f8fafc',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
    padding: '12px 16px'
  };

  const shownVips = vipCustomers.slice(0, visibleCount);
  const hasMore = visibleCount < vipCustomers.length;
  const showLessVisible = visibleCount > 5;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      {/* VIP Customer Roster */}
      <div className="glass-card border-purple-500/20 rounded-[1.5rem] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[80px] -mr-48 -mt-48 pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 relative z-10">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <Crown className="w-5 h-5 text-amber-400" />
          </div>
          <div className="group relative flex flex-col items-center sm:items-start">
            <div className="flex items-center gap-2 cursor-help">
              <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-white font-bold text-xl tracking-tight">VIP Customers</h3>
              <Info className="w-3.5 h-3.5 text-slate-500" />
            </div>
            
            {/* Attractive Hover Box (Methodology Tooltip) - Positined below on mobile, to the right on desktop */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-4 sm:left-full sm:translate-x-0 sm:top-0 sm:ml-4 w-64 p-4 bg-[#0f172a] border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-[100] transform scale-95 group-hover:scale-100">
              <div className="flex items-center gap-2 mb-2 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                <Focus className="w-3 h-3" />
                Methodology
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                VIPs are identified by selecting the <strong>top 25% of customers</strong> who have the highest total lifetime spending.
              </p>
            </div>
          </div>
          <span className="sm:ml-auto text-sm font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1">
            {vipCustomers.length} identified
          </span>
        </div>

        {vipCustomers.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">No VIP customers identified in this dataset.</p>
        ) : (
          <div className="relative z-10 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3 pr-4">#</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3 pr-4">
                    <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />User ID</span>
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3 pr-4">
                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />Email</span>
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3 pr-4">Total Spent</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3">Orders</th>
                </tr>
              </thead>
              <tbody>
                {shownVips.map((customer, idx) => (
                  <tr
                    key={customer.userId}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors duration-150"
                  >
                    <td className="py-3 pr-4 text-slate-500 font-mono text-xs">{idx + 1}</td>
                    <td className="py-3 pr-4">
                      <span className="font-mono text-indigo-300 text-xs bg-indigo-500/10 px-2 py-0.5 rounded-md">
                        #{customer.userId}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-300">
                      {customer.email
                        ? <span className="text-slate-200 font-medium">{customer.email}</span>
                        : <span className="text-slate-500 italic text-xs">Not available</span>
                      }
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <span className="font-bold text-emerald-400">
                        ${customer.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-slate-300 font-semibold">{customer.totalOrders}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex items-center justify-center gap-4 mt-6">
              {showLessVisible && (
                <button
                  onClick={() => setVisibleCount(5)}
                  className="flex items-center gap-2 px-6 py-2 rounded-full bg-slate-900/50 border border-white/10 text-slate-400 text-sm font-semibold hover:bg-slate-800 hover:text-white transition-all duration-200"
                >
                  <ChevronUp className="w-4 h-4" />
                  Show Less
                </button>
              )}
              {hasMore && (
                <button
                  onClick={() => setVisibleCount(v => v + 5)}
                  className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/10 hover:text-white hover:border-indigo-500/30 transition-all duration-200"
                >
                  <ChevronDown className="w-4 h-4 text-indigo-400" />
                  See more ({vipCustomers.length - visibleCount} remaining)
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customer Orders vs Total Spending */}
        <div className="glass-card rounded-[1.5rem] p-4 sm:p-6 lg:p-8 relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <h3 className="text-xl font-bold tracking-tight text-white mb-6 sm:mb-8 flex items-center gap-2">Customer Orders vs Total Spending</h3>
          <div ref={chart1Ref} className="h-64 sm:h-72 w-full relative z-10 text-xs sm:text-sm">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" dataKey="x" name="Total Orders" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis type="number" dataKey="y" name="Total Spent" unit="$" stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip cursor={{ strokeDasharray: '3 3', stroke: '#475569' }} content={<ScatterTooltip />} />
                {chart1Visible && (
                  <Scatter name="Customers" data={ordVsSpent}>
                    {ordVsSpent.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={segmentColors[entry.segment]} opacity={0.8} />
                    ))}
                  </Scatter>
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-6 mb-4 relative z-10 text-sm font-medium">
            <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5"><span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6] shadow-[0_0_10px_#8b5cf6]"></span> VIP</span>
            <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5"><span className="w-2.5 h-2.5 rounded-full bg-[#60a5fa] shadow-[0_0_10px_#60a5fa]"></span> Regular</span>
            <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5"><span className="w-2.5 h-2.5 rounded-full bg-[#94a3b8] shadow-[0_0_10px_#94a3b8]"></span> Occasional</span>
          </div>
          <p className="text-sm text-slate-400/90 mt-6 bg-black/20 p-4 rounded-xl border border-white/5 leading-relaxed shadow-inner">
            <strong>💡 Insight:</strong> Every dot represents a customer. Customers who order more times (moving right) bring in much more total money (moving up). Focus on getting people to order again!
          </p>
        </div>

        {/* Predictive Feature Importance Proxy */}
        <div className="glass-card rounded-[1.5rem] p-4 sm:p-6 lg:p-8 relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <h3 className="text-xl font-bold tracking-tight text-white mb-6 sm:mb-8 flex items-center gap-2">What Drives VIP Behavior?</h3>
          <div ref={chart2Ref} className="h-64 sm:h-72 w-full relative z-10 text-xs sm:text-sm text-slate-300">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportance} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorImportance" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="colorImportanceTop" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" domain={[0, 50]} unit="%" tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" width={90} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{fill: 'rgba(255,255,255,0.02)'}}
                  contentStyle={tooltipStyle}
                  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                  formatter={(value: any) => [`${value}%`, 'Importance']}
                  itemStyle={{ color: '#60a5fa', fontWeight: 600 }}
                />
                {chart2Visible && (
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {featureImportance.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? 'url(#colorImportanceTop)' : 'url(#colorImportance)'} />
                    ))}
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-slate-400/90 mt-12 bg-black/20 p-4 rounded-xl border border-white/5 leading-relaxed shadow-inner">
            <strong>💡 Insight:</strong> Highlights the top behaviors that separate VIPs from the rest. The largest bars (like 'Total Orders') are the most reliable indicators of high profitability.
          </p>
        </div>
      </div>

      {/* Business Insights — moved to bottom */}
      <DecisionCard
        title="Predicting Your Best Customers"
        insights={[
          "Treat your high-spending VIPs well! Customers who order frequently are almost always your biggest spenders. Keep them coming back with special rewards.",
          "If you want to spot your best customers early, simply look at two things: how many times they have ordered, and how much they spend per order on average."
        ]}
      />
    </div>
  );
};
