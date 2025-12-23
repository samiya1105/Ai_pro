import React, { useState, useEffect } from 'react';
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
import { Loader2, Book, Pencil, GraduationCap, Brain, Lightbulb, Atom, Calculator } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authScreen, setAuthScreen] = useState<'login' | 'signup'>('login');
  const [appLoading, setAppLoading] = useState(true);
  const [quizTopic, setQuizTopic] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('st_theme');
    return saved === 'dark';
  });

  // Handle dark mode side effects
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('st_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('st_theme', 'light');
    }
  }, [isDarkMode]);

  // Initialize session from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('smart_tutor_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Session restore failed", e);
        localStorage.removeItem('smart_tutor_user');
      }
    }
    // Artificial load time for premium feel
    setTimeout(() => setAppLoading(false), 800);
  }, []);

  const handleAuthSuccess = (authUser: AuthUser) => {
    setUser(authUser);
    localStorage.setItem('smart_tutor_user', JSON.stringify(authUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('smart_tutor_user');
    setCurrentView('dashboard');
    setQuizTopic(null);
  };

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const handleStartQuiz = (topic: string) => {
    setQuizTopic(topic);
    setCurrentView('quiz');
  };

  const renderView = () => {
    if (!user) return null;

    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={user} onStartQuiz={handleStartQuiz} />;
      case 'chat':
        return <TutorChat />;
      case 'quiz':
        return <QuizArea initialTopic={quizTopic} />;
      case 'flashcards':
        return <Flashcards />;
      case 'summary':
        return <Summarizer />;
      case 'concept-map':
        return <ConceptMap />;
      default:
        return <Dashboard user={user} onStartQuiz={handleStartQuiz} />;
    }
  };

  if (appLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
        <h2 className="text-xl font-black text-white tracking-widest uppercase animate-pulse">Initializing Brain...</h2>
      </div>
    );
  }

  // Gatekeeper Logic: All content hidden behind login/signup
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 dark:bg-blue-900/20 rounded-full blur-[120px] opacity-60 animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-[120px] opacity-60 animate-float" style={{ animationDelay: '2s' }}></div>
        
        {/* Animated Study Objects */}
        <div className="absolute top-20 left-[15%] text-blue-400/20 dark:text-blue-500/10 animate-float" style={{ animationDuration: '8s' }}><Book size={40} /></div>
        <div className="absolute bottom-20 left-[10%] text-indigo-400/20 dark:text-indigo-500/10 animate-float" style={{ animationDuration: '12s', animationDelay: '1s' }}><Pencil size={32} /></div>
        <div className="absolute top-[40%] right-[10%] text-purple-400/20 dark:text-purple-500/10 animate-float" style={{ animationDuration: '9s', animationDelay: '3s' }}><GraduationCap size={48} /></div>
        <div className="absolute bottom-[40%] left-[5%] text-emerald-400/20 dark:text-emerald-500/10 animate-float" style={{ animationDuration: '11s', animationDelay: '5s' }}><Brain size={36} /></div>
        <div className="absolute top-[15%] right-[20%] text-yellow-400/20 dark:text-yellow-500/10 animate-float" style={{ animationDuration: '7s', animationDelay: '2s' }}><Lightbulb size={44} /></div>
        <div className="absolute bottom-[10%] right-[15%] text-red-400/20 dark:text-red-500/10 animate-float" style={{ animationDuration: '10s', animationDelay: '4s' }}><Atom size={38} /></div>
        <div className="absolute top-[60%] left-[20%] text-orange-400/20 dark:text-orange-500/10 animate-float" style={{ animationDuration: '13s', animationDelay: '6s' }}><Calculator size={30} /></div>

        <div className="relative z-10 w-full flex justify-center">
          {authScreen === 'login' ? (
            <Login onSuccess={handleAuthSuccess} onSwitch={() => setAuthScreen('signup')} />
          ) : (
            <Signup onSuccess={handleAuthSuccess} onSwitch={() => setAuthScreen('login')} />
          )}
        </div>

        {/* CSS for float animation */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(15px, -30px) rotate(5deg); }
            66% { transform: translate(-10px, 15px) rotate(-5deg); }
          }
          .animate-float { animation: float 10s infinite ease-in-out; }
        `}</style>
      </div>
    );
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
      {renderView()}
    </Layout>
  );
};

export default App;