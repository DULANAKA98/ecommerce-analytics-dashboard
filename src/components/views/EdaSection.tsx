import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { DashboardData, ProcessedTransaction } from '../../utils/dataProcessor';
import { DecisionCard } from '../DecisionCard';
import { useInView } from '../../hooks/useInView';
import { groupBy } from 'lodash';

const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'];

// ─── helpers ────────────────────────────────────────────────────────────────

type ChartMode = 'daily' | 'weekly' | 'bimonthly' | 'monthly';

const buildOrderVolume = (
  transactions: ProcessedTransaction[],
  mode: ChartMode
): { label: string; orders: number }[] => {
  const grouped: Record<string, { label: string; orders: number }> = {};

  transactions.forEach(t => {
    let sortKey: string;
    let displayLabel: string;
    const d = t.createdAt;

    if (mode === 'daily') {
      sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      displayLabel = sortKey;
    } else if (mode === 'weekly') {
      // Monday to Sunday range
      const day = d.getDay();
      const diff = d.getDate() - (day === 0 ? 6 : day - 1);
      const monday = new Date(new Date(d).setHours(0, 0, 0, 0));
      monday.setDate(diff);
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      sortKey = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
      const format = (dt: Date) => `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}`;
      displayLabel = `${format(monday)} to ${format(sunday)}`;
    } else if (mode === 'bimonthly') {
      // Semi-monthly: 1st-14th, 15th-End
      const isFirstHalf = d.getDate() <= 14;
      const monthNum = d.getMonth() + 1;
      const monthStr = String(monthNum).padStart(2, '0');
      
      sortKey = `${d.getFullYear()}-${monthStr}-${isFirstHalf ? '01' : '15'}`;
      if (isFirstHalf) {
        displayLabel = `01/${monthStr} to 14/${monthStr}`;
      } else {
        const lastDay = new Date(d.getFullYear(), monthNum, 0).getDate();
        displayLabel = `15/${monthStr} to ${lastDay}/${monthStr}`;
      }
    } else {
      // Monthly
      sortKey = t.orderMonth === 'Unknown' ? '9999-12' : t.orderMonth;
      displayLabel = t.orderMonth === 'Unknown' ? 'Other' : t.orderMonth;
    }

    if (!grouped[sortKey]) {
      grouped[sortKey] = { label: displayLabel, orders: 0 };
    }
    grouped[sortKey].orders += 1;
  });

  return Object.keys(grouped)
    .sort()
    .map(k => grouped[k]);
};



const CHART_META: Record<ChartMode, { title: string; insight: string }> = {
  daily: {
    title: 'Daily Order Volume',
    insight: 'This chart shows the total number of orders you received each day. You can spot rush days, weekends, and any anomalies to plan staffing and inventory accordingly.',
  },
  weekly: {
    title: 'Weekly Order Volume',
    insight: 'This chart shows the total number of orders grouped by ISO week. Spot your busiest and slowest weeks to time promotions and stock replenishment.',
  },
  bimonthly: {
    title: 'Bi-Monthly Order Volume',
    insight: 'This chart splits each month into two 14/15-day periods. It helps identify trends within each month and provides a higher fidelity view of your performance.',
  },
  monthly: {
    title: 'Monthly Order Volume',
    insight: 'This chart shows the total number of orders you received each month. You can easily spot your busiest and slowest months to plan your stock and promotions.',
  },
};

// ─── component ───────────────────────────────────────────────────────────────

export const EdaSection: React.FC<{ data: DashboardData }> = ({ data }) => {
  const { transactions } = data;

  const [chart1Ref, chart1Visible] = useInView({ threshold: 0.3 });
  const [chart2Ref, chart2Visible] = useInView({ threshold: 0.3 });

  const { mode, chartData } = useMemo(() => {
    const uniqueMonths = new Set(
      transactions.map(t => t.orderMonth).filter(m => m !== 'Unknown')
    );
    const monthCount = uniqueMonths.size;

    let m: ChartMode;
    if (monthCount <= 1) m = 'daily';
    else if (monthCount === 2) m = 'weekly';
    else if (monthCount === 3) m = 'bimonthly';
    else m = 'monthly';

    return { mode: m, chartData: buildOrderVolume(transactions, m) };
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

  const meta = CHART_META[mode];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Adaptive Order Volume Chart */}
        <div className="glass-card rounded-[1.5rem] p-4 sm:p-6 lg:p-8 relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              {meta.title}
            </h3>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2.5 py-0.5 ml-auto flex-shrink-0">
              Auto
            </span>
          </div>
          <div ref={chart1Ref} className="h-64 sm:h-72 w-full relative z-10 text-xs sm:text-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  interval="preserveStartEnd"
                />
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
            <strong>💡 Insight:</strong> {meta.insight}
          </p>
        </div>

        {/* Order Status */}
        <div className="glass-card rounded-[1.5rem] p-4 sm:p-6 lg:p-8 relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <h3 className="text-xl font-bold tracking-tight text-white mb-6 sm:mb-8 flex items-center gap-2">Order Status Distribution</h3>
          <div ref={chart2Ref} className="h-64 sm:h-72 w-full relative z-10 text-xs sm:text-sm">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                {chart2Visible && (
                  <Pie
                    data={orderStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="80%"
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

      {/* Business Insights — moved to bottom */}
      <DecisionCard
        title="Business Overview & Health"
        insights={[
          "Here we can see which periods bring in the most orders. You should plan your biggest sales and marketing during these busy periods.",
          "Check how many orders are failing or being cancelled. Investigating why customers are having trouble completing their purchases will help recover lost sales.",
          "A small group of loyal customers often spend much more than the rest. Identifying and keeping them happy is key to your business growth."
        ]}
      />
    </div>
  );
};
