import * as React from 'react';
import { AppView, AuthUser } from '../types.ts';
import { storageService } from '../services/storageService.ts';
import { 
  MessageSquare, 
  CheckSquare, 
  FileText, 
  Layers, 
  Share2, 
  Menu,
  X,
  GraduationCap,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';

interface LayoutProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  user: AuthUser;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, user, onLogout, isDarkMode, onToggleTheme, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const weeklyProgress = storageService.getWeeklyProgress();

  const userInitial = React.useMemo(() => {
    return user.name ? user.name.charAt(0).toUpperCase() : '?';
  }, [user.name]);

  const handleLogoutAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Immediate logout for better reliability
    onLogout();
  };

  const navItems = [
    { view: 'dashboard' as AppView, label: 'Dashboard', icon: GraduationCap },
    { view: 'chat' as AppView, label: 'AI Tutor', icon: MessageSquare },
    { view: 'quiz' as AppView, label: 'Quizzes', icon: CheckSquare },
    { view: 'flashcards' as AppView, label: 'Flashcards', icon: Layers },
    { view: 'summary' as AppView, label: 'Summarizer', icon: FileText },
    { view: 'concept-map' as AppView, label: 'Concept Maps', icon: Share2 },
  ];

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 transition-colors duration-300">
        <div className="flex items-center justify-between px-2 py-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">ST</div>
            <span className="text-lg font-bold text-slate-800 dark:text-white">SmartTutor</span>
          </div>
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onToggleTheme();
            }}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                currentView === item.view 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <item.icon size={20} />
              <span className="font-bold">{item.label}</span>
            </button>
          ))}

          {/* Logout Button in Sidebar */}
          <button
            type="button"
            onClick={handleLogoutAction}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 mt-4 group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="font-bold">Logout</span>
          </button>
        </nav>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 mt-auto">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase mb-2 tracking-widest">Study Progress</p>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mb-2 overflow-hidden">
            <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${weeklyProgress}%` }}></div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">{weeklyProgress}% Completed</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="flex items-center justify-between p-4 md:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-600 dark:text-slate-400">
              <Menu size={24} />
            </button>
            <h2 className="hidden md:block font-black text-slate-800 dark:text-white capitalize text-xl">{currentView.replace('-', ' ')}</h2>
          </div>

          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
               <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{user.name}</p>
               <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{user.email}</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md border-2 border-white dark:border-slate-800 ring-2 ring-blue-500/20">
               {userInitial}
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          <div className="max-w-6xl mx-auto h-full animate-in fade-in duration-500">
            {children}
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-900 p-4 transition-colors" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-8 px-2">
                <span className="text-xl font-bold text-slate-800 dark:text-white">SmartTutor</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="dark:text-white"><X size={24} /></button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.view}
                    onClick={() => { onNavigate(item.view); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${currentView === item.view ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
                  >
                    <item.icon size={20} />
                    <span className="font-bold">{item.label}</span>
                  </button>
                ))}
                
                {/* Logout Button in Mobile Menu */}
                <button
                  onClick={(e) => {
                    handleLogoutAction(e);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 mt-4 group"
                >
                  <LogOut size={20} />
                  <span className="font-bold">Logout</span>
                </button>
              </nav>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Layout;