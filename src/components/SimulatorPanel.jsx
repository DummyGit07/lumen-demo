import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sliders,
  Bell,
  ChevronDown,
  Battery,
  Wifi,
  Palette,
  Smartphone,
  Sparkles
} from 'lucide-react';

export default function SimulatorPanel({
  isNotificationShadeOpen,
  onToggleNotificationShade,
  sampleNotifications = [],
  onTriggerNotification,
  battery,
  setBattery,
  wifi,
  setWifi,
  wallpapers = [],
  currentWallpaper,
  setCurrentWallpaper,
  phoneFinish,
  setPhoneFinish,
  phoneScale,
  setPhoneScale,
  playHapticSound
}) {
  // Collapsible sub-simulators (minimized by default)
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (id) => {
    if (playHapticSound) playHapticSound('click');
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="control-panel-wrapper">
      <div className="control-panel">
        {/* Main Header: Simulator */}
        <div className="simulator-panel-header">
          <div className="simulator-panel-title">
            <Sliders size={16} color="#6366f1" />
            <span>Simulator</span>
          </div>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Modules</span>
        </div>

        {/* Minimizable Sub-Simulators (Minimized by Default) */}
        <div className="simulator-list">
          {/* 1. Sub-Simulator: Notifications */}
          <div className={`sub-sim-item ${openSections.notifications ? 'open' : ''}`}>
            <div
              className="sub-sim-header"
              onClick={() => toggleSection('notifications')}
            >
              <div className="sub-sim-title-group">
                <Bell size={14} color="#6366f1" />
                <span>Notifications</span>
              </div>
              <ChevronDown
                size={14}
                className={`sub-sim-chevron ${openSections.notifications ? 'open' : ''}`}
              />
            </div>
            <AnimatePresence>
              {openSections.notifications && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="sub-sim-body">
                    {/* Slide Down Screen Action Button */}
                    <button
                      className="panel-button active"
                      onClick={() => {
                        if (playHapticSound) playHapticSound('click');
                        onToggleNotificationShade();
                      }}
                      style={{
                        width: '100%',
                        marginBottom: '0.45rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.55rem 0.75rem',
                        fontSize: '0.74rem'
                      }}
                    >
                      <span>
                        {isNotificationShadeOpen
                          ? 'Slide Up Notification Screen'
                          : 'Slide Down Notification Screen'}
                      </span>
                      <ChevronDown
                        size={14}
                        style={{
                          transform: isNotificationShadeOpen ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s'
                        }}
                      />
                    </button>

                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', margin: '2px 0 4px' }}>
                      Send Test Toasts:
                    </div>
                    <div className="notification-sender-box">
                      {sampleNotifications.map((item) => (
                        <div
                          key={item.id}
                          className="preset-chip"
                          onClick={() => onTriggerNotification(item)}
                        >
                          <span style={{ fontWeight: 600 }}>{item.appName}</span>
                          <span style={{ opacity: 0.7 }}>Send Toast</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. Sub-Simulator: Device & Status */}
          <div className={`sub-sim-item ${openSections.status ? 'open' : ''}`}>
            <div
              className="sub-sim-header"
              onClick={() => toggleSection('status')}
            >
              <div className="sub-sim-title-group">
                <Battery size={14} color="#10b981" />
                <span>Device & Network</span>
              </div>
              <ChevronDown
                size={14}
                className={`sub-sim-chevron ${openSections.status ? 'open' : ''}`}
              />
            </div>
            <AnimatePresence>
              {openSections.status && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="sub-sim-body">
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Battery Level</div>
                    <div className="btn-group-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                      {[100, 80, 45, 15].map((lvl) => (
                        <button
                          key={lvl}
                          className={`panel-button ${battery === lvl ? 'active' : ''}`}
                          onClick={() => setBattery(lvl)}
                          style={{ padding: '0.35rem 0.2rem', fontSize: '0.7rem' }}
                        >
                          {lvl}%
                        </button>
                      ))}
                    </div>

                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>
                      Wi-Fi Connection
                    </div>
                    <div className="btn-group-grid">
                      <button
                        className={`panel-button ${wifi ? 'active' : ''}`}
                        onClick={() => setWifi(true)}
                      >
                        <Wifi size={12} /> Connected
                      </button>
                      <button
                        className={`panel-button ${!wifi ? 'active' : ''}`}
                        onClick={() => setWifi(false)}
                      >
                        Disconnected
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Sub-Simulator: Wallpaper */}
          <div className={`sub-sim-item ${openSections.wallpaper ? 'open' : ''}`}>
            <div
              className="sub-sim-header"
              onClick={() => toggleSection('wallpaper')}
            >
              <div className="sub-sim-title-group">
                <Palette size={14} color="#ec4899" />
                <span>Wallpaper Style</span>
              </div>
              <ChevronDown
                size={14}
                className={`sub-sim-chevron ${openSections.wallpaper ? 'open' : ''}`}
              />
            </div>
            <AnimatePresence>
              {openSections.wallpaper && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="sub-sim-body">
                    <div className="btn-group-grid">
                      {wallpapers.map((wp) => (
                        <button
                          key={wp.id}
                          className={`panel-button ${currentWallpaper?.id === wp.id ? 'active' : ''}`}
                          onClick={() => setCurrentWallpaper(wp)}
                        >
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              background: wp.accent,
                              display: 'inline-block'
                            }}
                          />
                          <span>{wp.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. Sub-Simulator: Chassis Finish */}
          <div className={`sub-sim-item ${openSections.finish ? 'open' : ''}`}>
            <div
              className="sub-sim-header"
              onClick={() => toggleSection('finish')}
            >
              <div className="sub-sim-title-group">
                <Smartphone size={14} color="#06b6d4" />
                <span>Chassis Finish</span>
              </div>
              <ChevronDown
                size={14}
                className={`sub-sim-chevron ${openSections.finish ? 'open' : ''}`}
              />
            </div>
            <AnimatePresence>
              {openSections.finish && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="sub-sim-body">
                    <div className="btn-group-grid">
                      {[
                        { id: 'titanium', label: 'Titanium' },
                        { id: 'midnight', label: 'Midnight' },
                        { id: 'silver', label: 'Silver' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          className={`panel-button ${phoneFinish === f.id ? 'active' : ''}`}
                          onClick={() => setPhoneFinish(f.id)}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 5. Sub-Simulator: Display Scale */}
          <div className={`sub-sim-item ${openSections.scale ? 'open' : ''}`}>
            <div
              className="sub-sim-header"
              onClick={() => toggleSection('scale')}
            >
              <div className="sub-sim-title-group">
                <Sparkles size={14} color="#f59e0b" />
                <span>Display Scale</span>
              </div>
              <ChevronDown
                size={14}
                className={`sub-sim-chevron ${openSections.scale ? 'open' : ''}`}
              />
            </div>
            <AnimatePresence>
              {openSections.scale && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="sub-sim-body">
                    <div className="btn-group-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                      {[
                        { label: '85%', val: 0.85 },
                        { label: 'Fit', val: 1 },
                        { label: '100%', val: 1.1 },
                      ].map((s) => (
                        <button
                          key={s.label}
                          className={`panel-button ${phoneScale === s.val ? 'active' : ''}`}
                          onClick={() => setPhoneScale(s.val)}
                          style={{ padding: '0.45rem 0.2rem', fontSize: '0.74rem' }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
