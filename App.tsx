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
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authScreen, setAuthScreen] = useState<'login' | 'signup'>('login');
  const [appLoading, setAppLoading] = useState(true);

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
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'chat':
        return <TutorChat />;
      case 'quiz':
        return <QuizArea />;
      case 'flashcards':
        return <Flashcards />;
      case 'summary':
        return <Summarizer />;
      case 'concept-map':
        return <ConceptMap />;
      default:
        return <Dashboard />;
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

  // Gatekeeper Logic
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-60 animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-60 animate-float" style={{ animationDelay: '2s' }}></div>
        
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
            50% { transform: translate(-20px, -40px) rotate(10deg); }
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
    >
      {renderView()}
    </Layout>
  );
};

export default App;