const STORAGE_KEY = 'gmail_messages_v1';
const ACCOUNT_KEY = 'gmail_active_account_v1';

export const gmailStorage = {
  // Starts with EMPTY array by default - no dummy old emails!
  loadEmails: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveEmails: (emails) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(emails));
    } catch {
      // ignore
    }
  },

  loadAccount: () => {
    try {
      const acc = localStorage.getItem(ACCOUNT_KEY);
      return acc ? JSON.parse(acc) : {
        name: 'Neeraj',
        email: 'neeraj@gmail.com',
        initial: 'N'
      };
    } catch {
      return {
        name: 'Neeraj',
        email: 'neeraj@gmail.com',
        initial: 'N'
      };
    }
  },

  clearAll: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
};
