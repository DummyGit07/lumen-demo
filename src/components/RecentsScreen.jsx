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
          <span className="recents-title">Active Apps</span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
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
          <span>No recent apps open</span>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            Tap the Home (○) button to launch an app
          </span>
        </div>
      ) : (
        <div className="recents-cards-container">
          <AnimatePresence>
            {runningApps.map((appId) => {
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
                        style={{ background: app.color }}
                      >
                        <IconComp size={14} />
                      </div>
                      <span className="recents-card-name">{app.name}</span>
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
                          fontSize: '0.8rem',
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
                          fontSize: '0.75rem',
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
