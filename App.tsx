import React, { useState, useMemo, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import TutorChat from './components/TutorChat.tsx';
import QuizArea from './components/QuizArea.tsx';
import Flashcards from './components/Flashcards.tsx';
import Summarizer from './components/Summarizer.tsx';
import ConceptMap from './components/ConceptMap.tsx';
import Login from './components/Auth/Login.tsx';
import Signup from './components/Auth/Signup.tsx';
import { AppView, AuthUser } from './types.ts';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('st_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('st_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('st_theme', 'light');
    }
  }, [isDarkMode]);

  const handleLoginSuccess = (authUser: AuthUser) => {
    setIsAuthLoading(true);
    setTimeout(() => {
      setUser(authUser);
      setIsAuthLoading(false);
      setCurrentView('dashboard');
    }, 800);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
    setShowSignup(false);
  };

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const activeView = useMemo(() => {
    if (!user) return null;
    
    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={user} onStartQuiz={(topic) => setCurrentView('quiz')} />;
      case 'chat':
        return <TutorChat user={user} />;
      case 'quiz':
        return <QuizArea />;
      case 'flashcards':
        return <Flashcards />;
      case 'summary':
        return <Summarizer />;
      case 'concept-map':
        return <ConceptMap />;
      default:
        return <Dashboard user={user} onStartQuiz={() => setCurrentView('quiz')} />;
    }
  }, [currentView, user]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-white tracking-widest uppercase">Syncing Knowledge...</h2>
      </div>
    );
  }

  if (!user) {
    if (showSignup) {
      return <Signup onSuccess={() => setShowSignup(false)} onNavigateToLogin={() => setShowSignup(false)} />;
    }
    return <Login onSuccess={handleLoginSuccess} onNavigateToSignup={() => setShowSignup(true)} />;
  }

  return (
    <Layout 
      currentView={currentView} 
      onNavigate={setCurrentView} 
      user={user} 
      onLogout={handleLogout}
      isDarkMode={isDarkMode}
      onToggleTheme={toggleTheme}
    >
      {activeView}
    </Layout>
  );
};

export default App;