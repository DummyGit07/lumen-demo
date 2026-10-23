// Central Fraud Incident Workflow State Machine
// Coordinates Simulator, Notifications, ActScreen, AskScreen, and GlanceScreen

import { trustStorage } from './trustStorage';
import { financeStorage } from './financeStorage';

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
        persistent: true,
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
        persistent: true,
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

    // Navigate to Ask screen of Lumen AI
    if (this.appNavigator) {
      this.appNavigator('lumen_ai', 'ask');
    }

    // Direct reply coming from agent (no prior user prompt)
    const amount = incident?.amount || 4850;
    const last4 = incident?.cardLast4 || '8411';

    const detailedMessage = `⚠️ **Fraud Protection Notice — Card •••• ${last4}**

We detected an unauthorized debit of **₹${amount.toLocaleString('en-IN')}** from an unverified payment gateway.

Here are the required steps to safeguard your funds:

1. **Freeze Your Credit Card**:
   Go to the **Glance** tab, select your credit card, and toggle **Freeze Card**. This immediately cuts off all domestic and international card networks.
2. **Review Suspicious Charge**:
   Check the transaction entry under **Recent Transactions** for the dispute reference code.
3. **Request Card Replacement**:
   Submit a formal re-issue request via bank helpline or request a digital token swap.

Feel free to ask me anything about filing a dispute or monitoring your bank balance!`;

    if (this.askDirectMessenger) {
      this.askDirectMessenger(detailedMessage);
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
        persistent: true,
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
        persistent: false,
        duration: 3500
      });
    }

    // Simulate background process completion after 2.5 seconds
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
          persistent: true,
          actions: [
            {
              label: 'Replace Card',
              variant: 'primary',
              onClick: () => this.executeL3Replace()
            }
          ]
        });
      }
    }, 2500);
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
        persistent: false,
        duration: 3500
      });
    }

    // Simulate background replacement generation after 2.6 seconds
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
          persistent: true,
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
    }, 2600);
  }

  // L3 Step 3: View New Card
  executeL3ViewNewCard() {
    this.dismissActiveNotification();
    trustStorage.clearFraudIncident();

    // Navigate to Glance and trigger Digital Card Modal
    if (this.appNavigator) {
      this.appNavigator('lumen_ai', 'glance');
    }

    if (this.glanceCardOpener) {
      // Small timeout to allow tab render if app just launched
      setTimeout(() => {
        this.glanceCardOpener();
      }, 150);
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
