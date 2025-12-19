import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, GraduationCap, Sparkles, Book, Atom, Orbit, Microscope, Brain, Globe, Pencil, Sun, Moon } from 'lucide-react';
import { authService } from '../../services/authService';
import { FloatingIcon } from './Login';

interface SignupProps {
  onSuccess: () => void;
  onNavigateToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSuccess, onNavigateToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local theme toggle
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

  const validatePasswordPattern = (pass: string) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+]{6,}$/.test(pass);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError('Please choose a username!');
      return;
    }
    if (!validatePasswordPattern(password)) {
      setError('Use 6+ characters with at least one letter and one number.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords don\'t match!');
      return;
    }

    setIsLoading(true);
    try {
      await authService.signup(name, email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020617] py-12">
      {/* Theme Toggle for Signup Page */}
      <button 
        onClick={toggleLocalTheme}
        className="absolute top-6 right-6 z-50 p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-lg border border-white/20 transition-all"
      >
        {isDark ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      {/* Dynamic 3D Environment (Same as Login) */}
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[2rem] text-white mb-6 shadow-2xl border border-white/20 -rotate-3 transition-transform">
            <User size={44} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter drop-shadow-lg">Create Profile</h1>
          <p className="text-blue-300 font-bold mt-2 uppercase tracking-[0.3em] text-[10px] opacity-70">Knowledge Registry</p>
        </div>

        <div className="bg-white/95 dark:bg-slate-900/95 p-10 rounded-[3rem] shadow-2xl border border-white/10 backdrop-blur-xl transition-colors">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-2xl text-xs font-bold border border-red-100 dark:border-red-900 animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-indigo-500 text-slate-900 dark:text-white font-bold outline-none transition-all"
                placeholder="AlexSmith"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-indigo-500 text-slate-900 dark:text-white font-bold outline-none transition-all"
                placeholder="alex@academy.com"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-indigo-500 text-slate-900 dark:text-white font-bold outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-indigo-500 text-slate-900 dark:text-white font-bold outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[2rem] font-black hover:from-indigo-700 hover:to-purple-700 active:scale-[0.96] transition-all flex items-center justify-center text-lg uppercase tracking-widest disabled:opacity-70 mt-4 shadow-xl shadow-indigo-500/20"
            >
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : (
                <span className="flex items-center gap-2">Sign Up <Sparkles size={20} /></span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">
              Member already?{' '}
              <button
                onClick={onNavigateToLogin}
                className="text-indigo-600 dark:text-indigo-400 font-black hover:underline"
              >
                Login
              </button>
            </p>
          </div>
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

export default Signup;