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
              Vertical Digital Card
            </span>
          </div>
          <button className="lumen-icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          className="no-scrollbar"
          style={{
            flex: 1,
            overflowY: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            padding: '0.85rem 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          {/* Vertical Card Preview Graphic */}
          <div
            className={`digital-card-preview vertical ${isFreezed ? 'is-freezed' : ''}`}
            style={{
              width: '100%',
              maxWidth: '246px',
              minHeight: '380px',
              margin: '0 auto',
              background: isFreezed
                ? 'linear-gradient(160deg, #0a192f 0%, #1e293b 50%, #0b1329 100%)'
                : 'linear-gradient(160deg, #0b0c16 0%, #1c1135 45%, #2e1853 80%, #110926 100%)',
              border: `1.5px solid ${isFreezed ? 'rgba(56, 189, 248, 0.45)' : 'rgba(168, 85, 247, 0.45)'}`,
              borderRadius: '22px',
              padding: '1.25rem 1.15rem',
              color: '#fff',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: isFreezed
                ? '0 16px 36px rgba(14, 165, 233, 0.22)'
                : '0 16px 40px rgba(168, 85, 247, 0.25)',
              overflow: 'hidden'
            }}
          >
            {/* Subtle Metallic Sheen Effect */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: isFreezed
                  ? 'radial-gradient(circle at 80% 20%, rgba(56, 189, 248, 0.15), transparent 70%)'
                  : 'radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.2), transparent 70%)',
                pointerEvents: 'none'
              }}
            />

            {/* Top section: Bank logo + Contactless Symbol */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '8px',
                      background: isFreezed ? '#0284c7' : '#7c3aed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '0.8rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}
                  >
                    L
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.04em' }}>
                    LUMEN
                  </span>
                </div>

                <Wifi size={17} color="rgba(255, 255, 255, 0.85)" style={{ transform: 'rotate(90deg)' }} />
              </div>

              {/* EMV Gold Chip + Frozen Status if active */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.6rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '28px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #fde68a, #f59e0b 60%, #b45309)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: 0,
                      right: 0,
                      height: '1px',
                      background: 'rgba(0,0,0,0.35)'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: '40%',
                      top: 0,
                      bottom: 0,
                      width: '1px',
                      background: 'rgba(0,0,0,0.35)'
                    }}
                  />
                </div>

                {isFreezed && (
                  <div
                    style={{
                      padding: '3px 8px',
                      borderRadius: '99px',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      background: 'rgba(56, 189, 248, 0.2)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.45)',
                      letterSpacing: '0.04em'
                    }}
                  >
                    ❄ FROZEN
                  </div>
                )}
              </div>
            </div>

            {/* Middle Section: 16-Digit Card Number */}
            <div style={{ margin: '0.8rem 0' }}>
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '1.04rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textShadow: '0 2px 4px rgba(0,0,0,0.85)',
                  lineHeight: 1.3
                }}
              >
                {card.cardNumber || '4028 8121 3684 8411'}
              </div>
            </div>

            {/* Bottom Details Section: Valid Thru, CVV, Cardholder, Network Logo */}
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.8rem' }}>
                <div>
                  <div style={{ fontSize: '0.5rem', color: '#94a3b8', fontWeight: 600 }}>VALID THRU</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                    {card.expiry || '12/31'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.5rem', color: '#94a3b8', fontWeight: 600 }}>CVV</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f87171', fontFamily: 'JetBrains Mono, monospace' }}>
                    {card.cvv || '471'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '0.45rem', borderTop: '1px solid rgba(255, 255, 255, 0.09)' }}>
                <div>
                  <div style={{ fontSize: '0.5rem', color: '#94a3b8', fontWeight: 600 }}>CARDHOLDER</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                    {String(card.cardHolder || 'NEERAJ').toUpperCase()}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 900, fontSize: '1.2rem', letterSpacing: '0.06em', lineHeight: 1 }}>
                    {brand.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* If freezed, display status banner */}
          {isFreezed && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '12px',
                padding: '0.65rem 0.9rem'
              }}
            >
              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#38bdf8' }}>
                  Card Status: Frozen
                </div>
                <div style={{ fontSize: '0.64rem', color: '#94a3b8' }}>
                  Transactions blocked. Card is temporarily locked.
                </div>
              </div>
            </div>
          )}

          {/* Download Button */}
          <button
            onClick={handleDownload}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '0.8rem',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: '#fff',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.86rem',
              cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(124, 58, 237, 0.35)',
              marginTop: '0.2rem'
            }}
          >
            <Download size={16} />
            <span>Download Card (PNG)</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
