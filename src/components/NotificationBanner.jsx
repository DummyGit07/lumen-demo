import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageSquare, Music2, Image, Bell, X, ShieldAlert } from 'lucide-react';

const ICON_MAP = {
  Phone,
  MessageSquare,
  Music2,
  Image,
  Bell,
  ShieldAlert
};

export default function NotificationBanner({ notification, onOpenApp, onDismiss, onExpandShade }) {
  if (!notification) return null;

  const IconComponent = ICON_MAP[notification.icon] || Bell;

  const handleCardClick = () => {
    if (notification.onClickCard) {
      notification.onClickCard();
    } else if (onOpenApp) {
      onOpenApp(notification.appId);
    }
    if (onDismiss) onDismiss();
  };

  return (
    <AnimatePresence>
      <div className="notification-banner-wrapper">
        <motion.div
          className="notification-card"
          initial={{ y: -70, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -70, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 24, stiffness: 350 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.4}
          onDragEnd={(e, info) => {
            if (info.offset.y < -30 && onDismiss) {
              onDismiss();
            } else if ((info.offset.y > 25 || info.velocity.y > 150) && onExpandShade) {
              onExpandShade();
            }
          }}
          onClick={handleCardClick}
          style={{ cursor: 'pointer' }}
        >
          <div
            className="notif-icon-badge"
            style={{
              background:
                notification.appId === 'gmail'
                  ? '#ffffff'
                  : notification.color || '#6366f1',
              fontWeight: 800,
              fontSize: '1rem',
              color: '#fff'
            }}
          >
            {notification.appId === 'lumen_ai' ? (
              <span>L</span>
            ) : notification.appId === 'gmail' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M2 6.5V17.5C2 18.3284 2.67157 19 3.5 19H6.5V10.5L2 7.125V6.5Z" fill="#4285F4"/>
                <path d="M17.5 19H20.5C21.3284 19 22 18.3284 22 17.5V6.5L17.5 9.875V19Z" fill="#34A853"/>
                <path d="M17.5 9.875L12 14L6.5 9.875V19H17.5V9.875Z" fill="#EA4335"/>
                <path d="M17.5 5H6.5C5.67157 5 5 5.67157 5 6.5V7.125L12 12.375L19 7.125V6.5C19 5.67157 18.3284 5 17.5 5Z" fill="#FBBC04"/>
              </svg>
            ) : (
              <IconComponent size={20} />
            )}
          </div>

          <div className="notif-text-content">
            <div className="notif-header-line">
              <span className="notif-app-name">{notification.appName}</span>
              {notification.autonomyBadge && (
                <span className="notif-autonomy-badge">{notification.autonomyBadge}</span>
              )}
              <span className="notif-timestamp">{notification.time || 'Now'}</span>
            </div>
            <div className="notif-title">{notification.title}</div>
            <div className="notif-body">{notification.body}</div>

            {/* Action Buttons */}
            {Array.isArray(notification.actions) && notification.actions.length > 0 && (
              <div className="notif-actions-row">
                {notification.actions.map((act, idx) => (
                  <button
                    key={idx}
                    className={`notif-btn notif-btn-${act.variant || 'default'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (act.onClick) act.onClick();
                      if (onDismiss) onDismiss();
                    }}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onDismiss) onDismiss();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Dismiss notification"
          >
            <X size={14} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
