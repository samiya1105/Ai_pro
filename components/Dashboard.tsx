import React, { useMemo } from 'react';
import { 
  BarChart2, 
  Trophy, 
  Flame, 
  Target, 
  ArrowRight, 
  Star, 
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { storageService } from '../services/storageService';
import { AuthUser } from '../types';

interface DashboardProps {
  user: AuthUser;
  onStartQuiz: (topic: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onStartQuiz }) => {
  const results = useMemo(() => storageService.getQuizResults() || [], []);
  const averageScore = useMemo(() => storageService.getAverageScore() || 0, [results]);
  const streak = useMemo(() => storageService.getStreak() || 0, [results]);
  const recommendation = useMemo(() => storageService.getRecommendation() || "Mastering AI Study Tools", [results]);
  const goalComp = useMemo(() => storageService.getWeeklyGoalCompletion() || "0/10", [results]);
  
  const chartData = useMemo(() => 
    results.slice(-7).map((r, i) => ({
      name: `S${i + 1}`,
      score: Math.round((r.score / r.total) * 100),
    })), 
  [results]);

  const firstName = user?.name?.split(' ')[0] || "Scholar";

  return (
    <div className="space-y-6 pb-12">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Accelerate Your Learning, {firstName}! 🚀</h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">Your academic profile is synced and active.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-transform hover:scale-[1.02]">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl w-fit mb-4">
            <Trophy size={24} />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{averageScore}%</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mt-2">Avg Proficiency</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-transform hover:scale-[1.02]">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl w-fit mb-4">
            <Activity size={24} />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{results.length}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mt-2">Lessons Done</p>
          <p className="text-[9px] text-slate-400 font-bold mt-1 italic">Total sessions completed</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-transform hover:scale-[1.02]">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl w-fit mb-4">
            <Flame size={24} />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{streak}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mt-2">Day Streak</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-transform hover:scale-[1.02]">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl w-fit mb-4">
            <Target size={24} />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{goalComp}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mt-2">Goal Progress</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm min-h-[400px]">
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-3">
             <BarChart2 size={24} className="text-blue-500" /> Proficiency Growth
          </h3>
          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="name" hide />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip contentStyle={{borderRadius: '16px', background: '#0f172a', border: 'none', color: '#fff'}} />
                  <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={5} dot={{r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2}} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-bold italic">Log your first quiz to see growth data.</div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-center">
           <Star className="absolute -top-6 -right-6 w-32 h-32 opacity-10 rotate-12" />
           <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-4">Smart Suggestion</p>
           <p className="font-medium text-lg mb-2 opacity-90">Based on your activity:</p>
           <p className="font-black text-3xl mb-10 leading-tight">"{recommendation}"</p>
           <button 
              onClick={() => onStartQuiz(recommendation)}
              className="w-full bg-white text-indigo-700 font-black py-5 rounded-2xl hover:scale-[1.03] transition-transform shadow-xl flex items-center justify-center gap-3"
            >
             Continue Mastery <ArrowRight size={20} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;