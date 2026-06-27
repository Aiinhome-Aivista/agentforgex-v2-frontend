import React, { useState, useEffect, useRef } from "react";
import { Bot, Send, Sparkles, CheckCircle2 } from "lucide-react";
import { sendOnboardingMessage } from "../../services/api";

export default function RobotIntro({ onComplete, userName = "" }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    
    const startChat = async () => {
      setIsLoading(true);
      try {
        const response = await sendOnboardingMessage(`Hi, I'm ${userName || "a new user"}.`);
        setMessages([
          { role: "assistant", content: response.response }
        ]);
      } catch (err) {
        console.error("Failed to start onboarding chat", err);
        setMessages([
          { role: "assistant", content: `Hello ${userName}! I'm AgentForgeX. How can I help you today?` }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    startChat();
  }, [userName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input.trim() };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendOnboardingMessage(userMessage.content, messages);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.response }
      ]);
      
      if (response.flow_complete && response.final_summary) {
        localStorage.setItem("user_mission_vision_context", JSON.stringify(response.final_summary));
        setIsComplete(true);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Oops, something went wrong. Could you try again?" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("user_mission_vision_context", JSON.stringify({ skipped: true }));
    onComplete();
  };

  return (
    <div className="w-full min-h-[75vh] flex flex-col items-center py-8 animate-in fade-in duration-700">
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-500/20 text-brand-400 mb-2 animate-bounce">
          <Bot size={40} />
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight">
          Welcome to <span className="gradient-text">AgentForgeX</span>
        </h2>
        <p className="text-white/60 text-lg">
          Let's align on your mission and vision to tailor our suggestions.
        </p>
      </div>

      <div className="w-full max-w-3xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col">
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-white/80">AgentForgeX Onboarding</span>
          </div>
          <div className="flex items-center space-x-4">
            {!isComplete && (
              <button onClick={handleSkip} className="text-xs font-medium text-white/40 hover:text-white/80 transition-colors uppercase tracking-wider">
                Skip
              </button>
            )}
            <Sparkles size={16} className="text-brand-400" />
          </div>
        </div>

        <div className="h-[400px] overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 text-[15px] leading-relaxed shadow-lg ${
                  msg.role === "assistant"
                    ? "bg-white/10 text-white/90 rounded-tl-sm"
                    : "bg-brand-500 text-white rounded-tr-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 text-white/90 rounded-2xl rounded-tl-sm p-4 text-sm shadow-lg flex items-center space-x-2">
                <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white/5 border-t border-white/10">
          {!isComplete ? (
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your response..."
                disabled={isLoading}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-4 pr-14 text-white/90 placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all text-base"
                autoFocus
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2.5 rounded-lg bg-brand-500 hover:bg-brand-400 text-white transition-colors disabled:opacity-50 disabled:hover:bg-brand-500"
              >
                <Send size={20} />
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 py-4">
              <div className="flex items-center space-x-2 text-green-400 font-medium">
                <CheckCircle2 size={20} />
                <span>Mission and Vision Saved!</span>
              </div>
              <button
                onClick={onComplete}
                className="px-6 py-3 bg-brand-500 hover:bg-brand-400 text-white rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg shadow-brand-500/25"
              >
                Continue to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
