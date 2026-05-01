import React, { useState, useRef, useEffect } from 'react';
import { quickQuestions } from '../data/quickQuestions';
import { timelineData } from '../data/timelineData';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  systemInstruction: "You are a nonpartisan, civic-focused Indian Election Process Assistant. Explain concepts about the Indian electoral system (Lok Sabha, Rajya Sabha, Election Commission of India, EVMs, VVPATs, etc.) in simple, accessible language. Do not express political opinions, favor any candidate or party, or discuss current political controversies. Stick strictly to the mechanics, history, and rules of the Indian election process."
});

const Chat = ({ setActiveStageId }) => {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('electionChatHistory');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      {
        role: 'assistant',
        content: 'Hello! I am your nonpartisan Election Process Assistant. I can help explain how the US election works. What would you like to know?'
      }
    ];
  });
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Check if we loaded history (more than just the initial greeting)
  const hasHistory = messages.length > 1;

  useEffect(() => {
    localStorage.setItem('electionChatHistory', JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      const initial = [{
        role: 'assistant',
        content: 'Hello! I am your nonpartisan Election Process Assistant. I can help explain how the US election works. What would you like to know?'
      }];
      setMessages(initial);
      localStorage.setItem('electionChatHistory', JSON.stringify(initial));
    }
  };

  const handleSend = async (textToSubmit = input) => {
    if (!textToSubmit.trim()) return;

    setError(null);
    const userMessage = { role: 'user', content: textToSubmit };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const firstUserIndex = messages.findIndex(m => m.role === 'user');
      let geminiHistory = [];
      if (firstUserIndex !== -1) {
        geminiHistory = messages.slice(firstUserIndex).map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));
      }

      const chat = model.startChat({
        history: geminiHistory
      });

      const result = await chat.sendMessage(textToSubmit);
      const responseContent = result.response.text();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: responseContent
      }]);

    } catch (err) {
      console.error("Chat error:", err);
      setError(err.message || "An error occurred.");
      // Remove the user message that failed so they can retry easily
      setMessages(prev => prev.slice(0, -1));
      setInput(textToSubmit); // Put text back in input box
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Function to parse assistant text and turn stage names into links
  const renderMessageContent = (content) => {
    let parsedContent = [content];
    
    // Sort by length descending to match longer titles first (e.g., "Primary Elections" before "Elections")
    const stages = [...timelineData].sort((a, b) => b.title.length - a.title.length);

    stages.forEach(stage => {
      // Regex to match the title exactly (case insensitive), whole words only
      const regex = new RegExp(`\\b(${stage.title})\\b`, 'gi');
      
      // Iterate through the array of string/elements we've built up
      const newParsedContent = [];
      parsedContent.forEach(item => {
        if (typeof item === 'string') {
          const parts = item.split(regex);
          parts.forEach(part => {
            if (part.toLowerCase() === stage.title.toLowerCase()) {
              newParsedContent.push(
                <button 
                  key={`${stage.id}-${Math.random()}`}
                  onClick={() => setActiveStageId(stage.id)}
                  className="inline-block text-[#C8A96E] hover:text-[#e4c995] font-bold underline decoration-[#C8A96E]/40 decoration-2 underline-offset-4 hover:decoration-[#C8A96E] transition-all cursor-pointer"
                >
                  {part}
                </button>
              );
            } else if (part) {
              newParsedContent.push(part);
            }
          });
        } else {
          newParsedContent.push(item);
        }
      });
      parsedContent = newParsedContent;
    });

    return parsedContent.map((item, i) => (
      <React.Fragment key={i}>{item}</React.Fragment>
    ));
  };

  return (
    <section className="w-full">
      <div className="glass-panel rounded-2xl flex flex-col h-[600px] shadow-2xl overflow-hidden relative">
        
        {/* Chat Header */}
        <div className="bg-slate-800/80 light:bg-slate-100 border-b border-slate-700 light:border-slate-300 p-4 flex justify-between items-center">
          <h2 className="text-xl font-heading font-bold text-[#C8A96E] flex items-center">
            <span className="mr-2">💬</span> Civic AI Assistant
          </h2>
          {hasHistory && (
            <button 
              onClick={clearHistory}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors bg-slate-900/50 light:bg-slate-200 px-3 py-1 rounded-full"
            >
              Clear History
            </button>
          )}
        </div>

        {/* Memory Banner */}
        {hasHistory && (
          <div className="bg-[#C8A96E]/10 text-[#C8A96E] text-xs font-bold text-center py-1.5 border-b border-[#C8A96E]/20">
            Continuing from your previous session
          </div>
        )}

        {/* Messages Area */}
        <div 
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6"
          aria-live="polite"
          aria-atomic="false"
        >
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] md:max-w-[80%] rounded-2xl p-4 font-body leading-relaxed shadow-md ${
                  msg.role === 'user' 
                    ? 'bg-[#C8A96E] text-slate-900 rounded-br-sm font-medium' 
                    : 'bg-slate-800/80 light:bg-slate-50 text-slate-200 light:text-slate-800 rounded-bl-sm border border-slate-700/50 light:border-slate-200'
                }`}
              >
                {msg.role === 'assistant' ? renderMessageContent(msg.content) : msg.content}
              </div>
            </div>
          ))}

          {/* Typing Indicator Skeleton */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl rounded-bl-sm p-5 shadow-md flex flex-col space-y-3 w-64">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[#C8A96E] animate-[bounce-delay_1.4s_infinite_ease-in-out_both]" style={{ animationDelay: '-0.32s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-[#C8A96E] animate-[bounce-delay_1.4s_infinite_ease-in-out_both]" style={{ animationDelay: '-0.16s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-[#C8A96E] animate-[bounce-delay_1.4s_infinite_ease-in-out_both]"></div>
                </div>
                <div className="skeleton h-3 w-full rounded"></div>
                <div className="skeleton h-3 w-4/5 rounded"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/20 border-t border-red-500 text-red-400 p-3 text-sm flex justify-between items-center">
            <span>⚠️ {error}</span>
            <button 
              onClick={() => handleSend()}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-bold transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-slate-900/90 light:bg-slate-100 border-t border-slate-800 light:border-slate-300">
          
          {/* Quick Questions */}
          <div className="flex flex-wrap gap-2 mb-4">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="text-xs font-body bg-slate-800/50 light:bg-white border border-slate-700 hover:border-[#C8A96E] text-slate-300 py-2 px-4 rounded-full transition-all disabled:opacity-50 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C8A96E] focus-visible:outline-offset-2"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <label htmlFor="chat-input" className="sr-only">Ask a question about the election</label>
            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about the election..."
              disabled={isLoading}
              className="flex-1 bg-slate-800/80 light:bg-white border border-slate-700 light:border-slate-300 rounded-xl px-4 py-3 md:py-4 focus:outline-none focus:border-[#C8A96E] focus:ring-2 focus:ring-[#C8A96E] focus-visible:ring-2 focus-visible:ring-[#C8A96E] transition-all font-body text-slate-200 placeholder-slate-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-[#C8A96E] hover:bg-[#b0935d] text-slate-900 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex-shrink-0 shadow-[0_0_15px_rgba(200,169,110,0.3)] hover:shadow-[0_0_20px_rgba(200,169,110,0.5)] transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
              aria-label="Send message"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Chat;
