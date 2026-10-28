import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone,
  MessageSquare, 
  Music2, 
  Image, 
  Trash2, 
  ArrowUp,
  Layers
} from 'lucide-react';

const ICON_MAP = {
  phone: Phone,
  sms: MessageSquare,
  gallery: Image,
  music: Music2,
};

export default function RecentsScreen({
  runningApps,
  allApps,
  onSelectApp,
  onRemoveApp,
  onClearAll
}) {
  const containerRef = React.useRef(null);

  // Automatically scroll to the very start (the most recent app)
  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
    }
  }, [runningApps]);

  const getAppMeta = (appId) => {
    return allApps.find((a) => a.id === appId) || {
      id: appId,
      name: appId,
      color: '#6366f1',
    };
  };

  return (
    <motion.div
      className="recents-screen"
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <div className="recents-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="#a5b4fc" />
          <span className="recents-title">Recent Apps</span>
          <span style={{ fontSize: 'calc(0.75rem * var(--mobile-font-scale, 1))', color: '#94a3b8' }}>
            ({runningApps.length})
          </span>
        </div>

        {runningApps.length > 0 && (
          <button className="clear-all-btn" onClick={onClearAll}>
            Clear all
          </button>
        )}
      </div>

      {runningApps.length === 0 ? (
        <div className="recents-empty">
          <Layers size={36} color="#475569" />
          <span>No recent apps</span>
          <span style={{ fontSize: 'calc(0.72rem * var(--mobile-font-scale, 1))', color: '#64748b' }}>
            Tap the Home (○) button to launch an app
          </span>
        </div>
      ) : (
        <div className="recents-cards-container" ref={containerRef}>
          <AnimatePresence>
            {runningApps.map((appId, index) => {
              const app = getAppMeta(appId);
              const IconComp = ICON_MAP[appId] || Layers;

              return (
                <motion.div
                  key={appId}
                  className="recents-card-wrapper"
                  layout
                  initial={{ opacity: 0, scale: 0.85, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    y: -400,
                    scale: 0.7,
                    transition: { duration: 0.25 },
                  }}
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0.8, bottom: 0.1 }}
                  onDragEnd={(e, info) => {
                    // Swiping UP removes the app
                    if (info.offset.y < -90) {
                      onRemoveApp(appId);
                    }
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div
                    className="recents-card"
                    onClick={() => onSelectApp(appId)}
                  >
                    {/* Header */}
                    <div className="recents-card-header">
                      <div
                        className="recents-card-icon"
                        style={{ 
                          background: app.color,
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '0.75rem'
                        }}
                      >
                        {appId === 'lumen_ai' ? (
                          <span>L</span>
                        ) : appId === 'gmail' ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M2 6.5V17.5C2 18.3284 2.67157 19 3.5 19H6.5V10.5L2 7.125V6.5Z" fill="#4285F4"/>
                            <path d="M17.5 19H20.5C21.3284 19 22 18.3284 22 17.5V6.5L17.5 9.875V19Z" fill="#34A853"/>
                            <path d="M17.5 9.875L12 14L6.5 9.875V19H17.5V9.875Z" fill="#EA4335"/>
                            <path d="M17.5 5H6.5C5.67157 5 5 5.67157 5 6.5V7.125L12 12.375L19 7.125V6.5C19 5.67157 18.3284 5 17.5 5Z" fill="#FBBC04"/>
                          </svg>
                        ) : (
                          <IconComp size={14} />
                        )}
                      </div>
                      <span className="recents-card-name">{app.name}</span>
                      {index === 0 && (
                        <span
                          style={{
                            fontSize: 'calc(0.6rem * var(--mobile-font-scale, 1))',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '6px',
                            background: 'rgba(99, 102, 241, 0.22)',
                            color: '#818cf8',
                            border: '1px solid rgba(99, 102, 241, 0.35)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em'
                          }}
                        >
                          Recent
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveApp(appId);
                        }}
                        style={{
                          marginLeft: 'auto',
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px',
                        }}
                        title="Remove app"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Preview Snapshot Simulation */}
                    <div className="recents-card-preview">
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: '#e2e8f0',
                          fontSize: 'calc(0.8rem * var(--mobile-font-scale, 1))',
                          fontWeight: 600,
                        }}
                      >
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#10b981',
                          }}
                        />
                        <span>Ready in background</span>
                      </div>

                      <div
                        style={{
                          marginTop: '1.5rem',
                          background: 'rgba(255, 255, 255, 0.04)',
                          borderRadius: '12px',
                          padding: '1rem',
                          fontSize: 'calc(0.75rem * var(--mobile-font-scale, 1))',
                          color: '#94a3b8',
                          lineHeight: '1.5',
                        }}
                      >
                        Active session cached. Tap this card to resume or drag up to kill process.
                      </div>

                      {/* Drag up hint */}
                      <div className="swipe-hint">
                        <ArrowUp size={13} />
                        <span>Swipe up to remove</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
