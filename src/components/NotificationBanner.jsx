import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageSquare, Music2, Image, Bell, X } from 'lucide-react';

const ICON_MAP = {
  Phone,
  MessageSquare,
  Music2,
  Image,
  Bell
};

export default function NotificationBanner({ notification, onOpenApp, onDismiss }) {
  if (!notification) return null;

  const IconComponent = ICON_MAP[notification.icon] || Bell;

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
            if (info.offset.y < -30) {
              onDismiss();
            }
          }}
          onClick={() => {
            onOpenApp(notification.appId);
            onDismiss();
          }}
        >
          <div
            className="notif-icon-badge"
            style={{ background: notification.color || '#6366f1' }}
          >
            <IconComponent size={20} />
          </div>

          <div className="notif-text-content">
            <div className="notif-header-line">
              <span className="notif-app-name">{notification.appName}</span>
              <span className="notif-timestamp">{notification.time}</span>
            </div>
            <div className="notif-title">{notification.title}</div>
            <div className="notif-body">{notification.body}</div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
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
