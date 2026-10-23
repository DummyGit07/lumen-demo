import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Zap, Lock } from 'lucide-react';

export default function DummyScreen({ tab, onNavigateGlance }) {
  if (tab === 'act') {
    return (
      <motion.div
        className="lumen-dummy-screen"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        <div className="dummy-icon-wrap" style={{ background: 'rgba(236, 72, 153, 0.15)' }}>
          <Zap size={36} color="#ec4899" />
        </div>
        <div className="dummy-title">Lumen Act</div>
        <div className="dummy-subtitle">Autonomous Actions & Routines</div>
        <p className="dummy-desc">
          Automate bill payments, auto-pay credit card outstanding before due date, and trigger smart micro-investments based on spending patterns.
        </p>

        <div className="dummy-status-pill">
          <span className="dummy-dot" /> Module in development
        </div>

        <button className="dummy-action-btn" onClick={() => onNavigateGlance()}>
          Back to Glance
        </button>
      </motion.div>
    );
  }

  if (tab === 'trust') {
    return (
      <motion.div
        className="lumen-dummy-screen"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        <div className="dummy-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
          <ShieldCheck size={36} color="#10b981" />
        </div>
        <div className="dummy-title">Lumen Trust</div>
        <div className="dummy-subtitle">Security, Privacy & Consent Logs</div>
        <p className="dummy-desc">
          End-to-end client-side encryption, granular account permissions, RBI-compliant data retention controls, and transaction audit trails.
        </p>

        <div className="dummy-status-pill" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.12)' }}>
          <Lock size={12} style={{ marginRight: 4 }} /> 256-bit AES Vault Protected
        </div>

        <button className="dummy-action-btn" onClick={() => onNavigateGlance()}>
          Back to Glance
        </button>
      </motion.div>
    );
  }

  return null;
}
