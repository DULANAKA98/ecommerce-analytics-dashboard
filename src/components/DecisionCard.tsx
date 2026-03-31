import React from 'react';
import { Sparkles, Info } from 'lucide-react';

interface DecisionCardProps {
  title: string;
  insights: string[];
}

export const DecisionCard: React.FC<DecisionCardProps> = ({ title, insights }) => {
  return (
    <div className="glass-card border-indigo-500/20 rounded-[1.5rem] p-6 lg:p-8 mb-8 relative overflow-hidden group">
      {/* Animated Background Gradients */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-500/5 rounded-full blur-[100px] -mr-[20rem] -mt-[20rem] transition-transform duration-1000 group-hover:translate-x-10 group-hover:translate-y-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none"></div>
      
      {/* Top Accent Line */}
      <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50"></div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl shadow-inner relative group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-shadow duration-500">
                <Sparkles className="text-indigo-400 w-5 h-5 flex-shrink-0" />
              </div>
              <div>
                <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white font-bold text-xl tracking-tight">Business Insights</h3>
                <p className="text-indigo-400/80 text-xs font-semibold tracking-wider uppercase mt-0.5">{title}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {insights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors duration-300">
                  <div className="mt-0.5 p-1 bg-indigo-500/20 rounded-md">
                    <Info className="w-3.5 h-3.5 text-indigo-300" />
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    {insight}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
