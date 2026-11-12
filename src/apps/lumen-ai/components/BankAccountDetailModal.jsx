import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Building2,
  CheckCircle2,
  Copy,
  Check,
  Send,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';

export default function BankAccountDetailModal({
  isOpen,
  onClose,
  bank,
  onInitiateTransfer
}) {
  const [copiedField, setCopiedField] = useState(null);

  if (!isOpen || !bank) return null;

  const handleCopy = (text, fieldName) => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
      }
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // ignore
    }
  };

  const ifscCode = bank.shortName === 'Lumen' ? 'LUMN0001048' : 'SBIN0003042';
  const fullAccountNumber = bank.shortName === 'Lumen' ? '5010 0482 7719' : '3042 8192 1042';
  const upiHandle = bank.shortName === 'Lumen' ? 'neeraj@oklumen' : 'neeraj@oksbi';

  return (
    <div className="lumen-modal-overlay" onClick={onClose} style={{ zIndex: 120 }}>
      <motion.div
        className="lumen-pay-sheet"
        style={{
          maxHeight: '92%',
          height: 'auto',
          display: 'flex',
          flexDirection: 'column',
          padding: '0.85rem 1.1rem 1.25rem',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          background: 'linear-gradient(180deg, #131728 0%, #0c0f1c 100%)',
          borderTop: '1px solid rgba(255, 255, 255, 0.14)'
        }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lumen-pay-handle" />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '0.6rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#fff' }}>
            Bank Account Details
          </span>
          <button className="lumen-icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Hero Section */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '1.2rem 0 0.9rem',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: bank.badgeColor || '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 900,
              fontSize: '1.1rem',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.25)',
              marginBottom: '8px'
            }}
          >
            {bank.shortName === 'Lumen' ? 'L' : 'SBI'}
          </div>

          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginBottom: '2px' }}>
            {bank.name}
          </div>

          <div
            style={{
              fontSize: '1.65rem',
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '-0.02em',
              margin: '2px 0 6px'
            }}
          >
            ₹{bank.balance?.toLocaleString('en-IN')}
          </div>

          {/* Status Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 9px',
              borderRadius: '99px',
              fontSize: '0.68rem',
              fontWeight: 700,
              background: 'rgba(16, 185, 129, 0.16)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.35)'
            }}
          >
            <CheckCircle2 size={11} />
            <span>Active & Linked for Instant UPI</span>
          </div>
        </div>

        {/* Detailed Breakdown Card */}
        <div
          style={{
            background: 'rgba(18, 24, 40, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            margin: '0.5rem 0 1rem'
          }}
        >
          {/* Account Number with Copy */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Account Number</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: '0.76rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: '#fff'
                }}
              >
                {fullAccountNumber}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(fullAccountNumber.replace(/\s+/g, ''), 'acNum')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: copiedField === 'acNum' ? '#10b981' : '#64748b',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Copy Account Number"
              >
                {copiedField === 'acNum' ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
          </div>

          {/* Account Type */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Account Type</span>
            <span style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>{bank.type || 'Savings Account'}</span>
          </div>

          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.06)' }} />

          {/* IFSC Code with Copy */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>IFSC Code</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: '0.76rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: '#38bdf8'
                }}
              >
                {ifscCode}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(ifscCode, 'ifsc')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: copiedField === 'ifsc' ? '#10b981' : '#64748b',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Copy IFSC Code"
              >
                {copiedField === 'ifsc' ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
          </div>

          {/* Branch */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Branch</span>
            <span style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>
              SP2, Hinjewadi, Pune
            </span>
          </div>

          {/* UPI VPA */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Linked UPI VPA</span>
            <span style={{ fontSize: '0.76rem', color: '#a855f7', fontWeight: 600 }}>
              {upiHandle}
            </span>
          </div>

          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.06)' }} />

          {/* Currency */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Currency</span>
            <span style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>Indian Rupee (INR ₹)</span>
          </div>

          {/* Autonomy Shield */}
          {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Lumen Guard</span>
            <span style={{ fontSize: '0.74rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} />
              <span>Duplicate & Fraud Shield Active</span>
            </span>
          </div> */}
        </div>

        {/* Transfer Shortcut */}
        {/* <button
          className="incident-action-btn primary"
          onClick={() => {
            onClose();
            if (onInitiateTransfer) onInitiateTransfer(bank.id);
          }}
          style={{ width: '100%', padding: '0.6rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <span>Send / Transfer from {bank.shortName}</span>
          <ArrowUpRight size={14} />
        </button> */}
      </motion.div>
    </div>
  );
}

