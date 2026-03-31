import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { DashboardData } from '../../utils/dataProcessor';
import { DecisionCard } from '../DecisionCard';
import { useInView } from '../../hooks/useInView';
import { groupBy } from 'lodash';

const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'];

export const EdaSection: React.FC<{ data: DashboardData }> = ({ data }) => {
  const { transactions } = data;

  const [chart1Ref, chart1Visible] = useInView({ threshold: 0.3 });
  const [chart2Ref, chart2Visible] = useInView({ threshold: 0.3 });

  const monthlyOrders = useMemo(() => {
    const grouped = groupBy(transactions, 'orderMonth');
    return Object.keys(grouped).sort().map(month => ({
      month: month === 'Unknown' ? 'Other' : month,
      orders: grouped[month].length
    }));
  }, [transactions]);

  const orderStatus = useMemo(() => {
    const grouped = groupBy(transactions, 'status');
    return Object.keys(grouped).map(status => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: grouped[status].length
    }));
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
      <DecisionCard 
        title="Business Overview & Health" 
        insights={[
          "Here we can see which months bring in the most orders. You should plan your biggest sales and marketing during these busy months.",
          "Check how many orders are failing or being cancelled. Investigating why customers are having trouble completing their purchases will help recover lost sales.",
          "A small group of loyal customers often spend much more than the rest. Identifying and keeping them happy is key to your business growth."
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Orders */}
        <div className="glass-card rounded-[1.5rem] p-4 sm:p-6 lg:p-8 relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <h3 className="text-xl font-bold tracking-tight text-white mb-6 sm:mb-8 flex items-center gap-2">Monthly Order Volume</h3>
          <div ref={chart1Ref} className="h-64 sm:h-72 w-full relative z-10 text-xs sm:text-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyOrders} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.02)'}}
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: '#818cf8', fontWeight: 600 }}
                />
                {chart1Visible && <Bar dataKey="orders" fill="url(#colorOrders)" radius={[4, 4, 0, 0]} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-slate-400/90 mt-8 bg-black/20 p-4 rounded-xl border border-white/5 leading-relaxed shadow-inner">
            <strong>💡 Insight:</strong> This chart shows the total number of orders you received each month. You can easily spot your busiest and slowest months to plan your stock and promotions.
          </p>
        </div>

        {/* Order Status */}
        <div className="glass-card rounded-[1.5rem] p-4 sm:p-6 lg:p-8 relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <h3 className="text-xl font-bold tracking-tight text-white mb-6 sm:mb-8 flex items-center gap-2">Order Status Distribution</h3>
          <div ref={chart2Ref} className="h-64 sm:h-72 w-full relative z-10 text-xs sm:text-sm">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {chart2Visible && (
                  <Pie
                    data={orderStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                    stroke="none"
                  >
                    {orderStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                )}
                <Tooltip contentStyle={tooltipStyle} itemStyle={{ fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-slate-400/90 mt-8 bg-black/20 p-4 rounded-xl border border-white/5 leading-relaxed shadow-inner">
            <strong>💡 Insight:</strong> Shows the percentage of your orders successfully completed versus failed. If the "Failed" slice is large, investigate checkout issues immediately!
          </p>
        </div>
      </div>
    </div>
  );
};
