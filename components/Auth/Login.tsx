import React, { useState } from 'react';
import { Mail, Lock, LogIn, ArrowRight, GraduationCap, AlertCircle } from 'lucide-react';
import { AuthUser } from '../../types';

interface LoginProps {
  onSuccess: (user: AuthUser) => void;
  onSwitch: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess, onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) return;

    setLoading(true);
    
    // Simulate API call check
    setTimeout(() => {
      // Get all local accounts
      const accountsRaw = localStorage.getItem('smart_tutor_accounts');
      const accounts = accountsRaw ? JSON.parse(accountsRaw) : [];
      
      // Look for match
      const foundAccount = accounts.find((acc: any) => acc.email.toLowerCase() === email.toLowerCase());
      
      if (!foundAccount) {
        setError('No account found. Please create an account first!');
        setLoading(false);
        return;
      }
      
      // Check password
      if (foundAccount.password !== password) {
        setError('Incorrect password. Please try again.');
        setLoading(false);
        return;
      }

      const userToLogin: AuthUser = {
        name: foundAccount.name,
        email: foundAccount.email,
        joinedDate: foundAccount.joinedDate
      };

      onSuccess(userToLogin);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="w-full max-w-md p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-300 transition-colors">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/30">
          <GraduationCap size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Welcome Back</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Sign in to continue your learning journey</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400 animate-in slide-in-from-top-2">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 dark:text-white"
              placeholder="name@university.edu"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 dark:text-white"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 group disabled:opacity-70"
        >
          {loading ? 'Authenticating...' : (
            <>
              Sign In
              <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center transition-colors">
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Don't have an account yet?</p>
        <button
          onClick={onSwitch}
          className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center justify-center gap-1 mx-auto"
        >
          Create Student Account <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Login;