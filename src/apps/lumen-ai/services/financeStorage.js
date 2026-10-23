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

  // 4. Discover: 6011, 622126–622925, 644–649, 65, Length 16
  if (len === 16) {
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

  // 5. Diners Club: 36, 38, or 300–305, Length 14
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

export const DEFAULT_TRANSACTIONS = [
  {
    id: 'txn-seed-1',
    recipient: 'Starbucks Coffee',
    upiId: 'starbucks@hdfcbank',
    amount: 380,
    type: 'debit',
    sourceType: 'bank',
    sourceName: 'Lumen Bank',
    sourceId: 'bank-lumen',
    note: 'Espresso & Croissant',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    formattedTime: '3 hrs ago'
  },
  {
    id: 'txn-seed-2',
    recipient: 'Apple Subscriptions',
    upiId: 'apple@icici',
    amount: 799,
    type: 'debit',
    sourceType: 'card',
    sourceName: 'Lumen Credit Card',
    sourceId: 'card-lumen-brand',
    note: 'iCloud+ 2TB Family',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    formattedTime: 'Yesterday'
  }
];

export const financeStorage = {
  notifyUpdate: () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lumen_finance_updated'));
    }
  },

  loadBanks: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_BANKS);
      return data ? JSON.parse(data) : DEFAULT_BANKS;
    } catch {
      return DEFAULT_BANKS;
    }
  },

  saveBanks: (banks, notify = true) => {
    try {
      localStorage.setItem(STORAGE_KEY_BANKS, JSON.stringify(banks));
      if (notify) {
        financeStorage.notifyUpdate();
      }
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
        status: c.status || 'active',
        cardNumber: c.cardNumber || DEFAULT_CARDS[i]?.cardNumber,
        cardHolder: c.cardHolder || DEFAULT_CARDS[i]?.cardHolder,
        cvv: c.cvv || DEFAULT_CARDS[i]?.cvv,
        expiry: c.expiry || DEFAULT_CARDS[i]?.expiry,
        last4: c.last4 || (c.cardNumber ? c.cardNumber.replace(/\s+/g, '').slice(-4) : DEFAULT_CARDS[i]?.last4),
        maskedNumber: c.maskedNumber || (c.last4 ? `•••• •••• •••• ${c.last4}` : DEFAULT_CARDS[i]?.maskedNumber)
      }));
    } catch {
      return DEFAULT_CARDS;
    }
  },

  saveCards: (cards, notify = true) => {
    try {
      localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(cards));
      if (notify) {
        financeStorage.notifyUpdate();
      }
    } catch (e) {
      console.warn('Failed to save credit cards:', e);
    }
  },

  loadTransactions: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_TXNS);
      if (!data) return DEFAULT_TRANSACTIONS;
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : DEFAULT_TRANSACTIONS;
    } catch {
      return DEFAULT_TRANSACTIONS;
    }
  },

  saveTransactions: (txns, notify = true) => {
    try {
      localStorage.setItem(STORAGE_KEY_TXNS, JSON.stringify(txns));
      if (notify) {
        financeStorage.notifyUpdate();
      }
    } catch (e) {
      console.warn('Failed to save transactions:', e);
    }
  },

  // Helper to freeze a specific card
  freezeCard: (cardId) => {
    const cards = financeStorage.loadCards();
    const updated = cards.map((c) =>
      c.id === cardId || (!cardId && c.id === 'card-lumen-brand')
        ? { ...c, status: 'freezed' }
        : c
    );
    financeStorage.saveCards(updated, true);
    return updated;
  },

  // Helper to unfreeze a specific card
  unfreezeCard: (cardId) => {
    const cards = financeStorage.loadCards();
    const updated = cards.map((c) =>
      c.id === cardId || (!cardId && c.id === 'card-lumen-brand')
        ? { ...c, status: 'active' }
        : c
    );
    financeStorage.saveCards(updated, true);
    return updated;
  },

  // Helper to generate a new valid random credit card and replace credentials
  generateAndReplaceCard: (cardId) => {
    const cards = financeStorage.loadCards();
    const target = cards.find((c) => c.id === cardId) || cards[0];

    // Generate random Visa 16-digit card number (starts with 4)
    const randomDigits = Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join('');
    const fullNumber = `4${randomDigits}`;
    const formattedNumber = `${fullNumber.slice(0, 4)} ${fullNumber.slice(4, 8)} ${fullNumber.slice(8, 12)} ${fullNumber.slice(12, 16)}`;
    const last4 = fullNumber.slice(-4);

    // Random future expiry (e.g. 3-5 years ahead)
    const futureYear = (new Date().getFullYear() + 4).toString().slice(-2);
    const randomMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const expiry = `${randomMonth}/${futureYear}`;

    // Random 3 digit CVV
    const cvv = String(Math.floor(100 + Math.random() * 900));

    const updatedCard = {
      ...target,
      cardNumber: formattedNumber,
      maskedNumber: `•••• •••• •••• ${last4}`,
      last4,
      expiry,
      cvv,
      status: 'active', // Restores to active!
      outstanding: Math.max(0, (target.outstanding || 0) - 4850) // remove fraud amount
    };

    const updatedCards = cards.map((c) => (c.id === target.id ? updatedCard : c));
    financeStorage.saveCards(updatedCards, true);
    return updatedCard;
  },

  // Helper to inject a simulated fraudulent transaction
  injectFraudTransaction: ({
    amount = 4850,
    merchant = 'Unknown Global POS • Dublin',
    cardId = 'card-lumen-brand'
  } = {}) => {
    const cards = financeStorage.loadCards();
    const targetCard = cards.find((c) => c.id === cardId) || cards[0];

    // Increase credit card outstanding
    const updatedCards = cards.map((c) =>
      c.id === targetCard.id
        ? { ...c, outstanding: (Number(c.outstanding) || 0) + amount }
        : c
    );

    // Add suspicious debit transaction
    const txns = financeStorage.loadTransactions();
    const fraudTxn = {
      id: `fraud-${Date.now()}`,
      recipient: merchant,
      upiId: 'flagged_merchant@intl-pos',
      amount,
      type: 'debit',
      sourceType: 'card',
      sourceName: `${targetCard.bankName || 'Lumen'} Card (•••• ${targetCard.last4 || '8411'})`,
      sourceId: targetCard.id,
      note: 'FLAGGED: Suspicious Card Transaction',
      timestamp: new Date().toISOString(),
      formattedTime: 'Just now',
      isFlagged: true
    };

    const updatedTxns = [fraudTxn, ...txns];

    // Atomic write: Save both without intermediate events, then fire one single update notification
    financeStorage.saveCards(updatedCards, false);
    financeStorage.saveTransactions(updatedTxns, false);
    financeStorage.notifyUpdate();

    return {
      card: targetCard,
      txn: fraudTxn,
      last4: targetCard.last4 || '8411'
    };
  },

  resetAll: () => {
    try {
      localStorage.removeItem(STORAGE_KEY_BANKS);
      localStorage.removeItem(STORAGE_KEY_CARDS);
      localStorage.removeItem(STORAGE_KEY_TXNS);
      financeStorage.notifyUpdate();
    } catch {
      // ignore
    }
  }
};
