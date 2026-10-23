import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageSquare, Image, Music2, CloudSun, Sparkles } from 'lucide-react';

const ICON_MAP = {
  phone: Phone,
  sms: MessageSquare,
  gallery: Image,
  music: Music2,
};

export default function HomeScreen({ apps, onLaunchApp }) {
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

      {/* Main App Grid (The 4 core apps) */}
      <div className="app-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginTop: '1rem' }}>
        {apps.map((app) => {
          const IconComp = ICON_MAP[app.id] || Sparkles;
          return (
            <motion.div
              key={app.id}
              className="app-icon-item"
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => onLaunchApp(app.id)}
            >
              <div className="app-icon-box" style={{ background: app.color }}>
                <IconComp size={26} strokeWidth={2.2} />
                {app.badge && <span className="app-badge-unread">{app.badge}</span>}
              </div>
              <span className="app-label">{app.name}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Quick Launch Dock */}
      <div className="home-dock" style={{ marginTop: 'auto' }}>
        {apps.map((app) => {
          const IconComp = ICON_MAP[app.id] || Sparkles;
          return (
            <motion.div
              key={app.id}
              className="app-icon-item"
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.08 }}
              onClick={() => onLaunchApp(app.id)}
            >
              <div className="app-icon-box" style={{ background: app.color, width: 50, height: 50, borderRadius: 14 }}>
                <IconComp size={22} strokeWidth={2.2} />
                {app.badge && <span className="app-badge-unread">{app.badge}</span>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
