import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { storageService } from '../services/storageService';
import { Trophy, Clock, Target, Flame } from 'lucide-react';

const Dashboard: React.FC = () => {
  const results = storageService.getQuizResults();
  const averageScore = storageService.getAverageScore();
  const recentTopics = storageService.getRecentTopics();
  
  // Prepare chart data
  const chartData = results.slice(-7).map((r, i) => ({
    name: `Quiz ${i + 1}`,
    score: Math.round((r.score / r.total) * 100),
    topic: r.topic
  }));

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Welcome back, Student!</h1>
        <p className="text-slate-500">You're making great progress. Ready to learn something new?</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Trophy size={24} />
            </div>
            <span className="text-green-500 text-sm font-semibold">+12%</span>
          </div>
          <span className="text-3xl font-bold text-slate-800">{averageScore}%</span>
          <span className="text-slate-500 text-sm">Average Score</span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
           <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
              <Clock size={24} />
            </div>
          </div>
          <span className="text-3xl font-bold text-slate-800">{results.length}</span>
          <span className="text-slate-500 text-sm">Quizzes Taken</span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
           <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
              <Flame size={24} />
            </div>
          </div>
          <span className="text-3xl font-bold text-slate-800">3</span>
          <span className="text-slate-500 text-sm">Day Streak</span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
           <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
              <Target size={24} />
            </div>
          </div>
          <span className="text-3xl font-bold text-slate-800">8/10</span>
          <span className="text-slate-500 text-sm">Weekly Goals</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Performance History</h3>
          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
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
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Topics</h3>
          <div className="space-y-4">
            {recentTopics.length > 0 ? (
              recentTopics.map((topic, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-slate-700">{topic}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm">No topics studied yet.</p>
            )}
          </div>
          
          <div className="mt-8">
            <h4 className="text-sm font-bold text-slate-800 mb-3">Recommended for you</h4>
             <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white">
               <p className="text-sm font-medium mb-2 opacity-90">Based on your recent scores</p>
               <p className="font-bold text-lg mb-3">Try "Linear Algebra"</p>
               <button className="text-xs bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-lg">Start Quiz</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
