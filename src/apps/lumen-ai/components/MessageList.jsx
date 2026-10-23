import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Bot, User, CornerDownRight } from 'lucide-react';

export default function MessageList({ messages, isThinking, onSelectSuggestion }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  if (messages.length === 0) {
    return (
      <div className="lumen-empty-container">
        <div className="lumen-hero-badge">
          <span>L</span>
        </div>
        <h2 className="lumen-hero-title">Lumen AI</h2>
        <p className="lumen-hero-subtitle">Fast, intelligent assistant for your daily mobile workflow.</p>

        <div className="lumen-suggestion-grid">
          {[
            'Summarize my agenda for today',
            'Draft a follow-up email to Elena',
            'Explain state management in React',
            'Suggest a quick healthy dinner idea'
          ].map((text, idx) => (
            <button
              key={idx}
              className="lumen-suggestion-pill"
              onClick={() => onSelectSuggestion(text)}
            >
              <span>{text}</span>
              <CornerDownRight size={13} style={{ opacity: 0.6 }} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="lumen-chat-stream">
      {messages.map((m) => {
        const isUser = m.role === 'user';
        return (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`lumen-message-row ${isUser ? 'user' : 'assistant'}`}
          >
            {!isUser && (
              <div className="lumen-avatar-mini">
                <span>L</span>
              </div>
            )}

            <div className={`lumen-bubble ${isUser ? 'user-bubble' : 'ai-bubble'}`}>
              <div className="lumen-message-text">
                {m.text}
              </div>
              <div className="lumen-message-time">
                {m.timestamp}
              </div>
            </div>

            {isUser && (
              <div className="lumen-avatar-user">
                <User size={13} />
              </div>
            )}
          </motion.div>
        );
      })}

      {isThinking && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="lumen-message-row assistant"
        >
          <div className="lumen-avatar-mini pulse">
            <span>L</span>
          </div>
          <div className="lumen-bubble ai-bubble thinking-bubble">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        </motion.div>
      )}

      <div ref={bottomRef} style={{ height: 4 }} />
    </div>
  );
}
