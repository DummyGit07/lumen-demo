import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Trash2 } from 'lucide-react';
import { useLumenFinance } from './hooks/useLumenFinance';
import { useLumenAi } from './hooks/useLumenAi';
import { fraudWorkflow } from './services/fraudWorkflow';

import GlanceScreen from './components/GlanceScreen';
import LumenBottomNav from './components/LumenBottomNav';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import ActScreen from './components/ActScreen';
import TrustScreen from './components/TrustScreen';

export default function LumenAiApp({
  initialTab = 'glance',
  activeTabProp,
  onTabChange,
  autoOpenDigitalCard = false,
  onClearAutoOpenCard
}) {
  const [activeTab, setActiveTab] = useState(activeTabProp || initialTab); // 'glance' | 'ask' | 'act' | 'trust'
  const [autoOpenCard, setAutoOpenCard] = useState(Boolean(autoOpenDigitalCard));
  const chatBodyRef = useRef(null);

  // Sync if parent passes activeTabProp
  useEffect(() => {
    if (activeTabProp && activeTabProp !== activeTab) {
      setActiveTab(activeTabProp);
    }
  }, [activeTabProp]);

  // Sync if parent passes autoOpenDigitalCard
  useEffect(() => {
    if (autoOpenDigitalCard) {
      setAutoOpenCard(true);
    }
  }, [autoOpenDigitalCard]);

  // Financial Dashboard State
  const finance = useLumenFinance();

  // AI Assistant Chat State (for 'ask' tab)
  const { messages, isThinking, sendMessage, addDirectAssistantMessage, clearChat } = useLumenAi();

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
    if (tab === 'ask') {
      setTimeout(() => {
        if (chatBodyRef.current) {
          chatBodyRef.current.scrollTop = 0;
        }
      }, 50);
    }
  };

  // Register chat messenger & card opener with fraudWorkflow
  useEffect(() => {
    fraudWorkflow.setChatMessenger(addDirectAssistantMessage);
    fraudWorkflow.setGlanceCardOpener(() => {
      setActiveTab('glance');
      setAutoOpenCard(true);
      if (onTabChange) onTabChange('glance');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('lumen_open_digital_card'));
      }, 100);
    });
  }, [addDirectAssistantMessage, onTabChange]);

  // Listen to tab switch events from external workflows
  useEffect(() => {
    const handleSwitch = (e) => {
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab);
        if (onTabChange) onTabChange(e.detail.tab);
        if (e.detail.tab === 'ask') {
          setTimeout(() => {
            if (chatBodyRef.current) {
              chatBodyRef.current.scrollTop = 0;
            }
          }, 50);
        }
      }
      if (e.detail?.openDigitalCard) {
        setAutoOpenCard(true);
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('lumen_open_digital_card'));
        }, 100);
      }
    };
    window.addEventListener('lumen_switch_tab', handleSwitch);
    return () => window.removeEventListener('lumen_switch_tab', handleSwitch);
  }, [onTabChange]);

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
                onNavigateTab={handleTabSwitch}
                autoOpenDigitalCard={autoOpenCard}
                onResetAutoOpen={() => {
                  setAutoOpenCard(false);
                  if (onClearAutoOpenCard) onClearAutoOpenCard();
                }}
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
              <div className="lumen-body" ref={chatBodyRef}>
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

          {activeTab === 'act' && (
            <motion.div
              key="tab-act"
              className="lumen-tab-pane"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <ActScreen
                onNavigateTab={handleTabSwitch}
              />
            </motion.div>
          )}

          {activeTab === 'trust' && (
            <motion.div
              key="tab-trust"
              className="lumen-tab-pane"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <TrustScreen
                onNavigateTab={handleTabSwitch}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4-Tab Bottom Navigation Bar (Glance, Ask, Act, Trust) */}
      <LumenBottomNav activeTab={activeTab} onSelectTab={handleTabSwitch} />
    </div>
  );
}
