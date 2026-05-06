import React, { useState } from 'react';
import { recommendJobs } from '../../services/api';
import { Briefcase, ChevronRight, Loader2, Sparkles, Map } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
export function Recommendations({ email, skills, onGenerateRoadmap }) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [userCategory, setUserCategory] = useState('');
  const [stats, setStats] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [lastProcessedSkills, setLastProcessedSkills] = useState('');
  React.useEffect(() => {
    const skillsKey = JSON.stringify(skills);
    if (skills?.length > 0 && !loading && !hasGenerated && skillsKey !== lastProcessedSkills) {
      handleGenerate();
      setLastProcessedSkills(skillsKey);
    }
  }, [skills, hasGenerated, loading, lastProcessedSkills]);
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await recommendJobs(email, skills);
      const data = response.data || {};
      const apiRecs = data.recommendations || [];
      const mapped = apiRecs.map((job) => ({
        role: job.role,
        match: job.match ?? job.match_score_percent ?? 0,
        baseMatch: job.base_match ?? job.match,
        skillOverlap: job.skill_overlap ?? 0,
        categoryMatch: job.category_match ?? false,
        jobCategory: job.job_category ?? 'General',
        matchedSkills: job.matchedSkills || [],
        missingSkills: job.missingSkills || job.missing_skills || [],
        totalSkillsRequired: job.total_skills_required ?? 0,
        skillsYouHave: job.skills_you_have ?? 0,
      }));
      setRecommendations(mapped);
      setSkillSuggestions(data.skillSuggestions || []);
      setUserCategory(data.category || 'General');
      setStats(data.stats || {});
      setHasGenerated(true);
    } catch (err) {
      console.error(err);
      alert('Failed to generate recommendations. Please try again.');
    }
    setLoading(false);
  };
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } }
  };
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">AI Job Recommendations</h2>
          <p className="text-saas-400 text-sm">Discover roles that match your skill profile perfectly.</p>
          {userCategory && (
            <div className="flex items-center gap-2 mt-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">Your Field: {userCategory}</span>
            </div>
          )}
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className={cn(
            "px-6 py-2.5 rounded-lg font-medium text-white transition-all shadow-lg flex items-center justify-center min-w-[200px]",
            loading 
              ? "bg-primary/50 cursor-not-allowed" 
              : "bg-primary hover:bg-primary-light hover:-translate-y-0.5 hover:shadow-primary/25 active:translate-y-0"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Profile...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Matches
            </>
          )}
        </button>
      </div>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-saas-900 border border-saas-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary-light">{stats.totalSkills || 0}</div>
            <div className="text-xs text-saas-400 uppercase tracking-wide">Total Skills</div>
          </div>
          <div className="bg-saas-900 border border-saas-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{Math.round(stats.bestMatchPercentage || 0)}%</div>
            <div className="text-xs text-saas-400 uppercase tracking-wide">Best Match</div>
          </div>
          <div className="bg-saas-900 border border-saas-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-accent-light">{stats.categoryBasedRecommendations || 0}</div>
            <div className="text-xs text-saas-400 uppercase tracking-wide">Field Matches</div>
          </div>
          <div className="bg-saas-900 border border-saas-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">{stats.skillGapCount || 0}</div>
            <div className="text-xs text-saas-400 uppercase tracking-wide">Skills to Learn</div>
          </div>
        </div>
      )}
      {!hasGenerated && !loading && (
        <div className="bg-saas-900 border border-saas-800 rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-saas-800 flex items-center justify-center mb-4 text-saas-400">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No recommendations yet</h3>
          <p className="text-saas-400 max-w-sm">
            Click the button above to analyze your skill profile and find your best career matches.
          </p>
        </div>
      )}
      {hasGenerated && recommendations.length > 0 && (
        <>
          {}
          {skillSuggestions.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Skills to Boost Your Career
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {skillSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="bg-saas-900 border border-saas-800 rounded-xl p-4 hover:border-saas-600 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white text-sm">{suggestion.category}</h4>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        suggestion.priority === 'high' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                      )}>
                        {suggestion.priority}
                      </span>
                    </div>
                    <p className="text-saas-400 text-xs mb-3">{suggestion.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {suggestion.skills.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-2 py-1 bg-saas-800 text-saas-300 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {}
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {recommendations.map((job, index) => (
              <motion.div
                key={index}
                variants={item}
                className="bg-saas-900 border border-saas-800 hover:border-saas-600 rounded-xl p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5 group relative overflow-hidden flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-saas-800 border border-saas-700 flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5 text-saas-300 group-hover:text-primary-light transition-colors" />
                    </div>
                    {job.categoryMatch && (
                      <div className="px-2 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                        <Sparkles className="w-3 h-3 text-yellow-400" />
                      </div>
                    )}
                  </div>
                  <div className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-bold border",
                    job.match >= 90 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    job.match >= 80 ? "bg-primary/10 text-primary-light border-primary/20" :
                    "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  )}>
                    {job.match}% Match
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-1 relative z-10">{job.role}</h3>
                <div className="mb-2 relative z-10">
                  <span className="text-xs text-saas-500 uppercase tracking-wide">{job.jobCategory}</span>
                  {job.categoryMatch && (
                    <span className="ml-2 text-xs text-yellow-400 font-medium">• Field Match</span>
                  )}
                </div>
                {}
                <div className="mb-3 relative z-10">
                  <div className="flex justify-between text-xs text-saas-400 mb-1">
                    <span>Skills Match</span>
                    <span>{job.skillsYouHave}/{job.totalSkillsRequired}</span>
                  </div>
                  <div className="w-full bg-saas-800 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(job.skillsYouHave / job.totalSkillsRequired) * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 mb-6 flex-1 relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Skills You Have</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {job.matchedSkills?.length > 0 ? (
                        job.matchedSkills.map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[11px] border border-emerald-500/20">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-saas-500 text-xs italic">None yet</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-3 h-3 text-amber-400" />
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Skills You Lack</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {job.missingSkills?.length > 0 ? (
                        job.missingSkills.map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[11px] border border-amber-500/20">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-emerald-400 text-xs italic">All skills matched!</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-4 relative z-10 mt-auto">
                  <button
                    onClick={() => onGenerateRoadmap(job.role)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-saas-800 hover:bg-saas-700 text-white text-sm font-semibold transition-all border border-saas-700 group/btn shadow-lg hover:shadow-primary/10 active:scale-[0.98]"
                  >
                    <Map className="w-4 h-4 text-saas-400 group-hover/btn:text-white" />
                    Launch Career Roadmap
                    <ChevronRight className="w-4 h-4 text-saas-500 group-hover/btn:text-primary-light ml-auto" />
                  </button>
                </div>
                {}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}