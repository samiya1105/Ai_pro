import React, { useState, useEffect } from 'react';
import { QuizQuestion, QuizResult } from '../types';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { Loader2, CheckCircle2, XCircle, Trophy, ArrowRight, BrainCircuit, AlertCircle, RefreshCw } from 'lucide-react';

interface QuizAreaProps {
  initialTopic?: string | null;
}

const QuizArea: React.FC<QuizAreaProps> = ({ initialTopic }) => {
  const [topic, setTopic] = useState(initialTopic || '');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-start quiz if initialTopic is provided
  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
      startQuiz(initialTopic);
    }
  }, [initialTopic]);

  const startQuiz = async (topicOverride?: string) => {
    const targetTopic = topicOverride || topic;
    if (!targetTopic.trim()) return;
    
    setIsLoading(true);
    setQuiz([]);
    setScore(0);
    setCurrentQuestionIndex(0);
    setIsCompleted(false);
    setError(null);
    
    try {
      const questions = await geminiService.generateQuiz(targetTopic, difficulty);
      if (questions.length === 0) {
        throw new Error("No questions were generated. Please try a different topic.");
      }
      setQuiz(questions);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate quiz. Please check your connection and try again.");
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
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setIsCompleted(true);
    const result: QuizResult = {
      id: Date.now().toString(),
      topic,
      score,
      total: quiz.length,
      date: Date.now()
    };
    storageService.saveQuizResult(result);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-8 transition-colors">
        <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Generating Quiz...</h3>
        <p className="text-slate-500 dark:text-slate-400">I'm crafting challenging questions about {topic}</p>
      </div>
    );
  }

  if (error) {
     return (
      <div className="max-w-xl mx-auto mt-10">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center transition-colors">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600 dark:text-red-400">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Something went wrong</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
          <button
              onClick={() => setError(null)}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={18} /> Try Again
            </button>
        </div>
      </div>
     );
  }

  if (quiz.length === 0 && !isCompleted) {
    return (
      <div className="max-w-xl mx-auto mt-10">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center transition-colors">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 dark:text-blue-400">
            <BrainCircuit size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Knowledge Check</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Enter a topic to generate a custom quiz and test your understanding.</p>
          
          <div className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Photosynthesis, World War II, Calculus..."
                className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 dark:text-white transition-all font-medium"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Difficulty</label>
              <div className="flex gap-2">
                {['easy', 'medium', 'hard'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d as any)}
                    className={`flex-1 py-2 rounded-lg text-sm font-black capitalize transition-all ${
                      difficulty === d 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => startQuiz()}
              disabled={!topic.trim()}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-black hover:bg-blue-700 disabled:opacity-50 transition-all mt-4 shadow-lg shadow-blue-500/25"
            >
              Generate Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center transition-colors">
          <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600 dark:text-yellow-400">
            <Trophy size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Quiz Completed!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">You scored {score} out of {quiz.length}</p>

          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 mb-8 overflow-hidden">
            <div 
              className="bg-green-500 h-full transition-all duration-1000" 
              style={{ width: `${(score / quiz.length) * 100}%` }}
            ></div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setQuiz([]);
                setTopic('');
                setIsCompleted(false);
              }}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Try Another Topic
            </button>
            <button
              onClick={() => startQuiz()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
            >
              Retry Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = quiz[currentQuestionIndex];

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col justify-center">
      <div className="mb-6 flex justify-between items-center text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">
        <span>Question {currentQuestionIndex + 1} of {quiz.length}</span>
        <span className="text-blue-600 dark:text-blue-400">Score: {score}</span>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 transition-colors">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-8 leading-relaxed">
          {currentQ.question}
        </h3>

        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQ.correctAnswer;
            const showResult = showExplanation;

            let btnClass = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20";
            
            if (showResult) {
              if (isCorrect) btnClass = "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400 font-bold";
              else if (isSelected) btnClass = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400 font-bold";
              else btnClass = "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60 text-slate-400";
            } else if (isSelected) {
               btnClass = "bg-blue-600 text-white border-blue-600 dark:border-blue-500 font-bold";
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                disabled={showExplanation}
                className={`w-full p-5 rounded-2xl border-2 text-left transition-all relative group ${btnClass}`}
              >
                <span className="font-medium text-sm sm:text-base">{option}</span>
                {showResult && isCorrect && <CheckCircle2 size={22} className="absolute right-5 top-1/2 -translate-y-1/2 text-green-600 dark:text-green-400" />}
                {showResult && isSelected && !isCorrect && <XCircle size={22} className="absolute right-5 top-1/2 -translate-y-1/2 text-red-600 dark:text-red-400" />}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="mt-8 p-5 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-2xl text-sm leading-relaxed border border-blue-100 dark:border-blue-800 animate-in fade-in slide-in-from-top-2">
            <span className="font-black block mb-2 uppercase tracking-widest text-[10px]">Tutor Explanation</span>
            <p className="font-medium">{currentQ.explanation}</p>
          </div>
        )}

        {showExplanation && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={nextQuestion}
              className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 group"
            >
              {currentQuestionIndex === quiz.length - 1 ? "Finish Quiz" : "Next Question"}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizArea;