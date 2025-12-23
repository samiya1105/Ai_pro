import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, AlertCircle, MessageSquare, Plus, Menu, X } from 'lucide-react';
import { ChatMessage, MessageRole } from '../types';
import { geminiService } from '../services/geminiService';

interface ChatSession {
  id: string;
  topic: string;
  messages: ChatMessage[];
  timestamp: number;
}

const TutorChat: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load sessions from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('smart_tutor_user') || '{}');
    if (!user.email) return;

    const key = `st_chat_sessions_${user.email}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      if (parsed.length > 0) {
        setCurrentSessionId(parsed[0].id);
      } else {
        createNewSession();
      }
    } else {
      createNewSession();
    }
  }, []);

  // Save sessions whenever they change
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('smart_tutor_user') || '{}');
    if (!user.email || sessions.length === 0) return;
    const key = `st_chat_sessions_${user.email}`;
    localStorage.setItem(key, JSON.stringify(sessions));
  }, [sessions]);

  const createNewSession = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      topic: 'New Conversation',
      messages: [
        {
          id: 'welcome',
          role: MessageRole.MODEL,
          text: "Hello! I'm your AI personal tutor. I can help you understand complex topics, solve doubts, or provide study tips. What are we learning today?",
          timestamp: Date.now()
        }
      ],
      timestamp: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setError(null);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    if (currentSessionId === id) {
      if (updated.length > 0) {
        setCurrentSessionId(updated[0].id);
      } else {
        createNewSession();
      }
    }
  };

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, error]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !currentSessionId) return;

    const currentInput = input;
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: currentInput,
      timestamp: Date.now()
    };

    // Update session locally
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        const isNew = s.topic === 'New Conversation';
        return {
          ...s,
          topic: isNew ? currentInput.slice(0, 30) + (currentInput.length > 30 ? '...' : '') : s.topic,
          messages: [...s.messages, userMessage]
        };
      }
      return s;
    }));

    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const responseText = await geminiService.chatWithTutor(currentSession.messages, userMessage.text);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        text: responseText,
        timestamp: Date.now()
      };
      
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return { ...s, messages: [...s.messages, botMessage] };
        }
        return s;
      }));
    } catch (err: any) {
      console.error("Failed to get response", err);
      setError(err.message || "Failed to connect to the tutor. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] md:h-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      
      {/* Sidebar for Chat History */}
      <div className={`transition-all duration-300 border-r border-slate-100 dark:border-slate-800 flex flex-col ${isSidebarOpen ? 'w-72' : 'w-16'} bg-slate-50 dark:bg-slate-900/50`}>
        <div className="p-4 flex flex-col h-full overflow-hidden">
          {/* Sidebar Header with Toggle Icon */}
          <div className="flex items-center mb-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
              title={isSidebarOpen ? "Close History" : "Open History"}
            >
              <Menu size={20} />
            </button>
            {isSidebarOpen && <h2 className="ml-3 font-bold text-slate-800 dark:text-white truncate">History</h2>}
          </div>

          <button 
            onClick={createNewSession}
            className={`flex items-center gap-2 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-blue-500 transition-all mb-4 shadow-sm overflow-hidden whitespace-nowrap ${!isSidebarOpen && 'justify-center px-0'}`}
          >
            <Plus size={18} className="text-blue-600 flex-shrink-0" />
            {isSidebarOpen && <span className="truncate">New Chat</span>}
          </button>
          
          <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
            {sessions.map(session => (
              <div 
                key={session.id}
                onClick={() => setCurrentSessionId(session.id)}
                className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${currentSessionId === session.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'} ${!isSidebarOpen && 'justify-center px-0'}`}
              >
                <MessageSquare size={16} className={`flex-shrink-0 ${currentSessionId === session.id ? 'text-white' : 'text-blue-500'}`} />
                {isSidebarOpen && <span className="flex-1 text-xs font-medium truncate">{session.topic}</span>}
                {isSidebarOpen && (
                  <button 
                    onClick={(e) => deleteSession(session.id, e)}
                    className={`opacity-0 group-hover:opacity-100 p-1 hover:bg-black/10 rounded transition-all ${currentSessionId === session.id ? 'text-white' : 'text-slate-400'}`}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white dark:bg-slate-900 p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center transition-colors">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="font-bold text-slate-800 dark:text-white leading-tight">AI Tutor Chat</h2>
              <p className="text-blue-500 text-xs font-medium">{currentSession?.topic}</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-bold rounded-full border border-green-200 dark:border-green-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              AI ONLINE
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/20">
          {currentSession?.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-4 ${msg.role === MessageRole.USER ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                msg.role === MessageRole.USER ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-blue-600 border border-slate-100 dark:border-slate-700'
              }`}>
                {msg.role === MessageRole.USER ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={`p-4 rounded-2xl max-w-[85%] sm:max-w-[75%] text-sm leading-relaxed shadow-sm transition-colors ${
                msg.role === MessageRole.USER
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'
              }`}>
                 <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-4">
               <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 text-blue-600 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm">
                <Bot size={18} />
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none flex items-center gap-3 border border-slate-100 dark:border-slate-700 shadow-sm">
                <Loader2 size={16} className="animate-spin text-blue-500" />
                <span className="text-slate-400 text-xs font-medium italic">Tutor is thinking...</span>
              </div>
            </div>
          )}
          {error && (
            <div className="flex justify-center p-4">
               <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-5 py-3 rounded-xl text-sm flex items-center gap-3 border border-red-100 dark:border-red-800 shadow-sm">
                  <AlertCircle size={18} />
                  <span>{error}</span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 md:p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-colors">
          <div className="max-w-4xl mx-auto flex items-end gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <textarea
              className="flex-1 bg-transparent outline-none text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none max-h-32 text-sm leading-relaxed py-1"
              placeholder="Type your message here..."
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              style={{ minHeight: '24px' }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/20"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">Smart Tutor AI may provide imperfect information. Verify critical data.</p>
        </div>
      </div>
    </div>
  );
};

export default TutorChat;