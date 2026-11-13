import React, { useState, useEffect, useRef } from 'react';
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
  Clock,
  Send,
  MessageSquare,
  ChevronLeft,
  ChevronRight
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

  // L2 Dispute card states
  const [emailDraftText, setEmailDraftText] = useState(() => disputeIncident?.draftEmail || '');
  const [chatInputText, setChatInputText] = useState(() => disputeIncident?.inputDraft || '');
  const chatMessagesEndRef = useRef(null);

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
    if (disputeIncident?.draftEmail && !emailDraftText) {
      setEmailDraftText(disputeIncident.draftEmail);
    }
  }, [disputeIncident?.draftEmail]);

  useEffect(() => {
    if (disputeIncident?.inputDraft !== undefined) {
      setChatInputText(disputeIncident.inputDraft);
    }
  }, [disputeIncident?.inputDraft]);

  useEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [disputeIncident?.chatMessages, disputeIncident?.isThinking]);

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

  // Active cards for single-card carousel deck
  const activeCards = [];
  if (disputeIncident) {
    activeCards.push({ id: 'dispute', type: 'dispute', title: 'Duplicate Charge Detected' });
  }
  if (hasValidIncident) {
    activeCards.push({ id: 'fraud', type: 'fraud', title: 'Suspicious Activity Flagged' });
  }

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (activeIndex >= activeCards.length && activeCards.length > 0) {
      setActiveIndex(activeCards.length - 1);
    }
  }, [activeCards.length, activeIndex]);

  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < activeCards.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      setDirection(-1);
      setActiveIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setDirection(1);
      setActiveIndex((prev) => prev + 1);
    }
  };

  const currentCard = activeCards[activeIndex] || null;

  const cardSlideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 180 : dir < 0 ? -180 : 0,
      opacity: 0,
      scale: 0.94
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 320, damping: 28 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 }
      }
    },
    exit: (dir) => ({
      x: dir < 0 ? 180 : -180,
      opacity: 0,
      scale: 0.94,
      transition: { duration: 0.18 }
    })
  };

  const renderDisputeContent = () => {
    if (!disputeIncident) return null;
    return (
      <>
        {/* L1 Autonomy Mode */}
        {isL1Dispute && (
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
                  L1 Guided Review
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

            <button
              className="incident-action-btn success"
              onClick={() => disputeWorkflow.resolveDispute()}
              style={{ width: '100%', marginTop: '2px', padding: '0.6rem 0.8rem', fontSize: '0.76rem' }}
            >
              <CheckCircle2 size={15} />
              <span>Mark as read</span>
            </button>
          </div>
        )}

        {/* L2 Autonomy Mode */}
        {!isL1Dispute && (
          <div className="incident-content">
            {/* L2 Stage 1: Email Draft Mode */}
            {(!disputeIncident.l2Stage || disputeIncident.l2Stage === 'email_draft') && (
              <>
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
                        background: 'rgba(245, 158, 11, 0.18)',
                        color: '#fbbf24',
                        border: '1px solid rgba(245, 158, 11, 0.35)',
                        fontSize: '0.62rem',
                        padding: '2px 7px',
                        borderRadius: '99px',
                        marginBottom: '3px'
                      }}
                    >
                      L2 Semi-Auto
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

                <p className="incident-desc" style={{ fontSize: '0.74rem', lineHeight: 1.35, marginTop: '2px' }}>
                  Lumen flagged a duplicate charge of{' '}
                  <strong style={{ color: '#fff' }}>
                    ₹{disputeIncident.amount?.toLocaleString('en-IN')}
                  </strong>{' '}
                  to <strong style={{ color: '#fff' }}>{disputeIncident.merchant}</strong>. Review and send the dispute email below:
                </p>

                {/* Transaction Reference Chips */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '6px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    fontSize: '0.72rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#94a3b8' }}>Disputed Txn ID</span>
                    <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.72rem' }}>
                      {disputeIncident.currentTxnId}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#94a3b8' }}>Disputed Amount</span>
                    <span style={{ color: '#ef4444', fontWeight: 700 }}>
                      ₹{disputeIncident.amount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#94a3b8' }}>Merchant</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{disputeIncident.merchant}</span>
                  </div>
                </div>

                {/* Editable Email Draft Box */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#cbd5e1', fontWeight: 600 }}>
                      <Edit3 size={11} color="#38bdf8" />
                      <span>Dispute Email Draft</span>
                    </span>
                    <span style={{ fontSize: '0.62rem', color: '#64748b' }}>A/C number omitted</span>
                  </div>

                  <textarea
                    value={emailDraftText}
                    onChange={(e) => setEmailDraftText(e.target.value)}
                    rows={7}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'rgba(15, 23, 42, 0.85)',
                      border: '1px solid rgba(255, 255, 255, 0.14)',
                      borderRadius: '10px',
                      color: '#e2e8f0',
                      padding: '8px 10px',
                      fontSize: '0.71rem',
                      lineHeight: 1.45,
                      fontFamily: 'inherit',
                      resize: 'none',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* 2 Buttons: Dismiss & Send */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '8px', marginTop: '2px' }}>
                  <button
                    className="incident-action-btn"
                    onClick={() => disputeWorkflow.resolveDispute()}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#94a3b8',
                      padding: '0.55rem',
                      fontSize: '0.74rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px'
                    }}
                  >
                    <X size={14} />
                    {/* <span>Dismiss</span> */}
                  </button>
                  <button
                    className="incident-action-btn primary"
                    onClick={() => disputeWorkflow.sendInitialEmail(emailDraftText)}
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: '#fff',
                      padding: '0.55rem',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                    }}
                  >
                    <Send size={13} />
                    {/* <span>Send to {disputeIncident.merchant}</span> */}
                  </button>
                </div>
              </>
            )}

            {/* L2 Stage 2: Chat Interface Mode (Active or Resolved) */}
            {(disputeIncident.l2Stage === 'chat_active' || disputeIncident.l2Stage === 'resolved') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                {/* Chat Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '6px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '8px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <MessageSquare size={14} color="#f59e0b" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff' }}>
                        {disputeIncident.merchant} Dispute
                      </div>
                      <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>
                        Txn: {disputeIncident.currentTxnId} • ₹{disputeIncident.amount}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: '99px',
                        background:
                          disputeIncident.l2Stage === 'resolved'
                            ? 'rgba(16, 185, 129, 0.18)'
                            : 'rgba(245, 158, 11, 0.18)',
                        color:
                          disputeIncident.l2Stage === 'resolved' ? '#34d399' : '#fbbf24',
                        border: `1px solid ${disputeIncident.l2Stage === 'resolved'
                          ? 'rgba(16, 185, 129, 0.35)'
                          : 'rgba(245, 158, 11, 0.35)'
                          }`
                      }}
                    >
                      {disputeIncident.l2Stage === 'resolved' ? 'Resolved' : 'In Progress'}
                    </span>
                    <button
                      onClick={() => disputeWorkflow.resolveDispute()}
                      title="Close Card"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Scrollable Chat Messages Container */}
                <div
                  style={{
                    maxHeight: '230px',
                    minHeight: '130px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '4px 2px',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}
                >
                  {(disputeIncident.chatMessages || []).map((msg) => {
                    const isUser = msg.sender === 'user';
                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isUser ? 'flex-end' : 'flex-start',
                          maxWidth: '100%'
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.58rem',
                            color: '#64748b',
                            marginBottom: '2px',
                            padding: '0 4px'
                          }}
                        >
                          {isUser ? 'You' : msg.senderName || disputeIncident.merchant}
                        </span>
                        <div
                          style={{
                            maxWidth: '88%',
                            padding: '7px 10px',
                            borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                            background: isUser
                              ? 'linear-gradient(135deg, #4f46e5, #6366f1)'
                              : 'rgba(30, 41, 59, 0.85)',
                            border: isUser ? 'none' : '1px solid rgba(245, 158, 11, 0.25)',
                            color: '#fff',
                            fontSize: '0.71rem',
                            lineHeight: 1.4,
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}

                  {/* 3-Second Thinking Animation */}
                  {disputeIncident.isThinking && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '7px',
                        padding: '6px 10px',
                        background: 'rgba(245, 158, 11, 0.12)',
                        border: '1px dashed rgba(245, 158, 11, 0.4)',
                        borderRadius: '10px',
                        color: '#fbbf24',
                        fontSize: '0.68rem',
                        alignSelf: 'flex-start'
                      }}
                    >
                      <Sparkles size={13} className="animate-spin" color="#f59e0b" />
                      <span>Lumen is drafting your reply...</span>
                    </motion.div>
                  )}

                  <div ref={chatMessagesEndRef} />
                </div>

                {/* Placeholder Edit Warning Hint */}
                {chatInputText.includes('[ORDER_ID]') && (
                  <div
                    style={{
                      fontSize: '0.64rem',
                      color: '#fbbf24',
                      background: 'rgba(245, 158, 11, 0.12)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: '6px',
                      padding: '3px 7px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <AlertCircle size={11} color="#fbbf24" />
                    <span>Please replace <strong>[ORDER_ID]</strong> before sending</span>
                  </div>
                )}

                {/* Bottom Chat Input Form */}
                {disputeIncident.l2Stage !== 'resolved' ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (chatInputText.trim() && !disputeIncident.isThinking) {
                        disputeWorkflow.sendUserChatMessage(chatInputText);
                        setChatInputText('');
                      }
                    }}
                    style={{
                      display: 'flex',
                      gap: '6px',
                      alignItems: 'center',
                      marginTop: '2px'
                    }}
                  >
                    <input
                      type="text"
                      value={chatInputText}
                      onChange={(e) => setChatInputText(e.target.value)}
                      placeholder={
                        disputeIncident.isThinking
                          ? 'Lumen is drafting response...'
                          : 'Type message or edit draft...'
                      }
                      disabled={disputeIncident.isThinking}
                      style={{
                        flex: 1,
                        background: 'rgba(15, 23, 42, 0.85)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '10px',
                        color: '#fff',
                        padding: '7px 10px',
                        fontSize: '0.72rem',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!chatInputText.trim() || disputeIncident.isThinking}
                      className="incident-action-btn primary"
                      style={{
                        padding: '7px 11px',
                        borderRadius: '10px',
                        opacity: !chatInputText.trim() || disputeIncident.isThinking ? 0.45 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                        border: 'none',
                        color: '#fff',
                        cursor:
                          !chatInputText.trim() || disputeIncident.isThinking
                            ? 'default'
                            : 'pointer'
                      }}
                    >
                      <Send size={13} />
                    </button>
                  </form>
                ) : (
                  /* Resolved Success Banner */
                  <div
                    style={{
                      padding: '7px 10px',
                      background: 'rgba(16, 185, 129, 0.14)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={15} color="#10b981" />
                      <span style={{ fontSize: '0.71rem', color: '#34d399', fontWeight: 600 }}>
                        ₹{disputeIncident.amount} Refund Credited
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (onNavigateTab) onNavigateTab('glance');
                        disputeWorkflow.openTransactionHistory();
                        disputeWorkflow.resolveDispute();
                      }}
                      style={{
                        background: '#10b981',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>View History</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  const renderFraudContent = () => {
    if (!incident) return null;
    return (
      <>
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
      </>
    );
  };

  return (
    <div
      className="lumen-act-scroll"
      style={{
        flex: 1,
        minHeight: 0,
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '0.85rem 0.85rem 3.5rem',
        boxSizing: 'border-box',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center'
      }}
    >
      {activeCards.length === 0 ? (
        <motion.div
          key="act-empty-state"
          className="act-empty-state-card"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ margin: 'auto 0' }}
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
      ) : (
        <div
          className="act-carousel-deck-wrapper"
          style={{
            width: '100%',
            maxWidth: '380px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            margin: 'auto 0'
          }}
        >
          {/* Deck Viewport containing active card and side peeking cards */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Peeking Card on Left (Previous) */}
            {hasPrev && (
              <div
                onClick={handlePrev}
                title="View previous action"
                style={{
                  position: 'absolute',
                  left: '-14px',
                  top: '10px',
                  bottom: '10px',
                  width: '94%',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #1c1a2e 0%, #15182a 100%)',
                  border: '1.5px solid rgba(255, 255, 255, 0.12)',
                  transform: 'scale(0.95)',
                  transformOrigin: 'left center',
                  opacity: 0.38,
                  zIndex: 1,
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                  pointerEvents: 'auto'
                }}
              />
            )}

            {/* Peeking Card on Right (Next) */}
            {hasNext && (
              <div
                onClick={handleNext}
                title="View next action"
                style={{
                  position: 'absolute',
                  right: '-14px',
                  top: '10px',
                  bottom: '10px',
                  width: '94%',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #1c1a2e 0%, #15182a 100%)',
                  border: '1.5px solid rgba(255, 255, 255, 0.12)',
                  transform: 'scale(0.95)',
                  transformOrigin: 'right center',
                  opacity: 0.38,
                  zIndex: 1,
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                  pointerEvents: 'auto'
                }}
              />
            )}

            {/* Active Card in Center */}
            <AnimatePresence custom={direction} mode="wait">
              {currentCard && (
                <motion.div
                  key={currentCard.id}
                  custom={direction}
                  variants={cardSlideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="act-incident-card"
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    width: '100%',
                    borderColor:
                      currentCard.type === 'dispute'
                        ? 'rgba(245, 158, 11, 0.45)'
                        : 'rgba(239, 68, 68, 0.45)',
                    padding: '0.95rem 0.9rem',
                    margin: 0,
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)'
                  }}
                >
                  {currentCard.type === 'dispute' ? renderDisputeContent() : renderFraudContent()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Navigation: Left/Right arrows + Action X of Y indicator */}
          {activeCards.length > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginTop: '12px',
                zIndex: 10
              }}
            >
              <button
                type="button"
                onClick={handlePrev}
                disabled={!hasPrev}
                title="Previous action"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: hasPrev ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: hasPrev ? '#fff' : '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: hasPrev ? 'pointer' : 'default',
                  transition: 'all 0.18s ease'
                }}
              >
                <ChevronLeft size={18} />
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '99px',
                  padding: '4px 12px'
                }}
              >
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#e2e8f0' }}>
                  Action {activeIndex + 1} of {activeCards.length}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {activeCards.map((_, idx) => (
                    <span
                      key={idx}
                      style={{
                        width: idx === activeIndex ? '14px' : '5px',
                        height: '5px',
                        borderRadius: '99px',
                        background: idx === activeIndex ? '#38bdf8' : 'rgba(255, 255, 255, 0.25)',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={!hasNext}
                title="Next action"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: hasNext ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: hasNext ? '#fff' : '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: hasNext ? 'pointer' : 'default',
                  transition: 'all 0.18s ease'
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
