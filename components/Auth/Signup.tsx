import React, { useState } from 'react';
import { User, Mail, Lock, UserPlus, ArrowLeft, GraduationCap, AlertCircle, ShieldCheck } from 'lucide-react';
import { AuthUser } from '../../types';

interface SignupProps {
  onSuccess: (user: AuthUser) => void;
  onSwitch: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSuccess, onSwitch }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      try {
        const accountsRaw = localStorage.getItem('smart_tutor_accounts');
        const accounts = accountsRaw ? JSON.parse(accountsRaw) : [];
        
        // Check if email already registered
        if (accounts.some((acc: any) => acc.email.toLowerCase() === email.toLowerCase())) {
          setError('An account with this email already exists.');
          setLoading(false);
          return;
        }

        const newUserAccount = {
          name,
          email,
          password,
          joinedDate: Date.now()
        };

        // Save to account list
        accounts.push(newUserAccount);
        localStorage.setItem('smart_tutor_accounts', JSON.stringify(accounts));

        const mockUser: AuthUser = {
          name: name,
          email: email,
          joinedDate: Date.now()
        };
        
        onSuccess(mockUser);
      } catch (err) {
        setError('Failed to save account. Please check your browser settings.');
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="w-full max-w-md p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
      <button 
        onClick={onSwitch}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 mb-6 flex items-center gap-2 text-sm font-medium transition-colors"
      >
        <ArrowLeft size={16} /> Back to login
      </button>

      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-500/30">
          <GraduationCap size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Join SmartTutor</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">The smartest way to master any subject</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 flex items-start gap-3 text-red-600 dark:text-red-400 animate-in slide-in-from-top-2 rounded-xl">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Username</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 dark:text-white"
              placeholder="e.g. ScholarKing"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 dark:text-white"
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 dark:text-white"
              placeholder="Min. 8 characters"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
          <div className="relative group">
            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 dark:text-white"
              placeholder="Repeat password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 group disabled:opacity-70 mt-2"
        >
          {loading ? 'Creating account...' : (
            <>
              Start Learning Now
              <UserPlus size={18} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-400 leading-relaxed px-4">
        By signing up, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
      </p>
    </div>
  );
};

export default Signup;