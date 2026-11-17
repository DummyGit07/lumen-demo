import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle2,
  Info,
  Sliders,
  Globe2,
  Lock,
  ArrowRight,
  X,
  Bot
} from 'lucide-react';
import { trustStorage } from '../services/trustStorage';

export default function TrustScreen({ onNavigateTab }) {
  const [activeTab, setActiveTab] = useState('agents'); // 'agents' | 'autonomy'
  const [autonomyLevel, setAutonomyLevel] = useState(() => trustStorage.getAutonomyLevel());
  const [disputeAutonomyLevel, setDisputeAutonomyLevel] = useState(() => trustStorage.getDisputeAutonomyLevel());

  // Modular policy states
  const [approvalLimit, setApprovalLimit] = useState(() => {
    try {
      const stored = localStorage.getItem('lumen_trust_approval_limit');
      return stored ? Number(stored) : 15000;
    } catch {
      return 15000;
    }
  });

  const [foreignGuard, setForeignGuard] = useState(() => {
    try {
      const stored = localStorage.getItem('lumen_trust_foreign_guard');
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  const [activeInfoCard, setActiveInfoCard] = useState(null); // 'spectrum' | 'dispute' | 'limit' | 'foreign' | null
  const [toastMessage, setToastMessage] = useState('');

  // Subscribe to external autonomy changes (e.g. from simulator or drawer)
  useEffect(() => {
    const unsub = trustStorage.subscribe((event, data) => {
      if (event === 'autonomy_changed') {
        setAutonomyLevel(data);
      } else if (event === 'dispute_autonomy_changed') {
        setDisputeAutonomyLevel(data);
      }
    });
    return unsub;
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2200);
  };

  const handleSelectAutonomy = (levelKey) => {
    const updated = trustStorage.setAutonomyLevel(levelKey);
    setAutonomyLevel(updated);
    const labelMap = {
      l1: 'L1 Guided',
      l2: 'L2 Semi-Auto',
      l3: 'L3 Autonomous'
    };
    // showToast(`Card Autonomy set to ${labelMap[updated] || 'L1 Guided'}`);
  };

  const handleSelectDisputeAutonomy = (levelKey) => {
    const updated = trustStorage.setDisputeAutonomyLevel(levelKey);
    setDisputeAutonomyLevel(updated);
    const labelMap = {
      l1: 'L1 Guided',
      l2: 'L2 Semi-Auto',
      l3: 'L3 Autonomous'
    };
    // showToast(`Dispute Guard set to ${labelMap[updated] || 'L1 Guided'}`);
  };

  const handleLimitChange = (val) => {
    setApprovalLimit(val);
    try {
      localStorage.setItem('lumen_trust_approval_limit', String(val));
    } catch {
      // ignore
    }
  };

  const toggleForeignGuard = () => {
    const next = !foreignGuard;
    setForeignGuard(next);
    try {
      localStorage.setItem('lumen_trust_foreign_guard', JSON.stringify(next));
    } catch {
      // ignore
    }
    showToast(next ? 'International shield active' : 'International shield paused');
  };

  const toggleInfo = (cardKey) => {
    setActiveInfoCard((curr) => (curr === cardKey ? null : cardKey));
  };

  const isL1 = autonomyLevel === 'l1';
  const isL2 = autonomyLevel === 'l2';
  const isL3 = autonomyLevel === 'l3';

  const themeColor = isL1 ? '#38bdf8' : isL2 ? '#f59e0b' : '#10b981';
  const badgeLabel = isL1 ? 'L1 Guided' : isL2 ? 'L2 Semi-Auto' : 'L3 Autonomous';
  const badgeBg = isL1
    ? 'rgba(56, 189, 248, 0.14)'
    : isL2
      ? 'rgba(245, 158, 11, 0.14)'
      : 'rgba(16, 185, 129, 0.14)';
  const badgeBorder = isL1
    ? 'rgba(56, 189, 248, 0.3)'
    : isL2
      ? 'rgba(245, 158, 11, 0.3)'
      : 'rgba(16, 185, 129, 0.3)';

  const isDispL1 = disputeAutonomyLevel === 'l1';
  const isDispL2 = disputeAutonomyLevel === 'l2';
  const isDispL3 = disputeAutonomyLevel === 'l3';

  const dispThemeColor = isDispL1 ? '#38bdf8' : isDispL2 ? '#f59e0b' : '#10b981';
  const dispBadgeLabel = isDispL1 ? 'L1 Guided' : isDispL2 ? 'L2 Semi-Auto' : 'L3 Autonomous';
  const dispBadgeBg = isDispL1
    ? 'rgba(56, 189, 248, 0.14)'
    : isDispL2
      ? 'rgba(245, 158, 11, 0.14)'
      : 'rgba(16, 185, 129, 0.14)';
  const dispBadgeBorder = isDispL1
    ? 'rgba(56, 189, 248, 0.3)'
    : isDispL2
      ? 'rgba(245, 158, 11, 0.3)'
      : 'rgba(16, 185, 129, 0.3)';

  return (
    <div className="lumen-trust-scroll">
      {/* 1. Top Header */}
      <div className="trust-hero-bar">
        <div className="trust-hero-left">
          <div className="trust-hero-icon-box">
            <ShieldCheck size={22} color="#818cf8" />
          </div>
          <div>
            <div className="trust-hero-title">Trust & Autonomy</div>
            <div className="trust-hero-subtitle">Permissions & proactive guardrails</div>
          </div>
        </div>

        <div className="trust-guard-pill">
          <span className="trust-status-dot-pulse" />
          <span>Active</span>
        </div>
      </div>

      {/* Floating Save Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            className="trust-save-toast"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <CheckCircle2 size={13} color="#10b981" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Section Selector Tabs: Agent Limits vs Autonomy Levels */}
      <div className="trust-tabs-container">
        <button
          className={`trust-tab-btn ${activeTab === 'agents' ? 'active' : ''}`}
          onClick={() => setActiveTab('agents')}
        >
          <Bot size={14} />
          <span>Agent Limits</span>
        </button>
        <button
          className={`trust-tab-btn ${activeTab === 'autonomy' ? 'active' : ''}`}
          onClick={() => setActiveTab('autonomy')}
        >
          <Sliders size={14} />
          <span>Autonomy Levels</span>
        </button>
      </div>

      {/* ========================================================
          SECTION 1: AGENT LIMITS / CONFIGURATION
          ======================================================== */}
      {activeTab === 'agents' && (
        <motion.div
          key="agent-limits-section"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
        >
          <div className="agent-config-placeholder-card">
            <div className="agent-config-placeholder-icon">
              <Bot size={26} />
            </div>
            <div>
              <div className="agent-config-placeholder-title">Agent Configuration & Limits</div>
              <div className="agent-config-placeholder-desc">
                Configure authorized AI agents (e.g. Alexa, ChatGPT, Copilot) and define spending guardrails.
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================
          SECTION 2: AUTONOMY LEVELS (Card Mgmt & Dispute Detection)
          ======================================================== */}
      {activeTab === 'autonomy' && (
        <motion.div
          key="autonomy-levels-section"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
        >
          {/* Card Mgmt Autonomy Card */}
          <div
            className="spectrum-card"
            style={{
              borderColor: isL1
                ? 'rgba(56, 189, 248, 0.35)'
                : isL2
                  ? 'rgba(245, 158, 11, 0.35)'
                  : 'rgba(16, 185, 129, 0.4)'
            }}
          >
            <div className="spectrum-header">
              <div className="spectrum-header-title">
                <span>Card Mgmt</span>
                <span
                  className="spectrum-badge"
                  style={{
                    color: themeColor,
                    background: badgeBg,
                    borderColor: badgeBorder
                  }}
                >
                  {badgeLabel}
                </span>
              </div>

              <button
                className={`trust-info-trigger-btn ${activeInfoCard === 'spectrum' ? 'active' : ''}`}
                onClick={() => toggleInfo('spectrum')}
                onMouseEnter={() => setActiveInfoCard('spectrum')}
                title="What is Autonomy Spectrum?"
              >
                <Info size={14} />
              </button>
            </div>

            {/* Info Popover */}
            <AnimatePresence>
              {activeInfoCard === 'spectrum' && (
                <motion.div
                  className="trust-info-popover"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="trust-info-popover-title">Autonomy Spectrum Explained</div>
                    <button
                      onClick={() => setActiveInfoCard(null)}
                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <div className="trust-info-popover-text">
                    Controls the authority you delegate to Lumen AI during fraud & unauthorized transactions.<br />
                    • <strong>L1 Guided:</strong> AI flags anomalies and provides step-by-step guidance in Ask. You freeze and order cards yourself.<br />
                    • <strong>L2 Semi-Auto:</strong> AI provides step-by-step confirmation. You approve card freeze first, then approve replacement.<br />
                    • <strong>L3 Autonomous:</strong> AI acts with 1-click &ldquo;Freeze &amp; Replace&rdquo;, automatically locking the card and issuing a ready-to-use digital card.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Segmented Horizontal Slider Track */}
            <div className="spectrum-track-container">
              <div className="spectrum-track">
                {/* Active sliding indicator background */}
                <motion.div
                  className="spectrum-slider-thumb"
                  layout
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  style={{
                    left: isL1 ? '2px' : isL2 ? 'calc(33.33% + 1px)' : 'calc(66.66% - 2px)',
                    width: 'calc(33.33% - 2px)',
                    background: isL1
                      ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(59, 130, 246, 0.35))'
                      : isL2
                        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(217, 119, 6, 0.35))'
                        : 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.35))',
                    borderColor: themeColor,
                    boxShadow: `0 0 16px ${isL1 ? 'rgba(56, 189, 248, 0.3)' : isL2 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                  }}
                />

                {/* Segment 1: L1 Guided */}
                <button
                  className={`spectrum-seg-btn ${isL1 ? 'active' : ''}`}
                  onClick={() => handleSelectAutonomy('l1')}
                >
                  <span className="spectrum-seg-num" style={{ color: isL1 ? '#38bdf8' : '#94a3b8' }}>
                    L1
                  </span>
                  <span className="spectrum-seg-label">Guided</span>
                </button>

                {/* Segment 2: L2 Semi-Auto */}
                <button
                  className={`spectrum-seg-btn ${isL2 ? 'active' : ''}`}
                  onClick={() => handleSelectAutonomy('l2')}
                >
                  <span className="spectrum-seg-num" style={{ color: isL2 ? '#f59e0b' : '#94a3b8' }}>
                    L2
                  </span>
                  <span className="spectrum-seg-label">Semi-Auto</span>
                </button>

                {/* Segment 3: L3 Autonomous */}
                <button
                  className={`spectrum-seg-btn ${isL3 ? 'active' : ''}`}
                  onClick={() => handleSelectAutonomy('l3')}
                >
                  <span className="spectrum-seg-num" style={{ color: isL3 ? '#10b981' : '#94a3b8' }}>
                    L3
                  </span>
                  <span className="spectrum-seg-label">Autonomous</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dispute Detection Autonomy Card */}
          <div
            className="spectrum-card"
            style={{
              marginTop: '2px',
              borderColor: isDispL1
                ? 'rgba(56, 189, 248, 0.35)'
                : isDispL2
                  ? 'rgba(245, 158, 11, 0.35)'
                  : 'rgba(16, 185, 129, 0.4)'
            }}
          >
            <div className="spectrum-header">
              <div className="spectrum-header-title">
                <span>Dispute Detection</span>
                <span
                  className="spectrum-badge"
                  style={{
                    color: dispThemeColor,
                    background: dispBadgeBg,
                    borderColor: dispBadgeBorder
                  }}
                >
                  {dispBadgeLabel}
                </span>
              </div>

              <button
                className={`trust-info-trigger-btn ${activeInfoCard === 'dispute' ? 'active' : ''}`}
                onClick={() => toggleInfo('dispute')}
                onMouseEnter={() => setActiveInfoCard('dispute')}
                title="What is Dispute Detection Autonomy?"
              >
                <Info size={14} />
              </button>
            </div>

            {/* Info Popover */}
            <AnimatePresence>
              {activeInfoCard === 'dispute' && (
                <motion.div
                  className="trust-info-popover"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="trust-info-popover-title">Dispute Detection Autonomy</div>
                    <button
                      onClick={() => setActiveInfoCard(null)}
                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <div className="trust-info-popover-text">
                    Monitors and resolves unintentional duplicate transactions sent to the same merchant or recipient.<br />
                    • <strong>L1 Guided:</strong> Flags duplicate payments with full transaction IDs and alerts you. You review and mark complete manually.<br />
                    • <strong>L2 Semi-Auto:</strong> Flags duplicate payments and prepares a 1-click merchant reversal request with step-by-step confirmation.<br />
                    • <strong>L3 Autonomous:</strong> AI automatically initiates real-time payment gateway chargeback or reversal without requiring manual confirmation.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Segmented Horizontal Slider Track */}
            <div className="spectrum-track-container">
              <div className="spectrum-track">
                {/* Active sliding indicator background */}
                <motion.div
                  className="spectrum-slider-thumb"
                  layout
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  style={{
                    left: isDispL1 ? '2px' : isDispL2 ? 'calc(33.33% + 1px)' : 'calc(66.66% - 2px)',
                    width: 'calc(33.33% - 2px)',
                    background: isDispL1
                      ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(59, 130, 246, 0.35))'
                      : isDispL2
                        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(217, 119, 6, 0.35))'
                        : 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.35))',
                    borderColor: dispThemeColor,
                    boxShadow: `0 0 16px ${isDispL1 ? 'rgba(56, 189, 248, 0.3)' : isDispL2 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                  }}
                />

                {/* Segment 1: L1 Guided */}
                <button
                  className={`spectrum-seg-btn ${isDispL1 ? 'active' : ''}`}
                  onClick={() => handleSelectDisputeAutonomy('l1')}
                >
                  <span className="spectrum-seg-num" style={{ color: isDispL1 ? '#38bdf8' : '#94a3b8' }}>
                    L1
                  </span>
                  <span className="spectrum-seg-label">Guided</span>
                </button>

                {/* Segment 2: L2 Semi-Auto */}
                <button
                  className={`spectrum-seg-btn ${isDispL2 ? 'active' : ''}`}
                  onClick={() => handleSelectDisputeAutonomy('l2')}
                >
                  <span className="spectrum-seg-num" style={{ color: isDispL2 ? '#f59e0b' : '#94a3b8' }}>
                    L2
                  </span>
                  <span className="spectrum-seg-label">Semi-Auto</span>
                </button>

                {/* Segment 3: L3 Autonomous */}
                <button
                  className={`spectrum-seg-btn ${isDispL3 ? 'active' : ''}`}
                  onClick={() => handleSelectDisputeAutonomy('l3')}
                >
                  <span className="spectrum-seg-num" style={{ color: isDispL3 ? '#10b981' : '#94a3b8' }}>
                    L3
                  </span>
                  <span className="spectrum-seg-label">Autonomous</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div >
  );
}
