import { useState, useEffect, useMemo } from 'react';
import {
  financeStorage,
  DEFAULT_BANKS,
  DEFAULT_CARDS
} from '../services/financeStorage';

export function useLumenFinance() {
  const [banks, setBanks] = useState(() => financeStorage.loadBanks());
  const [cards, setCards] = useState(() => financeStorage.loadCards());
  const [transactions, setTransactions] = useState(() => financeStorage.loadTransactions());

  // Listen to external updates (fraud simulation, card replacement, freezing)
  useEffect(() => {
    const handleUpdate = () => {
      setBanks(financeStorage.loadBanks());
      setCards(financeStorage.loadCards());
      setTransactions(financeStorage.loadTransactions());
    };

    window.addEventListener('lumen_finance_updated', handleUpdate);
    return () => window.removeEventListener('lumen_finance_updated', handleUpdate);
  }, []);

  // Save to persistent storage whenever state changes
  useEffect(() => {
    financeStorage.saveBanks(banks);
  }, [banks]);

  useEffect(() => {
    financeStorage.saveCards(cards);
  }, [cards]);

  useEffect(() => {
    financeStorage.saveTransactions(transactions);
  }, [transactions]);

  // Dynamically calculate total liquid bank balance
  const totalBankBalance = useMemo(() => {
    return banks.reduce((sum, b) => sum + (Number(b.balance) || 0), 0);
  }, [banks]);

  // Dynamically calculate total credit card outstanding
  const totalCreditOutstanding = useMemo(() => {
    return cards.reduce((sum, c) => sum + (Number(c.outstanding) || 0), 0);
  }, [cards]);

  // Execute payment transaction from connected Bank or Credit Card
  const executePayment = ({
    recipient,
    upiId = '',
    amount,
    paymentMethodId,
    note = 'UPI Transfer'
  }) => {
    const numAmount = parseFloat(amount);
    if (!recipient || isNaN(numAmount) || numAmount <= 0) {
      return { success: false, error: 'Please enter a valid recipient and amount' };
    }

    // 1. Check if paying from a Bank Account
    const targetBank = banks.find((b) => b.id === paymentMethodId);
    if (targetBank) {
      if (targetBank.balance < numAmount) {
        return {
          success: false,
          error: `Insufficient balance in ${targetBank.name} (Available: ₹${targetBank.balance.toLocaleString('en-IN')})`
        };
      }

      // Deduct balance from the bank
      const updatedBanks = banks.map((b) =>
        b.id === paymentMethodId
          ? { ...b, balance: b.balance - numAmount }
          : b
      );

      const newTxn = {
        id: `txn-${Date.now()}`,
        recipient,
        upiId: upiId || `${recipient.toLowerCase().replace(/\s+/g, '')}@okaxis`,
        amount: numAmount,
        type: 'debit',
        sourceType: 'bank',
        sourceName: targetBank.name,
        sourceId: targetBank.id,
        note: note || 'Payment transfer',
        timestamp: new Date().toISOString(),
        formattedTime: 'Just now'
      };

      setBanks(updatedBanks);
      setTransactions((prev) => [newTxn, ...prev]);
      return { success: true, txn: newTxn };
    }

    // 2. Check if paying from a Credit Card
    const targetCard = cards.find((c) => c.id === paymentMethodId);
    if (targetCard) {
      if (targetCard.status === 'freezed') {
        return {
          success: false,
          error: 'This credit card is currently freezed. Please unfreeze it to perform payments.'
        };
      }

      const remainingLimit = targetCard.creditLimit - targetCard.outstanding;
      if (numAmount > remainingLimit) {
        return {
          success: false,
          error: `Card limit exceeded. Remaining available limit: ₹${remainingLimit.toLocaleString('en-IN')}`
        };
      }

      // Increase outstanding amount on the credit card
      const updatedCards = cards.map((c) =>
        c.id === paymentMethodId
          ? { ...c, outstanding: c.outstanding + numAmount }
          : c
      );

      const newTxn = {
        id: `txn-${Date.now()}`,
        recipient,
        upiId: upiId || `${recipient.toLowerCase().replace(/\s+/g, '')}@lumenpay`,
        amount: numAmount,
        type: 'debit',
        sourceType: 'card',
        sourceName: `${targetCard.bankName || 'Lumen'} Credit Card`,
        sourceId: targetCard.id,
        note: note || 'Card payment',
        timestamp: new Date().toISOString(),
        formattedTime: 'Just now'
      };

      setCards(updatedCards);
      setTransactions((prev) => [newTxn, ...prev]);
      return { success: true, txn: newTxn };
    }

    return { success: false, error: 'Please select a valid payment method' };
  };

  // Toggle Card Freeze/Active Status
  const toggleCardStatus = (cardId) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? { ...c, status: c.status === 'freezed' ? 'active' : 'freezed' }
          : c
      )
    );
  };

  const resetToDefault = () => {
    financeStorage.resetAll();
    setBanks(DEFAULT_BANKS);
    setCards(DEFAULT_CARDS);
    setTransactions([]);
  };

  return {
    banks,
    cards,
    transactions,
    totalBankBalance,
    totalCreditOutstanding,
    executePayment,
    toggleCardStatus,
    resetToDefault
  };
}
