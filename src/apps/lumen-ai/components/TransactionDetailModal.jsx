import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Building2,
  Calendar,
  Clock,
  FileText,
  CreditCard,
  Share2
} from 'lucide-react';
import { formatRelativeTime } from '../services/financeStorage';

export default function TransactionDetailModal({
  isOpen,
  onClose,
  transaction
}) {
  const [copiedField, setCopiedField] = useState(null);

  if (!isOpen || !transaction) return null;

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

  const isCredit = transaction.type === 'credit';
  const isFlagged = transaction.isFlagged || (transaction.note && transaction.note.includes('FLAGGED'));
  const dateObj = transaction.timestamp ? new Date(transaction.timestamp) : new Date();
  const formattedFullDate = dateObj.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

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
            Transaction Details
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
              borderRadius: '50%',
              background: isCredit
                ? 'rgba(16, 185, 129, 0.2)'
                : isFlagged
                  ? 'rgba(239, 68, 68, 0.2)'
                  : 'rgba(99, 102, 241, 0.18)',
              border: `1.5px solid ${isCredit
                  ? 'rgba(16, 185, 129, 0.45)'
                  : isFlagged
                    ? 'rgba(239, 68, 68, 0.45)'
                    : 'rgba(99, 102, 241, 0.35)'
                }`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px'
            }}
          >
            {isCredit ? (
              <ArrowDownLeft size={22} color="#34d399" />
            ) : (
              <ArrowUpRight size={22} color={isFlagged ? '#ef4444' : '#818cf8'} />
            )}
          </div>

          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginBottom: '2px' }}>
            {transaction.recipient}
          </div>

          <div
            style={{
              fontSize: '1.65rem',
              fontWeight: 900,
              color: isCredit ? '#34d399' : '#fff',
              letterSpacing: '-0.02em',
              margin: '2px 0 6px'
            }}
          >
            {isCredit ? '+' : '-'}₹{transaction.amount?.toLocaleString('en-IN')}
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
              background: isCredit
                ? 'rgba(16, 185, 129, 0.16)'
                : isFlagged
                  ? 'rgba(239, 68, 68, 0.16)'
                  : 'rgba(16, 185, 129, 0.16)',
              color: isCredit ? '#34d399' : isFlagged ? '#ef4444' : '#34d399',
              border: `1px solid ${isCredit
                  ? 'rgba(16, 185, 129, 0.35)'
                  : isFlagged
                    ? 'rgba(239, 68, 68, 0.35)'
                    : 'rgba(16, 185, 129, 0.35)'
                }`
            }}
          >
            {isCredit ? (
              <>
                <CheckCircle2 size={12} color="#34d399" />
                <span>Dispute Refund Credited</span>
              </>
            ) : isFlagged ? (
              <>
                <AlertCircle size={12} />
                <span>Flagged for Dispute Review</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={12} />
                <span>Payment Successful</span>
              </>
            )}
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
          {/* Transaction ID with Copy */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Transaction ID</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: '0.76rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: '#38bdf8'
                }}
              >
                {transaction.id}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(transaction.id, 'txnId')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: copiedField === 'txnId' ? '#10b981' : '#64748b',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Copy Transaction ID"
              >
                {copiedField === 'txnId' ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
          </div>

          {/* UPI ID / VPA */}
          {transaction.upiId && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>UPI ID</span>
              <span style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>{transaction.upiId}</span>
            </div>
          )}

          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.06)' }} />

          {/* Payment Method / Account */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              {isCredit ? 'Credited To' : 'Debited From'}
            </span>
            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#fff' }}>
              {transaction.sourceName || 'Lumen Account'}
            </span>
          </div>

          {/* Payment Type */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Payment Type</span>
            <span style={{ fontSize: '0.76rem', color: isCredit ? '#34d399' : '#cbd5e1' }}>
              {isCredit
                ? 'Bank transfer'
                : transaction.sourceType === 'card'
                  ? 'Credit Card Charge'
                  : 'Direct UPI Transfer'}
            </span>
          </div>

          {/* Note / Purpose */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Note</span>
            <span style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>
              {transaction.note || (isCredit ? 'Dispute Refund' : 'Payment Transfer')}
            </span>
          </div>

          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.06)' }} />

          {/* Date & Time */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Date & Time</span>
            <span style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>{formattedFullDate}</span>
          </div>

          {/* Relative Time */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Completed</span>
            <span style={{ fontSize: '0.74rem', color: '#f59e0b', fontWeight: 600 }}>
              {formatRelativeTime(transaction.timestamp)}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

