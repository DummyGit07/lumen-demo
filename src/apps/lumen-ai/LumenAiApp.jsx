import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Trash2 } from 'lucide-react';
import { useLumenFinance } from './hooks/useLumenFinance';
import { useLumenAi } from './hooks/useLumenAi';

import GlanceScreen from './components/GlanceScreen';
import LumenBottomNav from './components/LumenBottomNav';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import DummyScreen from './components/DummyScreen';

export default function LumenAiApp() {
  const [activeTab, setActiveTab] = useState('glance'); // 'glance' | 'ask' | 'act' | 'trust'

  // Financial Dashboard State
  const finance = useLumenFinance();

  // AI Assistant Chat State (for 'ask' tab)
  const { messages, isThinking, sendMessage, clearChat } = useLumenAi();

  return (
    <div className="lumen-app-root">
      {/* Dynamic Screen Viewport */}
      <div className="lumen-screen-content">
        <AnimatePresence mode="wait">
          {activeTab === 'glance' && (
            <motion.div
              key="tab-glance"
              className="lumen-tab-pane"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <GlanceScreen
                finance={finance}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            </motion.div>
          )}

          {activeTab === 'ask' && (
            <motion.div
              key="tab-ask"
              className="lumen-tab-pane lumen-ask-pane"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {/* Ask Header */}
              <div className="lumen-header">
                <div className="lumen-header-left">
                  <div className="lumen-header-logo">
                    <span>L</span>
                  </div>
                  <div>
                    <div className="lumen-app-title">Lumen Assistant</div>
                    <div className="lumen-model-badge">
                      <span className="online-indicator" />
                      <span>Financial Advisor</span>
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

              {/* Chat Stream */}
              <div className="lumen-body">
                <MessageList
                  messages={messages}
                  isThinking={isThinking}
                  onSelectSuggestion={(prompt) => sendMessage(prompt)}
                />
              </div>

              {/* Input */}
              <ChatInput onSend={sendMessage} isThinking={isThinking} />
            </motion.div>
          )}

          {(activeTab === 'act' || activeTab === 'trust') && (
            <motion.div
              key={`tab-${activeTab}`}
              className="lumen-tab-pane"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <DummyScreen
                tab={activeTab}
                onNavigateGlance={() => setActiveTab('glance')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4-Tab Bottom Navigation Bar (Glance, Ask, Act, Trust) */}
      <LumenBottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
}
