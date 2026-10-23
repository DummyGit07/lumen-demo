const STORAGE_KEY = 'lumen_ai_chat_history_v1';

export const aiStorage = {
  loadMessages: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];

      // Automatically prune duplicate consecutive or identical messages
      const cleaned = parsed.filter((msg, idx, arr) => {
        if (idx === 0) return true;
        const prev = arr[idx - 1];
        return !(prev.role === msg.role && prev.text?.trim() === msg.text?.trim());
      });

      return cleaned;
    } catch {
      return [];
    }
  },

  saveMessages: (messages) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // storage quota or blocked, ignore
    }
  },

  clearMessages: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lumen_ai_messages_updated'));
      }
    } catch {
      // ignore
    }
  },

  appendMessage: (msg) => {
    try {
      const current = aiStorage.loadMessages();

      // De-duplication check: avoid adding identical text message if it's already the last message
      if (
        current.length > 0 &&
        current[current.length - 1].role === msg.role &&
        current[current.length - 1].text?.trim() === msg.text?.trim()
      ) {
        return current;
      }

      const updated = [...current, msg];
      aiStorage.saveMessages(updated);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lumen_ai_messages_updated'));
      }
      return updated;
    } catch {
      return [];
    }
  }
};
