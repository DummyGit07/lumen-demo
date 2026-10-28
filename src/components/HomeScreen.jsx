import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageSquare, Image, Music2, CloudSun, Sparkles, Mail } from 'lucide-react';

const ICON_MAP = {
  phone: Phone,
  sms: MessageSquare,
  gallery: Image,
  music: Music2,
};

function renderAppIconContent(app, size = 26) {
  if (app.id === 'lumen_ai') {
    return (
      <span style={{ fontSize: size * 0.95, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
        L
      </span>
    );
  }

  if (app.id === 'gmail') {
    return (
      <svg width={size + 2} height={size + 2} viewBox="0 0 24 24" fill="none">
        <path d="M2 6.5V17.5C2 18.3284 2.67157 19 3.5 19H6.5V10.5L2 7.125V6.5Z" fill="#4285F4"/>
        <path d="M17.5 19H20.5C21.3284 19 22 18.3284 22 17.5V6.5L17.5 9.875V19Z" fill="#34A853"/>
        <path d="M17.5 9.875L12 14L6.5 9.875V19H17.5V9.875Z" fill="#EA4335"/>
        <path d="M17.5 5H6.5C5.67157 5 5 5.67157 5 6.5V7.125L12 12.375L19 7.125V6.5C19 5.67157 18.3284 5 17.5 5Z" fill="#FBBC04"/>
      </svg>
    );
  }

  const IconComp = ICON_MAP[app.id] || Sparkles;
  return <IconComp size={size} strokeWidth={2.2} />;
}

export default function HomeScreen({ apps, onLaunchApp, iconScale = 0.8 }) {
  const [time, setTime] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      setDateStr(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const dockApps = apps.filter((a) => a.inDock);

  const gridIconSize = Math.max(16, Math.round(24 * iconScale));
  const dockIconSize = Math.max(14, Math.round(20 * iconScale));
  const gridBoxSize = Math.round(48 * iconScale);
  const dockBoxSize = Math.round(46 * iconScale);
  const gridBorderRadius = Math.round(14 * iconScale);
  const dockBorderRadius = Math.round(13 * iconScale);

  // Dynamic vertical gap so larger icons fit comfortably without collision
  const dynamicRowGap = `${Math.max(0.45, 1.0 - (iconScale - 1) * 1.4).toFixed(2)}rem`;

  return (
    <motion.div
      className="home-screen"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.08 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      {/* Big Clock & Weather Widget */}
      <div className="widget-clock-date">
        <div className="widget-big-time">{time || '10:24'}</div>
        <div className="widget-date-weather">
          <span>{dateStr || 'Thu, Oct 23'}</span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CloudSun size={15} color="#fbbf24" /> 72°F Sunny
          </span>
        </div>
      </div>

      {/* Main App Grid */}
      <div
        className="app-grid"
        style={{
          gridTemplateColumns: 'repeat(4, 1fr)',
          marginTop: '0.75rem',
          gap: `${dynamicRowGap} 0.6rem`,
          transition: 'gap 0.2s ease'
        }}
      >
        {apps.map((app) => (
          <motion.div
            key={app.id}
            className="app-icon-item"
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => onLaunchApp(app.id)}
          >
            <div 
              className="app-icon-box" 
              style={{ 
                background: app.color,
                width: gridBoxSize,
                height: gridBoxSize,
                borderRadius: gridBorderRadius,
                boxShadow: app.id === 'gmail' ? '0 4px 12px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(0,0,0,0.08)' : undefined
              }}
            >
              {renderAppIconContent(app, gridIconSize)}
              {app.badge && <span className="app-badge-unread">{app.badge}</span>}
            </div>
            <span className="app-label">{app.name}</span>
          </motion.div>
        ))}
      </div>

      {/* Bottom Quick Launch Dock */}
      <div className="home-dock" style={{ marginTop: 'auto' }}>
        {dockApps.map((app) => (
          <motion.div
            key={app.id}
            className="app-icon-item"
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.08 }}
            onClick={() => onLaunchApp(app.id)}
          >
            <div 
              className="app-icon-box" 
              style={{ 
                background: app.color, 
                width: dockBoxSize, 
                height: dockBoxSize, 
                borderRadius: dockBorderRadius,
                boxShadow: app.id === 'gmail' ? '0 3px 10px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(0,0,0,0.08)' : undefined
              }}
            >
              {renderAppIconContent(app, dockIconSize)}
              {app.badge && <span className="app-badge-unread">{app.badge}</span>}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
