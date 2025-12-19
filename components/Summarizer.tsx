import React, { useState } from 'react';
import { StudySummary } from '../types';
import { geminiService } from '../services/geminiService';
import { Loader2, FileText, ArrowRight, Copy } from 'lucide-react';

const Summarizer: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<StudySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSummarize = async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const summary = await geminiService.generateSummary(input);
      setResult(summary);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      {/* Input Side */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
          <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm flex items-center gap-2">
            <FileText size={18} className="text-blue-600" />
            Source Material
          </h3>
          <span className="text-[10px] font-bold text-slate-400">{input.length} Chars</span>
        </div>
        <textarea
          className="flex-1 p-6 resize-none outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-bold leading-relaxed placeholder-slate-400 dark:placeholder-slate-700 transition-colors"
          placeholder="Paste lecture notes or text here for instant analysis..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleSummarize}
            disabled={!input.trim() || isLoading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all flex justify-center items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            {isLoading ? <Loader2 size={24} className="animate-spin" /> : <>Deep Scan <ArrowRight size={20} /></>}
          </button>
        </div>
      </div>

      {/* Output Side */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
          <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm">Distilled Insights</h3>
          {result && (
            <button onClick={() => navigator.clipboard.writeText(result.summary)} className="text-slate-400 hover:text-blue-600 transition-colors">
              <Copy size={18} />
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30 dark:bg-slate-950/30">
          {!result && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 opacity-50">
              <FileText size={64} className="mb-4" />
              <p className="font-black uppercase tracking-widest text-sm">Awaiting Content</p>
            </div>
          )}

          {isLoading && (
            <div className="h-full flex flex-col items-center justify-center">
              <Loader2 size={40} className="animate-spin text-blue-600 mb-2" />
              <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Processing Data...</p>
            </div>
          )}

          {result && (
            <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8">
              <div>
                <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div> Executive Summary
                </h4>
                <p className="text-slate-800 dark:text-slate-200 font-bold leading-8 text-lg text-justify">{result.summary}</p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-4">Critical Vectors</h4>
                <ul className="space-y-4">
                  {result.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-4">
                      <div className="mt-2 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                      <span className="text-slate-700 dark:text-slate-300 font-bold leading-relaxed">{point}</span>
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