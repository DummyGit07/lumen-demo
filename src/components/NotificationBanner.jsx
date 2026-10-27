import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { trustStorage } from '../apps/lumen-ai/services/trustStorage';

export default function NotificationBanner({ notification, onOpenApp, onDismiss, onExpandShade }) {
  if (!notification) return null;

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState(notification?.deliveryAddress || '');

  // Reset address state when new notification arrives
  useEffect(() => {
    setIsEditingAddress(false);
    setAddressInput(notification?.deliveryAddress || '');
  }, [notification?.id, notification?.deliveryAddress]);

  // Two-way real-time sync with trustStorage address updates
  useEffect(() => {
    const unsub = trustStorage.subscribe((event, data) => {
      if (event === 'address_updated') {
        setAddressInput(data);
      }
    });
    return unsub;
  }, []);

  const handleCardClick = () => {
    if (notification.onClickCard) {
      notification.onClickCard();
    } else if (onOpenApp) {
      onOpenApp(notification.appId);
    }
    if (onDismiss) onDismiss();
  };

  const handleSaveAddress = (e) => {
    e.stopPropagation();
    if (addressInput.trim()) {
      setIsEditingAddress(false);
      if (notification.onUpdateAddress) {
        notification.onUpdateAddress(addressInput.trim());
      }
    }
  };

  const handleCancelAddress = (e) => {
    e.stopPropagation();
    setAddressInput(notification?.deliveryAddress || '');
    setIsEditingAddress(false);
  };

  const badgeLevelKey = (notification.autonomyBadge || '').toLowerCase().slice(0, 2);

  return (
    <AnimatePresence>
      <div className="notification-banner-wrapper">
        <motion.div
          key={notification.id}
          className="notification-card"
          initial={{ y: -70, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -70, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 24, stiffness: 350 }}
          layout
          drag={true}
          dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
          dragElastic={0.65}
          onDragEnd={(e, info) => {
            // Horizontal swipe left or right (Real mobile dismiss gesture)
            if (info.offset.x > 60 || info.velocity.x > 200) {
              if (onDismiss) onDismiss();
            } else if (info.offset.x < -60 || info.velocity.x < -200) {
              if (onDismiss) onDismiss();
            }
            // Vertical swipe up (dismiss upwards)
            else if (info.offset.y < -30 || info.velocity.y < -200) {
              if (onDismiss) onDismiss();
            }
            // Vertical swipe down (pull down notification shade)
            else if (info.offset.y > 35 || info.velocity.y > 200) {
              if (onExpandShade) onExpandShade();
            }
          }}
          onClick={handleCardClick}
          style={{ cursor: 'pointer' }}
        >
          {/* Main Content Area - Full Width */}
          <div className="notif-text-content">
            {/* Header: App Name + Autonomy Badge + Timestamp */}
            <div className="notif-header-line">
              <div className="notif-header-left">
                <span className="notif-app-name">{notification.appName || 'Lumen'}</span>
                {notification.autonomyBadge && (
                  <span className={`notif-autonomy-pill pill-${badgeLevelKey}`}>
                    {notification.autonomyBadge}
                  </span>
                )}
              </div>
              <div className="notif-header-right">
                <span className="notif-timestamp">{notification.time || 'Now'}</span>
              </div>
            </div>

            {/* Headline */}
            <div className="notif-title">{notification.title}</div>

            {/* Body Text */}
            <div className="notif-body">
              {notification.body}
            </div>

            {/* Address Verification Box (L2 Semi-Autonomous flow) */}
            {notification.addressVerification && (
              <div
                className="notif-address-box"
                onClick={(e) => e.stopPropagation()}
              >
                {!isEditingAddress ? (
                  <div className="notif-address-view">
                    <div className="notif-address-header">
                      <span className="notif-address-label">
                        <MapPin size={12} className="notif-address-pin" /> Delivery Address
                      </span>
                      <button
                        type="button"
                        className="notif-address-edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditingAddress(true);
                        }}
                      >
                        <Edit3 size={11} />
                        <span>Edit</span>
                      </button>
                    </div>
                    <div className="notif-address-value">
                      {addressInput || notification.deliveryAddress || 'Address on file'}
                    </div>
                  </div>
                ) : (
                  <div className="notif-address-edit-form">
                    <div className="notif-address-edit-title">
                      <MapPin size={12} /> Edit Delivery Address:
                    </div>
                    <textarea
                      className="notif-address-textarea"
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      rows={2}
                      autoFocus
                      placeholder="Enter complete delivery address..."
                    />
                    <div className="notif-address-edit-actions">
                      <button
                        type="button"
                        className="notif-addr-btn cancel"
                        onClick={handleCancelAddress}
                      >
                        <X size={12} /> Cancel
                      </button>
                      <button
                        type="button"
                        className="notif-addr-btn save"
                        onClick={handleSaveAddress}
                      >
                        <Check size={12} /> Save Address
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modern Tactile Action Buttons (Always visible in 1 tap!) */}
            {Array.isArray(notification.actions) && notification.actions.length > 0 && (
              <div className="notif-actions-row">
                {notification.actions.map((act, idx) => (
                  <button
                    key={idx}
                    className={`notif-btn notif-btn-${act.variant || 'default'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (act.onClick) act.onClick(addressInput.trim() || notification?.deliveryAddress);
                    }}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
