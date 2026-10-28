import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  Bluetooth, 
  Volume2, 
  VolumeX, 
  Flashlight, 
  Moon, 
  Trash2, 
  ChevronUp, 
  Sun,
  Bell
} from 'lucide-react';
import { trustStorage } from '../apps/lumen-ai/services/trustStorage';

export default function NotificationShade({ 
  isOpen, 
  onClose, 
  notifications, 
  onClearAll, 
  onDismissOne, 
  onOpenApp,
  wifi,
  setWifi 
}) {
  const [bluetooth, setBluetooth] = useState(true);
  const [flashlight, setFlashlight] = useState(false);
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [muted, setMuted] = useState(false);
  const [brightness, setBrightness] = useState(85);

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="notification-shade-overlay"
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.1, bottom: 0.6 }}
          onDragEnd={(e, info) => {
            // Dragging upwards closes the shade
            if (info.offset.y < -50 || info.velocity.y < -300) {
              onClose();
            }
          }}
        >
          {/* Top Clock & Date in shade */}
          <div className="shade-top-bar">
            <div>
              <div className="shade-clock">{timeStr}</div>
              <div className="shade-date">{dateStr}</div>
            </div>
            <button className="shade-close-btn" onClick={onClose} title="Slide up to close">
              <ChevronUp size={20} />
            </button>
          </div>

          {/* Quick Settings Toggles */}
          <div className="shade-quick-settings">
            <div 
              className={`quick-toggle-item ${wifi ? 'active' : ''}`}
              onClick={() => setWifi(!wifi)}
            >
              <div className="quick-toggle-icon">
                <Wifi size={16} />
              </div>
              <span>Wi-Fi</span>
            </div>

            <div 
              className={`quick-toggle-item ${bluetooth ? 'active' : ''}`}
              onClick={() => setBluetooth(!bluetooth)}
            >
              <div className="quick-toggle-icon">
                <Bluetooth size={16} />
              </div>
              <span>Bluetooth</span>
            </div>

            <div 
              className={`quick-toggle-item ${flashlight ? 'active' : ''}`}
              onClick={() => setFlashlight(!flashlight)}
            >
              <div className="quick-toggle-icon">
                <Flashlight size={16} />
              </div>
              <span>Torch</span>
            </div>

            <div 
              className={`quick-toggle-item ${muted ? 'active' : ''}`}
              onClick={() => setMuted(!muted)}
            >
              <div className="quick-toggle-icon">
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </div>
              <span>{muted ? 'Muted' : 'Sound'}</span>
            </div>

            <div 
              className={`quick-toggle-item ${doNotDisturb ? 'active' : ''}`}
              onClick={() => setDoNotDisturb(!doNotDisturb)}
            >
              <div className="quick-toggle-icon">
                <Moon size={16} />
              </div>
              <span>DND</span>
            </div>
          </div>

          {/* Brightness Slider */}
          <div className="shade-brightness-slider">
            <Sun size={14} color="#f59e0b" />
            <input 
              type="range" 
              min="20" 
              max="100" 
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="brightness-range"
            />
          </div>

          {/* Notifications Header */}
          <div className="shade-notif-header">
            <span>Notifications ({notifications.length})</span>
            {notifications.length > 0 && (
              <button className="shade-clear-all" onClick={onClearAll}>
                <Trash2 size={12} style={{ marginRight: 4 }} /> Clear all
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="shade-notif-list">
            {notifications.length === 0 ? (
              <div className="shade-empty-state">
                <Bell size={26} color="#64748b" />
                <span>No new notifications</span>
              </div>
            ) : (
              <AnimatePresence>
                {notifications.map((item) => (
                    <motion.div
                      key={item.id}
                      className="shade-notif-item"
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100, transition: { duration: 0.15 } }}
                      onClick={() => {
                        if (item.onClickCard) {
                          item.onClickCard();
                        } else {
                          onOpenApp(item.appId);
                        }
                        onDismissOne(item.id);
                        onClose();
                      }}
                    >
                      <div className="shade-item-content">
                        <div className="shade-item-top">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="shade-item-app">{item.appName || 'Lumen'}</span>
                            {item.autonomyBadge && (
                              <span className={`notif-autonomy-pill pill-${(item.autonomyBadge || '').toLowerCase().slice(0, 2)}`}>
                                {item.autonomyBadge}
                              </span>
                            )}
                          </div>
                          <span className="shade-item-time">{item.time || 'Now'}</span>
                        </div>
                        <div className="shade-item-title">{item.title}</div>
                        <div className="shade-item-body">{item.body}</div>

                        {Array.isArray(item.actions) && item.actions.length > 0 && (
                          <div className="notif-actions-row" style={{ marginTop: '6px' }}>
                            {item.actions.map((act, idx) => (
                              <button
                                key={idx}
                                className={`notif-btn notif-btn-${act.variant || 'default'}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (act.onClick) act.onClick(trustStorage.getUserAddress());
                                  onClose();
                                }}
                              >
                                {act.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        className="shade-item-close"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismissOne(item.id);
                        }}
                        title="Dismiss"
                      >
                        ×
                      </button>
                    </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Bottom Pull-Up Handle */}
          <div className="shade-bottom-handle" onClick={onClose}>
            <div className="shade-pill-bar" />
            <span style={{ fontSize: 'calc(0.62rem * var(--mobile-font-scale, 1))', color: '#94a3b8', marginTop: 2 }}>
              Slide up to close
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
