import React from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { storageService } from '../services/storageService';
import { Trophy, Clock, Target, Flame, Play } from 'lucide-react';
import { AuthUser } from '../types';

interface DashboardProps {
  user: AuthUser;
  onStartQuiz: (topic: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onStartQuiz }) => {
  const results = storageService.getQuizResults();
  const averageScore = storageService.getAverageScore();
  const recentTopics = storageService.getRecentTopics();
  const streak = storageService.getStreak();
  const weeklyGoals = storageService.getWeeklyGoalProgress();
  
  // Calculate relative improvement based on recent 3 vs lifetime average
  const lastThree = results.slice(-3);
  const lastThreeAvg = lastThree.length > 0 
    ? Math.round((lastThree.reduce((a, b) => a + (b.score / b.total), 0) / lastThree.length) * 100)
    : 0;
  
  const improvement = averageScore === 0 ? 0 : lastThreeAvg - averageScore;

  // Prepare chart data
  const chartData = results.slice(-7).map((r, i) => ({
    name: `Quiz ${i + 1}`,
    score: Math.round((r.score / r.total) * 100),
    topic: r.topic
  }));

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Welcome back, {user.name}!</h1>
        <p className="text-slate-500 dark:text-slate-400">You're making great progress. Ready to learn something new?</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <Trophy size={24} />
            </div>
            {improvement !== 0 && (
              <span className={`${improvement >= 0 ? 'text-green-500' : 'text-red-500'} text-sm font-semibold`}>
                {improvement >= 0 ? '+' : ''}{improvement}%
              </span>
            )}
          </div>
          <span className="text-3xl font-bold text-slate-800 dark:text-white">{averageScore}%</span>
          <span className="text-slate-500 dark:text-slate-400 text-sm">Average Score</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col transition-colors">
           <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Clock size={24} />
            </div>
          </div>
          <span className="text-3xl font-bold text-slate-800 dark:text-white">{results.length}</span>
          <span className="text-slate-500 dark:text-slate-400 text-sm">Quizzes Taken</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col transition-colors">
           <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl">
              <Flame size={24} />
            </div>
          </div>
          <span className="text-3xl font-bold text-slate-800 dark:text-white">{streak}</span>
          <span className="text-slate-500 dark:text-slate-400 text-sm">Day Streak</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col transition-colors">
           <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
              <Target size={24} />
            </div>
          </div>
          <span className="text-3xl font-bold text-slate-800 dark:text-white">{weeklyGoals.current}/{weeklyGoals.target}</span>
          <span className="text-slate-500 dark:text-slate-400 text-sm">Weekly Goals</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Performance History</h3>
          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff'}} 
                    cursor={{stroke: '#cbd5e1', strokeWidth: 2}}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#2563eb" 
                    strokeWidth={3} 
                    dot={{fill: '#2563eb', strokeWidth: 2, r: 4, stroke: '#fff'}}
                    activeDot={{r: 6, strokeWidth: 0}}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                No quiz data yet. Take a quiz to see your progress!
              </div>
            )}
          </div>
        </div>

        {/* Recent Topics */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Recent Topics</h3>
          <div className="space-y-3">
            {recentTopics.length > 0 ? (
              recentTopics.map((topic, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group hover:shadow-sm transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{topic}</span>
                  </div>
                  <button
                    onClick={() => onStartQuiz(topic)}
                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg transition-all hover:bg-blue-600 hover:text-white"
                  >
                    <Play size={10} fill="currentColor" /> START
                  </button>
                </div>
              ))
            ) : (
              <div className="py-10 text-center">
                <p className="text-slate-400 text-sm">No topics studied yet.</p>
                <p className="text-slate-300 dark:text-slate-600 text-[10px] mt-2 font-medium">Take a quiz to see recent topics here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;