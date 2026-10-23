import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight, ReceiptText } from 'lucide-react';

export default function AllTransactionsModal({
  isOpen,
  onClose,
  transactions = []
}) {
  if (!isOpen) return null;

  return (
    <div className="lumen-modal-overlay" onClick={onClose}>
      <motion.div
        className="lumen-pay-sheet"
        style={{ maxHeight: '82%', display: 'flex', flexDirection: 'column' }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lumen-pay-handle" />

        {/* Modal Header */}
        <div className="lumen-pay-header" style={{ paddingBottom: '0.65rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ReceiptText size={18} color="#10b981" />
            <span style={{ fontWeight: 800, fontSize: '0.98rem' }}>
              All Transactions ({transactions.length})
            </span>
          </div>
          <button className="lumen-icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Full Transaction List */}
        <div className="all-txns-scroll-list" style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
          {transactions.length === 0 ? (
            <div className="glance-txn-empty">
              <ReceiptText size={32} color="#475569" />
              <span>No transactions recorded</span>
            </div>
          ) : (
            transactions.map((txn) => (
              <div key={txn.id} className="glance-txn-item" style={{ padding: '0.75rem 0' }}>
                <div className="txn-left">
                  <div
                    className="txn-icon-circle"
                    style={{
                      background: txn.isFlagged || (txn.note && txn.note.includes('FLAGGED'))
                        ? 'rgba(239, 68, 68, 0.22)'
                        : 'rgba(99, 102, 241, 0.15)'
                    }}
                  >
                    <ArrowUpRight
                      size={14}
                      color={txn.isFlagged || (txn.note && txn.note.includes('FLAGGED')) ? '#ef4444' : '#818cf8'}
                    />
                  </div>
                  <div className="txn-details">
                    <div className="txn-recipient" title={txn.recipient}>{txn.recipient}</div>
                    <div className="txn-meta">
                      <span className="txn-source" title={txn.sourceName}>{txn.sourceName}</span>
                      <span className="txn-dot">•</span>
                      <span className="txn-time">{txn.formattedTime || 'Today'}</span>
                    </div>
                  </div>
                </div>

                <div className="txn-right">
                  <div className="txn-amount-wrap debit">
                    -₹{txn.amount?.toLocaleString('en-IN')}
                  </div>
                  <div
                    className={`txn-note ${txn.isFlagged || (txn.note && txn.note.includes('FLAGGED')) ? 'flagged' : ''}`}
                    title={txn.note || 'Payment'}
                  >
                    {txn.note || 'Payment'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
