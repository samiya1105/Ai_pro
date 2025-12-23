
import React, { useState } from 'react';
import { Flashcard } from '../types';
import { geminiService } from '../services/geminiService';
import { Loader2, RotateCw, Plus, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

const Flashcards: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCards = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setError(null);
    
    try {
      const generated = await geminiService.generateFlashcards(topic);
      if (generated.length === 0) {
        throw new Error("No flashcards were generated.");
      }
      setCards(generated);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate flashcards.");
    } finally {
      setIsLoading(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 200);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
       setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 200);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 dark:text-slate-400">Creating flashcards for {topic}...</p>
      </div>
    );
  }

  if (error) {
    return (
       <div className="max-w-xl mx-auto mt-20 p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center transition-colors">
        <div className="text-red-500 flex justify-center mb-4"><AlertCircle size={32} /></div>
        <p className="text-slate-800 dark:text-slate-200 font-medium mb-4">{error}</p>
        <button 
          onClick={() => setError(null)}
          className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
        >
          Try Again
        </button>
       </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Study Flashcards</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Enter a subject to generate a deck of flashcards instantly.</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Organic Chemistry, French Vocabulary..."
            className="flex-1 p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white transition-all"
          />
          <button
            onClick={generateCards}
            disabled={!topic.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Plus size={20} />
            Generate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col items-center justify-center py-8">
      <div className="w-full flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">{topic}</h3>
        <span className="text-slate-400 font-medium">{currentIndex + 1} / {cards.length}</span>
      </div>

      <div 
        className="group relative w-full h-80 perspective-1000 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full duration-500 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center transition-colors">
            <span className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 mb-4 tracking-wider">Question</span>
            <p className="text-2xl font-medium text-slate-800 dark:text-white">{cards[currentIndex].front}</p>
            <span className="absolute bottom-6 text-slate-400 dark:text-slate-500 text-sm flex items-center gap-1">
              <RotateCw size={14} /> Tap to flip
            </span>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-blue-600 text-white rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center">
            <span className="text-xs uppercase font-bold text-blue-200 mb-4 tracking-wider">Answer</span>
            <p className="text-xl font-medium leading-relaxed">{cards[currentIndex].back}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 mt-10">
        <button 
          onClick={prevCard}
          className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-md text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={() => {
            setCards([]);
            setTopic('');
          }}
          className="px-6 py-3 rounded-xl font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:white transition-colors"
        >
          New Deck
        </button>
        <button 
          onClick={nextCard}
          className="p-4 bg-blue-600 rounded-full shadow-lg shadow-blue-500/30 text-white hover:bg-blue-700 transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </div>
      
      {/* CSS for 3D flip effect */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default Flashcards;
