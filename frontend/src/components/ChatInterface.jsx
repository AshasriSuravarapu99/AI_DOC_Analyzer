import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ChatInterface({ documentId }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I have analyzed your document. What would you like to know about it?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/ask`, {
        question: userMessage,
        document_id: documentId
      });
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.answer,
        sources: response.data.sources
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: err.response?.data?.detail || 'Sorry, I encountered an error while trying to answer your question. Please try again.',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-start gap-4 max-w-4xl mx-auto w-full ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in-up`}>
            
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              msg.role === 'user' 
                ? 'bg-dark-border' 
                : msg.isError 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'bg-gradient-to-tr from-primary to-purple-600 text-white shadow-lg shadow-primary/20'
            }`}>
              {msg.role === 'user' ? <User className="w-5 h-5 text-dark-muted" /> : <Bot className="w-6 h-6" />}
            </div>

            {/* Message Bubble */}
            <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
              <div className={`px-5 py-4 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-tr-none'
                  : msg.isError
                    ? 'bg-red-500/10 border border-red-500/20 text-red-200 rounded-tl-none'
                    : 'bg-dark-bg/80 border border-dark-border text-dark-text rounded-tl-none prose prose-invert max-w-none'
              }`}>
                {msg.role === 'assistant' && !msg.isError ? (
                  <>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-dark-border/50">
                        <p className="text-xs text-dark-muted font-medium mb-2 flex items-center gap-1">
                          <FileText className="w-3 h-3" /> Sources
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {msg.sources.map((src, i) => (
                            <span key={i} className="text-xs bg-dark-panel border border-dark-border px-2 py-1 rounded-md text-dark-muted">
                              Page {src.page}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>

          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-4 max-w-4xl mx-auto w-full animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-purple-600 text-white shadow-lg shadow-primary/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="bg-dark-bg/80 border border-dark-border px-5 py-4 rounded-2xl rounded-tl-none flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-dark-muted text-sm font-medium animate-pulse">Analyzing document...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-dark-panel/90 border-t border-dark-border">
        <div className="max-w-4xl mx-auto relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your document..."
            className="w-full bg-dark-bg border border-dark-border rounded-xl px-5 py-4 pr-14 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none overflow-hidden h-[60px] text-dark-text placeholder:text-dark-muted shadow-inner scrollbar-hide"
            rows="1"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`absolute right-3 top-3 p-2 rounded-lg transition-all ${
              !input.trim() || isLoading
                ? 'text-dark-muted bg-transparent cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/25 active:scale-95'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-xs text-dark-muted mt-3">
          AI can make mistakes. Consider verifying important information.
        </p>
      </div>
    </div>
  );
}
