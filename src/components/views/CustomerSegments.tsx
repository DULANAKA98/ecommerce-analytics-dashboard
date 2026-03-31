import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ScatterChart, Scatter, Cell } from 'recharts';
import { DashboardData } from '../../utils/dataProcessor';
import { DecisionCard } from '../DecisionCard';
import { useInView } from '../../hooks/useInView';

export const CustomerSegments: React.FC<{ data: DashboardData }> = ({ data }) => {
  const { customers } = data;

  const [chart1Ref, chart1Visible] = useInView({ threshold: 0.3 });
  const [chart2Ref, chart2Visible] = useInView({ threshold: 0.3 });

  const ordVsSpent = useMemo(() => {
    return customers.map(c => ({
      x: c.totalOrders,
      y: parseFloat(c.totalSpent.toFixed(2)),
      segment: c.spendingSegment
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

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <DecisionCard 
        title="Predicting Your Best Customers" 
        insights={[
          "Treat your high-spending VIPs well! Customers who order frequently are almost always your biggest spenders. Keep them coming back with special rewards.",
          "If you want to spot your best customers early, simply look at two things: how many times they have ordered, and how much they spend per order on average.",
          "It's hard to guess who will use generic coupons. Instead of giving discounts to everyone, try sending personalized offers based on what the customer actually likes."
        ]}
      />

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
                <Tooltip cursor={{ strokeDasharray: '3 3', stroke: '#475569' }} contentStyle={tooltipStyle} itemStyle={{ fontWeight: 600 }} />
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
    </div>
  );
};
