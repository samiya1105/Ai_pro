import React, { useState, useEffect } from 'react';
import { AppView, AuthUser } from '../types';
import { 
  MessageSquare, 
  CheckSquare, 
  FileText, 
  Layers, 
  Share2, 
  Menu,
  X,
  GraduationCap,
  LogOut,
  Sun,
  Moon,
  Clock
} from 'lucide-react';
import { storageService } from '../services/storageService';

interface LayoutProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  user: AuthUser;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  children: React.ReactNode;
}

interface NavItemProps {
  view: AppView;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ 
  label, 
  icon: Icon, 
  isActive, 
  onClick 
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-bold">{label}</span>
  </button>
);

const Layout: React.FC<LayoutProps> = ({ 
  currentView, 
  onNavigate, 
  user, 
  onLogout, 
  isDarkMode, 
  onToggleTheme, 
  children 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [recentChats, setRecentChats] = useState<string[]>([]);
  
  const weeklyGoals = storageService.getWeeklyGoalProgress();
  const completionPercentage = Math.round((weeklyGoals.current / weeklyGoals.target) * 100);

  // Load chat history from localStorage (simulating ChatGPT style history)
  useEffect(() => {
    const loadChatHistory = () => {
      const history = localStorage.getItem(`st_chat_history_${user.email}`);
      if (history) {
        setRecentChats(JSON.parse(history));
      }
    };
    loadChatHistory();
    // Listen for custom event when chat updates
    window.addEventListener('chatHistoryUpdated', loadChatHistory);
    return () => window.removeEventListener('chatHistoryUpdated', loadChatHistory);
  }, [user.email]);

  const navItems = [
    { view: 'dashboard' as AppView, label: 'Dashboard', icon: GraduationCap },
    { view: 'chat' as AppView, label: 'AI Tutor', icon: MessageSquare },
    { view: 'quiz' as AppView, label: 'Quizzes', icon: CheckSquare },
    { view: 'flashcards' as AppView, label: 'Flashcards', icon: Layers },
    { view: 'summary' as AppView, label: 'Summarizer', icon: FileText },
    { view: 'concept-map' as AppView, label: 'Concept Maps', icon: Share2 },
  ];

  const userInitial = user.name.charAt(0).toUpperCase();

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full p-4 transition-colors">
        <div className="flex items-center justify-between px-2 py-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">ST</div>
            <span className="text-lg font-black text-slate-800 dark:text-white">SmartTutor</span>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
          {navItems.map((item) => (
            <NavItem
              key={item.view}
              {...item}
              isActive={currentView === item.view}
              onClick={() => onNavigate(item.view)}
            />
          ))}

          {/* Chat History Section - ChatGPT Style */}
          {recentChats.length > 0 && (
            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 px-4 mb-2 text-slate-400">
                <Clock size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Recent Chats</span>
              </div>
              <div className="space-y-1">
                {recentChats.map((topic, idx) => (
                  <button
                    key={idx}
                    onClick={() => onNavigate('chat')}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg truncate transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
             <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all font-bold group"
            >
              <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
              <span>Logout</span>
            </button>
          </div>
        </nav>

        {/* Study Goals Progress - Dynamic */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 mt-auto transition-colors">
          <div className="flex items-center gap-3 mb-3">
             <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
               {userInitial}
             </div>
             <div className="overflow-hidden">
               <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
               <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
             </div>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase mb-2 tracking-widest">Weekly Goals</p>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mb-2 overflow-hidden">
            <div 
              className="bg-green-500 h-full rounded-full transition-all duration-1000"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">{completionPercentage}% Complete</p>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-900 p-4 shadow-2xl transition-colors" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8 px-2">
              <span className="text-xl font-black text-slate-800 dark:text-white">SmartTutor</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors dark:text-white"><X size={24} /></button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.view}
                  {...item}
                  isActive={currentView === item.view}
                  onClick={() => {
                    onNavigate(item.view);
                    setIsMobileMenuOpen(false);
                  }}
                />
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative transition-colors">
        <header className="flex items-center justify-between p-4 md:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <Menu size={24} />
            </button>
            <h2 className="font-black text-slate-800 dark:text-white capitalize text-xl">{currentView.replace('-', ' ')}</h2>
          </div>

          <div className="flex items-center gap-4">
             <button 
                onClick={onToggleTheme}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-yellow-400 hover:ring-2 hover:ring-blue-500/20 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
             >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>

             <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>
             <div className="w-10 h-10 rounded-full bg-blue-600 hidden sm:flex items-center justify-center text-white font-bold border border-blue-500 shadow-lg shadow-blue-500/20">
               {userInitial}
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 dark:bg-slate-950 transition-colors">
          <div className="max-w-6xl mx-auto h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
      </main>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #334155;
        }
      `}</style>
    </div>
  );
};

export default Layout;