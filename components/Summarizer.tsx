import React, { useState } from 'react';
import { StudySummary } from '../types';
import { geminiService } from '../services/geminiService';
import { Loader2, FileText, ArrowRight, Copy, AlertCircle } from 'lucide-react';

const Summarizer: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<StudySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) {
      setError("Please paste some notes first!");
      return;
    }
    
    if (trimmedInput.length < 20) {
      setError("Study notes are too short for a useful summary. Please provide more content.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const summary = await geminiService.generateSummary(trimmedInput);
      setResult(summary);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate summary.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      {/* Input Area */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <FileText size={18} className="text-blue-600" />
            Source Notes
          </h3>
          <span className="text-xs text-slate-500">{input.length} chars</span>
        </div>
        <textarea
          className="flex-1 p-4 resize-none outline-none text-slate-900 dark:text-white bg-white dark:bg-slate-900 leading-relaxed placeholder-slate-400 dark:placeholder-slate-600"
          placeholder="Paste your long lecture notes, article, or essay here..."
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError(null);
          }}
        />
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleSummarize}
            disabled={!input.trim() || isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-all flex justify-center items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <>Summarize <ArrowRight size={18} /></>}
          </button>
        </div>
      </div>

      {/* Output Area */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative transition-colors">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">AI Summary</h3>
          {result && (
             <button 
                onClick={() => navigator.clipboard.writeText(result.summary)}
                className="text-slate-400 hover:text-blue-600 transition-colors"
                title="Copy to clipboard"
             >
               <Copy size={16} />
             </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/20">
          {error && (
            <div className="h-full flex flex-col items-center justify-center text-red-500 text-center p-4">
              <AlertCircle size={32} className="mb-2" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {!result && !isLoading && !error && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <FileText size={48} className="mb-4 opacity-20" />
              <p>Summary will appear here</p>
            </div>
          )}
          
          {isLoading && (
             <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Loader2 size={32} className="animate-spin text-blue-600 mb-2" />
                <p>Analyzing text...</p>
             </div>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3">Core Summary</h4>
                <p className="text-slate-700 dark:text-slate-300 leading-7 text-justify">{result.summary}</p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-100 dark:border-blue-800">
                <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wide mb-3">Key Points</h4>
                <ul className="space-y-2">
                  {result.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-blue-800 dark:text-blue-200">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Summarizer;