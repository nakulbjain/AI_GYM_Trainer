// frontend/src/components/ChatAssistant.jsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Send, MessageSquare, Award, AlertTriangle, RefreshCw, Bot, User } from 'lucide-react';

export default function ChatAssistant({ setView }) {
  const [messages, setMessages] = useState([
    { sender: 'coach', text: 'Kinematic coaching assistant initialized. Ask regarding joint constraints, exercise adaptations, bio-mechanics, or macronutrient distribution.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const suggestions = [
    "Can I do squats if my knee hurts?",
    "What exercise replaces Deadlift?",
    "How much protein should I eat?",
    "Is my posture correct?",
    "How long should I rest?"
  ];

  const handleSendMessage = async (text) => {
    const msg = text || inputText;
    if (!msg.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: msg }]);
    setInputText('');
    setSending(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'user', message: msg })
      });
      if (!res.ok) throw new Error('API server failed');
      const data = await res.json();
      
      // Add response
      setMessages(prev => [...prev, { sender: 'coach', text: data.reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { sender: 'coach', text: '⚠️ Connection lost. Make sure the FastAPI backend is running locally.' }]);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#F7F7F5] pb-6 px-3.5 sm:px-6 md:px-8 relative overflow-hidden select-none flex flex-col items-center font-sans">
      <div className="w-full max-w-4xl flex-1 flex flex-col pt-4 sm:pt-6 md:pt-8 relative z-10">
        
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-4 sm:mb-6 border-b border-white/10 pb-4">
          <button 
            onClick={() => setView('dashboard')}
            className="w-10 h-10 rounded bg-[#101012] hover:bg-white/5 border border-white/10 transition-colors flex items-center justify-center text-[#F7F7F5] flex-shrink-0"
            title="Return to Dashboard"
            aria-label="Return to Dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-[#B7F52A]"></span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#6F7075]">AI ADAPTIVE KINEMATICS</span>
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold uppercase font-serif tracking-tight truncate">Kinematic Chat Consultant</h1>
          </div>
        </div>

        {/* CHAT CHASSIS */}
        <div className="flex-1 bg-[#101012] border border-white/10 rounded-xl overflow-hidden flex flex-col mb-4 shadow-2xl">
          
          {/* MESSAGES BODY */}
          <div className="flex-1 p-3.5 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4 max-h-[50vh] md:max-h-[58vh]">
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`flex gap-2 sm:gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender !== 'user' && (
                  <div className="w-7 h-7 rounded bg-[#B7F52A]/10 border border-[#B7F52A]/30 flex items-center justify-center text-[#B7F52A] flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                
                <div 
                  className={`max-w-[85%] sm:max-w-[80%] rounded px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm leading-relaxed font-sans ${
                    m.sender === 'user' 
                      ? 'bg-[#B7F52A] text-[#050505] font-medium' 
                      : 'bg-[#0A0A0A] border border-white/10 text-[#F7F7F5]'
                  }`}
                >
                  {/* Clean bullet rendering for markdown formats */}
                  {m.text.split('\n').map((line, lidx) => (
                    <p key={lidx} className={lidx > 0 ? "mt-1.5" : ""}>
                      {line.startsWith('- ') ? (
                        <span className="flex items-start gap-1.5">
                          <span className={m.sender === 'user' ? 'text-[#050505] font-bold' : 'text-[#B7F52A] font-bold'}>•</span>
                          <span>{line.substring(2)}</span>
                        </span>
                      ) : (
                        <span>{line}</span>
                      )}
                    </p>
                  ))}
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded bg-white/10 border border-white/20 flex items-center justify-center text-[#F7F7F5] flex-shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* CHIPS SUGGESTIONS */}
          <div className="px-3.5 sm:px-6 py-2.5 sm:py-3.5 border-t border-white/10 bg-[#0A0A0A]">
            <span className="text-[10px] font-mono text-[#6F7075] uppercase tracking-wider block mb-2">QUICK TELEMETRY INQUIRIES</span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s)}
                  disabled={sending}
                  className="px-2.5 sm:px-3 py-1.5 bg-[#101012] hover:bg-white/5 border border-white/10 hover:border-[#B7F52A]/40 transition-all rounded text-xs text-[#6F7075] hover:text-[#F7F7F5] font-sans active:scale-95"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* INPUT AREA */}
          <div className="p-3 sm:p-4 border-t border-white/10 bg-[#101012] flex gap-2 sm:gap-3 items-center">
            <input 
              type="text" 
              placeholder="Ask regarding biomechanics, injury avoidance..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={sending}
              className="flex-1 bg-[#0A0A0A] border border-white/15 outline-none rounded px-3.5 sm:px-4 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-[#B7F52A] text-[#F7F7F5] placeholder:text-[#6F7075] font-sans transition-all"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={sending || !inputText.trim()}
              className="px-4 py-2.5 min-h-[44px] bg-[#B7F52A] hover:bg-[#a6df24] rounded text-[#050505] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center disabled:opacity-40 flex-shrink-0"
              aria-label="Send message"
            >
              {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
