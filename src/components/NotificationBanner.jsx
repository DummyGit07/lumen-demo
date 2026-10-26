import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  MessageSquare,
  Music2,
  Image,
  Bell,
  ChevronDown,
  ShieldAlert,
  Lock,
  CreditCard,
  Sparkles,
  CheckCircle2,
  MapPin,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { trustStorage } from '../apps/lumen-ai/services/trustStorage';

const ICON_MAP = {
  Phone,
  MessageSquare,
  Music2,
  Image,
  Bell,
  ShieldAlert,
  Lock,
  CreditCard,
  Sparkles,
  CheckCircle2
};

export default function NotificationBanner({ notification, onOpenApp, onDismiss, onExpandShade }) {
  if (!notification) return null;

  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState(notification?.deliveryAddress || '');

  // Reset to compact state & reset address when new notification arrives
  useEffect(() => {
    setIsExpanded(false);
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

  const IconComponent = ICON_MAP[notification.icon] || Bell;

  const handleCardClick = () => {
    if (!isExpanded) {
      // First click on card: Expand to read full details
      setIsExpanded(true);
      return;
    }

    // Second click on card (when already expanded): Open the app
    if (notification.onClickCard) {
      notification.onClickCard();
    } else if (onOpenApp) {
      onOpenApp(notification.appId);
    }
    if (onDismiss) onDismiss();
  };

  const handleToggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
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
          className={`notification-card ${isExpanded ? 'is-expanded' : 'is-compact'}`}
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
          {/* Leading App/Action Icon */}
          <div
            className="notif-icon-badge"
            style={{
              background:
                notification.appId === 'gmail'
                  ? '#ffffff'
                  : notification.color
                  ? `linear-gradient(135deg, ${notification.color}, ${notification.color}dd)`
                  : 'linear-gradient(135deg, #6366f1, #4f46e5)',
              boxShadow: notification.color ? `0 4px 12px ${notification.color}40` : 'none'
            }}
          >
            {notification.icon && ICON_MAP[notification.icon] ? (
              <IconComponent size={18} color="#fff" />
            ) : notification.appId === 'lumen_ai' ? (
              <Sparkles size={17} color="#fff" />
            ) : notification.appId === 'gmail' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M2 6.5V17.5C2 18.3284 2.67157 19 3.5 19H6.5V10.5L2 7.125V6.5Z" fill="#4285F4"/>
                <path d="M17.5 19H20.5C21.3284 19 22 18.3284 22 17.5V6.5L17.5 9.875V19Z" fill="#34A853"/>
                <path d="M17.5 9.875L12 14L6.5 9.875V19H17.5V9.875Z" fill="#EA4335"/>
                <path d="M17.5 5H6.5C5.67157 5 5 5.67157 5 6.5V7.125L12 12.375L19 7.125V6.5C19 5.67157 18.3284 5 17.5 5Z" fill="#FBBC04"/>
              </svg>
            ) : (
              <IconComponent size={18} />
            )}
          </div>

          {/* Main Content Area */}
          <div className="notif-text-content">
            {/* Header: App Name + Autonomy Badge + Timestamp + Expand Chevron */}
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
                <button
                  className="notif-expand-btn"
                  onClick={handleToggleExpand}
                  title={isExpanded ? 'Collapse' : 'Expand to see full message'}
                >
                  <ChevronDown
                    size={14}
                    className={`notif-chevron-icon ${isExpanded ? 'expanded' : ''}`}
                  />
                </button>
              </div>
            </div>

            {/* The Hero: Prominent, Crisp Headline */}
            <div className="notif-title">{notification.title}</div>

            {/* Body Text: Truncated when collapsed, full when expanded */}
            <div className={`notif-body ${isExpanded ? 'expanded' : 'collapsed'}`}>
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
                          setIsExpanded(true);
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
