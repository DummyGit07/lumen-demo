import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  CreditCard,
  Wifi,
  Lock,
  Unlock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { generateAndDownloadDigitalCard } from '../services/cardDownloadService';

export default function DigitalCardModal({
  isOpen,
  onClose,
  card,
  brand = 'Visa',
  onToggleStatus
}) {
  if (!isOpen || !card) return null;

  const isFreezed = card.status === 'freezed';

  const handleDownload = () => {
    generateAndDownloadDigitalCard(card, brand);
  };

  return (
    <div className="lumen-modal-overlay" onClick={onClose}>
      <motion.div
        className="lumen-pay-sheet"
        style={{ maxHeight: '90%', display: 'flex', flexDirection: 'column' }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lumen-pay-handle" />

        {/* Modal Header */}
        <div
          className="lumen-pay-header"
          style={{
            paddingBottom: '0.65rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={18} color="#a855f7" />
            <span style={{ fontWeight: 800, fontSize: '0.98rem' }}>
              Digital Card Copy
            </span>
          </div>
          <button className="lumen-icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          {/* Card Preview Graphic */}
          <div
            className={`digital-card-preview ${isFreezed ? 'is-freezed' : ''}`}
            style={{
              background: isFreezed
                ? 'linear-gradient(135deg, #0b172a 0%, #1e293b 60%, #0f172a 100%)'
                : 'linear-gradient(135deg, #110e20 0%, #291b40 50%, #46256f 100%)',
              border: `1.5px solid ${isFreezed ? 'rgba(56, 189, 248, 0.4)' : 'rgba(168, 85, 247, 0.4)'}`,
              borderRadius: '20px',
              padding: '1.2rem',
              color: '#fff',
              position: 'relative',
              boxShadow: isFreezed
                ? '0 12px 30px rgba(14, 165, 233, 0.18)'
                : '0 12px 35px rgba(168, 85, 247, 0.22)'
            }}
          >
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: isFreezed ? '#0284c7' : '#7c3aed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.82rem'
                  }}
                >
                  L
                </div>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.04em' }}>
                  LUMEN BANK
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wifi size={16} color="rgba(255, 255, 255, 0.7)" />
                <span style={{ fontWeight: 900, fontSize: '1.05rem', letterSpacing: '0.06em' }}>
                  {brand.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Chip & Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '26px',
                  borderRadius: '5px',
                  background: 'linear-gradient(135deg, #f59e0b, #b45309)',
                  border: '1px solid rgba(255,255,255,0.4)'
                }}
              />
              {isFreezed && (
                <div
                  style={{
                    padding: '3px 8px',
                    borderRadius: '99px',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    background: 'rgba(56, 189, 248, 0.2)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.4)'
                  }}
                >
                  ❄ FREEZED
                </div>
              )}
            </div>

            {/* Full Card Number */}
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '1.08rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                marginBottom: '1rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.8)'
              }}
            >
              {card.cardNumber || '4028 8121 3684 8411'}
            </div>

            {/* Metadata (Name, Expiry, CVV) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: '0.52rem', color: '#94a3b8', fontWeight: 600 }}>CARDHOLDER</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.04em' }}>
                  {card.cardHolder || 'NEERAJ'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.52rem', color: '#94a3b8', fontWeight: 600 }}>VALID THRU</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                  {card.expiry || '12/31'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.52rem', color: '#94a3b8', fontWeight: 600 }}>CVV</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f87171' }}>
                  {card.cvv || '471'}
                </div>
              </div>
            </div>
          </div>

          {/* If freezed in future steps, display notice */}
          {isFreezed && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '14px',
                padding: '0.75rem 1rem'
              }}
            >
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8' }}>
                  Card Status: Freezed
                </div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                  Transactions blocked. Card is temporarily locked.
                </div>
              </div>
            </div>
          )}

          {/* Security Features Info List */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
              fontSize: '0.7rem',
              color: '#94a3b8',
              padding: '0 0.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="#10b981" />
              <span>Official digitally signed card copy verified by Lumen Vault</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} color="#10b981" />
              <span>High-resolution PNG includes CVV and full card number</span>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '0.85rem',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: '#fff',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(124, 58, 237, 0.35)',
              marginTop: '0.25rem'
            }}
          >
            <Download size={17} />
            <span>Download Digital Copy (PNG)</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
