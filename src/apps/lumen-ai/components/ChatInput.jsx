import React, { useState } from 'react';
import { ArrowUp, Mic, Paperclip } from 'lucide-react';

export default function ChatInput({ onSend, isThinking }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (text.trim() && !isThinking) {
      onSend(text);
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="lumen-input-container">
      <form onSubmit={handleSubmit} className="lumen-input-box">
        <button
          type="button"
          className="lumen-action-icon"
          title="Add attachment"
          onClick={() => {}}
        >
          <Paperclip size={16} />
        </button>

        <input
          type="text"
          className="lumen-input-field"
          placeholder="Ask Lumen anything..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isThinking}
        />

        <button
          type="button"
          className="lumen-action-icon"
          title="Voice input"
          onClick={() => {}}
        >
          <Mic size={16} />
        </button>

        <button
          type="submit"
          disabled={!text.trim() || isThinking}
          className={`lumen-send-btn ${text.trim() && !isThinking ? 'ready' : ''}`}
          title="Send message"
        >
          <ArrowUp size={16} strokeWidth={2.5} />
        </button>
      </form>
    </div>
  );
}
