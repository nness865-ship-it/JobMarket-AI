import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  Globe,
  Zap,
  MousePointer2,
  Lock,
  Rocket,
  Stars,
  Orbit,
  Satellite
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../auth/useAuth.jsx';
export function Landing() {
  const auth = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    const res = await auth.loginWithGoogleCredential(credentialResponse.credential);
    setLoading(false);
    if (!res.ok) setError(res.error);
  };
  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    const res = await auth.loginWithDemo();
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
    } else {
      setSuccess('Access granted! Entering workspace...');
      setTimeout(() => setShowLoginModal(false), 500);
    }
  };
  const openLoginModal = () => {
    setShowLoginModal(true);
    setEmail('');
    setOtp('');
    setStep('email');
    setError('');
    setSuccess('');
    setLoading(false);
  };
  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI Skill Intelligence",
      description: "Proprietary NLP engine extracts deep-level competencies from your resume with 99.9% accuracy.",
      color: "text-primary-light",
      bg: "bg-primary/10"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Market Synced",
      description: "Real-time integration with global job boards to track emerging tech trends and salary benchmarks.",
      color: "text-accent-light",
      bg: "bg-accent/10"
    },
    {
      icon: <Map className="w-6 h-6" />,
      title: "Precision Roadmaps",
      description: "Generative AI creates hyper-personalized learning paths to bridge your specific technical gaps.",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Career Strategy",
      description: "Identify your next 3 optimal career moves based on trajectory data and historical success patterns.",
      color: "text-amber-400",
      bg: "bg-amber-400/10"
    }
  ];
  return (
    <div className="min-h-screen bg-black text-slate-50 selection:bg-blue-500/30 overflow-x-hidden font-sans relative">
      {}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {}
        <div 
          className="absolute inset-0 opacity-60"
          style={{
            background: `
              radial-gradient(ellipse at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 40% 80%, rgba(120, 219, 255, 0.3) 0%, transparent 50%),
              linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)
            `,
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        />
        {}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
        {}
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 border border-blue-500/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-24 h-24 border border-purple-500/20 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        {}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/3 left-1/2 w-96 h-96 bg-gradient-radial from-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/2 w-80 h-80 bg-gradient-radial from-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </div>
      {}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-blue-500/20 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 via-purple-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-blue-500/30 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: [-100, 100] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <Rocket className="w-6 h-6 text-white relative z-10" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Elevate <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">AI</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-blue-400 transition-colors relative group">
              Features
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#intelligence" className="hover:text-purple-400 transition-colors relative group">
              Intelligence
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#enterprise" className="hover:text-cyan-400 transition-colors relative group">
              Enterprise
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300" />
            </a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={openLoginModal}
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Log in
            </button>
            <button 
              onClick={openLoginModal}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold hover:from-blue-600 hover:to-purple-600 transition-all active:scale-95 shadow-lg shadow-blue-500/25 relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: [-100, 100] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <span className="relative z-10">Launch Journey</span>
            </button>
          </div>
        </div>
      </nav>
      {}
      <main className="relative z-10 pt-44 pb-32">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-6 tracking-wide uppercase">
              <Zap className="w-3 h-3" />
              <span>v2.0 Career Intelligence Engine</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-8">
              <span className="text-white">FILL THE </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 animate-pulse">
                SPACE
              </span>
              <br />
              <span className="text-white">BY LEVELLING UP</span>
              <br />
              <span className="text-slate-400">YOUR SKILLS</span>
            </h1>
            <p className="text-slate-300 text-xl max-w-xl mb-12 leading-relaxed font-medium">
              Transform your career with data-driven insights. Our advanced AI platform analyzes your skills, experience, and market trends to create personalized career pathways and strategic growth opportunities.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button 
                onClick={openLoginModal}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 group relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: [-100, 100] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <span className="relative z-10">Sign In</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
              </button>
              <button 
                onClick={handleDemoLogin}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/50 border border-blue-500/30 text-blue-300 font-bold text-lg hover:bg-slate-800/50 hover:text-white transition-all flex items-center justify-center gap-3 group backdrop-blur-sm"
              >
                <MousePointer2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Continue as Guest
              </button>
            </div>
            <div className="mt-12 flex items-center gap-6 opacity-60 hover:opacity-100 transition-opacity">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Trusted by builders at</span>
              <div className="flex gap-4">
                {}
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30" />
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-[100px] -z-10 animate-pulse" />
            <div className="bg-slate-900/30 border border-blue-500/20 rounded-[2.5rem] p-4 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
              {}
              <motion.div
                className="absolute inset-0 rounded-[2.5rem] border-2 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-border"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{ mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude' }}
              />
              <div className="rounded-[2rem] overflow-hidden border border-blue-500/10 aspect-square relative">
                <img 
                  src="https:
                  alt="AI Intelligence Visual" 
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                {}
                <motion.div 
                  className="absolute top-8 left-8 right-8 p-6 rounded-2xl bg-black/40 border border-blue-500/30 backdrop-blur-2xl"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <Rocket className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-bold text-white">Optimization Complete</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">+12.4% Match</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: '92%' }}
                      transition={{ duration: 2, delay: 1 }}
                    />
                  </div>
                </motion.div>
                {}
                <motion.div
                  className="absolute bottom-8 right-8 w-16 h-16 border-2 border-cyan-500/50 rounded-full flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                  <Satellite className="w-6 h-6 text-cyan-400" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      {}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-6 tracking-wide uppercase"
          >
            <Orbit className="w-3 h-3" />
            <span>Quantum-Powered Features</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Cosmic Success</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Harness the power of advanced AI algorithms and quantum career modeling to navigate your professional universe with unprecedented precision.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 rounded-[2rem] border border-blue-500/10 bg-slate-900/20 hover:bg-slate-900/40 hover:border-blue-500/30 transition-all backdrop-blur-sm relative overflow-hidden"
            >
              {}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"
                animate={{ 
                  background: [
                    "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)",
                    "linear-gradient(135deg, rgba(147, 51, 234, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)",
                    "linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <div className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center ${f.color} mb-8 group-hover:scale-110 transition-transform shadow-xl relative z-10 border border-current/20`}>
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-4 text-white relative z-10">{f.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm font-medium relative z-10">
                {f.description}
              </p>
              {}
              <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400/30 rounded-full animate-ping" />
              <div className="absolute bottom-6 left-6 w-1 h-1 bg-purple-400/40 rounded-full animate-pulse" />
            </motion.div>
          ))}
        </div>
      </section>
      {}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-900/90 border border-blue-500/30 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-xl overflow-hidden"
            >
              {}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 animate-pulse" />
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-6 right-6 p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-center mb-10 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/30 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{ x: [-100, 100] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <Rocket className="w-8 h-8 text-blue-400 relative z-10" />
                </div>
                <h2 className="text-3xl font-bold mb-3 tracking-tight text-white">Sign In</h2>
                <p className="text-slate-400">Access your account to continue your career journey.</p>
              </div>
              {error && (
                <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-3">
                  <X className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {success}
                </div>
              )}
              <div className="space-y-6 relative z-10">
                <div className="flex justify-center">
                  <GoogleLogin 
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Authentication failed')}
                    theme="filled_black"
                    shape="pill"
                    width="100%"
                  />
                </div>
                <button 
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300 font-bold hover:from-blue-500/30 hover:to-purple-500/30 transition-all flex items-center justify-center gap-3 backdrop-blur-sm"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      <MousePointer2 className="w-5 h-5" />
                      Login
                    </>
                  )}
                </button>
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-blue-500/20"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-widest text-slate-500">
                    <span className="bg-slate-900 px-4">OR SIGN IN WITH EMAIL</span>
                  </div>
                </div>
                <form className="space-y-4" onSubmit={async (e) => {
                  e.preventDefault();
                  if (step === 'email') {
                    setLoading(true);
                    setError('');
                    const res = await auth.sendLoginOtp(email);
                    setLoading(false);
                    if (res.ok) {
                      setStep('otp');
                      setSuccess('OTP sent to your email. Please check your inbox.');
                    } else {
                      setError(res.error);
                    }
                  } else if (step === 'otp') {
                    setLoading(true);
                    setError('');
                    const res = await auth.verifyLoginOtp(email, otp);
                    setLoading(false);
                    if (res.ok) {
                      setSuccess('Successfully signed in!');
                      setTimeout(() => setShowLoginModal(false), 1000);
                    } else {
                      setError(res.error);
                    }
                  }
                }}>
                  {step === 'email' ? (
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input 
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="w-full bg-slate-950/50 border border-blue-500/30 rounded-xl py-4 pl-12 pr-4 focus:border-blue-400 outline-none transition-all placeholder:text-slate-600 text-white backdrop-blur-sm"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-sm text-slate-400 mb-4">
                          Enter the 6-digit code sent to <span className="text-white font-medium">{email}</span>
                        </p>
                        <button 
                          type="button"
                          onClick={() => setStep('email')}
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          Change email address
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input 
                          type="text"
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="Enter 6-digit code"
                          className="w-full bg-slate-950/50 border border-blue-500/30 rounded-xl py-4 pl-12 pr-4 focus:border-blue-400 outline-none transition-all placeholder:text-slate-600 text-white backdrop-blur-sm text-center text-lg tracking-widest font-mono"
                          maxLength="6"
                        />
                      </div>
                    </div>
                  )}
                  <button 
                    type="submit"
                    disabled={loading || (step === 'email' && !email) || (step === 'otp' && otp.length !== 6)}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-black hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/25 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      <>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: [-100, 100] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                        <span className="relative z-10">
                          {step === 'email' ? 'Send Verification Code' : 'Verify & Sign In'}
                        </span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}