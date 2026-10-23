import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Loader2,
  Lock,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { trustStorage } from '../services/trustStorage';
import { fraudWorkflow } from '../services/fraudWorkflow';

export default function ActScreen({ onNavigateTab }) {
  const [incident, setIncident] = useState(() => trustStorage.getFraudIncident());

  useEffect(() => {
    const unsub = trustStorage.subscribe((event, data) => {
      if (event === 'incident_updated') {
        setIncident(data);
      }
    });
    return unsub;
  }, []);

  return (
    <div className="lumen-act-scroll">
      {/* 1. Header Overview */}
      <div className="act-hero-bar">
        <div className="act-hero-icon-box">
          <Zap size={26} color="#ec4899" />
        </div>
        <div>
          <div className="act-hero-title">Lumen Act</div>
          <div className="act-hero-subtitle">Autonomous AI Routines & Protection</div>
        </div>
      </div>

      {/* 2. Active Incident Action Card (Rendered dynamically if an incident exists) */}
      <AnimatePresence mode="wait">
        {incident && incident.status !== 'resolved' && (
          <motion.div
            key={incident.status}
            className="act-incident-card"
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            {/* L1 State: Steps Guidance */}
            {incident.status === 'l1_steps' && (
              <div className="incident-content">
                <div className="incident-header">
                  <div className="incident-icon-pulse danger">
                    <ShieldAlert size={20} color="#ef4444" />
                  </div>
                  <div className="incident-title-block">
                    <div className="incident-badge l1-badge">L1 Guided Action</div>
                    <div className="incident-title">Suspicious Charge Detected</div>
                  </div>
                </div>

                <p className="incident-desc">
                  Detected a transaction of{' '}
                  <strong style={{ color: '#fff' }}>₹{incident.amount?.toLocaleString('en-IN')}</strong> with credit card{' '}
                  <strong>•••• {incident.cardLast4}</strong>. Know how to freeze the card and apply for a new credit card.
                </p>

                <button
                  className="incident-action-btn primary"
                  onClick={() => fraudWorkflow.executeL1NavigateToAsk()}
                >
                  <span>View Steps</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            )}

            {/* L3 State 1: Freeze Prompt */}
            {incident.status === 'l3_freeze_prompt' && (
              <div className="incident-content">
                <div className="incident-header">
                  <div className="incident-icon-pulse danger">
                    <ShieldAlert size={20} color="#ef4444" />
                  </div>
                  <div className="incident-title-block">
                    <div className="incident-badge l3-badge">L3 Autonomous Protection</div>
                    <div className="incident-title">Emergency Freeze Recommended</div>
                  </div>
                </div>

                <p className="incident-desc">
                  Unauthorized charge of{' '}
                  <strong style={{ color: '#fff' }}>₹{incident.amount?.toLocaleString('en-IN')}</strong> flagged on card{' '}
                  <strong>•••• {incident.cardLast4}</strong> at <em>{incident.merchant || 'International POS'}</em>.
                </p>

                <button
                  className="incident-action-btn danger"
                  onClick={() => fraudWorkflow.executeL3Freeze()}
                >
                  <Lock size={15} />
                  <span>Freeze Now</span>
                </button>
              </div>
            )}

            {/* L3 State 2: Freezing In Progress */}
            {incident.status === 'l3_freezing' && (
              <div className="incident-content">
                <div className="incident-header">
                  <div className="incident-icon-pulse spin">
                    <Loader2 size={20} color="#38bdf8" />
                  </div>
                  <div className="incident-title-block">
                    <div className="incident-badge l3-badge">L3 Background Worker</div>
                    <div className="incident-title">Freezing Card in Progress...</div>
                  </div>
                </div>

                <p className="incident-desc">
                  Issuing emergency block commands to domestic and international card networks for •••• {incident.cardLast4}...
                </p>

                {/* Animated progress bar */}
                <div className="incident-progress-track">
                  <motion.div
                    className="incident-progress-fill freeze-fill"
                    initial={{ width: '10%' }}
                    animate={{ width: '92%' }}
                    transition={{ duration: 2.3, ease: 'easeInOut' }}
                  />
                </div>
              </div>
            )}

            {/* L3 State 3: Freeze Completed / Replace Prompt */}
            {incident.status === 'l3_freeze_done' && (
              <div className="incident-content">
                <div className="incident-header">
                  <div className="incident-icon-pulse success">
                    <CheckCircle2 size={20} color="#10b981" />
                  </div>
                  <div className="incident-title-block">
                    <div className="incident-badge l3-badge">L3 Card Secured</div>
                    <div className="incident-title">Card Freezed Successfully</div>
                  </div>
                </div>

                <p className="incident-desc">
                  Card <strong>•••• {incident.cardLast4}</strong> is now completely frozen. All payment requests are actively blocked. Would you like to issue a replacement card?
                </p>

                <button
                  className="incident-action-btn primary"
                  onClick={() => fraudWorkflow.executeL3Replace()}
                >
                  <RefreshCw size={15} />
                  <span>Apply for New Card</span>
                </button>
              </div>
            )}

            {/* L3 State 4: Replacing In Progress */}
            {incident.status === 'l3_replacing' && (
              <div className="incident-content">
                <div className="incident-header">
                  <div className="incident-icon-pulse spin">
                    <Loader2 size={20} color="#a855f7" />
                  </div>
                  <div className="incident-title-block">
                    <div className="incident-badge l3-badge">L3 Digital Provisioning</div>
                    <div className="incident-title">Replacing Card in Progress...</div>
                  </div>
                </div>

                <p className="incident-desc">
                  Generating verified 16-digit credit card number, fresh dynamic CVV, and updating local security vault...
                </p>

                {/* Animated progress bar */}
                <div className="incident-progress-track">
                  <motion.div
                    className="incident-progress-fill replace-fill"
                    initial={{ width: '12%' }}
                    animate={{ width: '94%' }}
                    transition={{ duration: 2.4, ease: 'easeInOut' }}
                  />
                </div>
              </div>
            )}

            {/* L3 State 5: Replaced & Issued */}
            {incident.status === 'l3_replaced' && (
              <div className="incident-content">
                <div className="incident-header">
                  <div className="incident-icon-pulse success">
                    <Sparkles size={20} color="#10b981" />
                  </div>
                  <div className="incident-title-block">
                    <div className="incident-badge success-badge">Issued & Active</div>
                    <div className="incident-title">New Credit Card Is Here!</div>
                  </div>
                </div>

                <div className="new-card-preview-mini">
                  <div className="mini-card-icon">
                    <CreditCard size={18} color="#a855f7" />
                  </div>
                  <div className="mini-card-details">
                    <div className="mini-card-name">Lumen Visa Signature</div>
                    <div className="mini-card-num">
                      •••• {incident.newCard?.last4 || 'Newly Issued'}
                    </div>
                  </div>
                </div>

                <p className="incident-desc" style={{ marginTop: '0.4rem' }}>
                  Your new card has been generated and connected to your account. All payments have been reactivated.
                </p>

                <button
                  className="incident-action-btn success"
                  onClick={() => fraudWorkflow.executeL3ViewNewCard()}
                >
                  <CreditCard size={15} />
                  <span>View New Card</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Standard Autonomous Routines List */}
      <div className="act-section-header">
        <span>ACTIVE ROUTINES & WORKFLOWS</span>
      </div>

      <div className="act-routine-card">
        <div className="routine-top">
          <div className="routine-icon-box" style={{ background: 'rgba(236, 72, 153, 0.15)' }}>
            <Zap size={18} color="#ec4899" />
          </div>
          <div className="routine-meta">
            <div className="routine-name">Smart Bill Autopay</div>
            <div className="routine-desc">Auto-clears credit card bill 2 days before due date.</div>
          </div>
          <div className="routine-toggle active">
            <div className="toggle-dot" />
          </div>
        </div>
      </div>

      <div className="act-routine-card">
        <div className="routine-top">
          <div className="routine-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
            <ShieldCheck size={18} color="#10b981" />
          </div>
          <div className="routine-meta">
            <div className="routine-name">Fraud Shield Watchdog</div>
            <div className="routine-desc">Autonomous network monitoring across high-risk merchant categories.</div>
          </div>
          <div className="routine-toggle active">
            <div className="toggle-dot" />
          </div>
        </div>
      </div>

      <div className="act-routine-card">
        <div className="routine-top">
          <div className="routine-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
            <Sparkles size={18} color="#818cf8" />
          </div>
          <div className="routine-meta">
            <div className="routine-name">Round-Up Micro Investments</div>
            <div className="routine-desc">Invests spare change from UPI spends into digital gold.</div>
          </div>
          <div className="routine-toggle">
            <div className="toggle-dot" />
          </div>
        </div>
      </div>
    </div>
  );
}
