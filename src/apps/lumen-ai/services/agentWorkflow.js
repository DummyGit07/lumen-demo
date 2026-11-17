// Agent Spending & Simulation Workflow for Lumen AI
import { agentStorage } from './agentStorage';
import { financeStorage } from './financeStorage';

class AgentWorkflowService {
  constructor() {
    this.notificationTrigger = null;
    this.notificationDismiss = null;
    this.activeNotifId = null;
  }

  init({ triggerNotification, dismissNotification }) {
    this.notificationTrigger = triggerNotification;
    this.notificationDismiss = dismissNotification;
  }

  dismissActiveNotification() {
    if (this.activeNotifId) {
      if (this.notificationDismiss) {
        this.notificationDismiss(this.activeNotifId);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('lumen_dismiss_notification', {
            detail: { id: this.activeNotifId }
          })
        );
      }
      this.activeNotifId = null;
    }
  }

  sendNotification(notifPayload) {
    this.dismissActiveNotification();
    const id = notifPayload.id || `notif-agent-${Date.now()}`;
    this.activeNotifId = id;
    const fullPayload = { ...notifPayload, id };

    if (this.notificationTrigger) {
      this.notificationTrigger(fullPayload);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('lumen_trigger_notification', { detail: fullPayload })
      );
    }
  }

  executeDebit(agentName, amount) {
    const banks = financeStorage.loadBanks();
    const lumenBank = banks.find((b) => b.id === 'bank-lumen') || banks[0];
    const updatedBanks = banks.map((b) =>
      b.id === lumenBank.id ? { ...b, balance: Math.max(0, b.balance - amount) } : b
    );

    const txns = financeStorage.loadTransactions();
    const newTxn = {
      id: `txn-agent-${Date.now()}`,
      recipient: agentName,
      title: `${agentName} Payment`,
      merchant: agentName,
      category: 'AI Assistant',
      amount: Number(amount),
      type: 'debit',
      sourceType: 'bank',
      sourceName: lumenBank.name || 'Lumen Bank',
      sourceId: lumenBank.id || 'bank-lumen',
      bankId: lumenBank.id || 'bank-lumen',
      bankName: lumenBank.name || 'Lumen Bank',
      status: 'Completed',
      accountNumber: lumenBank.accountNumber || '•••• 7719',
      upiId: `${agentName.toLowerCase().replace(/\s+/g, '')}@ai.lumen`,
      note: `Authorized via ${agentName} agent`,
      timestamp: new Date().toISOString()
    };

    const updatedTxns = [newTxn, ...txns];
    financeStorage.saveBanks(updatedBanks, false);
    financeStorage.saveTransactions(updatedTxns, false);
    financeStorage.notifyUpdate();

    agentStorage.recordAgentSpend(agentName, amount);
    return newTxn;
  }

  simulatePaymentRequest({ agentName, amount, isUnregistered = false }) {
    const numAmount = Math.max(1, Number(amount) || 0);
    const agents = agentStorage.getAgents();
    const matchedAgent = agents.find(
      (a) => a.name.toLowerCase() === String(agentName).toLowerCase()
    );

    // ========================================================
    // PRIORITY 1: Unregistered Agent Check
    // ========================================================
    if (isUnregistered || !matchedAgent) {
      const displayName = isUnregistered ? 'Siri' : agentName;
      this.sendNotification({
        appId: 'lumen_ai',
        appName: 'Lumen Security',
        title: `Unregistered Agent • ${displayName}`,
        promptText: `${displayName} requested ₹${numAmount.toLocaleString()} but is not configured. Authorize payment?`,
        time: 'Just now',
        actions: [
          {
            label: 'Decline',
            variant: 'danger',
            inPlace: true,
            confirmationText: 'Request Blocked',
            onClick: () => {
              this.dismissActiveNotification();
            }
          },
          {
            label: 'Review & Pay',
            variant: 'primary',
            tab: 'glance',
            openApp: true,
            onClick: () => {
              this.dismissActiveNotification();
              const payData = {
                recipient: `${displayName} (Agent)`,
                amount: numAmount,
                note: `${displayName} Payment Approval`
              };
              if (typeof window !== 'undefined') {
                window.__lumen_prefilled_pay = payData;
                window.dispatchEvent(
                  new CustomEvent('lumen_navigate_app', {
                    detail: { appId: 'lumen_ai', tab: 'glance' }
                  })
                );
                window.dispatchEvent(
                  new CustomEvent('lumen_open_prefilled_pay', {
                    detail: payData
                  })
                );
                [50, 150, 300].forEach((d) => {
                  setTimeout(() => {
                    window.dispatchEvent(
                      new CustomEvent('lumen_switch_tab', { detail: { tab: 'glance' } })
                    );
                    window.dispatchEvent(
                      new CustomEvent('lumen_open_prefilled_pay', { detail: payData })
                    );
                  }, d);
                });
              }
            }
          }
        ]
      });
      return { status: 'unregistered', agentName: displayName, amount: numAmount };
    }

    // ========================================================
    // PRIORITY 2: Limit Check
    // ========================================================
    const spent = Number(matchedAgent.spent) || 0;
    const remainingLimit = Math.max(0, matchedAgent.limit - spent);

    if (numAmount > remainingLimit) {
      this.sendNotification({
        appId: 'lumen_ai',
        appName: 'Lumen Trust',
        title: `Limit Exceeded • ${matchedAgent.name}`,
        promptText: `${matchedAgent.name} requested ₹${numAmount.toLocaleString()}, which exceeds remaining ${matchedAgent.period} limit of ₹${remainingLimit.toLocaleString()}. Pay anyway?`,
        time: 'Just now',
        actions: [
          {
            label: 'Decline',
            variant: 'danger',
            inPlace: true,
            confirmationText: 'Declined',
            onClick: () => {
              this.dismissActiveNotification();
            }
          },
          {
            label: 'Approve & Pay',
            variant: 'primary',
            inPlace: true,
            confirmationText: `₹${numAmount.toLocaleString()} Paid`,
            onClick: () => {
              this.executeDebit(matchedAgent.name, numAmount);
            }
          }
        ]
      });
      return { status: 'limit_exceeded', agent: matchedAgent, amount: numAmount, remainingLimit };
    }

    // ========================================================
    // PRIORITY 3: Balance Check
    // ========================================================
    const banks = financeStorage.loadBanks();
    const lumenBank = banks.find((b) => b.id === 'bank-lumen') || banks[0];
    const currentBalance = lumenBank ? Number(lumenBank.balance) : 0;

    if (numAmount > currentBalance) {
      this.sendNotification({
        appId: 'lumen_ai',
        appName: 'Lumen Bank',
        title: `Payment Failed • ${matchedAgent.name}`,
        promptText: `${matchedAgent.name} requested ₹${numAmount.toLocaleString()} (within limit), but Lumen account has insufficient balance (₹${currentBalance.toLocaleString()}).`,
        time: 'Just now',
        actions: [
          {
            label: 'Dismiss',
            variant: 'default',
            inPlace: true,
            onClick: () => {
              this.dismissActiveNotification();
            }
          }
        ]
      });
      return { status: 'insufficient_balance', agent: matchedAgent, amount: numAmount, currentBalance };
    }

    // ========================================================
    // PRIORITY 4: Auto-Approved within Limit & Sufficient Balance
    // ========================================================
    const newTxn = this.executeDebit(matchedAgent.name, numAmount);
    const newRemaining = Math.max(0, remainingLimit - numAmount);

    this.sendNotification({
      appId: 'lumen_ai',
      appName: 'Lumen Bank',
      title: `Payment Approved • ${matchedAgent.name}`,
      promptText: `₹${numAmount.toLocaleString()} debited for ${matchedAgent.name} (within ${matchedAgent.period} limit). Remaining: ₹${newRemaining.toLocaleString()}.`,
      time: 'Just now',
      actions: [
        {
          label: 'View',
          variant: 'default',
          tab: 'glance',
          openApp: true,
          onClick: () => {
            this.dismissActiveNotification();
            if (typeof window !== 'undefined') {
              window.__lumen_selected_txn = newTxn;
              window.dispatchEvent(
                new CustomEvent('lumen_navigate_app', {
                  detail: { appId: 'lumen_ai', tab: 'glance' }
                })
              );
              window.dispatchEvent(
                new CustomEvent('lumen_open_transaction_detail', { detail: newTxn })
              );
              [50, 150, 300].forEach((d) => {
                setTimeout(() => {
                  window.dispatchEvent(
                    new CustomEvent('lumen_switch_tab', { detail: { tab: 'glance' } })
                  );
                  window.dispatchEvent(
                    new CustomEvent('lumen_open_transaction_detail', { detail: newTxn })
                  );
                }, d);
              });
            }
          }
        }
      ]
    });

    return { status: 'approved', agent: matchedAgent, amount: numAmount, newRemaining };
  }
}

export const agentWorkflow = new AgentWorkflowService();
