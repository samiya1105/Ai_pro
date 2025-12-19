import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, GraduationCap, Sparkles, Book, Atom, Orbit, Microscope, Brain, Globe, Pencil, Sun, Moon } from 'lucide-react';
import { authService } from '../../services/authService';
import { AuthUser } from '../../types';

interface LoginProps {
  onSuccess: (user: AuthUser) => void;
  onNavigateToSignup: () => void;
}

export const FloatingIcon: React.FC<{ icon: React.ReactNode; delay: string; duration: string; top: string; left: string; size: number; opacity: number; blur?: string }> = ({ icon, delay, duration, top, left, size, opacity, blur = '0px' }) => (
  <div 
    className="absolute select-none pointer-events-none animate-float"
    style={{ 
      top, left, animationDelay: delay, animationDuration: duration,
      fontSize: size, opacity, filter: `blur(${blur})`, color: 'white'
    }}
  >
    {icon}
  </div>
);

const Login: React.FC<LoginProps> = ({ onSuccess, onNavigateToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Local theme toggle for pre-login accessibility
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleLocalTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('st_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('st_theme', 'light');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const user = await authService.login(email, password);
      onSuccess(user);
    } catch (err: any) {
      setError(err.message || "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020617]">
      {/* Theme Toggle for Login Page */}
      <button 
        onClick={toggleLocalTheme}
        className="absolute top-6 right-6 z-50 p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-lg border border-white/20 transition-all"
      >
        {isDark ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      {/* Enhanced 3D Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/20 rounded-full blur-[160px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-purple-600/10 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '3s' }}></div>
        
        <FloatingIcon icon={<Book size={80} />} delay="0s" duration="15s" top="10%" left="5%" size={80} opacity={0.15} />
        <FloatingIcon icon={<Atom size={60} />} delay="2s" duration="18s" top="20%" left="85%" size={60} opacity={0.1} />
        <FloatingIcon icon={<Orbit size={120} />} delay="5s" duration="25s" top="65%" left="80%" size={120} opacity={0.05} blur="4px" />
        <FloatingIcon icon={<Microscope size={90} />} delay="1s" duration="22s" top="75%" left="15%" size={90} opacity={0.08} />
        <FloatingIcon icon={<Brain size={70} />} delay="4s" duration="20s" top="40%" left="50%" size={70} opacity={0.12} />
        <FloatingIcon icon={<Globe size={150} />} delay="8s" duration="40s" top="5%" left="40%" size={150} opacity={0.03} blur="10px" />
        <FloatingIcon icon={<Pencil size={40} />} delay="3s" duration="12s" top="85%" left="60%" size={40} opacity={0.2} />
      </div>

      <div className="relative z-10 max-w-md w-full px-6">
        <div className="text-center mb-10 group">
          <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-[2.5rem] text-white mb-6 shadow-2xl border border-white/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <GraduationCap size={56} />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter shadow-blue-500/20">SmartTutor</h1>
          <p className="text-blue-300 font-bold mt-2 uppercase tracking-[0.3em] text-[10px] opacity-70">Knowledge Reinvented</p>
        </div>

        <div className="bg-white/95 dark:bg-slate-900/95 p-10 rounded-[3rem] shadow-2xl border border-white/10 backdrop-blur-xl transition-colors duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-4 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-2xl text-xs font-bold border border-red-100 dark:border-red-900">{error}</div>}
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identifier</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-3xl font-bold outline-none focus:border-blue-500 text-slate-900 dark:text-white transition-colors" 
                  placeholder="alex@academy.com" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Passphrase</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full pl-14 pr-14 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-3xl font-bold outline-none focus:border-blue-500 text-slate-900 dark:text-white transition-colors" 
                  placeholder="••••••••" 
                  required 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center">
              {isLoading ? <Loader2 className="animate-spin" size={28} /> : <span className="flex items-center gap-3">Login <Sparkles size={24} /></span>}
            </button>
          </form>

          <button onClick={onNavigateToSignup} className="w-full mt-8 text-slate-500 dark:text-slate-400 font-bold text-sm hover:text-blue-600 transition-colors">
            Don't have an account? Sign up
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-20px, -40px) rotate(10deg); }
        }
        .animate-float { animation: float 10s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

export default Login;