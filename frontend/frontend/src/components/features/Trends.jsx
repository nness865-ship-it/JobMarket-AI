import React, { useState, useEffect } from 'react';
import { getJobTrends, syncLiveJobs } from '../../services/api';
import { BarChart as BarC, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, AreaChart, Area, Cell } from 'recharts';
import { Loader2, TrendingUp, BarChart3, LayoutGrid, RotateCcw, AlertCircle, Zap, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#84cc16'];

export function Trends() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ topSkills: [], roleDistribution: [], salaryTrend: [] });
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      setError(null);
      const response = await getJobTrends();
      setData(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load trends. Make sure backend is running and jobs are seeded.");
      setData({ topSkills: [], roleDistribution: [], salaryTrend: [] });
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncSuccess(false);
    setError(null);
    try {
      await syncLiveJobs();
      setSyncSuccess(true);
      await fetchTrends();
      setTimeout(() => setSyncSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      setError("Failed to sync live market data. Please try again later.");
    } finally {
      setSyncing(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-saas-900 border border-saas-700 p-3 rounded-lg shadow-xl text-sm">
          <p className="font-semibold text-white mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="font-medium">
              {entry.name}: {
                entry.name === 'average' 
                  ? `$${entry.value.toLocaleString()}` 
                  : entry.value
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="w-full h-[600px] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <h3 className="text-lg font-medium text-saas-300">Loading Market Trends</h3>
      </div>
    );
  }

  const chartTheme = {
    axis: { stroke: '#475569', fill: '#94a3b8' },
    grid: { stroke: '#1e293b' }
  };

  const isEmpty =
    !data?.topSkills?.length && !data?.roleDistribution?.length && !data?.salaryTrend?.length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Market Intelligence</h2>
            <div className="flex items-center gap-2">
              <p className="text-saas-400 text-sm">Real-world trends powered by live job data.</p>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-saas-800 text-saas-500 border border-saas-700">Source: Remotive</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all border",
                syncSuccess 
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : "bg-primary/20 text-primary-light hover:bg-primary/30 border-primary/30"
              )}
            >
              {syncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : syncSuccess ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {syncing ? "Syncing..." : syncSuccess ? "Synced!" : "Sync Live Data"}
            </button>
            <button
              onClick={() => { setLoading(true); fetchTrends(); }}
              className="inline-flex items-center gap-2 rounded-lg bg-saas-800 px-3 py-2 text-sm font-medium text-white hover:bg-saas-700 border border-saas-700"
            >
              <RotateCcw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm font-medium border bg-amber-500/10 text-amber-400 border-amber-500/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {isEmpty && (
        <div className="bg-saas-900 border border-saas-800 rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[320px]">
          <div className="w-16 h-16 rounded-full bg-saas-800 flex items-center justify-center mb-4 text-saas-400">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No trends data yet</h3>
          <p className="text-saas-400 max-w-md">
            Sync live market data using the button above or seed your database to see analytics.
          </p>
        </div>
      )}

      {/* Process data for better display */}
      {(() => {
        const sortedRoles = [...(data.roleDistribution || [])]
          .sort((a, b) => b.value - a.value)
          .slice(0, 10);
        
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Skills Bar Chart */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-saas-900 border border-saas-800 rounded-xl p-6 shadow-xl lg:col-span-2"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg text-primary-light">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Top In-Demand Skills</h3>
              </div>
              
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarC data={data.topSkills} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="skillGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.6}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid.stroke} />
                    <XAxis dataKey="name" tick={{ fill: chartTheme.axis.fill, fontSize: 12 }} axisLine={{ stroke: chartTheme.axis.stroke }} tickLine={{ stroke: chartTheme.axis.stroke }} />
                    <YAxis tick={{ fill: chartTheme.axis.fill, fontSize: 12 }} axisLine={{ stroke: chartTheme.axis.stroke }} tickLine={{ stroke: chartTheme.axis.stroke }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b', opacity: 0.4 }} />
                    <Bar dataKey="demand" name="Demand Score" fill="url(#skillGradient)" radius={[6, 6, 0, 0]}>
                      {data.topSkills.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarC>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Role Distribution Horizontal Bar Chart */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-saas-900 border border-saas-800 rounded-xl p-6 shadow-xl"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-accent/10 rounded-lg text-accent-light">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Role Popularity</h3>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarC data={sortedRoles} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={chartTheme.grid.stroke} />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tick={{ fill: chartTheme.axis.fill, fontSize: 11 }} 
                      width={100}
                      axisLine={{ stroke: chartTheme.axis.stroke }}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b', opacity: 0.4 }} />
                    <Bar dataKey="value" name="Job Count" radius={[0, 4, 4, 0]}>
                      {sortedRoles.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarC>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Salary Trend Area Chart */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-saas-900 border border-saas-800 rounded-xl p-6 shadow-xl"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Salary Growth Trend</h3>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.salaryTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid.stroke} />
                    <XAxis dataKey="year" tick={{ fill: chartTheme.axis.fill, fontSize: 12 }} axisLine={{ stroke: chartTheme.axis.stroke }} tickLine={{ stroke: chartTheme.axis.stroke }} />
                    <YAxis tickFormatter={(val) => `$${val/1000}k`} tick={{ fill: chartTheme.axis.fill, fontSize: 12 }} axisLine={{ stroke: chartTheme.axis.stroke }} tickLine={{ stroke: chartTheme.axis.stroke }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="average" 
                      name="Average Salary" 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorSalary)"
                      activeDot={{ r: 6, fill: "#059669", stroke: "#fff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        );
      })()}
      </div>
    );
}
