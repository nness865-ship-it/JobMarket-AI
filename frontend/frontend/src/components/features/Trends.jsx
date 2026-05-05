import React, { useState, useEffect } from 'react';
import { getJobTrends } from '../../services/api';
import { 
  BarChart as BarC, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  Legend 
} from 'recharts';
import { 
  Loader2, 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Globe, 
  Zap, 
  Activity, 
  MapPin, 
  ArrowUpRight, 
  ShieldCheck, 
  BrainCircuit,
  Workflow
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#84cc16'];

export function Trends() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      const response = await getJobTrends();
      setData(response.data);
    } catch (err) {
      console.error('Failed to fetch trends:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="w-full h-[600px] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-[40px] animate-pulse" />
          <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
        </div>
        <h3 className="mt-6 text-lg font-bold text-slate-400 tracking-widest uppercase">Syncing Market Data...</h3>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
          <p className="font-black text-white mb-2 text-xs uppercase tracking-widest">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <p className="text-sm font-bold text-slate-300">
                {entry.name}: <span className="text-white">
                  {entry.name.toLowerCase().includes('salary') ? `$${entry.value.toLocaleString()}` : entry.value}
                </span>
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10 pb-20">
      {/* Header & Pulse */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-[10px] font-black uppercase tracking-widest">
              Live Intelligence
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2">Market Pulse</h2>
          <p className="text-slate-400 text-lg max-w-xl">Dynamic shift analysis and predictive career modeling.</p>
        </div>
      </div>

      {/* Ticker */}
      <div className="relative h-12 overflow-hidden bg-white/5 border-y border-white/5 flex items-center">
        <div className="whitespace-nowrap animate-marquee flex items-center gap-12">
            {[...(data?.topSkills || []), ...(data?.topSkills || [])].map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.name}</span>
                    <span className="text-sm font-bold text-primary-light">{s.demand}%</span>
                    <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                </div>
            ))}
        </div>
      </div>

      {/* User's Domain Job Demand (Personalized) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-10 rounded-[3rem] bg-gradient-to-br from-emerald-900/20 to-blue-900/20 border border-emerald-500/20 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">Your Domain: Job Market Growth</h3>
              <p className="text-emerald-400 text-sm font-bold">Personalized for your profession & industry</p>
            </div>
          </div>
          <div className="flex gap-2">
              <div className="px-3 py-1 rounded-lg bg-emerald-500/10 text-[10px] font-bold text-emerald-400">Your Field</div>
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.salaryTrend || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} tickFormatter={(v) => `${v/1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="average" name="Average Salary" stroke="#10b981" strokeWidth={4} dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }} />
              <Line type="monotone" dataKey="senior" name="Senior Level" stroke="#3b82f6" strokeWidth={3} strokeDasharray="5 5" dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} />
              <Line type="monotone" dataKey="entry" name="Entry Level" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Domain Insights */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-emerald-500/20">
          {[
            { name: 'Your Role', color: '#10b981', growth: '+85%', trend: 'Strong' },
            { name: 'Senior Level', color: '#3b82f6', growth: '+120%', trend: 'Excellent' },
            { name: 'Related Role 1', color: '#8b5cf6', growth: '+65%', trend: 'Good' },
            { name: 'Related Role 2', color: '#f59e0b', growth: '+45%', trend: 'Moderate' },
            { name: 'Emerging Role', color: '#ef4444', growth: '+200%', trend: 'Explosive' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
              <div className="text-center">
                <span className="text-xs font-bold text-white block">{item.name}</span>
                <span className="text-[10px] font-bold text-emerald-400">{item.growth}</span>
                <span className="text-[8px] text-slate-400 block uppercase tracking-widest">{item.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Salary Growth (Main Card) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 p-10 rounded-[3rem] bg-slate-900/40 border border-white/5 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary-light">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-white">Job Demand Over 5 Years</h3>
            </div>
            <div className="flex gap-2">
                <div className="px-3 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-slate-400">Job Openings</div>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarC data={data?.salaryTrend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="average" name="Market Average" fill="#0ea5e9" />
                <Bar dataKey="senior" name="Senior Tier" fill="#8b5cf6" />
              </BarC>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
            {(data?.roleDistribution || []).map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">{item.name}</span>
                  <span className="text-[10px] font-bold text-emerald-400">+{item.growth}% Growth</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Category Intelligence */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 rounded-[3rem] bg-slate-900/40 border border-white/5"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent-light">
              <PieChartIcon className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-white">Domains</h3>
          </div>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.roleDistribution || []}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {data.roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-4">
            {(data?.roleDistribution || []).map((r, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">{r.name}</span>
                <span className="text-sm font-bold text-white">+{r.growth}% Growth</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
