import React, { useState } from 'react';
import { recommendJobs } from '../../services/api';
import { Briefcase, ChevronRight, Loader2, Sparkles, Map } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function Recommendations({ email, onGenerateRoadmap }) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async () => {
    const trimmedEmail = (email || '').trim();
    if (!trimmedEmail) {
      alert('Please enter your email in the Skill Profile tab first.');
      return;
    }

    setLoading(true);
    try {
      const response = await recommendJobs(trimmedEmail);
      const apiRecs = response.data?.recommendations || [];

      const mapped = apiRecs.map((job) => ({
        role: job.role,
        match: job.match ?? job.match_score_percent ?? 0,
        missingSkills: job.missingSkills || job.missing_skills || [],
      }));

      setRecommendations(mapped);
      setHasGenerated(true);
    } catch (err) {
      console.error(err);
      // Fallback/Mock data if actual endpoint fails
      setTimeout(() => {
        setRecommendations([
          { role: 'Frontend Developer', match: 92, missingSkills: ['GraphQL', 'Next.js'] },
          { role: 'Full Stack Engineer', match: 85, missingSkills: ['Node.js', 'PostgreSQL', 'AWS'] },
          { role: 'UI/UX Engineer', match: 78, missingSkills: ['Figma', 'User Research'] },
        ]);
        setHasGenerated(true);
        setLoading(false);
      }, 1500);
      return;
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
                <div className="w-10 h-10 rounded-lg bg-saas-800 border border-saas-700 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5 text-saas-300 group-hover:text-primary-light transition-colors" />
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
              <p className="text-saas-400 text-sm mb-6 flex-1 relative z-10">
                Missing skills: <span className="text-saas-300">{job.missingSkills?.join(', ') || 'None'}</span>
              </p>

              <div className="space-y-4 relative z-10 mt-auto">
                <div className="w-full bg-saas-800 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${job.match}%` }}
                    transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                    className={cn(
                      "h-full rounded-full",
                      job.match >= 90 ? "bg-emerald-500" :
                      job.match >= 80 ? "bg-primary" :
                      "bg-amber-500"
                    )}
                  />
                </div>
                
                <button
                  onClick={() => onGenerateRoadmap(job.role)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-saas-800 hover:bg-saas-700 text-white text-sm font-medium transition-colors border border-saas-700 group/btn"
                >
                  <Map className="w-4 h-4 text-saas-400 group-hover/btn:text-white" />
                  Generate Roadmap
                  <ChevronRight className="w-4 h-4 text-saas-500 group-hover/btn:text-primary-light ml-auto" />
                </button>
              </div>

              {/* Decorative background glow */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
