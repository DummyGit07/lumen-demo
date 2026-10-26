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
                  A charge of <strong style={{ color: '#fff' }}>₹{incident.amount?.toLocaleString('en-IN')}</strong> was detected on card <strong>•••• {incident.cardLast4}</strong>. Did you authorize this transaction?
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
                    <div className="incident-badge l1-badge">L1 Guided Assistance</div>
                    <div className="incident-title">Card Protection Steps</div>
                  </div>
                </div>

                <p className="incident-desc">
                  We flagged an unauthorized charge of{' '}
                  <strong style={{ color: '#fff' }}>₹{incident.amount?.toLocaleString('en-IN')}</strong> on card{' '}
                  <strong>•••• {incident.cardLast4}</strong>. Follow our guided checklist in Ask to safely lock your card and request a replacement.
                </p>

                <button
                  className="incident-action-btn primary"
                  onClick={() => {
                    fraudWorkflow.executeL1NavigateToAsk();
                    if (onNavigateTab) onNavigateTab('ask');
                  }}
                >
                  <span>View Guided Steps</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            )}

            {/* ==========================================
                L2 WORKFLOW STATES (Two-Step Manual Approval)
                ========================================== */}

            {/* L2 State 1: Lock Prompt */}
            {incident.status === 'l2_freeze_prompt' && (
              <div className="incident-content">
                <div className="incident-header">
                  <div className="incident-icon-pulse danger">
                    <ShieldAlert size={20} color="#f59e0b" />
                  </div>
                  <div className="incident-title-block">
                    <div className="incident-badge l2-badge">L2 Semi-Autonomous</div>
                    <div className="incident-title">Suspicious Charge Flagged</div>
                  </div>
                </div>

                <p className="incident-desc">
                  We detected an unauthorized charge of{' '}
                  <strong style={{ color: '#fff' }}>₹{incident.amount?.toLocaleString('en-IN')}</strong> on card{' '}
                  <strong>•••• {incident.cardLast4}</strong> at <em>{incident.merchant || 'International POS'}</em>. We recommend locking this card immediately to prevent further charges.
                </p>

                <button
                  className="incident-action-btn danger"
                  onClick={() => fraudWorkflow.executeL2Freeze()}
                >
                  <Lock size={15} />
                  <span>Lock Card</span>
                </button>
              </div>
            )}

            {/* L2 State 2: Locking In Progress */}
            {incident.status === 'l2_freezing' && (
              <div className="incident-content">
                <div className="incident-header">
                  <div className="incident-icon-pulse spin">
                    <Loader2 size={20} color="#f59e0b" />
                  </div>
                  <div className="incident-title-block">
                    <div className="incident-badge l2-badge">L2 Security Action</div>
                    <div className="incident-title">Securing Your Card...</div>
                  </div>
                </div>

                <p className="incident-desc">
                  Temporarily locking your card across all domestic and international payment networks...
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
                    <span className="progress-status-text">Locking card across payment networks</span>
                  </div>
                </div>
              </div>
            )}

            {/* L2 State 3: Card Locked / Prompt for Replacement */}
            {incident.status === 'l2_freeze_done' && (
              <div className="incident-content">
                <div className="incident-header">
                  <div className="incident-icon-pulse success">
                    <CheckCircle2 size={20} color="#10b981" />
                  </div>
                  <div className="incident-title-block">
                    <div className="incident-badge l2-badge">L2 Card Secured</div>
                    <div className="incident-title">Card Successfully Locked</div>
                  </div>
                </div>

                <p className="incident-desc">
                  No further charges can go through on card <strong>•••• {incident.cardLast4}</strong>. Would you like us to generate a new card now?
                </p>

                <button
                  className="incident-action-btn primary"
                  onClick={() => fraudWorkflow.executeL2Replace()}
                >
                  <RefreshCw size={15} />
                  <span>Order Replacement Card</span>
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
                    <div className="incident-badge l2-badge">L2 Card Replacement</div>
                    <div className="incident-title">Generating Replacement Card...</div>
                  </div>
                </div>

                <p className="incident-desc">
                  Setting up your new digital card with fresh security credentials...
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
                    <span className="progress-status-text">Creating verified digital card credentials</span>
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
                    <div className="incident-title">Your New Card is Ready</div>
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
                  Your new credit card is active and ready to use immediately.
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

            {/* L3 State 1: Unified Prompt (Lock & Replace) */}
            {incident.status === 'l3_unified_prompt' && (
              <div className="incident-content">
                <div className="incident-header">
                  <div className="incident-icon-pulse danger">
                    <ShieldAlert size={20} color="#10b981" />
                  </div>
                  <div className="incident-title-block">
                    <div className="incident-badge l3-badge">L3 High Autonomy</div>
                    <div className="incident-title">Suspicious Charge Flagged</div>
                  </div>
                </div>

                <p className="incident-desc">
                  We detected an unauthorized charge of{' '}
                  <strong style={{ color: '#fff' }}>₹{incident.amount?.toLocaleString('en-IN')}</strong> on card{' '}
                  <strong>•••• {incident.cardLast4}</strong> at <em>{incident.merchant || 'International POS'}</em>. We recommend locking your compromised card and instantly issuing a safe replacement card.
                </p>

                <button
                  className="incident-action-btn danger"
                  onClick={() => fraudWorkflow.executeL3Unified()}
                >
                  <Lock size={15} />
                  <span>Lock & Replace</span>
                </button>
              </div>
            )}

            {/* L3 State 2: Locking In Progress */}
            {incident.status === 'l3_freezing' && (
              <div className="incident-content">
                <div className="incident-header">
                  <div className="incident-icon-pulse spin">
                    <Loader2 size={20} color="#38bdf8" />
                  </div>
                  <div className="incident-title-block">
                    <div className="incident-badge l3-badge">L3 Autonomous • Step 1/2</div>
                    <div className="incident-title">Securing Your Card...</div>
                  </div>
                </div>

                <p className="incident-desc">
                  Locking your compromised card to prevent further charges... Replacement card will follow automatically.
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
                    <span className="progress-status-text">Step 1 of 2: Locking card across all networks</span>
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
                    <div className="incident-title">Generating Your New Card</div>
                  </div>
                </div>

                <p className="incident-desc">
                  Card locked. Now creating your new credit card with fresh security credentials
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
                    <span className="progress-status-text">Step 2 of 2: Setting up fresh digital credentials</span>
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
                    <div className="incident-badge success-badge">Autonomous Complete</div>
                    <div className="incident-title">Your New Card is Ready</div>
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
                  Your compromised card has been blocked and your new digital card is ready for use.
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
