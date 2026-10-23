import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Bot, User, CornerDownRight, ShieldAlert, ArrowRight } from 'lucide-react';

function parseBold(text) {
  if (!text) return '';
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="lumen-bold-text">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function FormattedAiMessage({ text }) {
  if (!text) return null;

  // Split by code blocks if any
  if (text.includes('```')) {
    const codeParts = text.split(/(```[\s\S]*?```)/g);
    return (
      <div className="lumen-formatted-message">
        {codeParts.map((part, idx) => {
          if (part.startsWith('```') && part.endsWith('```')) {
            const codeContent = part.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '');
            return (
              <pre key={idx} className="lumen-code-box">
                <code>{codeContent}</code>
              </pre>
            );
          }
          return <FormattedTextBlocks key={idx} text={part} />;
        })}
      </div>
    );
  }

  return (
    <div className="lumen-formatted-message">
      <FormattedTextBlocks text={text} />
    </div>
  );
}

function FormattedTextBlocks({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let currentList = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <div key={`steps-${elements.length}`} className="lumen-steps-container">
          {currentList.map((step, sIdx) => (
            <div key={sIdx} className="lumen-step-card">
              <div className="lumen-step-num">{step.num}</div>
              <div className="lumen-step-body">
                {step.title && (
                  <div className="lumen-step-title">{parseBold(step.title)}</div>
                )}
                <div className="lumen-step-desc">{parseBold(step.desc)}</div>
              </div>
            </div>
          ))}
        </div>
      );
      currentList = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    // 1. Alert Banner
    if (trimmed.startsWith('⚠️') || trimmed.toLowerCase().includes('fraud protection notice')) {
      flushList();
      elements.push(
        <div key={`alert-${i}`} className="lumen-alert-banner">
          <div className="lumen-alert-icon-box">
            <ShieldAlert size={16} color="#ef4444" />
          </div>
          <div className="lumen-alert-text">
            {parseBold(trimmed.replace(/^⚠️\s*/, ''))}
          </div>
        </div>
      );
      continue;
    }

    // 2. Numbered Steps
    const stepMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)/);
    if (stepMatch) {
      const num = stepMatch[1];
      const remainder = stepMatch[2];

      let title = '';
      let desc = remainder;

      if (remainder.includes(':')) {
        const colonIdx = remainder.indexOf(':');
        title = remainder.slice(0, colonIdx).trim();
        desc = remainder.slice(colonIdx + 1).trim();
      } else if (remainder.startsWith('**') && remainder.indexOf('**', 2) !== -1) {
        const endBold = remainder.indexOf('**', 2);
        title = remainder.slice(2, endBold).trim();
        desc = remainder.slice(endBold + 2).trim();
      }

      // Check if subsequent lines belong to this step
      while (
        i + 1 < lines.length &&
        lines[i + 1].trim() &&
        (lines[i + 1].startsWith('   ') ||
          lines[i + 1].startsWith('\t') ||
          (!lines[i + 1].trim().match(/^(\d+)[\.\)]/) &&
            !lines[i + 1].trim().startsWith('⚠️') &&
            !lines[i + 1].trim().toLowerCase().startsWith('feel free')))
      ) {
        i++;
        desc += ' ' + lines[i].trim();
      }

      currentList.push({ num, title, desc });
      continue;
    }

    flushList();

    // 3. Regular Paragraph
    elements.push(
      <p key={`p-${i}`} className="lumen-paragraph">
        {parseBold(trimmed)}
      </p>
    );
  }

  flushList();

  return <>{elements}</>;
}

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
        <p className="lumen-hero-subtitle">
          Fast, intelligent assistant for your daily mobile workflow.
        </p>

        <div className="lumen-suggestion-grid">
          {[
            'Summarize my financial life',
            'Can i Afford a new car under 10 laksh?',
            'I lost my job what should i do?'
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
                {isUser ? (
                  <p className="lumen-paragraph" style={{ margin: 0 }}>
                    {m.text}
                  </p>
                ) : (
                  <FormattedAiMessage text={m.text} />
                )}
              </div>
              <div className="lumen-message-time">{m.timestamp}</div>
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
