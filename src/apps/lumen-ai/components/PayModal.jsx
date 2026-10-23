import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, ArrowRight, ShieldCheck, Zap, AlertCircle } from 'lucide-react';

export default function PayModal({
  isOpen,
  onClose,
  banks = [],
  cards = [],
  onExecutePayment
}) {
  const [recipient, setRecipient] = useState('');
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedMethodId, setSelectedMethodId] = useState(banks[0]?.id || cards[0]?.id || '');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [lastTxn, setLastTxn] = useState(null);

  if (!isOpen) return null;

  // Preset recipients for rapid testing
  const presets = [
    { name: 'Zomato', upi: 'zomato@icici', amount: 450, note: 'Dinner Order' },
    { name: 'Amazon India', upi: 'amazonpay@axis', amount: 1899, note: 'Electronics' },
    { name: 'Aarav Sharma', upi: 'aarav@okhdfc', amount: 500, note: 'Coffee' },
    { name: 'Electricity Bill', upi: 'bescom@sbi', amount: 2350, note: 'Monthly Utility' }
  ];

  const handleSelectPreset = (p) => {
    setRecipient(p.name);
    setUpiId(p.upi);
    setAmount(String(p.amount));
    setNote(p.note);
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!recipient.trim()) {
      setErrorMsg('Please enter recipient name or UPI ID');
      return;
    }
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setErrorMsg('Please enter a valid amount');
      return;
    }

    const res = onExecutePayment({
      recipient: recipient.trim(),
      upiId: upiId.trim() || `${recipient.toLowerCase().replace(/\s+/g, '')}@upi`,
      amount: num,
      paymentMethodId: selectedMethodId,
      note: note.trim() || 'UPI Transfer'
    });

    if (res.success) {
      setLastTxn(res.txn);
      setStatus('success');
    } else {
      setErrorMsg(res.error || 'Payment failed');
    }
  };

  const handleResetAndClose = () => {
    setStatus(null);
    setRecipient('');
    setUpiId('');
    setAmount('');
    setNote('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="lumen-modal-overlay" onClick={handleResetAndClose}>
      <motion.div
        className="lumen-pay-sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lumen-pay-handle" />

        {/* Header */}
        <div className="lumen-pay-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div className="lumen-upi-badge">UPI</div>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Simulate Payment</span>
          </div>
          <button className="lumen-icon-btn" onClick={handleResetAndClose}>
            <X size={18} />
          </button>
        </div>

        {status === 'success' ? (
          <div className="lumen-success-view">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 18 }}
              className="lumen-success-icon-wrap"
            >
              <CheckCircle size={48} color="#10b981" />
            </motion.div>
            <div className="lumen-success-title">Payment Successful</div>
            <div className="lumen-success-amount">₹{lastTxn?.amount?.toLocaleString('en-IN')}</div>
            <div className="lumen-success-recipient">Paid to {lastTxn?.recipient}</div>

            <div className="lumen-success-details-card">
              <div className="lumen-detail-row">
                <span>Payment Source</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{lastTxn?.sourceName}</span>
              </div>
              <div className="lumen-detail-row">
                <span>Transaction Ref</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>{lastTxn?.id}</span>
              </div>
              <div className="lumen-detail-row">
                <span>Note</span>
                <span>{lastTxn?.note}</span>
              </div>
            </div>

            <button className="lumen-primary-action-btn" onClick={handleResetAndClose}>
              Done & Return to Glance
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="lumen-pay-form">
            {/* Quick Presets */}
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '6px' }}>
              Quick Presets:
            </div>
            <div className="lumen-presets-scroll">
              {presets.map((p) => (
                <button
                  type="button"
                  key={p.name}
                  className="lumen-preset-pill"
                  onClick={() => handleSelectPreset(p)}
                >
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                  <span style={{ opacity: 0.75 }}>₹{p.amount}</span>
                </button>
              ))}
            </div>

            {/* Recipient & Amount Inputs */}
            <div className="lumen-input-group">
              <label>Pay To (Recipient / UPI)</label>
              <input
                type="text"
                placeholder="e.g. Swiggy, Rahul, or upi@id"
                value={recipient}
                onChange={(e) => {
                  setRecipient(e.target.value);
                  setErrorMsg('');
                }}
                className="lumen-text-input"
                autoFocus
              />
            </div>

            <div className="lumen-input-group">
              <label>Amount (₹ INR)</label>
              <div className="lumen-amount-input-wrap">
                <span className="lumen-inr-symbol">₹</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setErrorMsg('');
                  }}
                  className="lumen-amount-input"
                />
              </div>
            </div>

            {/* Choose Source Account / Credit Card */}
            <div className="lumen-input-group">
              <label>Pay Using Account / Card</label>
              <div className="lumen-method-selector">
                {/* 1. Bank Accounts */}
                {banks.map((b) => (
                  <div
                    key={b.id}
                    className={`lumen-method-item ${selectedMethodId === b.id ? 'selected' : ''}`}
                    onClick={() => setSelectedMethodId(b.id)}
                  >
                    <div className="lumen-method-radio">
                      <div className="lumen-radio-dot" />
                    </div>
                    <div className="lumen-method-info">
                      <div className="lumen-method-name">{b.name}</div>
                      <div className="lumen-method-sub">
                        Avail. Balance: ₹{b.balance?.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}

                {/* 2. Credit Cards */}
                {cards.map((c) => (
                  <div
                    key={c.id}
                    className={`lumen-method-item ${selectedMethodId === c.id ? 'selected' : ''}`}
                    onClick={() => setSelectedMethodId(c.id)}
                  >
                    <div className="lumen-method-radio">
                      <div className="lumen-radio-dot" />
                    </div>
                    <div className="lumen-method-info">
                      <div className="lumen-method-name">{c.name} ({c.brand})</div>
                      <div className="lumen-method-sub" style={{ color: '#f87171' }}>
                        Outstanding: {c.outstanding > 0 ? `-₹${c.outstanding?.toLocaleString('en-IN')}` : `₹${c.outstanding?.toLocaleString('en-IN')}`} (Limit: ₹{c.creditLimit?.toLocaleString('en-IN')})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="lumen-error-banner">
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}

            <button type="submit" className="lumen-primary-action-btn">
              <span>Pay ₹{amount ? Number(amount).toLocaleString('en-IN') : '0'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
