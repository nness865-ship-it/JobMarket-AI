import React, { useState, useEffect } from 'react';
import { getJobTrends } from '../../services/api';
import { BarChart as BarC, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Loader2, TrendingUp, BarChart3, PieChart as PieChartIcon, RotateCcw, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#84cc16'];

export function Trends() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ topSkills: [], roleDistribution: [], salaryTrend: [] });
  const [error, setError] = useState(null);

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
            <p className="text-saas-400 text-sm">Live analytics computed from your jobs database.</p>
          </div>
          <button
            onClick={() => { setLoading(true); fetchTrends(); }}
            className="inline-flex items-center gap-2 rounded-lg bg-saas-800 px-3 py-2 text-sm font-medium text-white hover:bg-saas-700 border border-saas-700"
          >
            <RotateCcw className="w-4 h-4" />
            Refresh
          </button>
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
            Seed your jobs database (backend endpoint <code className="text-saas-300">/seed-jobs</code>) and refresh this page.
          </p>
        </div>
      )}

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
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarC data={data.topSkills} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid.stroke} />
                <XAxis dataKey="name" tick={{ fill: chartTheme.axis.fill, fontSize: 12 }} axisLine={{ stroke: chartTheme.axis.stroke }} tickLine={{ stroke: chartTheme.axis.stroke }} />
                <YAxis tick={{ fill: chartTheme.axis.fill, fontSize: 12 }} axisLine={{ stroke: chartTheme.axis.stroke }} tickLine={{ stroke: chartTheme.axis.stroke }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b', opacity: 0.4 }} />
                <Bar dataKey="demand" name="Demand Score" fill="#0ea5e9" radius={[4, 4, 0, 0]}>
                  {data.topSkills.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarC>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Role Distribution Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-saas-900 border border-saas-800 rounded-xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-accent/10 rounded-lg text-accent-light text-accent">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Role Distribution</h3>
          </div>
          
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.roleDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Salary Trend Line Chart */}
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
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.salaryTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid.stroke} />
                <XAxis dataKey="year" tick={{ fill: chartTheme.axis.fill, fontSize: 12 }} axisLine={{ stroke: chartTheme.axis.stroke }} tickLine={{ stroke: chartTheme.axis.stroke }} />
                <YAxis tickFormatter={(val) => `$${val/1000}k`} tick={{ fill: chartTheme.axis.fill, fontSize: 12 }} axisLine={{ stroke: chartTheme.axis.stroke }} tickLine={{ stroke: chartTheme.axis.stroke }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="average" name="Average Salary" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6, fill: "#059669", stroke: "#fff", strokeWidth: 2 }} dot={{ fill: "#10b981", strokeWidth: 0, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
