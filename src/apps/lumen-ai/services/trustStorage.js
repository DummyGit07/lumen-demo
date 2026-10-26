// Trust & Autonomy Service for Lumen AI
// Manages Autonomy Level (L1, L2, L3) and Fraud Incident Lifecycles

const STORAGE_KEY_AUTONOMY = 'lumen_trust_autonomy_level_v1';
const STORAGE_KEY_FRAUD = 'lumen_trust_fraud_incident_v1';

export const AUTONOMY_LEVELS = {
  L1: {
    id: 'l1',
    label: 'L1: Guided Assistance',
    shortLabel: 'L1 Autonomy',
    badgeColor: '#3b82f6',
    description: 'AI detects anomalies and suggests guided manual steps. User retains 100% control over card locks and replacements.',
    tag: 'Manual Approval'
  },
  L2: {
    id: 'l2',
    label: 'L2: Semi-Autonomous',
    shortLabel: 'L2 Autonomy',
    badgeColor: '#f59e0b',
    description: 'AI performs emergency remediation with step-by-step confirmation: user approves card freeze first, then approves card replacement.',
    tag: 'Two-Step Approval'
  },
  L3: {
    id: 'l3',
    label: 'L3: High Autonomy',
    shortLabel: 'L3 Autonomy',
    badgeColor: '#10b981',
    description: 'AI executes end-to-end emergency remediation via a single unified Freeze & Replace action, automatically provisioning a new card.',
    tag: 'Autonomous AI'
  }
};

class TrustStorageService {
  constructor() {
    this.listeners = new Set();
  }

  // Subscribe to changes
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(event, data) {
    this.listeners.forEach((cb) => {
      try {
        cb(event, data);
      } catch (err) {
        console.error('Trust storage subscriber error:', err);
      }
    });

    // Also dispatch to window for cross-component sync
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('lumen_trust_event', { detail: { event, data } })
      );
    }
  }

  // Autonomy Level
  getAutonomyLevel() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUTONOMY);
      if (stored === 'l3' || stored === 'l2') return stored;
      return 'l1'; // default is L1
    } catch {
      return 'l1';
    }
  }

  setAutonomyLevel(level) {
    try {
      const valid = ['l1', 'l2', 'l3'].includes(level) ? level : 'l1';
      localStorage.setItem(STORAGE_KEY_AUTONOMY, valid);
      this.notify('autonomy_changed', valid);
      return valid;
    } catch (e) {
      console.warn('Failed to save autonomy level:', e);
      return 'l1';
    }
  }

  // Fraud Incident Management
  getFraudIncident() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FRAUD);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  setFraudIncident(incident) {
    try {
      if (!incident) {
        localStorage.removeItem(STORAGE_KEY_FRAUD);
        this.notify('incident_updated', null);
      } else {
        localStorage.setItem(STORAGE_KEY_FRAUD, JSON.stringify(incident));
        this.notify('incident_updated', incident);
      }
    } catch (e) {
      console.warn('Failed to save fraud incident:', e);
    }
  }

  clearFraudIncident() {
    this.setFraudIncident(null);
  }

  // Navigation Request (to open Lumen tab or submodal)
  requestNavigation(tab, payload = {}) {
    this.notify('navigate_tab', { tab, ...payload });
  }
}

export const trustStorage = new TrustStorageService();
