import React from 'react';
import Card from './Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, trendType = 'neutral', color = 'blue' }) => {
  const colorMap = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    green: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  };

  return (
    <Card className="flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
      {/* Decorative top corner glow */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full filter blur-[40px] opacity-10 bg-${color}-500 transition-all duration-300 group-hover:scale-125`}></div>
      
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <h4 className="text-3xl font-extrabold text-white mt-2 font-sans tracking-tight">{value}</h4>
        </div>
        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${colorMap[color] || colorMap.blue}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-1.5 mt-4">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
            trendType === 'up' 
              ? 'bg-emerald-500/10 text-emerald-400' 
              : trendType === 'down' 
                ? 'bg-rose-500/10 text-rose-400' 
                : 'bg-slate-800 text-slate-400'
          }`}>
            {trendType === 'up' && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
            {trendType === 'down' && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {trend}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">vs last month</span>
        </div>
      )}
    </Card>
  );
};

export default StatCard;
