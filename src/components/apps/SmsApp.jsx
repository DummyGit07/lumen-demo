import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, ChevronRight, MessageSquare } from 'lucide-react';

const INITIAL_THREADS = [
  {
    id: '1',
    sender: 'Alex Morgan',
    phone: '+1 (555) 234-5678',
    lastMessage: 'Are we still meeting up this evening?',
    time: '11:20 AM',
    messages: [
      { id: 1, text: 'Hey! Did you get the project files?', sender: 'them', time: '11:15 AM' },
      { id: 2, text: 'Yes, looking over them now.', sender: 'me', time: '11:18 AM' },
      { id: 3, text: 'Are we still meeting up this evening?', sender: 'them', time: '11:20 AM' },
    ]
  },
  {
    id: '2',
    sender: 'Bank Alert',
    phone: '2468',
    lastMessage: 'Your one-time code is 849201. Valid for 5 mins.',
    time: 'Yesterday',
    messages: [
      { id: 1, text: 'Your one-time security code is 849201. Valid for 5 minutes. Do not share this with anyone.', sender: 'them', time: 'Yesterday' }
    ]
  },
  {
    id: '3',
    sender: 'Delivery Service',
    phone: '+1 (555) 890-1234',
    lastMessage: 'Your package has been placed by the front door.',
    time: 'Oct 21',
    messages: [
      { id: 1, text: 'Your package #4912 has been placed by the front door. Thank you!', sender: 'them', time: 'Oct 21' }
    ]
  }
];

export default function SmsApp({ internalScreen, setInternalScreen }) {
  const [threads, setThreads] = useState(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [inputText, setInputText] = useState('');

  const activeThread = threads.find((t) => t.id === activeThreadId);

  const handleOpenThread = (id) => {
    setActiveThreadId(id);
    setInternalScreen('thread');
  };

  const handleSend = () => {
    if (!inputText.trim() || !activeThreadId) return;

    const newMsg = {
      id: Date.now(),
      text: inputText,
      sender: 'me',
      time: 'Just now'
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            lastMessage: inputText,
            time: 'Just now',
            messages: [...t.messages, newMsg]
          };
        }
        return t;
      })
    );

    const sent = inputText;
    setInputText('');

    // Simulate response
    setTimeout(() => {
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id === activeThreadId) {
            return {
              ...t,
              lastMessage: 'Sounds good to me!',
              time: 'Just now',
              messages: [
                ...t.messages,
                {
                  id: Date.now() + 1,
                  text: 'Sounds good to me!',
                  sender: 'them',
                  time: 'Just now'
                }
              ]
            };
          }
          return t;
        })
      );
    }, 1200);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0d14', color: '#fff' }}>
      <AnimatePresence mode="wait">
        {internalScreen === 'thread' && activeThread ? (
          /* Active Thread View */
          <motion.div
            key="thread-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            {/* Header info */}
            <div
              style={{
                padding: '0.75rem 1rem',
                background: '#121622',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}
              >
                <User size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{activeThread.sender}</div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{activeThread.phone}</div>
              </div>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem'
              }}
            >
              {activeThread.messages.map((m) => {
                const isMe = m.sender === 'me';
                return (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                      background: isMe ? '#2563eb' : '#1e2433',
                      color: '#fff',
                      padding: '0.6rem 0.85rem',
                      borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      fontSize: '0.8rem',
                      lineHeight: '1.4'
                    }}
                  >
                    <div>{m.text}</div>
                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)', marginTop: '3px', textAlign: 'right' }}>
                      {m.time}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <div
              style={{
                padding: '0.6rem 0.8rem',
                background: '#121622',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <input
                type="text"
                placeholder="Text message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  padding: '0.5rem 0.85rem',
                  color: '#fff',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSend}
                style={{
                  background: '#2563eb',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        ) : (
          /* Threads List View */
          <motion.div
            key="list-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700 }}>Messages</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => handleOpenThread(thread.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.85rem 1rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer'
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'rgba(37, 99, 235, 0.2)',
                      border: '1px solid rgba(37, 99, 235, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#60a5fa'
                    }}
                  >
                    <User size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{thread.sender}</span>
                      <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{thread.time}</span>
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#94a3b8',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {thread.lastMessage}
                    </div>
                  </div>
                  <ChevronRight size={14} color="#64748b" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
