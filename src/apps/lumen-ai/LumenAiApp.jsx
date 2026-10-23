import React from 'react';
import { Sparkles, Trash2, MoreVertical, Plus } from 'lucide-react';
import { useLumenAi } from './hooks/useLumenAi';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';

export default function LumenAiApp() {
  const { messages, isThinking, sendMessage, clearChat } = useLumenAi();

  return (
    <div className="lumen-app-root">
      {/* App Header */}
      <div className="lumen-header">
        <div className="lumen-header-left">
          <div className="lumen-header-logo">
            <span>L</span>
          </div>
          <div>
            <div className="lumen-app-title">Lumen AI</div>
            <div className="lumen-model-badge">
              <span className="online-indicator" />
              <span>Lumen 2.5 Pro</span>
            </div>
          </div>
        </div>

        <div className="lumen-header-actions">
          {messages.length > 0 && (
            <button
              className="lumen-header-btn"
              onClick={clearChat}
              title="New Chat / Clear History"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="lumen-body">
        <MessageList
          messages={messages}
          isThinking={isThinking}
          onSelectSuggestion={(prompt) => sendMessage(prompt)}
        />
      </div>

      {/* Input Area */}
      <ChatInput onSend={sendMessage} isThinking={isThinking} />
    </div>
  );
}
