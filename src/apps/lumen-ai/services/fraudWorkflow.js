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
        appName: 'Lumen AI • Security',
        title: 'Suspicious Transaction Detected',
        body: `A transaction of ₹${amount.toLocaleString('en-IN')} has been detected on your card ending with ${last4}. Have you done this transaction?`,
        color: '#ef4444',
        duration: 5000,
        actions: [
          {
            label: 'Yes',
            variant: 'ghost',
            onClick: () => this.handleConfirmationResponse(true)
          },
          {
            label: 'No',
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
        appName: 'Lumen AI • Security',
        autonomyBadge: 'L1 Autonomy',
        title: 'Credit Card Protection',
        body: 'Want to freeze and replace the credit card? Click here to know how to freeze and apply for replacement of credit card',
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
  // L3 WORKFLOW (Autonomous AI Execution)
  // ==========================================
  startL3Workflow(incident) {
    const updated = {
      ...incident,
      status: 'l3_freeze_prompt'
    };
    trustStorage.setFraudIncident(updated);

    // Notification for L3 initial prompt
    const notifId = `notif-l3-freeze-${Date.now()}`;
    this.activeNotifId = notifId;

    if (this.notificationTrigger) {
      this.notificationTrigger({
        id: notifId,
        appId: 'lumen_ai',
        appName: 'Lumen AI • Security',
        autonomyBadge: 'L3 Autonomy',
        title: 'Emergency Card Action',
        body: 'Want to freeze the credit card to prevent further charges?',
        color: '#ef4444',
        duration: 5000,
        actions: [
          {
            label: 'Freeze Now',
            variant: 'danger',
            onClick: () => this.executeL3Freeze()
          }
        ]
      });
    }
  }

  // L3 Step 1: Freezing
  executeL3Freeze() {
    this.dismissActiveNotification();

    const incident = trustStorage.getFraudIncident();
    if (!incident) return;

    // Set status to in progress
    trustStorage.setFraudIncident({
      ...incident,
      status: 'l3_freezing'
    });

    // Notification: "Initiated freezing the credit card"
    const notifId = `notif-l3-freezing-${Date.now()}`;
    this.activeNotifId = notifId;

    if (this.notificationTrigger) {
      this.notificationTrigger({
        id: notifId,
        appId: 'lumen_ai',
        appName: 'Lumen AI • Security',
        title: 'Security Protocol Activated',
        body: 'Initiated freezing the credit card in the background...',
        color: '#0284c7',
        duration: 5000
      });
    }

    // Simulate background process completion after 10.0 seconds
    setTimeout(() => {
      this.dismissActiveNotification();

      // Formally freeze the credit card in financeStorage
      financeStorage.freezeCard(incident.cardId);

      const updated = {
        ...incident,
        status: 'l3_freeze_done'
      };
      trustStorage.setFraudIncident(updated);

      // Notification: "The card has been freezed successfully. Want to apply for replacement..."
      const replaceNotifId = `notif-l3-replace-${Date.now()}`;
      this.activeNotifId = replaceNotifId;

      if (this.notificationTrigger) {
        this.notificationTrigger({
          id: replaceNotifId,
          appId: 'lumen_ai',
          appName: 'Lumen AI • Security',
          autonomyBadge: 'L3 Autonomy',
          title: 'Card Freezed Successfully',
          body: 'The card has been freezed successfully. Want to apply for replacement of this credit card?',
          color: '#10b981',
          duration: 5000,
          actions: [
            {
              label: 'Replace Card',
              variant: 'primary',
              onClick: () => this.executeL3Replace()
            }
          ]
        });
      }
    }, 10000);
  }

  // L3 Step 2: Replacing Card
  executeL3Replace() {
    this.dismissActiveNotification();

    const incident = trustStorage.getFraudIncident();
    if (!incident) return;

    // Status: replacing in progress
    trustStorage.setFraudIncident({
      ...incident,
      status: 'l3_replacing'
    });

    // Notification: "Applied for new credit card"
    const notifId = `notif-l3-applied-${Date.now()}`;
    this.activeNotifId = notifId;

    if (this.notificationTrigger) {
      this.notificationTrigger({
        id: notifId,
        appId: 'lumen_ai',
        appName: 'Lumen AI • Security',
        title: 'Replacement Request Filed',
        body: 'Applied for new credit card. Generating fresh digital credentials...',
        color: '#6366f1',
        duration: 5000
      });
    }

    // Simulate background replacement generation after 10.0 seconds
    setTimeout(() => {
      this.dismissActiveNotification();

      // Generate brand new card and update credentials
      const newCard = financeStorage.generateAndReplaceCard(incident.cardId);

      const updated = {
        ...incident,
        status: 'l3_replaced',
        newCard
      };
      trustStorage.setFraudIncident(updated);

      // Notification: "New credit card is here"
      const readyNotifId = `notif-l3-ready-${Date.now()}`;
      this.activeNotifId = readyNotifId;

      if (this.notificationTrigger) {
        this.notificationTrigger({
          id: readyNotifId,
          appId: 'lumen_ai',
          appName: 'Lumen AI • Security',
          autonomyBadge: 'L3 Autonomy',
          title: 'New Credit Card Issued',
          body: 'New credit card is here! Fresh CVV and 16-digit credentials ready to view.',
          color: '#10b981',
          duration: 5000,
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
