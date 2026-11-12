// Dispute Detection & Remediation Service for Lumen AI
// Detects 2 transactions to the same merchant within 1 minute (60 seconds)
// Coordinates real-time sync between Notifications, TrustScreen, and ActScreen

import { trustStorage } from './trustStorage';
import { financeStorage } from './financeStorage';

class DisputeWorkflowService {
  constructor() {
    this.notificationTrigger = null;
    this.notificationDismiss = null;
    this.appNavigator = null;
    this.activeNotifId = null;
  }

  init({ triggerNotification, dismissNotification, navigateApp }) {
    this.notificationTrigger = triggerNotification;
    this.notificationDismiss = dismissNotification;
    this.appNavigator = navigateApp;
  }

  dismissActiveNotification() {
    if (this.activeNotifId) {
      if (this.notificationDismiss) {
        this.notificationDismiss(this.activeNotifId);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('lumen_dismiss_notification', { detail: { id: this.activeNotifId } })
        );
      }
      this.activeNotifId = null;
    }
  }

  // Open Lumen AI app directly on the Act screen
  openActScreen() {
    this.dismissActiveNotification();
    if (this.appNavigator) {
      this.appNavigator('lumen_ai', 'act');
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('lumen_navigate_app', { detail: { appId: 'lumen_ai', tab: 'act' } })
      );
      window.dispatchEvent(
        new CustomEvent('lumen_switch_tab', { detail: { tab: 'act' } })
      );
    }
  }

  // Check if a new payment is a duplicate of a transaction made within the past 60 seconds
  checkForDuplicatePayment(newTxn) {
    if (!newTxn || !newTxn.recipient) return false;

    const txns = financeStorage.loadTransactions();
    const now = Date.now();
    const candidateRecipient = newTxn.recipient.trim().toLowerCase();

    // Look for previous transaction to the same recipient made within 60 seconds (excluding the current one)
    const duplicateMatch = txns.find((t) => {
      if (t.id === newTxn.id || !t.recipient || !t.timestamp) return false;
      const sameMerchant = t.recipient.trim().toLowerCase() === candidateRecipient;
      const tTime = new Date(t.timestamp).getTime();
      const diffMs = now - tTime;
      // Made within 60 seconds (0 to 60000ms)
      return sameMerchant && diffMs >= 0 && diffMs <= 60000;
    });

    if (duplicateMatch) {
      const timeGapSeconds = Math.max(
        1,
        Math.round((now - new Date(duplicateMatch.timestamp).getTime()) / 1000)
      );

      this.triggerDuplicateDispute({
        currentTxn: newTxn,
        previousTxn: duplicateMatch,
        amount: newTxn.amount,
        merchant: newTxn.recipient,
        sourceName: newTxn.sourceName || 'Lumen Account',
        timeGapSeconds
      });
      return true;
    }

    return false;
  }

  // Trigger dispute workflow when a duplicate is identified
  triggerDuplicateDispute({
    currentTxn,
    previousTxn,
    amount,
    merchant,
    sourceName,
    timeGapSeconds = 15
  }) {
    const activeLevel = trustStorage.getDisputeAutonomyLevel(); // 'l1', 'l2', or 'l3'

    const incident = {
      id: `dispute-${Date.now()}`,
      type: 'duplicate_charge',
      amount: Number(amount) || 0,
      merchant: merchant || 'Unknown Merchant',
      sourceName: sourceName || 'Primary Account',
      currentTxnId: currentTxn?.id || `TXN-${Date.now()}`,
      previousTxnId: previousTxn?.id || `TXN-${Date.now() - timeGapSeconds * 1000}`,
      currentTxnTime: currentTxn?.timestamp || new Date().toISOString(),
      previousTxnTime: previousTxn?.timestamp || new Date(Date.now() - timeGapSeconds * 1000).toISOString(),
      timeGapSeconds,
      autonomyLevel: activeLevel,
      status: 'detected',
      timestamp: Date.now()
    };

    // Save incident to trust storage
    trustStorage.setDisputeIncident(incident);

    // Dismiss existing notification if any
    this.dismissActiveNotification();

    // Trigger interactive push notification
    const notifId = `notif-dispute-${Date.now()}`;
    this.activeNotifId = notifId;

    const autonomyBadgeMap = {
      l1: 'L1 Autonomy',
      l2: 'L2 Autonomy',
      l3: 'L3 Autonomy'
    };

    const notifPayload = {
      id: notifId,
      appId: 'lumen_ai',
      appName: 'Lumen',
      autonomyBadge: autonomyBadgeMap[activeLevel] || 'L1 Autonomy',
      icon: 'AlertCircle',
      title: 'Duplicate Charge Detected',
      body: `Lumen AI detected a duplicate payment of ₹${Number(amount).toLocaleString('en-IN')} to ${merchant}. Tap to review.`,
      color: '#f59e0b',
      duration: 10000,
      // Clicking notification banner body navigates to act page
      onClickCard: () => {
        this.openActScreen();
      },
      actions: [
        {
          label: 'View',
          variant: 'primary',
          onClick: () => {
            this.openActScreen();
          }
        },
        {
          label: 'Mark as read',
          variant: 'ghost',
          onClick: () => {
            this.resolveDispute();
          }
        }
      ]
    };

    if (this.notificationTrigger) {
      this.notificationTrigger(notifPayload);
    }

    // Always dispatch global event for fallback reliability
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('lumen_trigger_notification', { detail: notifPayload })
      );
    }

    return incident;
  }

  // Resolve dispute action (removes action card and clears notification)
  resolveDispute() {
    const targetId = this.activeNotifId;
    trustStorage.clearDisputeIncident();
    this.dismissActiveNotification();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('lumen_dismiss_notification', {
          detail: { id: targetId, filterDisputes: true }
        })
      );
    }
  }

  // Simulate duplicate payment from simulator with genuine ledger entries
  simulateDuplicateDispute({ amount = 450, merchant = 'Blinkit' } = {}) {
    const banks = financeStorage.loadBanks();
    const primaryBank = banks[0] || { id: 'bank-lumen', name: 'Lumen Bank', balance: 50000 };
    const numAmount = Number(amount) || 450;

    const now = Date.now();
    const timeGap = 16; // 16 seconds ago
    const previousTime = new Date(now - timeGap * 1000).toISOString();
    const currentTime = new Date(now).toISOString();

    const previousTxn = {
      id: `TXN-${now - timeGap * 1000}`,
      recipient: merchant,
      upiId: `${merchant.toLowerCase().replace(/\s+/g, '')}@icici`,
      amount: numAmount,
      type: 'debit',
      sourceType: 'bank',
      sourceName: primaryBank.name,
      sourceId: primaryBank.id,
      note: 'Payment transfer',
      timestamp: previousTime,
      formattedTime: 'Just now'
    };

    const currentTxn = {
      id: `TXN-${now}`,
      recipient: merchant,
      upiId: `${merchant.toLowerCase().replace(/\s+/g, '')}@icici`,
      amount: numAmount,
      type: 'debit',
      sourceType: 'bank',
      sourceName: primaryBank.name,
      sourceId: primaryBank.id,
      note: 'Payment transfer',
      timestamp: currentTime,
      formattedTime: 'Just now'
    };

    // Update real transaction history and account balance in financeStorage
    const txns = financeStorage.loadTransactions();
    const updatedTxns = [currentTxn, previousTxn, ...txns];

    const updatedBanks = banks.map((b) =>
      b.id === primaryBank.id
        ? { ...b, balance: Math.max(0, (Number(b.balance) || 0) - numAmount * 2) }
        : b
    );

    financeStorage.saveBanks(updatedBanks, false);
    financeStorage.saveTransactions(updatedTxns, false);
    financeStorage.notifyUpdate();

    // Trigger dispute workflow
    return this.triggerDuplicateDispute({
      currentTxn,
      previousTxn,
      amount: numAmount,
      merchant,
      sourceName: primaryBank.name,
      timeGapSeconds: timeGap
    });
  }
}

export const disputeWorkflow = new DisputeWorkflowService();

