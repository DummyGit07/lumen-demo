import { useState, useEffect, useCallback } from 'react';
import { aiStorage } from '../services/aiStorage';

export function useLumenAi() {
  const [messages, setMessages] = useState(() => aiStorage.loadMessages());
  const [isThinking, setIsThinking] = useState(false);

  // Sync to local storage whenever messages update
  useEffect(() => {
    aiStorage.saveMessages(messages);
  }, [messages]);

  const sendMessage = useCallback((promptText) => {
    if (!promptText.trim() || isThinking) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: promptText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    // Dynamic response generation
    setTimeout(() => {
      const query = promptText.toLowerCase();
      let responseText = '';

      if (query.includes('hello') || query.includes('hi')) {
        responseText = 'Hello! I am Lumen AI. How can I assist you with your day, apps, or research?';
      } else if (query.includes('weather')) {
        responseText = 'It is currently 72°F (22°C) and sunny with a light breeze. A great day to be outside!';
      } else if (query.includes('code') || query.includes('react') || query.includes('javascript')) {
        responseText = 'Here is a quick tip:\n```javascript\n// State & effect optimization\nconst memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);\n```\nLet me know what you are building!';
      } else if (query.includes('email') || query.includes('gmail')) {
        responseText = 'You have your Gmail app right on your home screen! You can compose or review mail with full offline storage.';
      } else {
        responseText = `I've analyzed: "${promptText}". Everything looks optimized and ready. Let me know if you need any follow-up actions or calculations!`;
      }

      const aiMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsThinking(false);
    }, 1100);
  }, [isThinking]);

  const clearChat = useCallback(() => {
    setMessages([]);
    aiStorage.clearMessages();
  }, []);

  return {
    messages,
    isThinking,
    sendMessage,
    clearChat
  };
}
