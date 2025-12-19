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
        <p className="text-slate-500 dark:text-slate-400 font-bold">Creating flashcards for {topic}...</p>
      </div>
    );
  }

  if (error) {
    return (
       <div className="max-w-xl mx-auto mt-20 p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
        <div className="text-red-500 flex justify-center mb-4"><AlertCircle size={32} /></div>
        <p className="text-slate-800 dark:text-slate-200 font-bold mb-4">{error}</p>
        <button 
          onClick={() => setError(null)}
          className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
        >
          Try Again
        </button>
       </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-4">Study Flashcards</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 font-bold">Enter a subject to generate a deck of flashcards instantly.</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Organic Chemistry, AI Principles..."
            className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-bold outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={generateCards}
            disabled={!topic.trim()}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
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
      <div className="w-full flex justify-between items-center mb-6 px-4">
        <h3 className="text-lg font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{topic}</h3>
        <span className="text-slate-400 dark:text-slate-500 font-black">{currentIndex + 1} / {cards.length}</span>
      </div>

      <div 
        className="group relative w-full h-80 perspective-1000 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full duration-500 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 text-center transition-colors">
            <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 mb-4 tracking-[0.2em]">Prompt</span>
            <p className="text-2xl font-black text-slate-800 dark:text-white leading-tight">{cards[currentIndex].front}</p>
            <span className="absolute bottom-6 text-slate-400 dark:text-slate-500 text-xs font-black flex items-center gap-2 uppercase tracking-widest">
              <RotateCw size={14} /> Tap to flip
            </span>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-blue-600 dark:bg-blue-700 text-white rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 text-center">
            <span className="text-[10px] uppercase font-black text-blue-200 dark:text-blue-300 mb-4 tracking-[0.2em]">Analysis</span>
            <p className="text-xl font-bold leading-relaxed">{cards[currentIndex].back}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 mt-12">
        <button 
          onClick={prevCard}
          className="p-5 bg-white dark:bg-slate-900 rounded-full shadow-lg text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-100 dark:border-slate-800 transition-all active:scale-95"
          title="Previous Card"
        >
          <ChevronLeft size={28} />
        </button>
        <button
          onClick={() => {
            setCards([]);
            setTopic('');
          }}
          className="px-8 py-3 rounded-2xl font-black text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 uppercase tracking-widest text-xs transition-colors"
        >
          Discard Deck
        </button>
        <button 
          onClick={nextCard}
          className="p-5 bg-blue-600 rounded-full shadow-xl shadow-blue-500/30 text-white hover:bg-blue-700 transition-all active:scale-95"
          title="Next Card"
        >
          <ChevronRight size={28} />
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