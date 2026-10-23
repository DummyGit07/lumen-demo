import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  CreditCard,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sliders,
  Flame,
  KeyRound,
  FileCheck2,
  ChevronRight
} from 'lucide-react';
import { trustStorage, AUTONOMY_LEVELS } from '../services/trustStorage';

export default function TrustScreen({ onNavigateTab }) {
  const [autonomyLevel, setAutonomyLevel] = useState(() => trustStorage.getAutonomyLevel());
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    const unsub = trustStorage.subscribe((event, data) => {
      if (event === 'autonomy_changed') {
        setAutonomyLevel(data);
      }
    });
    return unsub;
  }, []);

  const handleSelectLevel = (levelKey) => {
    if (levelKey === 'l2') return; // L2 is disabled for future
    const updated = trustStorage.setAutonomyLevel(levelKey);
    setAutonomyLevel(updated);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2400);
  };

  return (
    <div className="lumen-trust-scroll">
      {/* 1. Header Overview */}
      <div className="trust-hero-bar">
        <div className="trust-hero-icon-box">
          <ShieldCheck size={28} color="#10b981" />
        </div>
        <div>
          <div className="trust-hero-title">Lumen Trust & Security</div>
          <div className="trust-hero-subtitle">Autonomous AI Permissions & Guardrails</div>
        </div>
      </div>

      {/* Security Status Pill */}
      <div className="trust-security-status-strip">
        <div className="status-item">
          <Lock size={12} color="#10b981" />
          <span>256-Bit AES Vault</span>
        </div>
        <div className="status-divider">•</div>
        <div className="status-item">
          <KeyRound size={12} color="#6366f1" />
          <span>Zero-Knowledge Encryption</span>
        </div>
      </div>

      {/* Save Toast Notification */}
      {saveToast && (
        <motion.div
          className="trust-save-toast"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <CheckCircle2 size={13} color="#10b981" />
          <span>Autonomy policy updated to {autonomyLevel.toUpperCase()}</span>
        </motion.div>
      )}

      {/* Section Label */}
      <div className="trust-section-header">
        <Sliders size={14} color="#818cf8" />
        <span>AUTONOMY POLICIES</span>
      </div>

      {/* Card 1: Card Management (Primary Configurable Card) */}
      <div className="trust-card-container highlighted-trust-card">
        <div className="trust-card-top">
          <div className="trust-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
            <CreditCard size={18} color="#818cf8" />
          </div>
          <div className="trust-card-title-group">
            <div className="trust-card-title">Card Management</div>
            <div className="trust-card-desc">
              Adjust how Lumen AI responds to credit card fraud, emergency freezes, and card replacements.
            </div>
          </div>
        </div>

        {/* 3 Autonomy Levels Selector */}
        <div className="autonomy-levels-grid">
          {/* L1 Tier */}
          <div
            className={`autonomy-tier-card ${autonomyLevel === 'l1' ? 'active' : ''}`}
            onClick={() => handleSelectLevel('l1')}
          >
            <div className="tier-header">
              <div className="tier-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                L1
              </div>
              <div className="tier-title-wrap">
                <div className="tier-title">Guided Assistance</div>
                <div className="tier-tag">Manual Approval</div>
              </div>
              <div className="tier-radio">
                {autonomyLevel === 'l1' && <div className="tier-radio-dot" style={{ background: '#3b82f6' }} />}
              </div>
            </div>
            <p className="tier-desc">
              AI detects fraud and provides step-by-step guidance in <strong>Ask</strong>. You retain 100% manual control over freezing and ordering replacements.
            </p>
            {autonomyLevel === 'l1' && (
              <div className="tier-active-pill" style={{ color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                <CheckCircle2 size={11} /> Currently Active
              </div>
            )}
          </div>

          {/* L2 Tier (Disabled for future) */}
          <div className="autonomy-tier-card disabled-tier">
            <div className="tier-header">
              <div className="tier-badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                L2
              </div>
              <div className="tier-title-wrap">
                <div className="tier-title">Semi-Autonomous</div>
                <div className="tier-tag-soon">Coming Soon</div>
              </div>
              <div className="tier-radio disabled" />
            </div>
            <p className="tier-desc">
              Threshold-based auto-freeze with manual spending limits. (Reserved for next feature release).
            </p>
          </div>

          {/* L3 Tier */}
          <div
            className={`autonomy-tier-card ${autonomyLevel === 'l3' ? 'active l3-active' : ''}`}
            onClick={() => handleSelectLevel('l3')}
          >
            <div className="tier-header">
              <div className="tier-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                L3
              </div>
              <div className="tier-title-wrap">
                <div className="tier-title">High Autonomy</div>
                <div className="tier-tag" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#34d399' }}>
                  AI Automation
                </div>
              </div>
              <div className="tier-radio">
                {autonomyLevel === 'l3' && <div className="tier-radio-dot" style={{ background: '#10b981' }} />}
              </div>
            </div>
            <p className="tier-desc">
              AI can immediately freeze compromised credit cards and issue a brand-new digital card with 1-click approvals in the background.
            </p>
            {autonomyLevel === 'l3' && (
              <div className="tier-active-pill" style={{ color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                <CheckCircle2 size={11} /> Currently Active
              </div>
            )}
          </div>
        </div>

        {/* Current Active Mode Footer Note */}
        <div className="trust-card-footer-note">
          <Info size={13} color="#94a3b8" />
          <span>
            {autonomyLevel === 'l1'
              ? 'At L1, suspicious transactions trigger guided interactive steps in Ask.'
              : 'At L3, suspicious transactions can be frozen and replaced in 1-click.'}
          </span>
        </div>
      </div>

      {/* Card 2: Fraud & Anomaly Shield Policy */}
      <div className="trust-card-container">
        <div className="trust-card-top">
          <div className="trust-card-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
            <AlertTriangle size={18} color="#f87171" />
          </div>
          <div className="trust-card-title-group">
            <div className="trust-card-title">Real-Time Anomaly Detection</div>
            <div className="trust-card-desc">
              Constantly analyzes POS swipe locations, unknown international gateways, and unusual frequency spikes.
            </div>
          </div>
        </div>
        <div className="trust-badge-row">
          <span className="trust-pill-tag">Status: Active & Monitoring</span>
          <span className="trust-pill-tag">Risk Model: v4.2 Neural</span>
        </div>
      </div>

      {/* Card 3: RBI & Data Privacy Vault */}
      <div className="trust-card-container">
        <div className="trust-card-top">
          <div className="trust-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
            <FileCheck2 size={18} color="#10b981" />
          </div>
          <div className="trust-card-title-group">
            <div className="trust-card-title">Data Privacy & Consent</div>
            <div className="trust-card-desc">
              Client-side financial tokens only. Your credentials and card numbers are never stored in unencrypted cloud logs.
            </div>
          </div>
        </div>
        <div className="trust-badge-row">
          <span className="trust-pill-tag">RBI Guidelines Compliant</span>
          <span className="trust-pill-tag">Local Vault Isolated</span>
        </div>
      </div>
    </div>
  );
}
