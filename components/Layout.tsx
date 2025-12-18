import React, { useState } from 'react';
import { AppView } from '../types';
import { 
  BookOpen, 
  MessageSquare, 
  CheckSquare, 
  FileText, 
  Layers, 
  Share2, 
  Menu,
  X,
  GraduationCap
} from 'lucide-react';

interface LayoutProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
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
    <span className="font-medium">{label}</span>
  </button>
);

const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { view: 'dashboard' as AppView, label: 'Dashboard', icon: GraduationCap },
    { view: 'chat' as AppView, label: 'AI Tutor', icon: MessageSquare },
    { view: 'quiz' as AppView, label: 'Quizzes', icon: CheckSquare },
    { view: 'flashcards' as AppView, label: 'Flashcards', icon: Layers },
    { view: 'summary' as AppView, label: 'Summarizer', icon: FileText },
    { view: 'concept-map' as AppView, label: 'Concept Maps', icon: Share2 },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-full p-4">
        <div className="flex items-center space-x-2 px-4 py-4 mb-6">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">ST</div>
          <span className="text-xl font-bold text-slate-800">SmartTutor</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavItem
              key={item.view}
              {...item}
              isActive={currentView === item.view}
              onClick={() => onNavigate(item.view)}
            />
          ))}
        </nav>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mt-auto">
          <p className="text-xs text-slate-500 font-medium uppercase mb-2">My Progress</p>
          <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
            <div className="bg-green-500 h-2 rounded-full w-[75%]"></div>
          </div>
          <p className="text-xs text-slate-600">Weekly Goal: 75%</p>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-900/50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white p-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 px-2">
              <span className="text-xl font-bold text-slate-800">SmartTutor</span>
              <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
            </div>
            <nav className="space-y-2">
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
          <span className="font-bold text-lg text-slate-800">SmartTutor</span>
          <button onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} className="text-slate-600" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;