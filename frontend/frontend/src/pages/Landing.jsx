import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  BarChart3, 
  Map, 
  ArrowRight, 
  Mail, 
  ShieldCheck, 
  Target, 
  Cpu,
  Loader2,
  X,
  CheckCircle2
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../auth/useAuth.jsx';

export function Landing() {
  const auth = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email'); // email, otp
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    const res = await auth.loginWithGoogleCredential(credentialResponse.credential);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return;
    setError('');
    setLoading(true);
    const res = await auth.sendLoginOtp(email);
    setLoading(false);
    if (res.ok) {
      setStep('otp');
    } else {
      setError(res.error);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return;
    setError('');
    setLoading(true);
    const res = await auth.verifyLoginOtp(email, otp);
    setLoading(false);
    if (res.ok) {
      setSuccess('Verified! Logging you in...');
      setTimeout(() => {
        setShowLoginModal(false);
      }, 500);
    } else {
      setError(res.error);
    }
  };

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI Skill Extraction",
      description: "Upload your resume and let our advanced NLP extract every hidden talent and competency automatically."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Market Intelligence",
      description: "Get real-time insights into which skills are trending in the job market and where the highest salaries are."
    },
    {
      icon: <Map className="w-6 h-6" />,
      title: "Career Roadmap",
      description: "Visualize your path to your dream role with step-by-step skill acquisition plans tailored to your gaps."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Smart Recommendations",
      description: "Discover job roles that perfectly match your current skills, with a precision-based matching score."
    }
  ];

  return (
    <div className="min-h-screen bg-saas-950 text-white selection:bg-primary/30 overflow-x-hidden font-sans">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-accent/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-saas-400">
            Elevate AI
          </span>
        </div>
        <button 
          onClick={() => setShowLoginModal(true)}
          className="px-6 py-2.5 rounded-xl bg-saas-900 border border-saas-800 font-bold hover:bg-saas-800 transition-all active:scale-95"
        >
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-20 pb-32 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-sm font-bold mb-8">
            <Sparkles className="w-4 h-4" />
            <span>The Future of Career Growth is Here</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight mb-8">
            Unlock Your Potential with <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-accent-light">
              AI-Driven Career Intelligence
            </span>
          </h1>
          <p className="text-saas-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
            Stop guessing your next career move. Elevate AI analyzes your skills, tracks the market, and maps your journey to the top.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => setShowLoginModal(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-primary-light transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-saas-900 border border-saas-800 text-white font-bold text-lg hover:bg-saas-800 transition-all">
              Watch Demo
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto border-t border-saas-800/50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-8 rounded-3xl border border-saas-800 bg-saas-900/40 hover:bg-saas-900/60 transition-colors group"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary-light mb-6 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-saas-400 leading-relaxed font-medium">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-saas-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-saas-900 border border-saas-800 rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                <button 
                  onClick={() => setShowLoginModal(false)}
                  className="p-2 rounded-lg hover:bg-saas-800 text-saas-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary-light mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Welcome to Elevate AI</h2>
                <p className="text-saas-400">Join thousands of professionals growing their careers.</p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {success}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-center">
                  <GoogleLogin 
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Google Sign-In failed')}
                    theme="filled_black"
                    shape="pill"
                    width="100%"
                  />
                </div>

                <div className="flex items-center gap-4 my-6">
                  <div className="h-px bg-saas-800 flex-1" />
                  <span className="text-xs font-bold text-saas-500 uppercase tracking-widest">Or continue with email</span>
                  <div className="h-px bg-saas-800 flex-1" />
                </div>

                {step === 'email' ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-saas-500" />
                      <input 
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full bg-saas-950 border border-saas-800 rounded-xl py-3.5 pl-12 pr-4 focus:border-primary outline-none transition-all"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-xl bg-white text-saas-950 font-bold hover:bg-saas-200 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Magic Code'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-saas-500" />
                      <input 
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit code"
                        className="w-full bg-saas-950 border border-saas-800 rounded-xl py-3.5 pl-12 pr-4 focus:border-primary outline-none transition-all tracking-[0.5em] text-center font-bold"
                        maxLength={6}
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-light transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Sign In'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setStep('email')}
                      className="w-full text-sm font-medium text-saas-500 hover:text-white transition-colors"
                    >
                      Change email
                    </button>
                  </form>
                )}
              </div>

              <p className="mt-8 text-center text-xs text-saas-500 font-medium">
                By signing in, you agree to our <span className="text-saas-400 underline underline-offset-4 cursor-pointer hover:text-white transition-colors">Terms of Service</span> and <span className="text-saas-400 underline underline-offset-4 cursor-pointer hover:text-white transition-colors">Privacy Policy</span>.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}