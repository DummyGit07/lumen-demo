const STORAGE_KEY = 'lumen_ai_chat_history_v1';

export const aiStorage = {
  loadMessages: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
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
    } catch {
      // ignore
    }
  }
};
