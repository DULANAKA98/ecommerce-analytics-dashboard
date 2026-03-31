import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ScatterChart, Scatter } from 'recharts';
import { DashboardData } from '../../utils/dataProcessor';
import { DecisionCard } from '../DecisionCard';
import { useInView } from '../../hooks/useInView';
import { groupBy, meanBy } from 'lodash';

export const FeatureInsights: React.FC<{ data: DashboardData }> = ({ data }) => {
  const { transactions } = data;

  const [chart1Ref, chart1Visible] = useInView({ threshold: 0.3 });
  const [chart2Ref, chart2Visible] = useInView({ threshold: 0.3 });
  const [chart3Ref, chart3Visible] = useInView({ threshold: 0.3 });

  const couponImpact = useMemo(() => {
    const withCoupon = transactions.filter(t => t.couponUsed && t.status === 'completed');
    const withoutCoupon = transactions.filter(t => !t.couponUsed && t.status === 'completed');
    
    return [
      { name: 'No Coupon', avgSpent: meanBy(withoutCoupon, 'netAmount') || 0 },
      { name: 'With Coupon', avgSpent: meanBy(withCoupon, 'netAmount') || 0 }
    ];
  }, [transactions]);

  const failureRates = useMemo(() => {
    const grouped = groupBy(transactions, 'paymentMethodId');
    return Object.keys(grouped).map(methodId => {
      const txs = grouped[methodId];
      const failed = txs.filter(t => t.isFailedPayment).length;
      return {
        method: `Method ${methodId}`,
        rate: parseFloat(((failed / txs.length) * 100).toFixed(1))
      };
    }).sort((a, b) => b.rate - a.rate);
  }, [transactions]);

  const discountNet = useMemo(() => {
    return transactions
      .filter(t => t.status === 'completed' && t.discountRatio > 0)
      .map(t => ({ x: parseFloat((t.discountRatio*100).toFixed(1)), y: t.netAmount, z: 1 }));
  }, [transactions]);

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coupon Impact */}
        <div className="glass-card rounded-[1.5rem] p-4 sm:p-6 lg:p-8 relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <h3 className="text-xl font-bold tracking-tight text-white mb-6 sm:mb-8 flex items-center gap-2">Avg Spending: Coupon vs No Coupon</h3>
          <div ref={chart1Ref} className="h-64 sm:h-72 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={couponImpact} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCoupon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={val => `$${val}`} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.02)'}}
                  contentStyle={tooltipStyle}
                  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                  formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, 'Avg Spent']}
                  itemStyle={{ color: '#34d399', fontWeight: 600 }}
                />
                {chart1Visible && <Bar dataKey="avgSpent" fill="url(#colorCoupon)" radius={[4, 4, 0, 0]} barSize={60} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-slate-400/90 mt-8 bg-black/20 p-4 rounded-xl border border-white/5 leading-relaxed shadow-inner">
            <strong>💡 Insight:</strong> Compares average order size when customers use a coupon vs. when they don't to see if your discounts really encourage larger purchases.
          </p>
        </div>

        {/* Failure Rates */}
        <div className="glass-card rounded-[1.5rem] p-4 sm:p-6 lg:p-8 relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <h3 className="text-xl font-bold tracking-tight text-white mb-6 sm:mb-8 flex items-center gap-2">Payment Failure Rate</h3>
          <div ref={chart2Ref} className="h-64 sm:h-72 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={failureRates} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFailure" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 'dataMax + 10']} />
                <YAxis dataKey="method" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.02)'}}
                  contentStyle={tooltipStyle}
                  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                  formatter={(value: any) => [`${value}%`, 'Failure Rate']}
                  itemStyle={{ color: '#fb7185', fontWeight: 600 }}
                />
                {chart2Visible && <Bar dataKey="rate" fill="url(#colorFailure)" radius={[0, 4, 4, 0]} barSize={20} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-slate-400/90 mt-8 bg-black/20 p-4 rounded-xl border border-white/5 leading-relaxed shadow-inner">
            <strong>💡 Insight:</strong> Highlights which payment options fail the most. If a specific method has a long bar, it's causing checkout friction.
          </p>
        </div>
        
        {/* Discount Scatter */}
        <div className="glass-card rounded-[1.5rem] p-4 sm:p-6 lg:p-8 relative overflow-hidden group lg:col-span-2">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>
          <h3 className="text-xl font-bold tracking-tight text-white mb-6 sm:mb-8 flex items-center gap-2">Discount Ratio vs Net Spending</h3>
          <div ref={chart3Ref} className="h-72 sm:h-80 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" dataKey="x" name="Discount %" unit="%" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="number" dataKey="y" name="Net Spent" unit="$" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3', stroke: '#475569' }} 
                  contentStyle={tooltipStyle} 
                  itemStyle={{ fontWeight: 600 }}
                />
                {chart3Visible && <Scatter name="Transactions" data={discountNet} fill="#a855f7" stroke="#d8b4fe" strokeWidth={1} opacity={0.7} />}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-slate-400/90 mt-8 bg-black/20 p-4 rounded-xl border border-white/5 leading-relaxed shadow-inner">
            <strong>💡 Insight:</strong> Every dot is a successful order. It shows the relationship between the discount percentage you gave and the total money spent. Are bigger discounts leading to bigger sales?
          </p>
        </div>
      </div>

      {/* Business Insights — moved to bottom */}
      <DecisionCard
        title="Coupons & Payment Methods"
        insights={[
          "Let's see if coupons actually make customers spend more overall. Sometimes people who would have bought anyway use coupons, which just loses you money.",
          "Some payment methods (like certain cards or wallets) fail a lot. You need to make sure your customers can pay smoothly without errors.",
          "Find the 'sweet spot' for discounts—the perfect percentage that encourages customers to buy more, without eating away your profits."
        ]}
      />
    </div>
  );
};
