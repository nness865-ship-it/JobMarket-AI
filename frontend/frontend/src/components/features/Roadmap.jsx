import React, { useState, useEffect } from 'react';
import { generateRoadmap } from '../../services/api';
import { Map, CheckCircle2, Circle, ArrowRight, Loader2, BookOpen, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export function Roadmap({ role, email }) {
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState(null);
  const [expandedStep, setExpandedStep] = useState(0);

  useEffect(() => {
    if (role && email) {
      handleGenerate(role, email);
    } else {
      setLoading(false);
    }
  }, [role, email]);

  const handleGenerate = async (selectedRole, userEmail) => {
    setLoading(true);
    try {
      const response = await generateRoadmap(userEmail, selectedRole);
      setRoadmap(response.data?.roadmap);
    } catch (err) {
      console.error(err);
      alert("Failed to generate roadmap. Please try again.");
    }
    setLoading(false);
  };

  if (!role && !loading && !roadmap) {
    return (
      <div className="w-full max-w-3xl mx-auto bg-saas-900 border border-saas-800 rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 rounded-full bg-saas-800 flex items-center justify-center mb-4 text-saas-400">
          <Map className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Select a Role</h3>
        <p className="text-saas-400 max-w-sm">
          Go to the Recommendations tab and click "Generate Roadmap" on a role to see your personalized learning path.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto bg-saas-900 border border-saas-800 rounded-xl p-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Generating personalized roadmap...</h3>
        <p className="text-saas-400 text-sm">Analyzing gap between your skills and {role} requirements.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Your Learning Roadmap</h2>
        <p className="text-saas-400 text-sm flex items-center gap-2">
          Target Role: <span className="font-semibold text-primary-light">{roadmap?.role}</span>
        </p>
      </div>

      <div className="relative pl-4 md:pl-0">
        {/* Timeline Line */}
        <div className="absolute left-[23px] md:left-8 top-6 bottom-6 w-0.5 bg-saas-800" />

        <div className="space-y-6">
          {roadmap?.steps.map((step, index) => {
            const isExpanded = expandedStep === index;
            
            return (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-start gap-4 md:gap-6 group"
              >
                {/* Timeline Node */}
                <div className="relative z-10 flex flex-col items-center justify-start pt-1 md:pl-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-4 border-saas-950 bg-saas-900 shadow-sm transition-colors",
                    step.completed ? "text-emerald-400 shadow-emerald-500/20" : "text-saas-400 group-hover:border-saas-800 group-hover:text-primary-light"
                  )}>
                    {step.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-3 h-3 fill-current" />}
                  </div>
                </div>

                {/* Content Card */}
                <div 
                  className={cn(
                    "flex-1 bg-saas-900 border rounded-xl overflow-hidden transition-all duration-200",
                    isExpanded ? "border-saas-600 shadow-lg shadow-black/20" : "border-saas-800 hover:border-saas-700 hover:bg-saas-800/20 cursor-pointer"
                  )}
                  onClick={() => setExpandedStep(isExpanded ? -1 : index)}
                >
                  <div className="p-5 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-saas-500">Step {index + 1}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-saas-800 text-saas-300">
                          {step.duration}
                        </span>
                      </div>
                      <h3 className={cn(
                        "text-lg font-bold transition-colors",
                        isExpanded ? "text-white" : "text-saas-100"
                      )}>
                        {step.title}
                      </h3>
                    </div>
                    
                    <button className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center bg-saas-800 text-saas-400 transition-transform duration-200",
                      isExpanded ? "rotate-90 text-primary-light bg-primary/10" : ""
                    )}>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-saas-800 bg-saas-950/30"
                      >
                        <div className="p-5 space-y-4">
                          <p className="text-saas-300 text-sm leading-relaxed">
                            {step.description}
                          </p>
                          
                          <div>
                            <h4 className="text-xs font-semibold text-saas-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <BookOpen className="w-3.5 h-3.5" />
                              Key Skills to Learn
                            </h4>
                            <ul className="space-y-2">
                              {step.skills.map((skill, sIdx) => (
                                <li key={sIdx} className="flex items-center gap-2 text-sm text-saas-100">
                                  <ArrowRight className="w-3 h-3 text-primary" />
                                  {skill}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="pt-2">
                            <button className="text-sm font-medium text-primary hover:text-primary-light transition-colors">
                              Find learning resources &rarr;
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
