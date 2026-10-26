import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Loader2,
  Lock,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Cpu
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

  const hasValidIncident =
    incident &&
    [
      'awaiting_confirmation',
      'l1_steps',
      'l2_freeze_prompt',
      'l2_freezing',
      'l2_freeze_done',
      'l2_replacing',
      'l2_replaced',
      'l3_unified_prompt',
      'l3_freezing',
      'l3_replacing',
      'l3_replaced'
    ].includes(incident.status);

  return (
    <div className="lumen-act-scroll">
      <AnimatePresence mode="wait">
        {/* Case 1: Active Incident Action Card */}
        {hasValidIncident ? (
          <motion.div
            key={incident.status}
            className="act-incident-card"
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {/* Initial State: Awaiting Confirmation */}
            {incident.status === 'awaiting_confirmation' && (
              <div className="incident-content">
                <div className="incident-header">
                  <div className="incident-icon-pulse danger">
                    <ShieldAlert size={20} color="#ef4444" />
                  </div>
                  <div className="incident-title-block">
                    <div className="incident-badge l3-badge">Verification Required</div>
                    <div className="incident-title">Suspicious Transaction</div>
                  </div>
                </div>

                <p className="incident-desc">
                  A charge of <strong style={{ color: '#fff' }}>₹{incident.amount?.toLocaleString('en-IN')}</strong> was detected on card <strong>•••• {incident.cardLast4}</strong>. Have you performed this transaction?
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                  <button
                    className="incident-action-btn"
                    style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1' }}
                    onClick={() => fraudWorkflow.handleConfirmationResponse(true)}
                  >
                    Yes, It Was Me
                  </button>
                  <button
                    className="incident-action-btn danger"
                    onClick={() => fraudWorkflow.handleConfirmationResponse(false)}
                  >
                    No, Not Me
                  </button>
                </div>
              </div>
            )}

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
                  <strong style={{ color: '#fff' }}>₹{incident.amount?.toLocaleString('en-IN')}</strong> on credit card{' '}
                  <strong>•••• {incident.cardLast4}</strong>. Learn how to freeze the card and apply for a new card.
                </p>

                <button
                  className="incident-action-btn primary"
                  onClick={() => {
                    fraudWorkflow.executeL1NavigateToAsk();
                    if (onNavigateTab) onNavigateTab('ask');
                  }}
                >
                  <span>View Steps</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            )}

            {/* ==========================================
                L2 WORKFLOW STATES (Two-Step Manual Approval)
                ========================================== */}

            {/* L2 State 1: Freeze Prompt */}
            {incident.status === 'l2_freeze_prompt' && (
              <div className="incident-content">
                <div className="incident-header">
                  <div className="incident-icon-pulse danger">
                    <ShieldAlert size={20} color="#f59e0b" />
                  </div>
                  <div className="incident-title-block">
                    <div className="incident-badge l2-badge">L2 Semi-Autonomous</div>
                    <div className="incident-title">Emergency Freeze Required</div>
                  </div>
                </div>

                <p className="incident-desc">
                  Unauthorized charge of{' '}
                  <strong style={{ color: '#fff' }}>₹{incident.amount?.toLocaleString('en-IN')}</strong> flagged on card{' '}
                  <strong>•••• {incident.cardLast4}</strong> at <em>{incident.merchant || 'International POS'}</em>.
                </p>

                <button
                  className="incident-action-btn danger"
                  onClick={() => fraudWorkflow.executeL2Freeze()}
                >
                  <Lock size={15} />
                  <span>Freeze Now</span>
                </button>
              </div>
            )}

            {/* L2 State 2: Freezing In Progress */}
            {incident.status === 'l2_freezing' && (
              <div className="incident-content">
                <div className="incident-header">
                  <div className="incident-icon-pulse spin">
                    <Loader2 size={20} color="#f59e0b" />
                  </div>
                  <div className="incident-title-block">
                    <div className="incident-badge l2-badge">L2 Background Worker</div>
                    <div className="incident-title">Freezing Card in Progress...</div>
                  </div>
                </div>

                <p className="incident-desc">
                  Issuing emergency block command to domestic and international card networks for •••• {incident.cardLast4}...
                </p>

                <div className="incident-progress-box">
                  <div className="incident-progress-track">
                    <motion.div
                      className="incident-progress-fill freeze-fill"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 10, ease: 'linear' }}
                    />
                  </div>
                  <div className="progress-meta-row">
                    <span className="progress-status-text">Network handshake active</span>
                  </div>
                </div>
              </div>
            )}

            {/* L2 State 3: Freeze Completed / Replace Prompt */}
            {incident.status === 'l2_freeze_done' && (
              <div className="incident-content">
                <div className="incident-header">
                  <div className="incident-icon-pulse success">
                    <CheckCircle2 size={20} color="#10b981" />
                  </div>
                  <div className="incident-title-block">
                    <div className="incident-badge l2-badge">L2 Card Secured</div>
                    <div className="incident-title">Card Freezed Successfully</div>
                  </div>
                </div>

                <p className="incident-desc">
                  Card <strong>•••• {incident.cardLast4}</strong> is now locked. All further payments are blocked. Would you like to issue a replacement card?
                </p>

                <button
                  className="incident-action-btn primary"
                  onClick={() => fraudWorkflow.executeL2Replace()}
                >
                  <RefreshCw size={15} />
                  <span>Apply for New Card</span>
                </button>
              </div>
            )}

            {/* L2 State 4: Replacing In Progress */}
            {incident.status === 'l2_replacing' && (
              <div className="incident-content">
                <div className="incident-header">
                  <div className="incident-icon-pulse spin">
                    <Loader2 size={20} color="#a855f7" />
                  </div>
                  <div className="incident-title-block">
                    <div className="incident-badge l2-badge">L2 Digital Provisioning</div>
                    <div className="incident-title">Replacing Card in Progress...</div>
                  </div>
                </div>

                <p className="incident-desc">
                  Generating verified 16-digit credit card number, fresh dynamic CVV, and updating security vault...
                </p>

                <div className="incident-progress-box">
                  <div className="incident-progress-track">
                    <motion.div
                      className="incident-progress-fill replace-fill"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 10, ease: 'linear' }}
                    />
                  </div>
                  <div className="progress-meta-row">
                    <span className="progress-status-text">RBI tokenization & key sync</span>
                  </div>
                </div>
              </div>
            )}

            {/* L2 State 5: Replaced & Issued */}
            {incident.status === 'l2_replaced' && (
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
                      •••• {incident.newCard?.last4 || 'Active'}
                    </div>
                  </div>
                </div>

                <p className="incident-desc" style={{ marginTop: '0.25rem' }}>
                  Your new card has been generated and connected to your account. All payments have been reactivated.
                </p>

                <button
                  className="incident-action-btn success"
                  onClick={() => {
                    fraudWorkflow.executeL2ViewNewCard();
                    if (onNavigateTab) onNavigateTab('glance');
                  }}
                >
                  <CreditCard size={15} />
                  <span>View New Card</span>
                </button>
              </div>
            )}

            {/* ==========================================
                L3 WORKFLOW STATES (Unified Single-Click Action)
                ========================================== */}

            {/* L3 State 1: Unified Prompt (Freeze & Replace) */}
            {incident.status === 'l3_unified_prompt' && (
              <div className="incident-content">
                <div className="incident-header">
                  <div className="incident-icon-pulse danger">
                    <ShieldAlert size={20} color="#10b981" />
                  </div>
                  <div className="incident-title-block">
                    <div className="incident-badge l3-badge">L3 High Autonomy</div>
                    <div className="incident-title">Emergency Autonomous Action</div>
                  </div>
                </div>

                <p className="incident-desc">
                  Unauthorized charge of{' '}
                  <strong style={{ color: '#fff' }}>₹{incident.amount?.toLocaleString('en-IN')}</strong> flagged on card{' '}
                  <strong>•••• {incident.cardLast4}</strong> at <em>{incident.merchant || 'International POS'}</em>.
                </p>

                <button
                  className="incident-action-btn danger"
                  onClick={() => fraudWorkflow.executeL3Unified()}
                >
                  <Lock size={15} />
                  <span>Freeze & Replace</span>
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
                    <div className="incident-badge l3-badge">L3 Autonomous • Step 1/2</div>
                    <div className="incident-title">Freezing Card in Progress...</div>
                  </div>
                </div>

                <p className="incident-desc">
                  Issuing emergency block command to card network... Card replacement will follow automatically.
                </p>

                {/* Progress bar (10 seconds) */}
                <div className="incident-progress-box">
                  <div className="incident-progress-track">
                    <motion.div
                      className="incident-progress-fill freeze-fill"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 10, ease: 'linear' }}
                    />
                  </div>
                  <div className="progress-meta-row">
                    <span className="progress-status-text">Network handshake active • Auto-provision queued</span>
                  </div>
                </div>
              </div>
            )}

            {/* L3 State 3: Auto-Replacing In Progress */}
            {incident.status === 'l3_replacing' && (
              <div className="incident-content">
                <div className="incident-header">
                  <div className="incident-icon-pulse spin">
                    <Loader2 size={20} color="#a855f7" />
                  </div>
                  <div className="incident-title-block">
                    <div className="incident-badge l3-badge">L3 Autonomous • Step 2/2</div>
                    <div className="incident-title">Replacing Card in Progress...</div>
                  </div>
                </div>

                <p className="incident-desc">
                  Generating verified 16-digit credit card number, fresh dynamic CVV, and updating security vault...
                </p>

                {/* Progress bar (10 seconds) */}
                <div className="incident-progress-box">
                  <div className="incident-progress-track">
                    <motion.div
                      className="incident-progress-fill replace-fill"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 10, ease: 'linear' }}
                    />
                  </div>
                  <div className="progress-meta-row">
                    <span className="progress-status-text">RBI tokenization & automated key sync</span>
                  </div>
                </div>
              </div>
            )}

            {/* L3 State 4: Replaced & Issued */}
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
                      •••• {incident.newCard?.last4 || 'Active'}
                    </div>
                  </div>
                </div>

                <p className="incident-desc" style={{ marginTop: '0.25rem' }}>
                  Your new card has been generated and connected to your account. All payments have been reactivated.
                </p>

                <button
                  className="incident-action-btn success"
                  onClick={() => {
                    fraudWorkflow.executeL3ViewNewCard();
                    if (onNavigateTab) onNavigateTab('glance');
                  }}
                >
                  <CreditCard size={15} />
                  <span>View New Card</span>
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          /* Case 2: Clean Empty State (No Active Actions) */
          <motion.div
            key="act-empty-state"
            className="act-empty-state-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="act-empty-icon-wrap">
              <ShieldCheck size={32} color="#10b981" />
            </div>
            <div className="act-empty-title">All Systems Protected</div>
            <p className="act-empty-desc">
              No active security incidents or background actions. Lumen AI is monitoring your cards and routines in the background.
            </p>
            <div className="act-empty-badge">
              <span className="act-status-dot" />
              <span>Guardrails Standing By</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
