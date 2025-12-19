import * as React from 'react';
import { Send, User, Bot, Loader2, AlertCircle, Trash2, Plus, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { ChatMessage, MessageRole, AuthUser } from '../types';
import { geminiService } from '../services/geminiService';

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastUpdated: number;
}

interface TutorChatProps {
  user?: AuthUser;
}

const TutorChat: React.FC<TutorChatProps> = ({ user }) => {
  const userId = user?.id || 'guest';
  const sessionsKey = `st_chat_sessions_${userId}`;
  
  const [sessions, setSessions] = React.useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(sessionsKey);
      if (saved) return JSON.parse(saved);
      return [];
    } catch (e) {
      return [];
    }
  });

  const [activeSessionId, setActiveSessionId] = React.useState<string | null>(() => {
    if (sessions.length > 0) return sessions[0].id;
    return null;
  });

  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  const activeSession = React.useMemo(() => 
    sessions.find(s => s.id === activeSessionId) || null
  , [sessions, activeSessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages, error, isLoading]);

  React.useEffect(() => {
    localStorage.setItem(sessionsKey, JSON.stringify(sessions));
  }, [sessions, sessionsKey]);

  const startNewChat = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: 'New Study Session',
      messages: [{
        id: '1',
        role: MessageRole.MODEL,
        text: "Hello! I'm your AI personal tutor. What subject are we mastering today?",
        timestamp: Date.now()
      }],
      lastUpdated: Date.now()
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newId);
    setInput('');
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    let currentSessionId = activeSessionId;
    let currentSessions = [...sessions];

    // If no active session, start one
    if (!currentSessionId) {
      const newId = Date.now().toString();
      const newSession: ChatSession = {
        id: newId,
        title: input.slice(0, 30) + (input.length > 30 ? '...' : ''),
        messages: [],
        lastUpdated: Date.now()
      };
      currentSessions = [newSession, ...currentSessions];
      currentSessionId = newId;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: input,
      timestamp: Date.now()
    };

    // Update session title on first user message if it's default
    const sessionToUpdate = currentSessions.find(s => s.id === currentSessionId);
    if (sessionToUpdate && sessionToUpdate.title === 'New Study Session') {
      sessionToUpdate.title = input.slice(0, 30) + (input.length > 30 ? '...' : '');
    }

    if (sessionToUpdate) {
      sessionToUpdate.messages.push(userMessage);
      sessionToUpdate.lastUpdated = Date.now();
    }

    setSessions(currentSessions);
    setActiveSessionId(currentSessionId);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const history = sessionToUpdate ? sessionToUpdate.messages : [];
      const responseText = await geminiService.chatWithTutor(history.slice(0, -1), userMessage.text);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        text: responseText,
        timestamp: Date.now()
      };

      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: [...s.messages, botMessage],
            lastUpdated: Date.now()
          };
        }
        return s;
      }));
    } catch (error: any) {
      setError("Study connection interrupted. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (activeSessionId === id) {
      setActiveSessionId(filtered.length > 0 ? filtered[0].id : null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] md:h-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
      
      {/* Sidebar for History */}
      <div className={`transition-all duration-300 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
        <div className="p-4">
          <button 
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-500/20"
          >
            <Plus size={18} /> New Session
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {sessions.length === 0 && (
            <div className="p-4 text-center text-slate-400 text-xs font-bold uppercase tracking-widest opacity-50 mt-10">
              No History
            </div>
          )}
          {sessions.map(s => (
            <div 
              key={s.id}
              onClick={() => setActiveSessionId(s.id)}
              className={`group relative p-3 rounded-xl cursor-pointer flex items-center gap-3 transition-all ${activeSessionId === s.id ? 'bg-white dark:bg-slate-800 shadow-sm' : 'hover:bg-slate-200 dark:hover:bg-slate-800/50'}`}
            >
              <MessageCircle size={16} className={activeSessionId === s.id ? 'text-blue-500' : 'text-slate-400'} />
              <span className={`text-sm font-bold truncate pr-6 ${activeSessionId === s.id ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                {s.title}
              </span>
              <button 
                onClick={(e) => deleteSession(s.id, e)}
                className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Toggle Sidebar Btn */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-r-lg shadow-md text-slate-400 hover:text-blue-500"
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className="bg-blue-600 p-4 text-white flex justify-between items-center shadow-lg">
          <div>
            <h2 className="font-bold text-lg">AI Tutor Chat</h2>
            <p className="text-blue-100 text-xs opacity-80 uppercase tracking-widest font-black">
              {activeSession ? activeSession.title : "Ready to Start"}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/30 dark:bg-slate-950/50 transition-colors">
          {!activeSessionId && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
               <Bot size={64} className="mb-4 opacity-20" />
               <p className="font-black uppercase tracking-widest text-sm opacity-50">Select or Start a Chat</p>
            </div>
          )}

          {activeSession?.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === MessageRole.USER ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === MessageRole.USER 
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                }`}
              >
                {msg.role === MessageRole.USER ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div
                className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed font-medium transition-all ${
                  msg.role === MessageRole.USER
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm'
                }`}
              >
                 <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
               <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 border border-slate-200 dark:border-slate-700 shadow-sm">
                <Loader2 size={16} className="animate-spin text-blue-500" />
                <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Studying...</span>
              </div>
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center p-4">
               <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 border border-red-100 dark:border-red-900/50 max-w-md font-bold">
                  <AlertCircle size={16} />
                  <span>{error}</span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all shadow-sm">
            <input
              type="text"
              className="flex-1 bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-bold py-3"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 shadow-md shadow-blue-500/20"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorChat;