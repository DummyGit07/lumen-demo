// Dispute Detection & Remediation Service for Lumen AI
// Coordinates real-time sync between Notifications, TrustScreen, ActScreen, and SimulatorPanel

import { trustStorage } from './trustStorage';
import { financeStorage } from './financeStorage';

class DisputeWorkflowService {
  constructor() {
    this.notificationTrigger = null;
    this.notificationDismiss = null;
    this.appNavigator = null;
    this.activeNotifId = null;
    this.thinkingTimer = null;
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

  // Open Lumen AI app directly on Glance tab with Transaction History open
  openTransactionHistory() {
    this.dismissActiveNotification();
    if (typeof window !== 'undefined') {
      window.__lumen_auto_open_txns = true;
    }
    if (this.appNavigator) {
      this.appNavigator('lumen_ai', 'glance', { openTransactions: true });
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('lumen_navigate_app', {
          detail: { appId: 'lumen_ai', tab: 'glance', extra: { openTransactions: true } }
        })
      );
      window.dispatchEvent(
        new CustomEvent('lumen_switch_tab', {
          detail: { tab: 'glance', openTransactions: true }
        })
      );
      [50, 150, 300, 500, 800].forEach((delay) => {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('lumen_open_transactions'));
        }, delay);
      });
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
    merchant = 'Blinkit',
    sourceName,
    timeGapSeconds = 15
  }) {
    const activeLevel = trustStorage.getDisputeAutonomyLevel(); // 'l1', 'l2', or 'l3'
    const curTxnId = currentTxn?.id || `TXN-${Date.now()}`;
    const prevTxnId = previousTxn?.id || `TXN-${Date.now() - timeGapSeconds * 1000}`;
    const formattedAmount = Number(amount || 450).toLocaleString('en-IN');
    const nowObj = new Date();
    const formattedDate = nowObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const formattedTime = nowObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // Formal dispute grievance draft - strictly NO bank account number included per requirements
    const draftEmail = `Dear ${merchant} Support Team,

I noticed an accidental duplicate charge of ₹${formattedAmount} on my recent transaction on ${formattedDate} at ${formattedTime}.

Transaction Details:
• Disputed Transaction ID: ${curTxnId}
• Original Transaction ID: ${prevTxnId}
• Disputed Amount: ₹${formattedAmount}

Please review this transaction and process a refund for the duplicate payment.

Thank you,
Neeraj`;

    const incident = {
      id: `dispute-${Date.now()}`,
      type: 'duplicate_charge',
      amount: Number(amount) || 450,
      merchant: merchant || 'Blinkit',
      sourceName: sourceName || 'Lumen Bank',
      currentTxnId: curTxnId,
      previousTxnId: prevTxnId,
      currentTxnTime: currentTxn?.timestamp || nowObj.toISOString(),
      previousTxnTime: previousTxn?.timestamp || new Date(Date.now() - timeGapSeconds * 1000).toISOString(),
      timeGapSeconds,
      autonomyLevel: activeLevel,
      status: 'detected',
      timestamp: Date.now(),
      // Autonomy States: starts at email_draft for both L2 and L3 (Gate 0 user permission)
      l2Stage: 'email_draft',
      draftEmail,
      chatMessages: [],
      isThinking: false,
      inputDraft: ''
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

    let notifBody = '';
    let notifActions = [];

    if (activeLevel === 'l1') {
      notifBody = `Detected duplicate payment of ₹${formattedAmount} to ${merchant}.\nReview transaction IDs to verify accidental charge.`;
      notifActions = [
        {
          iconOnly: 'dismiss',
          variant: 'default',
          onClick: () => {
            this.resolveDispute();
          }
        },
        {
          label: 'Review',
          variant: 'primary',
          openApp: true,
          tab: 'act',
          onClick: () => {
            this.openActScreen();
          }
        }
      ];
    } else {
      // Both L2 Semi-Autonomous & L3 Permissioned Autonomy present the Gate 0 authorization email draft
      notifBody = `Detected duplicate payment of ₹${formattedAmount} to ${merchant}.\nLumen prepared a formal dispute email for support@${merchant.toLowerCase()}.com`;
      notifActions = [
        {
          iconOnly: 'dismiss',
          variant: 'default',
          onClick: () => {
            this.resolveDispute();
          }
        },
        {
          label: 'Edit Draft',
          variant: 'default',
          openApp: true,
          tab: 'act',
          onClick: () => {
            this.openActScreen();
          }
        },
        {
          label: 'Send Email',
          variant: 'primary',
          inPlace: true,
          confirmationText: `✓ Email sent to ${merchant} Support`,
          onClick: () => {
            this.sendInitialEmail();
          }
        }
      ];
    }

    const notifPayload = {
      id: notifId,
      appId: 'lumen_ai',
      appName: 'Lumen AI',
      hideTimestamp: true,
      autonomyBadge: autonomyBadgeMap[activeLevel] || 'L2 Autonomy',
      icon: 'AlertCircle',
      title: 'Duplicate Charge Detected',
      body: notifBody,
      color: activeLevel === 'l3' ? '#10b981' : '#f59e0b',
      duration: 15000,
      onClickCard: () => {
        this.openActScreen();
      },
      actions: notifActions
    };

    if (this.notificationTrigger) {
      this.notificationTrigger(notifPayload);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('lumen_trigger_notification', { detail: notifPayload })
      );
    }

    return incident;
  }

  // L2 Flow: Send initial dispute email (transitions card to chat mode)
  sendInitialEmail(customBody) {
    const incident = trustStorage.getDisputeIncident();
    if (!incident) return;

    const bodyText = customBody || incident.draftEmail;
    const initialMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      senderName: 'You',
      text: bodyText,
      timestamp: Date.now()
    };

    const updated = {
      ...incident,
      l2Stage: 'chat_active',
      draftEmail: bodyText,
      chatMessages: [initialMsg],
      isThinking: false,
      inputDraft: ''
    };

    this.dismissActiveNotification();
    trustStorage.setDisputeIncident(updated);
  }

  // L2 Flow: User sends a manual chat message from the Act card input
  sendUserChatMessage(text) {
    if (!text || !text.trim()) return;
    const incident = trustStorage.getDisputeIncident();
    if (!incident) return;

    this.dismissActiveNotification();
    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      senderName: 'You',
      text: text.trim(),
      timestamp: Date.now()
    };

    const updated = {
      ...incident,
      chatMessages: [...(incident.chatMessages || []), userMsg],
      inputDraft: '',
      isThinking: false
    };

    trustStorage.setDisputeIncident(updated);
  }

  // L2/L3 Flow: Simulate Blinkit Support Agent response from the Simulator Panel
  simulateMerchantQuestion(type) {
    const incident = trustStorage.getDisputeIncident();
    if (!incident) return;

    if (this.thinkingTimer) {
      clearTimeout(this.thinkingTimer);
      this.thinkingTimer = null;
    }

    const merchant = incident.merchant || 'Blinkit';
    const amountStr = `₹${Number(incident.amount || 450).toLocaleString('en-IN')}`;
    const activeLevel = incident.autonomyLevel || trustStorage.getDisputeAutonomyLevel() || 'l2';
    const isL3 = activeLevel === 'l3';

    if (type === 'account_and_amount') {
      // 1. Blinkit asks for bank account number & amount
      const merchantMsg = {
        id: `msg-${Date.now()}`,
        sender: 'merchant',
        senderName: `${merchant} Support`,
        text: `Hello Neeraj, to verify and process your duplicate charge refund, please confirm your bank account number and the exact disputed amount.`,
        timestamp: Date.now()
      };

      // Grounded directly from user's actual bank account in financeStorage
      const banks = financeStorage.loadBanks();
      const matchedBank =
        banks.find(
          (b) =>
            b.id === incident.sourceId ||
            b.name === incident.sourceName ||
            b.id === 'bank-lumen' ||
            b.shortName === 'Lumen'
        ) || banks[0];
      const accNumber = matchedBank?.fullAccountNumber || matchedBank?.accountNumber || '5010 0482 7719';
      const bankName = matchedBank?.name || 'Lumen Bank';
      const draftText = `Bank Account: ${accNumber} (${bankName}), Disputed Amount: ${amountStr}. Please initiate the refund to this account.`;

      // Set thinking in incident with explicit message
      const updatedWithMsg = {
        ...incident,
        chatMessages: [...(incident.chatMessages || []), merchantMsg],
        isThinking: true,
        thinkingMessage: isL3
          ? 'Lumen AI is retrieving bank details & formulating autonomous reply'
          : 'Lumen AI is drafting reply',
        inputDraft: ''
      };
      trustStorage.setDisputeIncident(updatedWithMsg);

      // Dismiss any existing notification
      this.dismissActiveNotification();

      if (isL3) {
        // === L3 AUTONOMOUS: ZERO NOTIFICATION FOR AUTO REPLIES ===
        // 3-second thinking animation on card, then AUTONOMOUSLY send the grounded bank reply
        this.thinkingTimer = setTimeout(() => {
          const cur = trustStorage.getDisputeIncident();
          if (!cur) return;
          const userReplyMsg = {
            id: `msg-${Date.now()}`,
            sender: 'user',
            isAutonomous: true,
            senderName: 'Lumen AI (Autonomous)',
            text: draftText,
            timestamp: Date.now()
          };
          trustStorage.setDisputeIncident({
            ...cur,
            chatMessages: [...(cur.chatMessages || []), userReplyMsg],
            isThinking: false,
            thinkingMessage: null,
            inputDraft: ''
          });
          // Silent in L3: No notification banner or sound emitted
        }, 3000);
      } else {
        // === L2 SEMI-AUTONOMOUS: Quick notification IMMEDIATELY with 3s thinking animation on banner ===
        const notifId = `notif-dispute-acc-${Date.now()}`;
        this.activeNotifId = notifId;

        const notifPayload = {
          id: notifId,
          appId: 'lumen_ai',
          appName: `Lumen AI × ${merchant} Dispute`,
          hideTimestamp: true,
          autonomyBadge: 'L2 Autonomy',
          icon: 'AlertCircle',
          color: '#f59e0b',
          duration: 25000,
          isThinking: true,
          thinkingDuration: 3000,
          thinkingText: 'Lumen is drafting reply...',
          promptText: `${merchant}: "Please confirm your bank account number and disputed amount."`,
          draftText: `Lumen ready to send: A/C ${accNumber} (${bankName}) • ${amountStr}`,
          onClickCard: () => {
            this.openActScreen();
          },
          actions: [
            {
              iconOnly: 'dismiss',
              variant: 'default',
              onClick: () => {
                this.dismissActiveNotification();
              }
            },
            {
              label: 'Send Reply',
              variant: 'primary',
              inPlace: true,
              confirmationText: `✓ Sent to ${merchant} Support`,
              onClick: () => {
                this.sendUserChatMessage(draftText);
              }
            }
          ]
        };

        if (this.notificationTrigger) {
          this.notificationTrigger(notifPayload);
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('lumen_trigger_notification', { detail: notifPayload })
          );
        }

        // After 3 seconds, update incident on Act Screen so card input draft is populated and thinking stops
        this.thinkingTimer = setTimeout(() => {
          const cur = trustStorage.getDisputeIncident();
          if (!cur) return;
          trustStorage.setDisputeIncident({
            ...cur,
            isThinking: false,
            thinkingMessage: null,
            inputDraft: draftText
          });
        }, 3000);
      }
    } else if (type === 'order_id') {
      // 2. Blinkit asks for Order ID (Human input required)
      const merchantMsg = {
        id: `msg-${Date.now()}`,
        sender: 'merchant',
        senderName: `${merchant} Support`,
        text: `Could you please share your ${merchant} Order ID associated with this duplicate transaction to verify?`,
        timestamp: Date.now()
      };

      // Set thinking in incident with explicit message
      const updatedWithMsg = {
        ...incident,
        chatMessages: [...(incident.chatMessages || []), merchantMsg],
        isThinking: true,
        thinkingMessage: 'Lumen AI is checking records for Order ID',
        inputDraft: ''
      };
      trustStorage.setDisputeIncident(updatedWithMsg);

      // Dismiss existing notification
      this.dismissActiveNotification();

      if (isL3) {
        // === L3: DO NOT show notification during thinking! ===
        // Lumen AI thinks internally for 3s checking records.
        // Show notification ONLY once thinking is over, showing Lumen thought and now needs human input!
        this.thinkingTimer = setTimeout(() => {
          const cur = trustStorage.getDisputeIncident();
          if (!cur) return;
          const draftText = `My ${merchant} Order ID is [ORDER_ID]. Please verify this against the duplicate charge.`;
          trustStorage.setDisputeIncident({
            ...cur,
            isThinking: false,
            thinkingMessage: null,
            inputDraft: draftText
          });

          // Trigger notification AFTER thinking is over with input immediately available (isThinking: false)
          const notifId = `notif-dispute-order-${Date.now()}`;
          this.activeNotifId = notifId;

          const notifPayload = {
            id: notifId,
            appId: 'lumen_ai',
            appName: `Lumen AI × ${merchant} Dispute`,
            hideTimestamp: true,
            autonomyBadge: 'L3 Autonomy',
            icon: 'AlertCircle',
            color: '#10b981',
            duration: 25000,
            isThinking: false,
            promptText: `${merchant}: "Please share your ${merchant} Order ID to verify charge."`,
            hasInlineInput: true,
            inputPlaceholder: `Enter Order ID (e.g. BLK-89214)...`,
            confirmationText: '✓ Order ID sent',
            onSubmitInput: (orderId) => {
              const fullText = `My ${merchant} Order ID is ${orderId.trim()}. Please verify this against the duplicate charge.`;
              this.sendUserChatMessage(fullText);
            },
            onClickCard: () => {
              this.openActScreen();
            },
            actions: [
              {
                iconOnly: 'dismiss',
                variant: 'default',
                onClick: () => {
                  this.dismissActiveNotification();
                }
              }
            ]
          };

          if (this.notificationTrigger) {
            this.notificationTrigger(notifPayload);
          }
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('lumen_trigger_notification', { detail: notifPayload })
            );
          }
        }, 3000);
      } else {
        // === L2: Quick notification IMMEDIATELY with 3s thinking animation on the banner ===
        const notifId = `notif-dispute-order-${Date.now()}`;
        this.activeNotifId = notifId;

        const notifPayload = {
          id: notifId,
          appId: 'lumen_ai',
          appName: `Lumen AI × ${merchant} Dispute`,
          hideTimestamp: true,
          autonomyBadge: 'L2 Autonomy',
          icon: 'AlertCircle',
          color: '#f59e0b',
          duration: 25000,
          isThinking: true,
          thinkingDuration: 3000,
          thinkingText: 'Lumen is checking records for Order ID...',
          promptText: `${merchant}: "Please share your ${merchant} Order ID to verify charge."`,
          hasInlineInput: true,
          inputPlaceholder: `Enter Order ID (e.g. BLK-89214)...`,
          confirmationText: '✓ Order ID sent',
          onSubmitInput: (orderId) => {
            const fullText = `My ${merchant} Order ID is ${orderId.trim()}. Please verify this against the duplicate charge.`;
            this.sendUserChatMessage(fullText);
          },
          onClickCard: () => {
            this.openActScreen();
          },
          actions: [
            {
              iconOnly: 'dismiss',
              variant: 'default',
              onClick: () => {
                this.dismissActiveNotification();
              }
            }
          ]
        };

        if (this.notificationTrigger) {
          this.notificationTrigger(notifPayload);
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('lumen_trigger_notification', { detail: notifPayload })
          );
        }

        // At 3 seconds, update incident in trustStorage
        this.thinkingTimer = setTimeout(() => {
          const cur = trustStorage.getDisputeIncident();
          if (!cur) return;
          const draftText = `My ${merchant} Order ID is [ORDER_ID]. Please verify this against the duplicate charge.`;
          trustStorage.setDisputeIncident({
            ...cur,
            isThinking: false,
            thinkingMessage: null,
            inputDraft: draftText
          });
        }, 3000);
      }
    } else if (type === 'send_money') {
      // 3. Blinkit resolves the dispute and credits money
      const refundId = `TXN-REF-${Math.floor(10000 + Math.random() * 90000)}`;
      const numAmount = Number(incident.amount) || 450;

      const merchantMsg = {
        id: `msg-${Date.now()}`,
        sender: 'merchant',
        senderName: `${merchant} Support`,
        text: `We have verified the duplicate charge and credited ${amountStr} back to your Lumen account. Refund Transaction ID: ${refundId}.`,
        timestamp: Date.now()
      };

      // Record credit transaction in finance ledger
      const refundTxn = {
        id: refundId,
        recipient: `${merchant} Refund`,
        upiId: `refunds@${merchant.toLowerCase().replace(/\s+/g, '')}`,
        amount: numAmount,
        type: 'credit',
        sourceType: 'bank',
        sourceName: 'Lumen Bank',
        sourceId: 'bank-lumen',
        note: `Dispute refunded #${incident.currentTxnId}`,
        timestamp: new Date().toISOString(),
        formattedTime: 'Just now'
      };

      // Credit balance back to Lumen Bank
      const banks = financeStorage.loadBanks();
      const updatedBanks = banks.map((b) =>
        b.id === 'bank-lumen'
          ? { ...b, balance: (Number(b.balance) || 0) + numAmount }
          : b
      );
      financeStorage.saveBanks(updatedBanks, false);

      const txns = financeStorage.loadTransactions();
      financeStorage.saveTransactions([refundTxn, ...txns], false);
      financeStorage.notifyUpdate();

      // Dismiss existing notification
      this.dismissActiveNotification();

      // Trigger resolution push notification
      const notifId = `notif-refund-${Date.now()}`;
      this.activeNotifId = notifId;

      const notifPayload = {
        id: notifId,
        appId: 'lumen_ai',
        appName: 'Lumen AI',
        hideTimestamp: true,
        autonomyBadge: isL3 ? 'L3 Autonomy' : 'L2 Autonomy',
        icon: 'CheckCircle2',
        title: 'Dispute Resolved',
        body: `Dispute resolved: ${amountStr} credited to your Lumen Bank account balance.\nRefund Transaction ID: ${refundId}`,
        color: '#10b981',
        duration: 15000,
        onClickCard: () => {
          this.openTransactionHistory();
          setTimeout(() => {
            this.resolveDispute();
          }, 800);
        },
        actions: [
          {
            iconOnly: 'dismiss',
            variant: 'default',
            onClick: () => {
              this.resolveDispute();
            }
          },
          {
            label: 'View Ledger',
            variant: 'primary',
            openApp: true,
            tab: 'glance',
            appId: 'lumen_ai',
            onClick: () => {
              this.openTransactionHistory();
              setTimeout(() => {
                this.resolveDispute();
              }, 800);
            }
          }
        ]
      };

      if (this.notificationTrigger) {
        this.notificationTrigger(notifPayload);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('lumen_trigger_notification', { detail: notifPayload })
        );
      }

      // Update incident to resolved state with final message
      const resolvedIncident = {
        ...incident,
        status: 'resolved',
        l2Stage: 'resolved',
        refundTxnId: refundId,
        chatMessages: [...(incident.chatMessages || []), merchantMsg],
        isThinking: false,
        inputDraft: ''
      };
      trustStorage.setDisputeIncident(resolvedIncident);
    }
  }

  // Resolve dispute action (removes action card and clears notification)
  resolveDispute() {
    const targetId = this.activeNotifId;
    if (this.thinkingTimer) {
      clearTimeout(this.thinkingTimer);
      this.thinkingTimer = null;
    }
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
