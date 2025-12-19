import React, { useState } from 'react';
import { QuizQuestion, QuizResult } from '../types';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { Loader2, CheckCircle2, XCircle, Trophy, ArrowRight, BrainCircuit, RefreshCw } from 'lucide-react';

const QuizArea: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const startQuiz = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setQuiz([]);
    setScore(0);
    setCurrentQuestionIndex(0);
    setIsCompleted(false);
    try {
      const questions = await geminiService.generateQuiz(topic, difficulty);
      setQuiz(questions);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (option: string) => {
    if (selectedAnswer || showExplanation) return;
    setSelectedAnswer(option);
    setShowExplanation(true);
    if (option === quiz[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
      storageService.saveQuizResult({
        id: Date.now().toString(),
        topic,
        score,
        total: quiz.length,
        date: Date.now()
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
        <h3 className="text-xl font-bold dark:text-white">Generating challenges...</h3>
      </div>
    );
  }

  if (quiz.length === 0 && !isCompleted) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <BrainCircuit size={32} className="text-blue-600" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Knowledge Sprint</h2>
        </div>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Topic (e.g. World History, Python, AI...)"
          className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-bold outline-none mb-4"
        />
        <div className="flex gap-2 mb-6">
          {['easy', 'medium', 'hard'].map(d => (
            <button key={d} onClick={() => setDifficulty(d as any)} className={`flex-1 py-2.5 rounded-xl font-bold capitalize ${difficulty === d ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{d}</button>
          ))}
        </div>
        <button onClick={startQuiz} disabled={!topic} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/20">Generate Quiz</button>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="max-w-xl mx-auto mt-10 text-center p-12 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
        <Trophy size={64} className="text-yellow-500 mx-auto mb-6" />
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Quiz Results</h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold text-xl mb-8">Score: {score} / {quiz.length}</p>
        <button onClick={() => { setQuiz([]); setIsCompleted(false); }} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform">Done</button>
      </div>
    );
  }

  const currentQ = quiz[currentQuestionIndex];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex justify-between items-center px-2">
        <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Question {currentQuestionIndex + 1} / {quiz.length}</span>
        <span className="text-sm font-black text-blue-600 dark:text-blue-400">Current Score: {score}</span>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 leading-tight">{currentQ.question}</h3>
        
        <div className="grid gap-4">
          {currentQ.options.map((opt, i) => {
            const isSelected = selectedAnswer === opt;
            const isCorrect = opt === currentQ.correctAnswer;
            const reveal = showExplanation;

            let style = "border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:text-white text-slate-900";
            if (reveal) {
              if (isCorrect) style = "bg-green-500 border-green-500 text-white";
              else if (isSelected) style = "bg-red-500 border-red-500 text-white";
              else style = "opacity-40 grayscale border-slate-200 dark:border-slate-700 dark:text-white text-slate-900";
            } else if (isSelected) {
              style = "border-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-white text-slate-900";
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                disabled={reveal}
                className={`w-full p-5 text-left rounded-2xl border-2 font-black transition-all flex items-center justify-between text-lg ${style}`}
              >
                <span>{opt}</span>
                {reveal && isCorrect && <CheckCircle2 size={24} />}
                {reveal && isSelected && !isCorrect && <XCircle size={24} />}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950/50 rounded-2xl border border-blue-100 dark:border-blue-900/50 animate-in fade-in slide-in-from-top-4">
            <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Professor's Note</p>
            <p className="text-blue-900 dark:text-blue-200 font-bold leading-relaxed">{currentQ.explanation}</p>
            <button onClick={nextQuestion} className="mt-6 w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest">
              {currentQuestionIndex === quiz.length - 1 ? "Complete Sprint" : "Next Challenge"} <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizArea;