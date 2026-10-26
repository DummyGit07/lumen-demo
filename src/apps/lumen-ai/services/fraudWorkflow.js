// Central Fraud Incident Workflow State Machine
// Coordinates Simulator, Notifications, ActScreen, AskScreen, and GlanceScreen

import { trustStorage } from './trustStorage';
import { financeStorage } from './financeStorage';
import { aiStorage } from './aiStorage';

class FraudWorkflowService {
  constructor() {
    this.notificationTrigger = null; // Bound by App.jsx
    this.notificationDismiss = null; // Bound by App.jsx
    this.appNavigator = null; // Bound by App.jsx
    this.askDirectMessenger = null; // Bound by LumenAiApp
    this.glanceCardOpener = null; // Bound by LumenAiApp
    this.activeNotifId = null;
  }

  init({ triggerNotification, dismissNotification, navigateApp }) {
    this.notificationTrigger = triggerNotification;
    this.notificationDismiss = dismissNotification;
    this.appNavigator = navigateApp;
  }

  setChatMessenger(fn) {
    this.askDirectMessenger = fn;
  }

  setGlanceCardOpener(fn) {
    this.glanceCardOpener = fn;
  }

  // 1. Trigger Fraud Simulation (called by SimulatorPanel)
  simulateFraud({ amount = 4850, merchant = 'Unknown Global POS • Dublin' } = {}) {
    const activeLevel = trustStorage.getAutonomyLevel(); // 'l1' or 'l3'

    // If simulating under L1, ensure the credit card is active (not left frozen from earlier tests)
    if (activeLevel === 'l1') {
      financeStorage.unfreezeCard('card-lumen-brand');
    }

    // Deduct & Record in Finance Storage
    const { card, txn, last4 } = financeStorage.injectFraudTransaction({ amount, merchant });

    // Store incident in trustStorage
    const incident = {
      id: `incident-${Date.now()}`,
      amount,
      merchant,
      cardId: card.id,
      cardLast4: last4,
      autonomyLevel: activeLevel,
      status: 'awaiting_confirmation', // waiting for user [Yes] or [No]
      timestamp: Date.now()
    };
    trustStorage.setFraudIncident(incident);

    // Show initial interactive push notification
    this.dismissActiveNotification();

    const notifId = `notif-fraud-${Date.now()}`;
    this.activeNotifId = notifId;

    if (this.notificationTrigger) {
      this.notificationTrigger({
        id: notifId,
        appId: 'lumen_ai',
        appName: 'Lumen',
        icon: 'ShieldAlert',
        title: 'Suspicious Transaction Detected',
        body: `A transaction of ₹${amount.toLocaleString('en-IN')} has been detected on your card ending with ${last4}. Have you done this transaction?`,
        color: '#ef4444',
        duration: 8000,
        actions: [
          {
            label: 'Yes, It Was Me',
            variant: 'ghost',
            onClick: () => this.handleConfirmationResponse(true)
          },
          {
            label: 'No, Not Me',
            variant: 'danger',
            onClick: () => this.handleConfirmationResponse(false)
          }
        ]
      });
    }

    return incident;
  }

  // 2. User presses [Yes] or [No] on initial fraud alert
  handleConfirmationResponse(userConfirmedLegitimate) {
    this.dismissActiveNotification();

    if (userConfirmedLegitimate) {
      // User says yes, it was them. Dismiss and clear incident.
      trustStorage.clearFraudIncident();
      return;
    }

    // User pressed NO: Fraud confirmed!
    const incident = trustStorage.getFraudIncident();
    if (!incident) return;

    const level = incident.autonomyLevel || trustStorage.getAutonomyLevel();

    if (level === 'l1') {
      this.startL1Workflow(incident);
    } else if (level === 'l2') {
      this.startL2Workflow(incident);
    } else {
      this.startL3Workflow(incident);
    }
  }

  // ==========================================
  // L1 WORKFLOW (Guided Assistance)
  // ==========================================
  startL1Workflow(incident) {
    // Explicitly guarantee the credit card is active and not frozen
    financeStorage.unfreezeCard(incident?.cardId || 'card-lumen-brand');

    const updated = {
      ...incident,
      status: 'l1_steps'
    };
    trustStorage.setFraudIncident(updated);

    // New notification for L1
    const notifId = `notif-l1-${Date.now()}`;
    this.activeNotifId = notifId;

    if (this.notificationTrigger) {
      this.notificationTrigger({
        id: notifId,
        appId: 'lumen_ai',
        appName: 'Lumen',
        icon: 'ShieldAlert',
        autonomyBadge: 'L1',
        title: 'Suspicious Charge Flagged',
        body: 'An unauthorized transaction was detected. Review the recommended steps to secure your card and request a replacement.',
        color: '#3b82f6',
        duration: 5000,
        onClickCard: () => this.executeL1NavigateToAsk(),
        actions: [
          {
            label: 'View Steps',
            variant: 'primary',
            onClick: () => this.executeL1NavigateToAsk()
          }
        ]
      });
    }
  }

  executeL1NavigateToAsk() {
    this.dismissActiveNotification();
    const incident = trustStorage.getFraudIncident();
    trustStorage.clearFraudIncident();

    // Ensure the card remains active and is NEVER left in a frozen state for L1
    financeStorage.unfreezeCard(incident?.cardId || 'card-lumen-brand');

    // Requirement: Remove previous messages before navigating to the ask page
    aiStorage.clearMessages();

    // Direct reply coming from agent (no prior user prompt)
    const amount = incident?.amount || 4850;
    const last4 = incident?.cardLast4 || '8411';
    const merchant = incident?.merchant || 'International POS Gateway';

    const detailedMessage = `⚠️ **Fraud Protection Alert — Card •••• ${last4}**
Flagged unauthorized debit of **₹${amount.toLocaleString('en-IN')}** at *${merchant}*. Follow these steps to safeguard your account:

1. **Freeze Your Credit Card**:
   Switch to the **Glance** tab, select your Card •••• ${last4}, and toggle **Freeze Card** to immediately block all domestic and international card transactions.
2. **Review & Flag Transaction**:
   Verify the unauthorized entry under **Recent Transactions** in Glance and note down the dispute reference ID.
3. **Request Card Replacement**:
   Submit a zero-liability replacement request to receive a new digital token and replacement card with fresh credentials.

Feel free to ask me anything below about filing a chargeback or verifying your balances.`;

    // Append to aiStorage as single source of truth (triggers lumen_ai_messages_updated)
    aiStorage.appendMessage({
      id: `msg-fraud-${last4}-${Date.now()}`,
      role: 'assistant',
      text: detailedMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    // Navigate to Ask screen of Lumen AI
    if (this.appNavigator) {
      this.appNavigator('lumen_ai', 'ask');
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('lumen_switch_tab', { detail: { tab: 'ask' } })
      );
    }
  }

  // ==========================================
  // L2 WORKFLOW (Semi-Autonomous: Two-Step Manual Approval)
  // ==========================================
  startL2Workflow(incident) {
    const updated = {
      ...incident,
      status: 'l2_freeze_prompt'
    };
    trustStorage.setFraudIncident(updated);

    // Notification for L2 initial prompt: Lock Card
    const notifId = `notif-l2-freeze-${Date.now()}`;
    this.activeNotifId = notifId;

    if (this.notificationTrigger) {
      this.notificationTrigger({
        id: notifId,
        appId: 'lumen_ai',
        appName: 'Lumen',
        icon: 'Lock',
        autonomyBadge: 'L2',
        title: 'Suspicious Charge Flagged',
        body: 'We detected an unauthorized charge. We recommend locking this card immediately to prevent further charges.',
        color: '#f59e0b',
        duration: 5000,
        actions: [
          {
            label: 'Lock Card',
            variant: 'danger',
            onClick: () => this.executeL2Freeze()
          }
        ]
      });
    }
  }

  // L2 Step 1: Freezing / Locking
  executeL2Freeze() {
    this.dismissActiveNotification();

    const incident = trustStorage.getFraudIncident();
    if (!incident) return;

    // Set status to in progress
    trustStorage.setFraudIncident({
      ...incident,
      status: 'l2_freezing'
    });

    // Notification: Securing card
    const notifId = `notif-l2-freezing-${Date.now()}`;
    this.activeNotifId = notifId;

    if (this.notificationTrigger) {
      this.notificationTrigger({
        id: notifId,
        appId: 'lumen_ai',
        appName: 'Lumen',
        icon: 'Lock',
        title: 'Securing Your Card...',
        body: 'Temporarily locking your card across all payment networks...',
        color: '#f59e0b',
        duration: 10000
      });
    }

    // Simulate background process completion after 10.0 seconds
    setTimeout(() => {
      this.dismissActiveNotification();

      // Formally freeze the credit card in financeStorage
      financeStorage.freezeCard(incident.cardId);

      const userAddress = trustStorage.getUserAddress();
      const updated = {
        ...incident,
        status: 'l2_freeze_done',
        deliveryAddress: userAddress
      };
      trustStorage.setFraudIncident(updated);

      // Notification: Card locked, prompt for replacement with address verification
      const replaceNotifId = `notif-l2-replace-${Date.now()}`;
      this.activeNotifId = replaceNotifId;

      if (this.notificationTrigger) {
        this.notificationTrigger({
          id: replaceNotifId,
          appId: 'lumen_ai',
          appName: 'Lumen',
          icon: 'CreditCard',
          autonomyBadge: 'L2',
          title: 'Card Successfully Locked',
          body: 'No further charges can go through. Verify delivery address for physical replacement card:',
          addressVerification: true,
          deliveryAddress: userAddress,
          color: '#10b981',
          duration: 10000,
          onUpdateAddress: (newAddr) => {
            trustStorage.setUserAddress(newAddr);
          },
          actions: [
            {
              label: 'Confirm & Replace Card',
              variant: 'primary',
              onClick: (confirmedAddr) => this.executeL2Replace(confirmedAddr)
            }
          ]
        });
      }
    }, 10000);
  }

  // L2 Step 2: Replacing Card
  executeL2Replace(customAddress) {
    this.dismissActiveNotification();

    const incident = trustStorage.getFraudIncident();
    if (!incident) return;

    if (customAddress && customAddress.trim()) {
      trustStorage.setUserAddress(customAddress.trim());
    }
    const finalAddress = trustStorage.getUserAddress();

    // Status: replacing in progress
    trustStorage.setFraudIncident({
      ...incident,
      status: 'l2_replacing',
      deliveryAddress: finalAddress
    });

    // Notification: Setting up new card (Option B: Action & Delivery Focused)
    const notifId = `notif-l2-applied-${Date.now()}`;
    this.activeNotifId = notifId;

    if (this.notificationTrigger) {
      this.notificationTrigger({
        id: notifId,
        appId: 'lumen_ai',
        appName: 'Lumen',
        icon: 'CreditCard',
        autonomyBadge: 'L2',
        title: 'New Card on the Way',
        body: `Old card secured. Preparing physical card for dispatch to ${finalAddress.split(',')[0]}. Instant digital card ready in moments.`,
        color: '#6366f1',
        duration: 10000
      });
    }

    // Simulate background replacement generation after 10.0 seconds
    setTimeout(() => {
      this.dismissActiveNotification();

      // Generate brand new card and update credentials
      const newCard = financeStorage.generateAndReplaceCard(incident.cardId);

      const updated = {
        ...incident,
        status: 'l2_replaced',
        newCard,
        deliveryAddress: finalAddress
      };
      trustStorage.setFraudIncident(updated);

      // Notification: New card ready
      const readyNotifId = `notif-l2-ready-${Date.now()}`;
      this.activeNotifId = readyNotifId;

      if (this.notificationTrigger) {
        this.notificationTrigger({
          id: readyNotifId,
          appId: 'lumen_ai',
          appName: 'Lumen',
          icon: 'Sparkles',
          autonomyBadge: 'L2',
          title: 'Your New Card is Ready',
          body: `Instant digital card is active immediately. Physical card dispatched to ${finalAddress.split(',')[0]}.`,
          color: '#10b981',
          duration: 8000,
          onClickCard: () => this.executeL2ViewNewCard(),
          actions: [
            {
              label: 'View New Card',
              variant: 'success',
              onClick: () => this.executeL2ViewNewCard()
            }
          ]
        });
      }
    }, 10000);
  }

  // L2 Step 3: View New Card
  executeL2ViewNewCard() {
    this.dismissActiveNotification();
    trustStorage.clearFraudIncident();

    if (this.appNavigator) {
      this.appNavigator('lumen_ai', 'glance', { openDigitalCard: true });
    }

    if (this.glanceCardOpener) {
      this.glanceCardOpener();
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('lumen_switch_tab', {
          detail: { tab: 'glance', openDigitalCard: true }
        })
      );
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('lumen_open_digital_card'));
      }, 250);
    }
  }

  // ==========================================
  // L3 WORKFLOW (High Autonomy: Single "Freeze & Replace" Action)
  // ==========================================
  startL3Workflow(incident) {
    const updated = {
      ...incident,
      status: 'l3_unified_prompt'
    };
    trustStorage.setFraudIncident(updated);

    // Notification for L3 unified prompt: Single button for full process
    const notifId = `notif-l3-unified-${Date.now()}`;
    this.activeNotifId = notifId;

    if (this.notificationTrigger) {
      this.notificationTrigger({
        id: notifId,
        appId: 'lumen_ai',
        appName: 'Lumen',
        icon: 'Lock',
        autonomyBadge: 'L3',
        title: 'Suspicious Charge Flagged',
        body: 'We detected an unauthorized charge. We recommend locking your compromised card and instantly issuing a safe replacement card.',
        color: '#10b981',
        duration: 8000,
        actions: [
          {
            label: 'Lock & Replace Card',
            variant: 'danger',
            onClick: () => this.executeL3Unified()
          }
        ]
      });
    }
  }

  // L3 Unified Action: Executes Locking then automatically proceeds to Replacement
  executeL3Unified() {
    this.dismissActiveNotification();

    const incident = trustStorage.getFraudIncident();
    if (!incident) return;

    // Phase 1: Freezing in progress
    trustStorage.setFraudIncident({
      ...incident,
      status: 'l3_freezing'
    });

    const notifId = `notif-l3-freezing-${Date.now()}`;
    this.activeNotifId = notifId;

    if (this.notificationTrigger) {
      this.notificationTrigger({
        id: notifId,
        appId: 'lumen_ai',
        appName: 'Lumen',
        icon: 'Lock',
        title: 'Securing Your Card...',
        body: 'Locking your compromised card to prevent further charges... Replacement card will follow automatically.',
        color: '#0284c7',
        duration: 10000
      });
    }

    // After 10s: card is locked, then AUTOMATICALLY transition to replacement
    setTimeout(() => {
      this.dismissActiveNotification();

      // Formally freeze card
      financeStorage.freezeCard(incident.cardId);

      const userAddress = trustStorage.getUserAddress();
      // Phase 2: Automatically start replacement without user intervention
      trustStorage.setFraudIncident({
        ...incident,
        status: 'l3_replacing',
        deliveryAddress: userAddress
      });

      const replacingNotifId = `notif-l3-replacing-${Date.now()}`;
      this.activeNotifId = replacingNotifId;

      if (this.notificationTrigger) {
        this.notificationTrigger({
          id: replacingNotifId,
          appId: 'lumen_ai',
          appName: 'Lumen',
          icon: 'CreditCard',
          autonomyBadge: 'L3',
          title: 'New Card on the Way',
          body: `Card secured. Dispatching new physical card to verified address on file (${userAddress.split(',')[0]}). Instant digital card ready in moments.`,
          color: '#6366f1',
          duration: 10000
        });
      }

      // After another 10s: Replacement card is ready
      setTimeout(() => {
        this.dismissActiveNotification();

        // Generate brand new card and update credentials
        const newCard = financeStorage.generateAndReplaceCard(incident.cardId);

        const updated = {
          ...incident,
          status: 'l3_replaced',
          newCard,
          deliveryAddress: userAddress
        };
        trustStorage.setFraudIncident(updated);

        // Final notification: "Your New Card is Ready"
        const readyNotifId = `notif-l3-ready-${Date.now()}`;
        this.activeNotifId = readyNotifId;

        if (this.notificationTrigger) {
          this.notificationTrigger({
            id: readyNotifId,
            appId: 'lumen_ai',
            appName: 'Lumen',
            icon: 'Sparkles',
            autonomyBadge: 'L3',
            title: 'Your New Card is Ready',
            body: `Instant digital card is active immediately. Physical card dispatched to verified address on file (${userAddress.split(',')[0]}).`,
            color: '#10b981',
            duration: 8000,
            onClickCard: () => this.executeL3ViewNewCard(),
            actions: [
              {
                label: 'View New Card',
                variant: 'success',
                onClick: () => this.executeL3ViewNewCard()
              }
            ]
          });
        }
      }, 10000);
    }, 10000);
  }

  // L3 Step 3: View New Card
  executeL3ViewNewCard() {
    this.dismissActiveNotification();
    trustStorage.clearFraudIncident();

    // Navigate to Glance and trigger Digital Card Modal
    if (this.appNavigator) {
      this.appNavigator('lumen_ai', 'glance', { openDigitalCard: true });
    }

    if (this.glanceCardOpener) {
      this.glanceCardOpener();
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('lumen_switch_tab', {
          detail: { tab: 'glance', openDigitalCard: true }
        })
      );
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('lumen_open_digital_card'));
      }, 250);
    }
  }

  // Safely dismiss current active notification
  dismissActiveNotification() {
    if (this.notificationDismiss && this.activeNotifId) {
      try {
        this.notificationDismiss(this.activeNotifId);
      } catch (e) {
        console.warn('Notification dismiss error handled:', e);
      }
    }
    this.activeNotifId = null;
  }
}

export const fraudWorkflow = new FraudWorkflowService();
