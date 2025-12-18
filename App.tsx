import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TutorChat from './components/TutorChat';
import QuizArea from './components/QuizArea';
import Flashcards from './components/Flashcards';
import Summarizer from './components/Summarizer';
import ConceptMap from './components/ConceptMap';
import { AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');

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

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;
