import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Building2,
  Send,
  ArrowUpRight,
  RotateCcw,
  Wifi,
  ReceiptText,
  ChevronRight,
  Repeat
} from 'lucide-react';
import PayModal from './PayModal';
import AllTransactionsModal from './AllTransactionsModal';
import DigitalCardModal from './DigitalCardModal';
import RecurringPaymentsModal from './RecurringPaymentsModal';
import { detectCardBrand } from '../services/financeStorage';

export default function GlanceScreen({
  finance,
  onNavigateTab,
  autoOpenDigitalCard = false,
  onResetAutoOpen
}) {
  const {
    banks,
    cards,
    transactions,
    totalBankBalance,
    totalCreditOutstanding,
    executePayment,
    toggleCardStatus,
    resetToDefault
  } = finance;

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isAllTxnsOpen, setIsAllTxnsOpen] = useState(false);
  const [isDigitalCardOpen, setIsDigitalCardOpen] = useState(Boolean(autoOpenDigitalCard));
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);

  // Sync when autoOpenDigitalCard prop becomes true
  useEffect(() => {
    if (autoOpenDigitalCard) {
      setIsDigitalCardOpen(true);
      if (onResetAutoOpen) onResetAutoOpen();
    }
  }, [autoOpenDigitalCard, onResetAutoOpen]);

  // Auto open digital card modal when triggered externally (e.g., View New Card)
  useEffect(() => {
    const handleOpen = () => {
      setIsDigitalCardOpen(true);
    };
    window.addEventListener('lumen_open_digital_card', handleOpen);
    return () => window.removeEventListener('lumen_open_digital_card', handleOpen);
  }, []);

  // Auto open recurring modal when triggered externally (e.g., from notification)
  useEffect(() => {
    const handleOpenRecurring = () => {
      setIsRecurringModalOpen(true);
    };
    window.addEventListener('lumen_open_recurring_modal', handleOpenRecurring);
    return () => window.removeEventListener('lumen_open_recurring_modal', handleOpenRecurring);
  }, []);

  // Primary Focus: Lumen Credit Card
  const primaryCard = cards[0];

  // Classify brand using BIN ranges and length rules
  const detectedBrand = detectCardBrand(primaryCard?.cardNumber);
  const bankName = primaryCard?.bankName || 'Lumen';

  // Last 3 transactions for dashboard
  const recentTransactions = transactions.slice(0, 3);

  return (
    <div className="lumen-glance-scroll">
      {/* 1. Header Overview with User Branding */}
      <div className="glance-top-bar">
        <div className="glance-user-pill">
          <div className="glance-user-avatar">L</div>
          <div>
            <div className="glance-greeting">Lumen Financial</div>
          </div>
        </div>

        {/* <button
          className="glance-reset-btn"
          onClick={resetToDefault}
          title="Reset Balances to Default (₹50k Lumen, ₹10k SBI, ₹10k Card)"
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button> */}
      </div>

      {/* 2. Total Net Worth Summary Strip with explicit -ve sign for outstanding */}
      <div className="glance-metrics-strip">
        <div className="metric-box">
          <span className="metric-label">Total Liquid Balance</span>
          <span className="metric-value">
            ₹{totalBankBalance?.toLocaleString('en-IN')}
          </span>
          <span className="metric-sub">{banks.length} Connected Banks</span>
        </div>

        <div className="metric-divider" />

        <div className="metric-box">
          <span className="metric-label">Credit Outstanding</span>
          <span
            className="metric-value debit"
            style={{ color: '#f87171', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'baseline' }}
          >
            {totalCreditOutstanding > 0
              ? `-₹${totalCreditOutstanding?.toLocaleString('en-IN')}`
              : `₹${totalCreditOutstanding?.toLocaleString('en-IN')}`}
          </span>
          <span className="metric-sub" style={{ color: '#fca5a5' }}>Due across credit cards</span>
        </div>
      </div>

      {/* 3. Quick Actions / Pay Widget Bar */}
      <div className="glance-quick-actions">
        <button
          className="glance-action-btn primary"
          onClick={() => setIsPayModalOpen(true)}
        >
          <div className="action-icon-circle">
            <Send size={16} />
          </div>
          <span>Pay Anyone</span>
        </button>

        <button
          className="glance-action-btn"
          onClick={() => setIsRecurringModalOpen(true)}
        >
          <div className="action-icon-circle" style={{ background: 'rgba(99, 102, 241, 0.25)' }}>
            <Repeat size={16} color="#818cf8" />
          </div>
          <span>Recurring Payment</span>
        </button>
      </div>

      {/* 4. Connected Bank Accounts */}
      <div className="glance-section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={16} color="#6366f1" />
          <span>Connected Bank Accounts</span>
        </div>
      </div>

      <div className="glance-banks-list">
        {banks.map((bank) => (
          <div key={bank.id} className="bank-account-card">
            <div className="bank-card-left">
              <div
                className="bank-logo-badge"
                style={{ background: bank.badgeColor || '#4f46e5' }}
              >
                {bank.shortName === 'Lumen' ? 'L' : 'SBI'}
              </div>
              <div>
                <div className="bank-name">{bank.name}</div>
                <div className="bank-ac-num">{bank.accountNumber}</div>
                <div className="bank-ac-type">{bank.type}</div>
              </div>
            </div>

            <div className="bank-card-right">
              <div className="bank-balance">
                ₹{bank.balance?.toLocaleString('en-IN')}
              </div>
              <button
                className="bank-pay-link"
                onClick={() => setIsPayModalOpen(true)}
              >
                Transfer <ArrowUpRight size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 5. Connected Credit Card */}
      <div className="glance-section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard size={16} color="#a855f7" />
          <span>Connected Credit Card</span>
        </div>
      </div>

      <div className="glance-banks-list">
        {primaryCard && (
          <div className="bank-account-card">
            <div className="bank-card-left">
              <div
                className="bank-logo-badge"
                style={{
                  background: primaryCard.status === 'freezed'
                    ? 'linear-gradient(135deg, #0284c7, #0ea5e9)'
                    : 'linear-gradient(135deg, #7c3aed, #a855f7)'
                }}
              >
                <CreditCard size={17} color="#fff" />
              </div>

              <div>
                <div className="bank-name">
                  {bankName} | {detectedBrand}
                </div>
                <div className="bank-ac-num">
                  •••• {primaryCard.last4 || '8411'}
                </div>
                <button
                  type="button"
                  className="bank-pay-link"
                  style={{ color: '#c084fc' }}
                  onClick={() => setIsDigitalCardOpen(true)}
                  title="View Digital Card Copy"
                >
                  View <ChevronRight size={12} />
                </button>
              </div>
            </div>

            <div className="bank-card-right">
              {/* Balance */}
              <div
                className="bank-balance debit"
                style={{ color: '#f87171', whiteSpace: 'nowrap' }}
              >
                {primaryCard.outstanding > 0
                  ? `-₹${primaryCard.outstanding?.toLocaleString('en-IN')}`
                  : `₹0`}
              </div>

              {/* State (active) below the balance */}
              <div
                className={`card-status-pill ${primaryCard.status || 'active'}`}
                style={{ marginTop: '4px' }}
              >
                <span className="status-dot" />
                <span>{primaryCard.status === 'freezed' ? 'Freezed' : 'Active'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. Transaction History Widget (Only last 3 + View All button) */}
      <div className="glance-section-header">
        <div className="glance-section-title">
          <ReceiptText size={16} color="#10b981" style={{ flexShrink: 0 }} />
          <span>Transaction History</span>
          <span className="glance-section-count">
            ({transactions.length})
          </span>
        </div>

        {transactions.length > 0 && (
          <button
            className="view-all-txns-btn"
            onClick={() => setIsAllTxnsOpen(true)}
          >
            <span>View All</span>
            <ChevronRight size={13} />
          </button>
        )}
      </div>

      <div className="glance-txn-container">
        {transactions.length === 0 ? (
          <div className="glance-txn-empty">
            <ReceiptText size={28} color="#475569" />
            <span>No transactions yet</span>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Tap "Pay Anyone" to simulate your first payment
            </span>
          </div>
        ) : (
          <div className="glance-txn-list">
            {recentTransactions.map((txn) => (
              <div key={txn.id} className="glance-txn-item">
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
                      size={13}
                      color={txn.isFlagged || (txn.note && txn.note.includes('FLAGGED')) ? '#ef4444' : '#818cf8'}
                    />
                  </div>
                  <div className="txn-details">
                    <div className="txn-recipient" title={txn.recipient}>
                      {txn.recipient}
                    </div>
                    <div className="txn-meta">
                      <span className="txn-source" title={txn.sourceName}>
                        {txn.sourceName}
                      </span>
                      <span className="txn-dot">•</span>
                      <span className="txn-time">{txn.formattedTime || 'Today'}</span>
                    </div>
                  </div>
                </div>

                <div className="txn-right">
                  <div
                    className="txn-amount-wrap debit"
                    style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'baseline' }}
                  >
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
            ))}
          </div>
        )}
      </div>

      {/* Interactive Pay Sheet Modal */}
      <PayModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        banks={banks}
        cards={cards}
        onExecutePayment={executePayment}
      />

      {/* Full Transaction History Modal */}
      <AllTransactionsModal
        isOpen={isAllTxnsOpen}
        onClose={() => setIsAllTxnsOpen(false)}
        transactions={transactions}
      />

      {/* Digital Card Pass & Download Modal */}
      <DigitalCardModal
        isOpen={isDigitalCardOpen}
        onClose={() => setIsDigitalCardOpen(false)}
        card={primaryCard}
        brand={detectedBrand}
        onToggleStatus={toggleCardStatus}
      />

      {/* Recurring Subscriptions & Autopay Modal */}
      <RecurringPaymentsModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
      />
    </div>
  );
}
