import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  Bluetooth, 
  Volume2, 
  VolumeX, 
  Flashlight, 
  Moon, 
  Plane, 
  Trash2, 
  ChevronUp, 
  Phone, 
  MessageSquare, 
  Music2, 
  Image,
  Bell,
  Sliders,
  Sun
} from 'lucide-react';

const ICON_MAP = {
  Phone,
  phone: Phone,
  MessageSquare,
  sms: MessageSquare,
  Music2,
  music: Music2,
  Image,
  gallery: Image,
  Bell
};

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
                {notifications.map((item) => {
                  const IconComp = ICON_MAP[item.appId] || ICON_MAP[item.icon] || Bell;
                  return (
                    <motion.div
                      key={item.id}
                      className="shade-notif-item"
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100, transition: { duration: 0.15 } }}
                      onClick={() => {
                        onOpenApp(item.appId);
                        onClose();
                      }}
                    >
                      <div 
                        className="shade-item-icon"
                        style={{ 
                          background: item.appId === 'gmail' ? '#ffffff' : (item.color || '#6366f1'),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          color: '#fff'
                        }}
                      >
                        {item.appId === 'lumen_ai' ? (
                          <span style={{ fontSize: '0.85rem' }}>L</span>
                        ) : item.appId === 'gmail' ? (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M2 6.5V17.5C2 18.3284 2.67157 19 3.5 19H6.5V10.5L2 7.125V6.5Z" fill="#4285F4"/>
                            <path d="M17.5 19H20.5C21.3284 19 22 18.3284 22 17.5V6.5L17.5 9.875V19Z" fill="#34A853"/>
                            <path d="M17.5 9.875L12 14L6.5 9.875V19H17.5V9.875Z" fill="#EA4335"/>
                            <path d="M17.5 5H6.5C5.67157 5 5 5.67157 5 6.5V7.125L12 12.375L19 7.125V6.5C19 5.67157 18.3284 5 17.5 5Z" fill="#FBBC04"/>
                          </svg>
                        ) : (
                          <IconComp size={16} color="#fff" />
                        )}
                      </div>

                      <div className="shade-item-content">
                        <div className="shade-item-top">
                          <span className="shade-item-app">{item.appName || 'System'}</span>
                          <span className="shade-item-time">{item.time || 'Now'}</span>
                        </div>
                        <div className="shade-item-title">{item.title}</div>
                        <div className="shade-item-body">{item.body}</div>
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
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {/* Bottom Pull-Up Handle */}
          <div className="shade-bottom-handle" onClick={onClose}>
            <div className="shade-pill-bar" />
            <span style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: 2 }}>
              Slide up to close
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
