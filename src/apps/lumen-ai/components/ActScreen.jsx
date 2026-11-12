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
  Cpu,
  MapPin,
  Edit3,
  Check,
  X,
  AlertCircle,
  Clock
} from 'lucide-react';
import { trustStorage } from '../services/trustStorage';
import { fraudWorkflow } from '../services/fraudWorkflow';
import { disputeWorkflow } from '../services/disputeWorkflow';
import { formatRelativeTime } from '../services/financeStorage';

export default function ActScreen({ onNavigateTab }) {
  const [incident, setIncident] = useState(() => trustStorage.getFraudIncident());
  const [disputeIncident, setDisputeIncident] = useState(() => trustStorage.getDisputeIncident());
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState(() => trustStorage.getUserAddress());

  useEffect(() => {
    const unsub = trustStorage.subscribe((event, data) => {
      if (event === 'incident_updated') {
        setIncident(data);
      } else if (event === 'dispute_incident_updated') {
        setDisputeIncident(data);
      } else if (event === 'address_updated') {
        setAddressInput(data);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (incident?.deliveryAddress) {
      setAddressInput(incident.deliveryAddress);
    } else {
      setAddressInput(trustStorage.getUserAddress());
    }
    setIsEditingAddress(false);
  }, [incident?.deliveryAddress, incident?.status]);

  const handleSaveAddress = () => {
    if (addressInput.trim()) {
      trustStorage.setUserAddress(addressInput.trim());
      setIsEditingAddress(false);
    }
  };

  const handleCancelAddress = () => {
    setAddressInput(incident?.deliveryAddress || trustStorage.getUserAddress());
    setIsEditingAddress(false);
  };

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

  const isL1Dispute = Boolean(
    disputeIncident &&
    (!disputeIncident.autonomyLevel || disputeIncident.autonomyLevel === 'l1')
  );

  return (
    <div
      className="lumen-act-scroll"
      style={{
        flex: 1,
        minHeight: 0,
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '0.85rem 0.85rem 6.5rem',
        boxSizing: 'border-box',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <AnimatePresence>
        {/* Case A: Active Duplicate Transaction Dispute Action Card */}
        {disputeIncident && (
          <motion.div
            key={disputeIncident.id || 'dispute-incident-card'}
            className="act-incident-card"
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.2 }}
            style={{
              borderColor: 'rgba(245, 158, 11, 0.45)',
              padding: '0.9rem 0.85rem',
              margin: 'auto 0',
              marginBottom: hasValidIncident ? '12px' : 'auto',
              width: '100%',
              maxWidth: '100%',
              maxHeight: '100%',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            <div className="incident-content">
              <div className="incident-header" style={{ alignItems: 'flex-start', gap: '10px' }}>
                <div
                  className="incident-icon-pulse"
                  style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    borderColor: 'rgba(245, 158, 11, 0.4)',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                >
                  <AlertCircle size={18} color="#f59e0b" />
                </div>
                <div className="incident-title-block" style={{ minWidth: 0, flex: 1 }}>
                  <div
                    className="incident-badge"
                    style={{
                      background: 'rgba(56, 189, 248, 0.14)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      fontSize: '0.62rem',
                      padding: '2px 7px',
                      borderRadius: '99px',
                      marginBottom: '3px'
                    }}
                  >
                    {disputeIncident.autonomyLevel === 'l1'
                      ? 'L1 Guided Review'
                      : disputeIncident.autonomyLevel === 'l2'
                        ? 'L2 Semi-Auto'
                        : 'L3 Autonomous'}
                  </div>
                  <div
                    className="incident-title"
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      color: '#fff',
                      whiteSpace: 'normal',
                      lineHeight: 1.25,
                      wordBreak: 'break-word'
                    }}
                  >
                    Duplicate Charge Detected
                  </div>
                </div>
              </div>

              <p className="incident-desc" style={{ fontSize: '0.74rem', lineHeight: 1.35, marginTop: '8px' }}>
                Lumen AI detected an unintentional duplicate payment of{' '}
                <strong style={{ color: '#fff' }}>
                  ₹{disputeIncident.amount?.toLocaleString('en-IN')}
                </strong>{' '}
                to <strong style={{ color: '#fff' }}>{disputeIncident.merchant}</strong>.
              </p>

              {/* Customer-Oriented Real Transaction Breakdown */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '9px 11px',
                  margin: '9px 0 11px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '7px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem' }}>
                  <span style={{ color: '#94a3b8' }}>Latest Transaction ID</span>
                  <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.76rem' }}>
                    {disputeIncident.currentTxnId}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem' }}>
                  <span style={{ color: '#94a3b8' }}>Original Transaction ID</span>
                  <span style={{ color: '#cbd5e1', fontFamily: 'monospace', fontSize: '0.74rem' }}>
                    {disputeIncident.previousTxnId}
                  </span>
                </div>

                <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.06)', margin: '1px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem' }}>
                  <span style={{ color: '#94a3b8' }}>Merchant / Recipient</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{disputeIncident.merchant}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem' }}>
                  <span style={{ color: '#94a3b8' }}>Duplicate Amount</span>
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>
                    ₹{disputeIncident.amount?.toLocaleString('en-IN')}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem' }}>
                  <span style={{ color: '#94a3b8' }}>Payment Account</span>
                  <span style={{ color: '#cbd5e1' }}>{disputeIncident.sourceName}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem' }}>
                  <span style={{ color: '#94a3b8' }}>Original Charge</span>
                  <span style={{ color: '#cbd5e1' }}>
                    {formatRelativeTime(disputeIncident.previousTxnTime)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem' }}>
                  <span style={{ color: '#94a3b8' }}>Duplicate Charge</span>
                  <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                    {formatRelativeTime(disputeIncident.currentTxnTime)}
                  </span>
                </div>
              </div>

              {/* Only show Mark as Read button for L1 dispute */}
              {isL1Dispute && (
                <button
                  className="incident-action-btn success"
                  onClick={() => disputeWorkflow.resolveDispute()}
                  style={{ width: '100%', marginTop: '2px', padding: '0.6rem 0.8rem', fontSize: '0.76rem' }}
                >
                  <CheckCircle2 size={15} />
                  <span>Mark as read</span>
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Case B: Active Fraud Incident Action Card */}
        {hasValidIncident && (
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

            {/* L2 State 3: Card Locked / Prompt for Replacement with Address Verification */}
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
                  No further charges can go through on card <strong>•••• {incident.cardLast4}</strong>. Verify your delivery address for physical card dispatch:
                </p>

                {/* Interactive Address Box */}
                <div className="act-address-box">
                  {!isEditingAddress ? (
                    <div className="act-address-view">
                      <div className="act-address-header">
                        <span className="act-address-label">
                          <MapPin size={13} className="act-address-pin" /> Physical Card Delivery Address
                        </span>
                        <button
                          type="button"
                          className="act-address-edit-btn"
                          onClick={() => setIsEditingAddress(true)}
                        >
                          <Edit3 size={12} />
                          <span>Edit</span>
                        </button>
                      </div>
                      <div className="act-address-value">
                        {addressInput || trustStorage.getUserAddress()}
                      </div>
                    </div>
                  ) : (
                    <div className="act-address-edit-form">
                      <div className="act-address-edit-title">
                        <MapPin size={13} /> Edit Delivery Address:
                      </div>
                      <textarea
                        className="act-address-textarea"
                        value={addressInput}
                        onChange={(e) => setAddressInput(e.target.value)}
                        rows={2}
                        placeholder="Enter full address for card delivery..."
                      />
                      <div className="act-address-edit-actions">
                        <button
                          type="button"
                          className="act-addr-btn cancel"
                          onClick={handleCancelAddress}
                        >
                          <X size={12} /> Cancel
                        </button>
                        <button
                          type="button"
                          className="act-addr-btn save"
                          onClick={handleSaveAddress}
                        >
                          <Check size={12} /> Save Address
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  className="incident-action-btn primary"
                  onClick={() => fraudWorkflow.executeL2Replace(addressInput)}
                >
                  <RefreshCw size={15} />
                  <span>Confirm & Replace Card</span>
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
                    <div className="incident-badge l2-badge">L2 Card Delivery</div>
                    <div className="incident-title">New Card on the Way</div>
                  </div>
                </div>

                <p className="incident-desc">
                  Your old card is locked. We are preparing your new physical card for dispatch to <strong>{(incident.deliveryAddress || trustStorage.getUserAddress()).split(',')[0]}</strong> and activating an instant digital card.
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
                    <span className="progress-status-text">Activating instant digital card • Preparing dispatch</span>
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
                  <span>Lock & Replace Card</span>
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
                    <div className="incident-title">New Card on the Way</div>
                  </div>
                </div>

                <p className="incident-desc">
                  Compromised card is locked. Dispatching your physical card to verified address on file (<strong>{(incident.deliveryAddress || trustStorage.getUserAddress()).split(',')[0]}</strong>) and activating an instant digital card.
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
                    <span className="progress-status-text">Step 2 of 2: Activating instant digital card • Preparing dispatch</span>
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
        )}

        {/* Case C: Clean Empty State (No Active Actions) */}
        {!hasValidIncident && !disputeIncident && (
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
