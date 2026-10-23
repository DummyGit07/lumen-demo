import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Signal, Battery, Music, Bell, ChevronDown } from 'lucide-react';

export default function StatusBar({ 
  battery = 94, 
  wifi = true, 
  isPlayingMusic = false, 
  activeNotification = null,
  onDynamicIslandClick,
  onSlideDown
}) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isExpanded = Boolean(activeNotification || isPlayingMusic);

  return (
    <motion.div 
      className="phone-status-bar"
      onClick={onSlideDown}
      title="Click or drag down to open Notification Screen"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.5 }}
      onDragEnd={(e, info) => {
        if (info.offset.y > 15 || info.velocity.y > 150) {
          onSlideDown();
        }
      }}
      style={{ cursor: 'pointer' }}
    >
      {/* Left: Clock */}
      <div className="status-left-time">
        <span>{timeStr || '09:41'}</span>
      </div>

      {/* Center: Dynamic Island */}
      <div 
        className="dynamic-island-container"
        onClick={(e) => {
          e.stopPropagation();
          onDynamicIslandClick();
        }}
      >
        <motion.div
          className="dynamic-island"
          layout
          initial={{ width: 88, height: 26 }}
          animate={{
            width: isExpanded ? 190 : 88,
            height: isExpanded ? 34 : 26,
          }}
          transition={{
            type: 'spring',
            stiffness: 450,
            damping: 30,
          }}
        >
          <div className="camera-punch-hole" />
          
          <AnimatePresence mode="wait">
            {activeNotification ? (
              <motion.div
                key="notif-island"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: '#f8fafc', paddingLeft: '4px' }}
              >
                <Bell size={12} color="#f59e0b" />
                <span style={{ maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activeNotification.title}
                </span>
              </motion.div>
            ) : isPlayingMusic ? (
              <motion.div
                key="music-island"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: '#ec4899', paddingLeft: '4px' }}
              >
                <Music size={12} className="pulse-icon" />
                <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Sonic Wave • Playing
                </span>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669', opacity: 0.8 }} />
        </motion.div>
      </div>

      {/* Right: Signal, Wi-Fi & Battery */}
      <div className="status-right-icons">
        <Signal size={13} strokeWidth={2.5} />
        {wifi && <Wifi size={13} strokeWidth={2.5} />}
        <div className="battery-pill">
          <span>{battery}%</span>
          <Battery size={15} strokeWidth={2.2} />
        </div>
      </div>

      {/* Subtle indicator bar hinting pull down */}
      <div className="status-bar-pull-indicator" />
    </motion.div>
  );
}
