import React, { useState } from 'react';
import { DashboardData } from '../utils/dataProcessor';
import { ArrowLeft, Target, TrendingUp, Users, DollarSign, Activity, PieChart, Focus } from 'lucide-react';
import { EdaSection } from './views/EdaSection';
import { FeatureInsights } from './views/FeatureInsights';
import { CustomerSegments } from './views/CustomerSegments';

export const Dashboard: React.FC<{ data: DashboardData, onReset: () => void }> = ({ data, onReset }) => {
  const [activeTab, setActiveTab] = useState<'eda' | 'features' | 'segments'>('eda');

  return (
    <div className="animate-in fade-in duration-700 max-w-[90rem] mx-auto w-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-white/5 relative z-20">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-indigo-500/20 flex-shrink-0">
            <div className="w-full h-full bg-[#020617] rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-1 tracking-tight">E-Commerce Analytics <span className="text-gradient">Dashboard</span></h1>
            <p className="text-slate-400 text-xs sm:text-sm font-medium">Derived from transactions predicting high-value and promotional behaviors</p>
          </div>
        </div>
        <button 
          onClick={onReset}
          className="flex items-center justify-center w-full md:w-auto gap-2 px-6 py-2.5 rounded-full bg-slate-900/50 border border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:text-white transition-all shadow-sm flex-shrink-0 group hover:border-indigo-500/30"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          <span className="font-semibold text-sm">Upload New Dataset</span>
        </button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <KpiCard title="Total Revenue" value={`$${data.metrics.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}`} icon={<DollarSign className="w-6 h-6 text-emerald-400" />} colorClass="emerald" />
        <KpiCard title="Total Orders" value={data.metrics.totalOrders.toLocaleString()} icon={<TrendingUp className="w-6 h-6 text-blue-400" />} colorClass="blue" />
        <KpiCard title="Total Customers" value={data.metrics.totalCustomers.toLocaleString()} icon={<Users className="w-6 h-6 text-indigo-400" />} colorClass="indigo" />
        <KpiCard title="Avg Order Value" value={`$${data.metrics.avgOrderValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}`} icon={<Target className="w-6 h-6 text-purple-400" />} colorClass="purple" />
      </div>

      {/* Tabs */}
      <div className="flex flex-nowrap overflow-x-auto gap-2 mb-10 bg-[#0f172a]/80 backdrop-blur-md p-1.5 rounded-2xl w-full sm:w-fit border border-white/5 shadow-xl pb-2 sm:pb-1.5 md:overflow-visible">
        <TabButton icon={<PieChart />} label="Store Overview" active={activeTab === 'eda'} onClick={() => setActiveTab('eda')} />
        <TabButton icon={<Activity />} label="Coupons & Payments" active={activeTab === 'features'} onClick={() => setActiveTab('features')} />
        <TabButton icon={<Focus />} label="VIP Customers" active={activeTab === 'segments'} onClick={() => setActiveTab('segments')} />
      </div>

      {/* Content Area */}
      <div className="mb-12 relative z-10 w-full overflow-hidden">
        {activeTab === 'eda' && <EdaSection data={data} />}
        {activeTab === 'features' && <FeatureInsights data={data} />}
        {activeTab === 'segments' && <CustomerSegments data={data} />}
      </div>
    </div>
  );
};

const KpiCard: React.FC<{ title: string, value: string | number, icon: React.ReactNode, colorClass: string }> = ({ title, value, icon, colorClass }) => {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/10 border-emerald-500/20 group-hover:bg-emerald-500/20',
    blue: 'bg-blue-500/10 border-blue-500/20 group-hover:bg-blue-500/20',
    indigo: 'bg-indigo-500/10 border-indigo-500/20 group-hover:bg-indigo-500/20',
    purple: 'bg-purple-500/10 border-purple-500/20 group-hover:bg-purple-500/20',
  };

  return (
    <div className="glass-card p-6 rounded-[1.5rem] flex items-center gap-5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
      <div className={`p-4 border rounded-2xl shadow-inner transition-colors duration-300 relative z-10 ${colorMap[colorClass]}`}>
        {icon}
      </div>
      <div className="relative z-10">
        <p className="text-slate-400 text-xs sm:text-sm font-semibold mb-1 tracking-wide uppercase">{title}</p>
        <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center whitespace-nowrap flex-shrink-0 gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
      active 
        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 border-transparent' 
        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
    }`}
  >
    {React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4' })}
    {label}
  </button>
);

