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
  Bot,
  Pencil,
  Trash2,
  Plus
} from 'lucide-react';
import { trustStorage } from '../services/trustStorage';
import { agentStorage } from '../services/agentStorage';

export default function TrustScreen({ onNavigateTab }) {
  const [activeTab, setActiveTab] = useState('autonomy'); // 'autonomy' | 'agents'
  const [autonomyLevel, setAutonomyLevel] = useState(() => trustStorage.getAutonomyLevel());
  const [disputeAutonomyLevel, setDisputeAutonomyLevel] = useState(() => trustStorage.getDisputeAutonomyLevel());
  const [agents, setAgents] = useState(() => agentStorage.getAgents());

  // Modal State for Add / Edit Agent
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null); // null if adding, agent object if editing
  const [formName, setFormName] = useState('Alexa');
  const [customName, setCustomName] = useState('');
  const [formLimit, setFormLimit] = useState('10000');
  const [formPeriod, setFormPeriod] = useState('monthly');
  const [formError, setFormError] = useState('');

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

  // Subscribe to agent storage updates
  useEffect(() => {
    const unsub = agentStorage.subscribe((event, data) => {
      if (event === 'agents_updated') {
        setAgents(data);
      }
    });
    return unsub;
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2200);
  };

  const handleOpenAdd = () => {
    setEditingAgent(null);
    setFormName('Alexa');
    setCustomName('');
    setFormLimit('10000');
    setFormPeriod('monthly');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (agent) => {
    setEditingAgent(agent);
    const presets = ['Alexa', 'ChatGPT', 'Gemini', 'Copilot'];
    if (presets.includes(agent.name)) {
      setFormName(agent.name);
      setCustomName('');
    } else {
      setFormName('Custom');
      setCustomName(agent.name);
    }
    setFormLimit(String(agent.limit || ''));
    setFormPeriod(agent.period || 'monthly');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDeleteAgent = (id) => {
    agentStorage.removeAgent(id);
    showToast('Agent removed');
  };

  const handleSaveAgent = (e) => {
    if (e) e.preventDefault();
    const finalName = formName === 'Custom' ? customName.trim() : formName;
    if (!finalName) {
      setFormError('Please enter an agent name');
      return;
    }
    const numLimit = parseFloat(formLimit);
    if (isNaN(numLimit) || numLimit <= 0) {
      setFormError('Please enter a valid spending limit');
      return;
    }

    if (editingAgent) {
      agentStorage.updateAgent(editingAgent.id, {
        name: finalName,
        limit: numLimit,
        period: formPeriod
      });
      showToast(`${finalName} updated`);
    } else {
      agentStorage.addAgent({
        name: finalName,
        limit: numLimit,
        period: formPeriod
      });
      showToast(`${finalName} configured`);
    }
    setIsModalOpen(false);
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
          className={`trust-tab-btn ${activeTab === 'autonomy' ? 'active' : ''}`}
          onClick={() => setActiveTab('autonomy')}
        >
          <Sliders size={14} />
          <span>Autonomy Levels</span>
        </button>
        <button
          className={`trust-tab-btn ${activeTab === 'agents' ? 'active' : ''}`}
          onClick={() => setActiveTab('agents')}
        >
          <Bot size={14} />
          <span>Agent Limits</span>
        </button>
      </div>

      {/* ========================================================
          SECTION 1: AUTONOMY LEVELS (Card Mgmt & Dispute Detection)
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

      {/* ========================================================
          SECTION 2: AGENT LIMITS / CONFIGURATION
          ======================================================== */}
      {activeTab === 'agents' && (
        <motion.div
          key="agent-limits-section"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          {/* Section Header Row with + Add Agent button on right */}
          <div className="agents-section-header-row">
            <span className="agents-section-header-title">Configured Agents</span>
            <button className="agents-add-header-btn" onClick={handleOpenAdd}>
              <Plus size={12} />
              <span>Add Agent</span>
            </button>
          </div>

          {/* List of Configured Agent Cards */}
          {agents.length === 0 ? (
            <div className="agent-empty-box">
              <Bot size={28} color="#6366f1" />
              <span>No AI agents configured yet.</span>
              <button
                className="agents-add-header-btn"
                style={{ marginTop: '6px' }}
                onClick={handleOpenAdd}
              >
                + Configure First Agent
              </button>
            </div>
          ) : (
            agents.map((agent) => {
              const spent = Number(agent.spent) || 0;
              const limit = Number(agent.limit) || 1;
              const pct = Math.min(100, Math.round((spent / limit) * 100));
              const isHigh = pct >= 80;

              return (
                <div key={agent.id} className="agent-item-card">
                  {/* Card Top Row: Name and Icon-only Action Buttons */}
                  <div className="agent-card-top-row">
                    <span className="agent-card-name">{agent.name}</span>
                    <div className="agent-card-actions">
                      <button
                        className="agent-icon-action-btn"
                        onClick={() => handleOpenEdit(agent)}
                        title="Edit Limit"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        className="agent-icon-action-btn danger"
                        onClick={() => handleDeleteAgent(agent.id)}
                        title="Remove Agent"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Card Meta Row: Limit and Spent */}
                  <div className="agent-card-meta-row">
                    <span style={{ textTransform: 'capitalize' }}>
                      {agent.period || 'monthly'} Limit: ₹{limit.toLocaleString()}
                    </span>
                    <span>
                      Spent:{' '}
                      <strong className="agent-card-spent-highlight">
                        ₹{spent.toLocaleString()}
                      </strong>{' '}
                      / ₹{limit.toLocaleString()}
                    </span>
                  </div>

                  {/* Visual Spend Progress Bar */}
                  <div className="agent-progress-track">
                    <div
                      className="agent-progress-bar"
                      style={{
                        width: `${pct}%`,
                        background: isHigh
                          ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                          : 'linear-gradient(90deg, #6366f1, #38bdf8)'
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </motion.div>
      )}

      {/* Minimal Add / Edit Agent Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="agent-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="agent-modal-card"
              initial={{ scale: 0.94, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="agent-modal-header">
                <span className="agent-modal-title">
                  {editingAgent ? 'Edit Agent Limit' : 'Configure Agent'}
                </span>
                <button
                  className="agent-modal-close-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveAgent} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Agent Selection */}
                <div className="agent-form-field">
                  <label className="agent-form-label">Select Agent</label>
                  <select
                    className="agent-form-select"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  >
                    <option value="Alexa">Alexa (Amazon)</option>
                    <option value="ChatGPT">ChatGPT (OpenAI)</option>
                    <option value="Gemini">Gemini (Google)</option>
                    <option value="Copilot">Copilot (Microsoft)</option>
                    <option value="Custom">Custom Agent Name...</option>
                  </select>
                </div>

                {/* If Custom Name */}
                {formName === 'Custom' && (
                  <div className="agent-form-field">
                    <label className="agent-form-label">Agent Name</label>
                    <input
                      type="text"
                      className="agent-form-input"
                      placeholder="e.g. Perplexity, Siri, BookingBot"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      autoFocus
                    />
                  </div>
                )}

                {/* Spending Limit */}
                <div className="agent-form-field">
                  <label className="agent-form-label">Spending Limit (₹)</label>
                  <input
                    type="number"
                    min="1"
                    className="agent-form-input"
                    placeholder="e.g. 10000"
                    value={formLimit}
                    onChange={(e) => setFormLimit(e.target.value)}
                  />
                </div>

                {/* Timeline / Cadence */}
                <div className="agent-form-field">
                  <label className="agent-form-label">Frequency</label>
                  <div className="agent-period-selector">
                    {['weekly', 'monthly', 'yearly'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`agent-period-btn ${formPeriod === p ? 'active' : ''}`}
                        onClick={() => setFormPeriod(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {formError && (
                  <span style={{ fontSize: '0.64rem', color: '#f87171', fontWeight: 600 }}>
                    {formError}
                  </span>
                )}

                {/* Modal Footer */}
                <div className="agent-modal-footer">
                  <button
                    type="button"
                    className="agent-btn-cancel"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="agent-btn-save">
                    {editingAgent ? 'Update Agent' : 'Save Agent'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
}
