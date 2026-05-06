import React, { useState, useEffect } from 'react';
import { Target, ChevronRight, Briefcase, Award, TrendingUp, AlertCircle, Loader2, Code, ShieldCheck, Map, DollarSign, BrainCircuit } from 'lucide-react';
import { getPromotionPathway, getHighPayingJobs, me } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
export function CareerPathways({ email, userSkills, onGenerateRoadmap, onNavigateRecommendations }) {
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('user_current_role') || (userSkills.length > 0 ? 'Professional' : 'Software Engineer');
  });
  const [activeTab, setActiveTab] = useState('promotion'); 
  const [promotionData, setPromotionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({});
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await me();
        const user = response.data?.user;
        if (user) {
          setProfileData({
            current_job_role: user.current_job_role || '',
            job_domain: user.job_domain || '',
            position_level: user.position_level || '',
            current_salary: user.current_salary || 0
          });
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };
    loadProfile();
  }, []);
  const fetchPromotionData = async () => {
    setLoading(true);
    setError('');
    if (!profileData.current_job_role || !profileData.job_domain || !profileData.position_level) {
      setError('Please complete your professional profile first to get personalized career pathways.');
      setLoading(false);
      return;
    }
    try {
      const res = await getPromotionPathway(email, userSkills, currentRole, profileData);
      setPromotionData(res.data);
    } catch (err) {
      console.error('Promotion pathway error:', err);
      if (err.response?.status === 400) {
        setError('Please complete your professional profile first to get personalized career pathways.');
      } else {
        setError('Failed to load promotion pathway. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (Object.keys(profileData).length > 0 && !promotionData) {
      fetchPromotionData();
    }
  }, [profileData]);
  const handleRoleSubmit = (e) => {
    e.preventDefault();
    if (currentRole) {
      localStorage.setItem('user_current_role', currentRole);
    }
    fetchPromotionData();
  };
  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
      {}
      <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Target className="text-primary-light w-8 h-8" />
            Career Pathways
          </h2>
          <p className="text-slate-400 mt-2">
            {profileData.job_domain 
              ? `Strategize your promotion or discover higher-paying roles in ${profileData.job_domain}`
              : 'Strategize your promotion or discover higher-paying roles.'}
          </p>
        </div>
        <form onSubmit={handleRoleSubmit} className="flex w-full md:w-auto items-center gap-3 bg-slate-950 p-2 rounded-2xl border border-white/10">
          <Briefcase className="text-slate-500 w-5 h-5 ml-2" />
          <input 
            type="text" 
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value)}
            placeholder="Your Current Role..."
            className="bg-transparent border-none outline-none text-white w-full md:w-48 font-medium"
            required
          />
          <button type="submit" className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-xl font-bold transition-colors">
            Update
          </button>
        </form>
      </div>
      {}
      <div className="relative min-h-[400px]">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p>{error}</p>
              {error.includes('complete your professional profile') && (
                <p className="text-sm text-slate-400 mt-2">
                  Go to the Dashboard to fill in your Current Job Role, Job Domain, and Position Level.
                </p>
              )}
            </div>
          </div>
        )}
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="mt-4 text-slate-400 font-bold tracking-widest uppercase text-xs animate-pulse">Analyzing Trajectory...</p>
          </div>
        ) : (
          promotionData && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
                {}
                <div className="flex items-center justify-center p-8 bg-slate-900/30 rounded-3xl border border-white/5 gap-4 md:gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
                      <Briefcase className="w-8 h-8" />
                    </div>
                    <span className="font-bold text-slate-300">{currentRole}</span>
                  </div>
                  <ChevronRight className="w-8 h-8 text-slate-600" />
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white mx-auto mb-3 shadow-xl shadow-primary/20 border border-white/10 relative overflow-hidden">
                      <div className="absolute inset-0 bg-white/20 shimmer-effect" />
                      <Award className="w-10 h-10 relative z-10" />
                    </div>
                    <span className="text-xl font-black text-white">{promotionData.next_role}</span>
                  </div>
                </div>
                {}
                {promotionData.salary_progression && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 text-center">
                      <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Current Salary</p>
                      <p className="text-2xl font-black text-white">${promotionData.salary_progression.current?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 text-center">
                      <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Next Level</p>
                      <p className="text-2xl font-black text-emerald-400">${promotionData.salary_progression.next_level?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 text-center">
                      <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Senior Level</p>
                      <p className="text-2xl font-black text-blue-400">${promotionData.salary_progression.senior_level?.toLocaleString() || 'N/A'}</p>
                    </div>
                  </div>
                )}
                {}
                <div className="grid md:grid-cols-2 gap-6">
                  {}
                  <div className="bg-slate-900/40 p-8 rounded-3xl border border-white/5">
                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                      <BrainCircuit className="w-6 h-6 text-emerald-400" />
                      Skills to Work On
                    </h3>
                    <div className="space-y-6">
                      {Object.entries(promotionData.skills_to_work_on || {}).map(([category, skills]) => (
                        <div key={category}>
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">{category}</h4>
                          <div className="flex flex-wrap gap-2">
                            {skills.map((s, i) => (
                              <span key={i} className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-semibold border border-emerald-500/20">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {}
                  <div className="bg-slate-900/40 p-8 rounded-3xl border border-white/5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                        <Map className="w-6 h-6 text-accent-light" />
                        Promotion Strategy
                      </h3>
                      <div className="space-y-5">
                        <div className="bg-slate-950 p-4 rounded-2xl border border-white/5">
                          <strong className="text-slate-300 block mb-1">Apply in Job:</strong>
                          <p className="text-slate-500 text-sm">{promotionData.strategy?.apply_in_job}</p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl border border-white/5">
                          <strong className="text-slate-300 block mb-1">Show Results (KPIs):</strong>
                          <p className="text-slate-500 text-sm">{promotionData.strategy?.show_results}</p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl border border-white/5">
                          <strong className="text-slate-300 block mb-1">Positioning:</strong>
                          <p className="text-slate-500 text-sm">{promotionData.strategy?.position_for_promotion}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {}
                <div className="bg-slate-900/40 p-8 rounded-3xl border border-white/5">
                  <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                    <Code className="w-6 h-6 text-blue-400" />
                    5 Main Projects to Get Promoted
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {}
                    <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-colors group">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2">Lead a Cross-Functional Team</h4>
                      <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                        Spearhead a project involving multiple departments. Demonstrate leadership, communication, and project management skills.
                      </p>
                      <div className="mb-4">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2">Skills Gained</span>
                        <div className="flex flex-wrap gap-2">
                          {['Leadership', 'Project Management', 'Communication', 'Stakeholder Management'].map((s, i) => (
                            <span key={i} className="text-xs text-slate-300 bg-white/5 px-2 py-1 rounded-md">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/5">
                        <strong className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">Promotion Impact</strong>
                        <p className="text-sm text-slate-300">Shows readiness for management roles and ability to drive results across teams</p>
                      </div>
                    </div>
                    {}
                    <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors group">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2">Optimize Core Business Process</h4>
                      <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                        Identify inefficiencies and implement solutions that save time/money. Document measurable improvements.
                      </p>
                      <div className="mb-4">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2">Skills Gained</span>
                        <div className="flex flex-wrap gap-2">
                          {['Process Analysis', 'Data Analytics', 'Problem Solving', 'ROI Calculation'].map((s, i) => (
                            <span key={i} className="text-xs text-slate-300 bg-white/5 px-2 py-1 rounded-md">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/5">
                        <strong className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">Promotion Impact</strong>
                        <p className="text-sm text-slate-300">Demonstrates business acumen and ability to drive operational excellence</p>
                      </div>
                    </div>
                    {}
                    <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-colors group">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <BrainCircuit className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2">Drive Innovation Initiative</h4>
                      <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                        Introduce new technology, methodology, or product feature that creates competitive advantage.
                      </p>
                      <div className="mb-4">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2">Skills Gained</span>
                        <div className="flex flex-wrap gap-2">
                          {['Innovation', 'Technology Adoption', 'Strategic Thinking', 'Change Management'].map((s, i) => (
                            <span key={i} className="text-xs text-slate-300 bg-white/5 px-2 py-1 rounded-md">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/5">
                        <strong className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block mb-1">Promotion Impact</strong>
                        <p className="text-sm text-slate-300">Positions you as a forward-thinking leader who drives company growth</p>
                      </div>
                    </div>
                    {}
                    <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 hover:border-orange-500/30 transition-colors group">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2">Establish Mentorship Program</h4>
                      <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                        Create and lead a program to develop junior talent. Show investment in team growth and knowledge transfer.
                      </p>
                      <div className="mb-4">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2">Skills Gained</span>
                        <div className="flex flex-wrap gap-2">
                          {['Mentoring', 'Talent Development', 'Program Design', 'Knowledge Transfer'].map((s, i) => (
                            <span key={i} className="text-xs text-slate-300 bg-white/5 px-2 py-1 rounded-md">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/5">
                        <strong className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block mb-1">Promotion Impact</strong>
                        <p className="text-sm text-slate-300">Demonstrates leadership potential and commitment to organizational growth</p>
                      </div>
                    </div>
                    {}
                    <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 hover:border-green-500/30 transition-colors group">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2">Deliver Measurable Business Impact</h4>
                      <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                        Lead a project that directly increases revenue, reduces costs, or improves customer satisfaction with quantifiable results.
                      </p>
                      <div className="mb-4">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2">Skills Gained</span>
                        <div className="flex flex-wrap gap-2">
                          {['Business Analysis', 'Financial Modeling', 'KPI Tracking', 'Results Presentation'].map((s, i) => (
                            <span key={i} className="text-xs text-slate-300 bg-white/5 px-2 py-1 rounded-md">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/5">
                        <strong className="text-[10px] font-bold text-green-400 uppercase tracking-widest block mb-1">Promotion Impact</strong>
                        <p className="text-sm text-slate-300">Proves direct contribution to company success with concrete metrics</p>
                      </div>
                    </div>
                  </div>
                  {}
                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl border border-blue-500/20">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-blue-400" />
                      Pro Tips for Project Success
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-300">
                      <div className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>Document everything: Keep detailed records of challenges, solutions, and outcomes</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>Quantify impact: Use specific numbers, percentages, and metrics wherever possible</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>Get visibility: Present results to leadership and stakeholders regularly</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>Build relationships: Collaborate with key people who can advocate for your promotion</span>
                      </div>
                    </div>
                  </div>
                </div>
                {}
                {promotionData.projects && promotionData.projects.length > 0 && (
                  <div className="bg-slate-900/40 p-8 rounded-3xl border border-white/5">
                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                      <Code className="w-6 h-6 text-accent-light" />
                      Personalized Projects for Your Role
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {promotionData.projects?.map((proj, idx) => (
                        <div key={idx} className="bg-slate-950 p-6 rounded-2xl border border-white/5 hover:border-accent-light/30 transition-colors">
                          <h4 className="text-lg font-bold text-white mb-2">{proj.project}</h4>
                          <p className="text-slate-400 text-sm mb-4 leading-relaxed">{proj.objective}</p>
                          <div className="mb-4">
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2">Skills Gained</span>
                            <div className="flex flex-wrap gap-2">
                              {proj.skills_gained?.map((s, i) => (
                                <span key={i} className="text-xs text-slate-300 bg-white/5 px-2 py-1 rounded-md">{s}</span>
                              ))}
                            </div>
                          </div>
                          <div className="pt-4 border-t border-white/5">
                            <strong className="text-[10px] font-bold text-accent-light uppercase tracking-widest block mb-1">Promotion Impact</strong>
                            <p className="text-sm text-slate-300">{proj.promotion_impact}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {}
                <div className="flex justify-center pt-6">
                  <button 
                    onClick={() => onGenerateRoadmap(promotionData.next_role)}
                    className="bg-primary hover:bg-primary-light text-white px-8 py-4 rounded-2xl font-black text-lg shadow-lg shadow-primary/20 transition-all flex items-center gap-3 group"
                  >
                    <Map className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    Build Learning Roadmap for {promotionData.next_role}
                  </button>
                </div>
              </motion.div>
            )
        )}
      </div>
    </div>
  );
}