// Persistent Storage and Seed Generator for Lumen Finance Dashboard

const STORAGE_KEY_BANKS = 'lumen_finance_banks_v1';
const STORAGE_KEY_CARDS = 'lumen_finance_cards_v1';
const STORAGE_KEY_TXNS = 'lumen_finance_txns_v1';

// Card Brand Identification based on Prefix/BIN ranges & Lengths
export function detectCardBrand(cardNumber) {
  if (!cardNumber) return 'Infinite';
  const clean = String(cardNumber).replace(/\D/g, '');
  const len = clean.length;

  // 1. Visa: Prefix 4, Length 13, 16, or 19
  if (/^4/.test(clean) && (len === 13 || len === 16 || len === 19)) {
    return 'Visa';
  }

  // 2. Mastercard: 51–55 or 2221–2720, Length 16
  if (len === 16) {
    const prefix2 = parseInt(clean.slice(0, 2), 10);
    const prefix4 = parseInt(clean.slice(0, 4), 10);
    if ((prefix2 >= 51 && prefix2 <= 55) || (prefix4 >= 2221 && prefix4 <= 2720)) {
      return 'Mastercard';
    }
  }

  // 3. American Express (Amex): 34 or 37, Length 15
  if (len === 15 && /^(34|37)/.test(clean)) {
    return 'Amex';
  }

  // 4. Discover: 6011, 644–649, 65, or 622126–622925, Length 16 to 19
  if (len >= 16 && len <= 19) {
    const prefix2 = parseInt(clean.slice(0, 2), 10);
    const prefix3 = parseInt(clean.slice(0, 3), 10);
    const prefix4 = parseInt(clean.slice(0, 4), 10);
    const prefix6 = parseInt(clean.slice(0, 6), 10);
    if (
      prefix4 === 6011 ||
      prefix2 === 65 ||
      (prefix3 >= 644 && prefix3 <= 649) ||
      (prefix6 >= 622126 && prefix6 <= 622925)
    ) {
      return 'Discover';
    }
  }

  // 5. Diners Club: 300–305, 36, 38, Length 14
  if (len === 14) {
    const prefix2 = parseInt(clean.slice(0, 2), 10);
    const prefix3 = parseInt(clean.slice(0, 3), 10);
    if (prefix2 === 36 || prefix2 === 38 || (prefix3 >= 300 && prefix3 <= 305)) {
      return 'Diners Club';
    }
  }

  // 6. JCB: 3528–3589, 2131, 1800, Length 15 or 16
  if (len === 15 || len === 16) {
    const prefix4 = parseInt(clean.slice(0, 4), 10);
    if ((prefix4 >= 3528 && prefix4 <= 3589) || prefix4 === 2131 || prefix4 === 1800) {
      return 'JCB';
    }
  }

  // If none of them match: fallback to Infinite
  return 'Infinite';
}

export const DEFAULT_BANKS = [
  {
    id: 'bank-lumen',
    name: 'Lumen Bank',
    shortName: 'Lumen',
    accountNumber: '•••• 7719',
    type: 'Savings A/C',
    balance: 50000,
    currency: 'INR',
    color: 'linear-gradient(135deg, #4f46e5, #6366f1)',
    badgeColor: '#6366f1'
  },
  {
    id: 'bank-sbi',
    name: 'State Bank of India',
    shortName: 'SBI',
    accountNumber: '•••• 3042',
    type: 'Primary A/C',
    balance: 10000,
    currency: 'INR',
    color: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
    badgeColor: '#0284c7'
  }
];

export const DEFAULT_CARDS = [
  {
    id: 'card-lumen-brand',
    bankName: 'Lumen',
    name: 'Lumen Credit Card',
    cardNumber: '4028 8121 3684 8411',
    last4: '8411',
    maskedNumber: '•••• •••• •••• 8411',
    expiry: '12/31',
    cvv: '471',
    cardHolder: 'Neeraj',
    status: 'active', // 'active' | 'freezed'
    outstanding: 10000,
    creditLimit: 150000,
    currency: 'INR',
    cardType: 'Credit Card',
    gradient: 'linear-gradient(135deg, #181926 0%, #2e2640 45%, #4f3b78 100%)',
    accent: '#a855f7'
  }
];

export const financeStorage = {
  loadBanks: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_BANKS);
      return data ? JSON.parse(data) : DEFAULT_BANKS;
    } catch {
      return DEFAULT_BANKS;
    }
  },

  saveBanks: (banks) => {
    try {
      localStorage.setItem(STORAGE_KEY_BANKS, JSON.stringify(banks));
    } catch (e) {
      console.warn('Failed to save bank accounts:', e);
    }
  },

  loadCards: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CARDS);
      if (!data) return DEFAULT_CARDS;
      const parsed = JSON.parse(data);
      return parsed.map((c, i) => ({
        ...DEFAULT_CARDS[i],
        ...c,
        status: c.status || DEFAULT_CARDS[i]?.status || 'active',
        cardNumber: DEFAULT_CARDS[i]?.cardNumber || c.cardNumber,
        cardHolder: DEFAULT_CARDS[i]?.cardHolder || c.cardHolder,
        cvv: DEFAULT_CARDS[i]?.cvv || c.cvv,
        expiry: DEFAULT_CARDS[i]?.expiry || c.expiry,
        last4: DEFAULT_CARDS[i]?.last4 || c.last4
      }));
    } catch {
      return DEFAULT_CARDS;
    }
  },

  saveCards: (cards) => {
    try {
      localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(cards));
    } catch (e) {
      console.warn('Failed to save credit cards:', e);
    }
  },

  loadTransactions: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_TXNS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveTransactions: (txns) => {
    try {
      localStorage.setItem(STORAGE_KEY_TXNS, JSON.stringify(txns));
    } catch (e) {
      console.warn('Failed to save transactions:', e);
    }
  },

  resetAll: () => {
    try {
      localStorage.removeItem(STORAGE_KEY_BANKS);
      localStorage.removeItem(STORAGE_KEY_CARDS);
      localStorage.removeItem(STORAGE_KEY_TXNS);
    } catch {
      // ignore
    }
  }
};
