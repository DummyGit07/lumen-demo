import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Edit3,
  Check,
  X,
  Send
} from 'lucide-react';
import { trustStorage } from '../apps/lumen-ai/services/trustStorage';

export default function NotificationBanner({ notification, onOpenApp, onDismiss, onExpandShade }) {
  if (!notification) return null;

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState(notification?.deliveryAddress || '');

  // 3s thinking sync for dispute notifications
  const [isThinking, setIsThinking] = useState(Boolean(notification?.isThinking));

  // Inline reply input (e.g. Order ID)
  const [inlineInput, setInlineInput] = useState('');

  // Approach A tactile confirmation state
  const [confirmationText, setConfirmationText] = useState(null);
  const dismissTimerRef = useRef(null);

  // Reset state when new notification arrives or changes
  useEffect(() => {
    setIsEditingAddress(false);
    setAddressInput(notification?.deliveryAddress || '');
    setInlineInput('');
    setConfirmationText(null);
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }

    if (notification?.isThinking) {
      setIsThinking(true);
      const duration = notification.thinkingDuration || 3000;
      const timer = setTimeout(() => {
        setIsThinking(false);
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setIsThinking(false);
    }
  }, [notification?.id, notification?.isThinking, notification?.thinkingDuration, notification?.deliveryAddress]);

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
    // If confirmation is being shown, don't trigger card navigation
    if (confirmationText) return;
    if (notification.onClickCard) {
      notification.onClickCard();
      if (onOpenApp && notification.appId) {
        onOpenApp(notification.appId);
      }
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

  const handleInlineSubmit = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!inlineInput.trim()) return;

    if (notification.onSubmitInput) {
      notification.onSubmitInput(inlineInput.trim());
    } else if (notification.onSubmitOrder) {
      notification.onSubmitOrder(inlineInput.trim());
    }

    setConfirmationText(notification.confirmationText || '✓ Order ID sent');
    dismissTimerRef.current = setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 1000);
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
            if (info.offset.x > 60 || info.velocity.x > 200 || info.offset.x < -60 || info.velocity.x < -200) {
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
            {/* Header: App Name + Autonomy Badge + Optional Timestamp */}
            <div className="notif-header-line">
              <div className="notif-header-left">
                <span className="notif-app-name">{notification.appName || 'Lumen'}</span>
                {notification.autonomyBadge && (
                  <span className={`notif-autonomy-pill pill-${badgeLevelKey}`}>
                    {notification.autonomyBadge}
                  </span>
                )}
              </div>
              {!notification.hideTimestamp && (
                <div className="notif-header-right">
                  <span className="notif-timestamp">{notification.time || 'Now'}</span>
                </div>
              )}
            </div>

            {/* Headline if provided */}
            {notification.title && <div className="notif-title">{notification.title}</div>}

            {/* Prompt text (e.g. what Blinkit asked) */}
            {notification.promptText && (
              <div className="notif-prompt-text">{notification.promptText}</div>
            )}

            {/* Thinking state (0s - 3s) */}
            {isThinking ? (
              <div className="notif-thinking-row">
                <span className="notif-thinking-dot" />
                <span className="notif-thinking-label">
                  {notification.thinkingText || 'Lumen is drafting reply...'}
                </span>
              </div>
            ) : (
              <>
                {/* Draft text proposed by Lumen */}
                {notification.draftText && (
                  <div className="notif-draft-text">{notification.draftText}</div>
                )}

                {/* Body Text */}
                {notification.body && (
                  <div className="notif-body">
                    {notification.body}
                  </div>
                )}
              </>
            )}

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

            {/* Inline Quick-Reply Input (Stage 3 Order ID) */}
            {!isThinking && notification.hasInlineInput && !confirmationText && (
              <form
                className="notif-inline-input-wrap"
                onSubmit={handleInlineSubmit}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="notif-btn notif-btn-icon notif-btn-dismiss"
                  title="Dismiss"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (notification.actions?.[0]?.onClick) {
                      notification.actions[0].onClick();
                    }
                    if (onDismiss) onDismiss();
                  }}
                >
                  <X size={14} />
                </button>
                <input
                  type="text"
                  className="notif-inline-input"
                  placeholder={notification.inputPlaceholder || 'Enter Order ID (e.g. BLK-89214)...'}
                  value={inlineInput}
                  onChange={(e) => setInlineInput(e.target.value)}
                  autoFocus
                />
                <button
                  type="submit"
                  className="notif-btn notif-btn-icon notif-btn-send"
                  title="Send"
                  disabled={!inlineInput.trim()}
                >
                  <Send size={14} />
                </button>
              </form>
            )}

            {/* Approach A: 1-second confirmation pill before auto-dismiss */}
            {confirmationText && (
              <motion.div
                className="notif-confirmation-banner"
                initial={{ opacity: 0, scale: 0.95, y: 3 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.16 }}
              >
                {confirmationText}
              </motion.div>
            )}

            {/* Tactile Action Buttons (Strictly either standalone icon OR clean text, never both) */}
            {!isThinking && !confirmationText && !notification.hasInlineInput && Array.isArray(notification.actions) && notification.actions.length > 0 && (
              <div className="notif-actions-row">
                {notification.actions.map((act, idx) => {
                  const isIconDismiss = act.iconOnly === 'dismiss' || act.icon === 'X';
                  const isIconSend = act.iconOnly === 'send' || act.icon === 'Send';
                  const isIconOnly = isIconDismiss || isIconSend;

                  return (
                    <button
                      key={idx}
                      className={`notif-btn notif-btn-${act.variant || 'default'} ${
                        isIconOnly ? `notif-btn-icon ${isIconDismiss ? 'notif-btn-dismiss' : 'notif-btn-send'}` : ''
                      }`}
                      title={isIconDismiss ? 'Dismiss' : isIconSend ? 'Send' : act.label}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (act.inPlace) {
                          if (act.onClick) {
                            act.onClick(addressInput.trim() || notification?.deliveryAddress);
                          }
                          if (act.confirmationText) {
                            setConfirmationText(act.confirmationText);
                            dismissTimerRef.current = setTimeout(() => {
                              if (onDismiss) onDismiss();
                            }, 1000);
                          } else {
                            if (onDismiss) onDismiss();
                          }
                          return;
                        }

                        if (act.onClick) {
                          act.onClick(addressInput.trim() || notification?.deliveryAddress);
                        }
                        if ((act.label === 'View' || act.label?.startsWith('View') || act.tab || act.openApp) && onOpenApp) {
                          onOpenApp(act.appId || notification.appId || 'lumen_ai');
                        }
                        if (onDismiss) onDismiss();
                      }}
                    >
                      {isIconDismiss ? (
                        <X size={14} />
                      ) : isIconSend ? (
                        <Send size={14} />
                      ) : (
                        act.label
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
