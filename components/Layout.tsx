import React, { useState } from 'react';
import { AppView, AuthUser } from '../types';
import { 
  BookOpen, 
  MessageSquare, 
  CheckSquare, 
  FileText, 
  Layers, 
  Share2, 
  Menu,
  X,
  GraduationCap,
  LogOut,
  Settings,
  Bell
} from 'lucide-react';

interface LayoutProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  user: AuthUser;
  onLogout: () => void;
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
  view, 
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
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <Icon size={20} />
    <span className="font-bold">{label}</span>
  </button>
);

const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, user, onLogout, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-full p-4">
        <div className="flex items-center justify-between px-2 py-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">ST</div>
            <span className="text-lg font-black text-slate-800">SmartTutor</span>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.view}
              {...item}
              isActive={currentView === item.view}
              onClick={() => onNavigate(item.view)}
            />
          ))}

          <div className="pt-4 mt-4 border-t border-slate-100">
             <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold group"
            >
              <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
              <span>Logout</span>
            </button>
          </div>
        </nav>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-auto">
          <div className="flex items-center gap-3 mb-3">
             <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black">
               {userInitial}
             </div>
             <div className="overflow-hidden">
               <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
               <p className="text-xs text-slate-500 truncate">{user.email}</p>
             </div>
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase mb-2 tracking-widest">Study Goals</p>
          <div className="w-full bg-slate-200 rounded-full h-1.5 mb-2 overflow-hidden">
            <div className="bg-green-500 h-full rounded-full w-[75%] transition-all duration-1000"></div>
          </div>
          <p className="text-xs text-slate-600 font-bold">75% Complete</p>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white p-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8 px-2">
              <span className="text-xl font-black text-slate-800">SmartTutor</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
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
              <div className="pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 font-bold"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="flex items-center justify-between p-4 md:px-8 bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <Menu size={24} />
            </button>
            <h2 className="font-black text-slate-800 capitalize text-xl">{currentView.replace('-', ' ')}</h2>
          </div>

          <div className="flex items-center gap-4">
             <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Bell size={20} /></button>
             <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Settings size={20} /></button>
             <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>
             <div className="w-10 h-10 rounded-full bg-slate-100 hidden sm:flex items-center justify-center text-slate-600 font-bold border border-slate-200">
               {userInitial}
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50">
          <div className="max-w-6xl mx-auto h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;