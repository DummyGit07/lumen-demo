import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CreditCard,
  Plus,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShieldCheck,
  Zap,
  Repeat
} from 'lucide-react';
import {
  recurringStorage,
  SUBSCRIPTION_CATALOG
} from '../services/recurringStorage';

export default function RecurringPaymentsModal({ isOpen, onClose }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [activeCard, setActiveCard] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null); // For "View Details" view
  const [isAddMode, setIsAddMode] = useState(false); // For "Add Subscription" view

  // Add Form state
  const [selectedPlatformId, setSelectedPlatformId] = useState('netflix');
  const [selectedPlanId, setSelectedPlanId] = useState('netflix-standard');

  const reloadData = () => {
    setSubscriptions(recurringStorage.loadSubscriptions());
    setActiveCard(recurringStorage.getActiveCard());
  };

  useEffect(() => {
    if (isOpen) {
      reloadData();
      setSelectedSub(null);
      setIsAddMode(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const unsub = recurringStorage.subscribe(() => {
      reloadData();
    });
    return unsub;
  }, []);

  // Update selected plan default when platform changes in add form
  useEffect(() => {
    const platform = SUBSCRIPTION_CATALOG[selectedPlatformId];
    if (platform && platform.plans.length > 0) {
      setSelectedPlanId(platform.plans[0].id);
    }
  }, [selectedPlatformId]);

  if (!isOpen) return null;

  const handleOpenAdd = () => {
    setSelectedPlatformId('netflix');
    setSelectedPlanId('netflix-standard');
    setIsAddMode(true);
    setSelectedSub(null);
  };

  const handleSaveNewSub = (e) => {
    e.preventDefault();
    recurringStorage.addSubscription({
      platformId: selectedPlatformId,
      planId: selectedPlanId
    });
    setIsAddMode(false);
  };

  const currentPlatformCatalog = SUBSCRIPTION_CATALOG[selectedPlatformId];
  const currentPlan = currentPlatformCatalog?.plans.find((p) => p.id === selectedPlanId);

  return (
    <AnimatePresence>
      <div className="recurring-modal-backdrop" onClick={onClose}>
        <motion.div
          className="recurring-modal-container"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="recurring-modal-header">
            {isAddMode ? (
              <div className="recurring-header-left">
                <button
                  type="button"
                  className="recurring-back-btn"
                  onClick={() => setIsAddMode(false)}
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <div className="recurring-title">Add Subscription</div>
                  <div className="recurring-subtitle">Link new recurring autopay</div>
                </div>
              </div>
            ) : selectedSub ? (
              <div className="recurring-header-left">
                <button
                  type="button"
                  className="recurring-back-btn"
                  onClick={() => setSelectedSub(null)}
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <div className="recurring-title">{selectedSub.platformName} Details</div>
                  <div className="recurring-subtitle">Plan & Linked Card</div>
                </div>
              </div>
            ) : (
              <div className="recurring-header-left">
                <div className="recurring-header-icon-box">
                  <Repeat size={18} color="#818cf8" />
                </div>
                <div>
                  <div className="recurring-title">Recurring Payments</div>
                  <div className="recurring-subtitle">
                    {subscriptions.length} Active Autopay Subscriptions
                  </div>
                </div>
              </div>
            )}

            <button type="button" className="recurring-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="recurring-modal-body">
            {/* 1. DETAIL VIEW */}
            {selectedSub ? (
              <div className="recurring-detail-view">
                {/* Platform Hero Card */}
                <div
                  className="recurring-hero-card"
                  style={{
                    background:
                      SUBSCRIPTION_CATALOG[selectedSub.platformId]?.bgGradient ||
                      'linear-gradient(135deg, #1e1b4b, #312e81)'
                  }}
                >
                  <div className="hero-platform-name">{selectedSub.platformName}</div>
                  <div className="hero-plan-badge">{selectedSub.planName} Plan</div>
                  <div className="hero-price-row">
                    <span className="hero-price">{selectedSub.price}</span>
                    <span className="hero-cycle">/ {selectedSub.cycle}</span>
                  </div>
                </div>

                {/* Plan Benefits Card */}
                <div className="recurring-info-section">
                  <div className="section-label">Plan Benefits</div>
                  <div className="plan-benefits-card">
                    <div className="benefit-item">
                      <CheckCircle2 size={16} className="benefit-check-icon" />
                      <span>{selectedSub.benefits}</span>
                    </div>
                    <div className="benefit-item">
                      <Calendar size={16} className="benefit-check-icon" />
                      <span>Next automatic billing date: <strong>{selectedSub.nextBillingDate}</strong></span>
                    </div>
                  </div>
                </div>

                {/* ACTIVE CREDIT CARD INFORMATION CARD (CRUCIAL) */}
                <div className="recurring-info-section">
                  <div className="section-label">Billed To Credit Card</div>
                  <div className="linked-card-card">
                    <div className="card-top-row">
                      <div className="card-bank-info">
                        <CreditCard size={18} color="#a855f7" />
                        <span className="card-bank-name">{activeCard?.bankName || 'Lumen'} {activeCard?.cardType || 'Credit Card'}</span>
                      </div>
                      <span className="card-status-pill">
                        <span className="status-dot green" /> Active
                      </span>
                    </div>

                    <div className="card-number-display">
                      {activeCard?.maskedDisplay || '•••• •••• •••• 8411'}
                    </div>

                    <div className="card-meta-row">
                      <div>
                        <span className="card-meta-label">Card Holder</span>
                        <span className="card-meta-value">{activeCard?.cardHolder || 'Neeraj'}</span>
                      </div>
                      <div>
                        <span className="card-meta-label">Expires</span>
                        <span className="card-meta-value">{activeCard?.expiry || '12/31'}</span>
                      </div>
                      <div>
                        <span className="card-meta-label">Network</span>
                        <span className="card-meta-value">{activeCard?.brand || 'Visa'}</span>
                      </div>
                    </div>

                    {/* <div className="card-autopay-note">
                      <ShieldCheck size={13} color="#10b981" />
                      <span>Autopay is active. When a new card is issued, this subscription updates seamlessly.</span>
                    </div> */}
                  </div>
                </div>

                <button
                  type="button"
                  className="recurring-action-outline-btn"
                  onClick={() => setSelectedSub(null)}
                >
                  ← Back to Subscriptions
                </button>
              </div>
            ) : isAddMode ? (
              /* 2. ADD SUBSCRIPTION VIEW */
              <form onSubmit={handleSaveNewSub} className="recurring-add-form">
                {/* Step 1: Platform Selection */}
                <div className="form-group">
                  <label className="form-label">1. Select Platform</label>
                  <div className="platform-selector-grid">
                    {Object.values(SUBSCRIPTION_CATALOG).map((plat) => {
                      const isSelected = selectedPlatformId === plat.id;
                      return (
                        <div
                          key={plat.id}
                          className={`platform-chip ${isSelected ? 'selected' : ''}`}
                          onClick={() => setSelectedPlatformId(plat.id)}
                          style={{
                            borderColor: isSelected ? plat.brandColor : 'rgba(255, 255, 255, 0.1)'
                          }}
                        >
                          <div
                            className="platform-chip-avatar"
                            style={{ background: plat.bgGradient }}
                          >
                            {plat.iconText}
                          </div>
                          <span className="platform-chip-name">{plat.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Plan Selection for this Platform */}
                <div className="form-group">
                  <label className="form-label">2. Select Plan for {currentPlatformCatalog?.name}</label>
                  <div className="plans-list-picker">
                    {currentPlatformCatalog?.plans.map((p) => {
                      const isPlanSelected = selectedPlanId === p.id;
                      return (
                        <div
                          key={p.id}
                          className={`plan-picker-item ${isPlanSelected ? 'selected' : ''}`}
                          onClick={() => setSelectedPlanId(p.id)}
                        >
                          <div className="plan-item-header">
                            <div>
                              <span className="plan-picker-name">{p.name}</span>
                              <span className="plan-picker-benefits">{p.benefits}</span>
                            </div>
                            <div className="plan-picker-price">
                              {p.price}
                              <span className="plan-picker-cycle">/{p.cycle}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3: Linked Credit Card Preview */}
                <div className="form-group">
                  <label className="form-label">3. Payment Method (Active Card)</label>
                  <div className="linked-card-mini-box">
                    <div className="mini-card-icon">
                      <CreditCard size={16} color="#818cf8" />
                    </div>
                    <div className="mini-card-info">
                      <span className="mini-card-number">{activeCard?.maskedDisplay || '•••• •••• •••• 8411'}</span>
                      <span className="mini-card-expiry">Expires {activeCard?.expiry || '12/31'} • {activeCard?.brand || 'Visa'}</span>
                    </div>
                    <span className="mini-card-badge">Autopay</span>
                  </div>
                </div>

                {/* Submit Action */}
                <button type="submit" className="recurring-submit-btn">
                  <Plus size={16} />
                  <span>Activate Recurring Payment</span>
                </button>
              </form>
            ) : (
              /* 3. LIST VIEW (DEFAULT) */
              <div className="recurring-list-view">
                {/* Active Summary Banner */}
                <div className="recurring-summary-banner">
                  <div className="summary-left">
                    <span className="summary-title">Active Subscriptions</span>
                    <span className="summary-subtitle">Billed to your {activeCard?.brand || 'Lumen'} Card</span>
                  </div>
                  <button
                    type="button"
                    className="add-sub-trigger-btn"
                    onClick={handleOpenAdd}
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>

                {/* Subscriptions Cards List */}
                <div className="recurring-cards-stack">
                  {subscriptions.map((sub) => {
                    const catalogItem = SUBSCRIPTION_CATALOG[sub.platformId];
                    return (
                      <div
                        key={sub.id}
                        className="recurring-item-card"
                        onClick={() => setSelectedSub(sub)}
                      >
                        <div className="item-card-left">
                          <div
                            className="item-platform-badge"
                            style={{ background: catalogItem?.bgGradient || '#4f46e5' }}
                          >
                            {catalogItem?.iconText || sub.platformName.charAt(0)}
                          </div>
                          <div className="item-text-info">
                            <div className="item-platform-name">{sub.platformName}</div>
                            <div className="item-plan-name">{sub.planName} Plan</div>
                            <div className="item-card-tag">
                              <CreditCard size={11} />
                              <span>{activeCard?.last4 ? `•••• ${activeCard.last4}` : '•••• 8411'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="item-card-right">
                          <div className="item-price-tag">{sub.price}</div>
                          <div className="item-cycle-tag">/{sub.cycle}</div>
                          <button
                            type="button"
                            className="item-view-details-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSub(sub);
                            }}
                          >
                            <span>Details</span>
                            <ChevronRight size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
