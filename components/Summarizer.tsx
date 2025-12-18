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
    if (!input.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const summary = await geminiService.generateSummary(input);
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
      <div className="flex-1 flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2">
            <FileText size={18} className="text-blue-600" />
            Source Notes
          </h3>
          <span className="text-xs text-slate-500">{input.length} chars</span>
        </div>
        <textarea
          className="flex-1 p-4 resize-none outline-none text-slate-700 leading-relaxed"
          placeholder="Paste your long lecture notes, article, or essay here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={handleSummarize}
            disabled={!input.trim() || isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-all flex justify-center items-center gap-2"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <>Summarize <ArrowRight size={18} /></>}
          </button>
        </div>
      </div>

      {/* Output Area */}
      <div className="flex-1 flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700">AI Summary</h3>
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
        
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {error && (
            <div className="h-full flex flex-col items-center justify-center text-red-500 text-center p-4">
              <AlertCircle size={32} className="mb-2" />
              <p>{error}</p>
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
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">Core Summary</h4>
                <p className="text-slate-700 leading-7 text-justify">{result.summary}</p>
              </div>
              
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wide mb-3">Key Points</h4>
                <ul className="space-y-2">
                  {result.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-blue-800">
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