import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Calendar, 
  CheckCircle2, 
  Trophy, 
  Target, 
  Clock, 
  Sparkles,
  BookOpen,
  BarChart3,
  MapPin,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { getSkillTracker } from '../../services/api';
import { useAuth } from '../../auth/useAuth';
const STORAGE_KEY = 'roadmap_progress';
const SKILL_TRACKER_KEY = 'skill_tracker_data';
function loadAllProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { 
    return {}; 
  }
}
function loadSkillTrackerData() {
  try {
    return JSON.parse(localStorage.getItem(SKILL_TRACKER_KEY) || '{}');
  } catch { 
    return {}; 
  }
}
function loadRoadmapData() {
  try {
    return JSON.parse(localStorage.getItem('generated_roadmaps') || '{}');
  } catch { 
    return {}; 
  }
}
export function SkillTracker() {
  const auth = useAuth();
  const [allProgress, setAllProgress] = useState({});
  const [skillTrackerData, setSkillTrackerData] = useState({});
  const [activeRoadmaps, setActiveRoadmaps] = useState({});
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [viewMode, setViewMode] = useState('timeline');
  const [loading, setLoading] = useState(true);
  const fetchData = async () => {
    if (!auth.user?.email) {
      setLoading(false);
      return;
    }
    try {
      const response = await getSkillTracker(auth.user.email);
      const { progress, tracker_data, active_roadmaps } = response.data;
      setAllProgress(progress || {});
      setSkillTrackerData(tracker_data || {});
      setActiveRoadmaps(active_roadmaps || {});
    } catch (err) {
      console.error('Failed to fetch skill tracker data:', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [auth.user?.email]);
  const getCompletedSkills = () => {
    const completed = [];
    Object.values(skillTrackerData).forEach(entry => {
      entry.skills.forEach(skill => {
        const existing = completed.find(c => c.skill === skill);
        if (existing) {
          existing.count += 1;
          existing.lastCompleted = new Date(entry.completedDate) > new Date(existing.lastCompleted) 
            ? entry.completedDate 
            : existing.lastCompleted;
        } else {
          completed.push({
            skill,
            count: 1,
            firstCompleted: entry.completedDate,
            lastCompleted: entry.completedDate,
            role: entry.role,
            stepTitle: entry.stepTitle
          });
        }
      });
    });
    return completed.sort((a, b) => new Date(b.lastCompleted) - new Date(a.lastCompleted));
  };
  const getCompletionTimeline = () => {
    return Object.values(skillTrackerData)
      .sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate))
      .filter(entry => {
        if (selectedRole !== 'all' && entry.role !== selectedRole) return false;
        if (selectedTimeframe !== 'all') {
          const completedDate = new Date(entry.completedDate);
          const now = new Date();
          const daysDiff = (now - completedDate) / (1000 * 60 * 60 * 24);
          if (selectedTimeframe === 'week' && daysDiff > 7) return false;
          if (selectedTimeframe === 'month' && daysDiff > 30) return false;
          if (selectedTimeframe === 'quarter' && daysDiff > 90) return false;
        }
        return true;
      });
  };
  const getStats = () => {
    const timeline = getCompletionTimeline();
    const skills = getCompletedSkills();
    const roles = [...new Set(Object.values(skillTrackerData).map(entry => entry.role))];
    return {
      totalSteps: timeline.length,
      totalSkills: skills.length,
      totalRoles: roles.length
    };
  };
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    const now = new Date();
    const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (daysDiff === 0) return 'Today';
    if (daysDiff === 1) return 'Yesterday';
    if (daysDiff < 7) return `${daysDiff} days ago`;
    if (daysDiff < 30) return `${Math.floor(daysDiff / 7)} weeks ago`;
    return date.toLocaleDateString();
  };
  const stats = getStats();
  const completedSkills = getCompletedSkills();
  const timeline = getCompletionTimeline();
  const availableRoles = ['all', ...new Set([
    ...Object.keys(activeRoadmaps),
    ...Object.keys(allProgress),
    ...Object.values(skillTrackerData).map(entry => entry.role)
  ])];
  if (loading) {
    return (
      <div className="w-full h-[600px] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <h3 className="mt-8 text-xl font-black text-white tracking-tight">Syncing Your Progress...</h3>
      </div>
    );
  }
  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-20">
      {}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              Live Tracking
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2">Skill Tracker</h2>
          <p className="text-slate-400 text-lg max-w-xl">Monitor your learning progress and celebrate every milestone achieved.</p>
        </div>
        {}
        <div className="flex gap-2 p-1 bg-slate-900/40 rounded-2xl border border-white/5">
          {[
            { id: 'timeline', label: 'Timeline', icon: Clock },
            { id: 'skills', label: 'Skills', icon: Sparkles },
            { id: 'stats', label: 'Stats', icon: BarChart3 }
          ].map(mode => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all text-sm",
                  viewMode === mode.id 
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <Icon className="w-4 h-4" />
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>
      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 text-center">
          <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-black text-white">{stats.totalSteps}</div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Steps Done</div>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 text-center">
          <Sparkles className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-black text-white">{stats.totalSkills}</div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Skills Learned</div>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 text-center">
          <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-black text-white">{stats.totalRoles}</div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Roles Active</div>
        </div>
      </div>
      {}
      <div className="p-8 rounded-2xl bg-slate-900/40 border border-white/5">
        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
          <Calendar className="w-6 h-6 text-emerald-400" />
          Monthly Progress Calendar
        </h3>
        <div className="grid grid-cols-7 gap-2 text-center">
          {}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              {day}
            </div>
          ))}
          {}
          {Array.from({ length: 35 }, (_, i) => {
            const dayNumber = i - 6; 
            const isCurrentMonth = dayNumber > 0 && dayNumber <= 31;
            const today = new Date();
            const isToday = isCurrentMonth && dayNumber === today.getDate();
            const dayCompletions = Object.values(skillTrackerData).filter(entry => {
              const completedDate = new Date(entry.completedDate);
              return completedDate.getDate() === dayNumber && 
                     completedDate.getMonth() === today.getMonth() &&
                     completedDate.getFullYear() === today.getFullYear();
            });
            return (
              <div
                key={i}
                className={cn(
                  "aspect-square p-2 rounded-lg text-sm font-bold transition-all relative",
                  isCurrentMonth 
                    ? dayCompletions.length > 0
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : isToday
                        ? "bg-white/10 text-white border border-white/20"
                        : "text-slate-400 hover:bg-white/5"
                    : "text-slate-700"
                )}
              >
                {isCurrentMonth && dayNumber}
                {dayCompletions.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full text-[8px] flex items-center justify-center text-white font-black">
                    {dayCompletions.length}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500/20 border border-emerald-500/30 rounded"></div>
            <span>Milestones Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white/10 border border-white/20 rounded"></div>
            <span>Today</span>
          </div>
        </div>
      </div>
      {}
      <AnimatePresence mode="wait">
        {viewMode === 'timeline' && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-black text-white flex items-center gap-3">
              <Clock className="w-6 h-6 text-emerald-400" />
              Completion Timeline
            </h3>
            {timeline.length === 0 ? (
              <div className="text-center p-12 text-slate-400">
                <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No completed steps found. Start learning to see your progress here!</p>
                <p className="text-sm mt-2">Complete roadmap steps to automatically track your progress.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {timeline.map((entry, index) => (
                  <motion.div
                    key={`${entry.role}-${entry.stepId}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-emerald-500/20 transition-colors group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                              {entry.role}
                            </span>
                            <span className="text-slate-500 text-sm">{formatDate(entry.completedDate)}</span>
                          </div>
                          <span className="text-xs text-slate-500">{entry.duration}</span>
                        </div>
                        <h4 className="text-lg font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors">
                          {entry.stepTitle}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {entry.skills.map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-slate-300"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
        {viewMode === 'skills' && (
          <motion.div
            key="skills"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-black text-white flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-blue-400" />
              Skills Mastered
            </h3>
            {completedSkills.length === 0 ? (
              <div className="text-center p-12 text-slate-400">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No skills completed yet. Complete roadmap steps to track your skill development!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedSkills.map((skillData, index) => (
                  <motion.div
                    key={skillData.skill}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-blue-500/20 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold">
                        {skillData.count}x
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                      {skillData.skill}
                    </h4>
                    <div className="space-y-2 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span>{skillData.role}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>Last: {formatDate(skillData.lastCompleted)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
        {viewMode === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <h3 className="text-2xl font-black text-white flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              Learning Analytics
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              {}
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-white/5">
                <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  Progress by Role
                </h4>
                <div className="space-y-4">
                  {Object.keys(activeRoadmaps).length === 0 ? (
                    <div className="text-center text-slate-500 py-8">
                      <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No roadmaps generated yet</p>
                      <p className="text-xs">Generate a roadmap to start tracking progress</p>
                    </div>
                  ) : (
                    Object.keys(activeRoadmaps).map(role => {
                      const roleRoadmap = activeRoadmaps[role];
                      const totalSteps = roleRoadmap?.steps?.length || 0;
                      const completedSteps = allProgress[role]?.length || 0;
                      const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
                      return (
                        <div key={role} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-white">{role.replace(/_/g, '.')}</span>
                            <span className="text-xs text-slate-400">{completedSteps}/{totalSteps}</span>
                          </div>
                          <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                              transition={{ duration: 1, delay: 0.2 }}
                            />
                          </div>
                          <div className="text-xs text-purple-400 font-bold">{percentage}% Complete</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              {}
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-white/5">
                <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  Recent Activity
                </h4>
                <div className="space-y-4">
                  {timeline.slice(0, 5).map((entry, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{entry.stepTitle}</div>
                        <div className="text-xs text-slate-400">{formatDate(entry.completedDate)}</div>
                      </div>
                    </div>
                  ))}
                  {timeline.length === 0 && (
                    <div className="text-center text-slate-500 py-8">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}