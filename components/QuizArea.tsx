import React, { useState } from 'react';
import { QuizQuestion, QuizResult } from '../types';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { Loader2, CheckCircle2, XCircle, Trophy, ArrowRight, BrainCircuit, AlertCircle, RefreshCw } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);

  const startQuiz = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setQuiz([]);
    setScore(0);
    setCurrentQuestionIndex(0);
    setIsCompleted(false);
    setError(null);
    
    try {
      const questions = await geminiService.generateQuiz(topic, difficulty);
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
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl shadow-sm p-8">
        <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
        <h3 className="text-xl font-semibold text-slate-800">Generating Quiz...</h3>
        <p className="text-slate-500">I'm crafting challenging questions about {topic}</p>
      </div>
    );
  }

  if (error) {
     return (
      <div className="max-w-xl mx-auto mt-10">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button
              onClick={() => setError(null)}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center gap-2 mx-auto"
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
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
            <BrainCircuit size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Knowledge Check</h2>
          <p className="text-slate-500 mb-8">Enter a topic to generate a custom quiz and test your understanding.</p>
          
          <div className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Photosynthesis, World War II, Calculus..."
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
              <div className="flex gap-2">
                {['easy', 'medium', 'hard'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d as any)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                      difficulty === d 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startQuiz}
              disabled={!topic.trim()}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all mt-4"
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
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600">
            <Trophy size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Quiz Completed!</h2>
          <p className="text-slate-500 mb-8">You scored {score} out of {quiz.length}</p>

          <div className="w-full bg-slate-100 rounded-full h-4 mb-8 overflow-hidden">
            <div 
              className="bg-green-500 h-full transition-all duration-1000" 
              style={{ width: `${(score / quiz.length) * 100}%` }}
            ></div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setQuiz([]);
                setIsCompleted(false);
              }}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            >
              Try Another Topic
            </button>
            <button
              onClick={startQuiz}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
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
      <div className="mb-6 flex justify-between items-center text-slate-500 text-sm font-medium">
        <span>Question {currentQuestionIndex + 1} of {quiz.length}</span>
        <span>Score: {score}</span>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-800 mb-6 leading-relaxed">
          {currentQ.question}
        </h3>

        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQ.correctAnswer;
            const showResult = showExplanation;

            let btnClass = "bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50";
            if (showResult) {
              if (isCorrect) btnClass = "bg-green-50 border-green-500 text-green-700";
              else if (isSelected) btnClass = "bg-red-50 border-red-500 text-red-700";
              else btnClass = "bg-slate-50 border-slate-200 opacity-60";
            } else if (isSelected) {
               btnClass = "bg-blue-600 text-white border-blue-600";
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                disabled={showExplanation}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all relative ${btnClass}`}
              >
                <span className="font-medium">{option}</span>
                {showResult && isCorrect && <CheckCircle2 size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600" />}
                {showResult && isSelected && !isCorrect && <XCircle size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-600" />}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm leading-relaxed border border-blue-100 animate-in fade-in slide-in-from-top-2">
            <span className="font-bold block mb-1">Explanation:</span>
            {currentQ.explanation}
          </div>
        )}

        {showExplanation && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={nextQuestion}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
            >
              {currentQuestionIndex === quiz.length - 1 ? "Finish Quiz" : "Next Question"}
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizArea;