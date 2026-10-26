import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sliders,
  Bell,
  ChevronDown,
  Battery,
  Wifi,
  Palette,
  Smartphone,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  Clock
} from 'lucide-react';
import { fraudWorkflow } from '../apps/lumen-ai/services/fraudWorkflow';
import { trustStorage } from '../apps/lumen-ai/services/trustStorage';
import { financeStorage } from '../apps/lumen-ai/services/financeStorage';

export default function SimulatorPanel({
  isNotificationShadeOpen,
  onToggleNotificationShade,
  sampleNotifications = [],
  onTriggerNotification,
  autoDismissNotification = false,
  onToggleAutoDismiss,
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
  // Collapsible sub-simulators (Lumen Fraud open by default)
  const [openSections, setOpenSections] = useState({ lumen_fraud: true });
  const [autonomyLevel, setAutonomyLevel] = useState(() => trustStorage.getAutonomyLevel());
  const [simFeedback, setSimFeedback] = useState('');

  // Keep autonomy level synced with Trust screen settings
  useEffect(() => {
    const unsub = trustStorage.subscribe((event, data) => {
      if (event === 'autonomy_changed') {
        setAutonomyLevel(data);
      }
    });
    return unsub;
  }, []);

  const toggleSection = (id) => {
    if (playHapticSound) playHapticSound('click');
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSimulateFraud = () => {
    if (playHapticSound) playHapticSound('click');
    const incident = fraudWorkflow.simulateFraud({
      amount: 4850,
      merchant: 'Unknown POS • Global Gateway'
    });
    setSimFeedback(`Fraud ₹4,850 simulated on •••• ${incident.cardLast4}!`);
    setTimeout(() => setSimFeedback(''), 3500);
  };

  const handleResetFinance = () => {
    if (playHapticSound) playHapticSound('click');
    financeStorage.resetAll();
    trustStorage.clearFraudIncident();
    setSimFeedback('Card balances & incidents reset!');
    setTimeout(() => setSimFeedback(''), 2500);
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

        {/* Minimizable Sub-Simulators */}
        <div className="simulator-list">
          {/* 0. Sub-Simulator: Lumen AI Fraud & Trust Simulation */}
          <div className={`sub-sim-item ${openSections.lumen_fraud ? 'open' : ''}`} style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <div
              className="sub-sim-header"
              onClick={() => toggleSection('lumen_fraud')}
              style={{ background: 'rgba(239, 68, 68, 0.08)' }}
            >
              <div className="sub-sim-title-group">
                <ShieldAlert size={14} color="#ef4444" />
                <span style={{ color: '#fff', fontWeight: 700 }}>Fraud & Trust Workflow</span>
              </div>
              <ChevronDown
                size={14}
                className={`sub-sim-chevron ${openSections.lumen_fraud ? 'open' : ''}`}
              />
            </div>
            <AnimatePresence>
              {openSections.lumen_fraud && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="sub-sim-body" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
                    {/* Active Autonomy Indicator */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Trust Autonomy:</span>
                      <span
                        className="notif-autonomy-badge"
                        style={{
                          background: autonomyLevel === 'l3' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                          color: autonomyLevel === 'l3' ? '#34d399' : '#60a5fa',
                          border: `1px solid ${autonomyLevel === 'l3' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(59, 130, 246, 0.35)'}`,
                          padding: '2px 8px'
                        }}
                      >
                        {autonomyLevel.toUpperCase()} {autonomyLevel === 'l3' ? '(Autonomous)' : '(Guided)'}
                      </span>
                    </div>

                    {/* Trigger Fraud Button */}
                    <button
                      className="panel-button active"
                      onClick={handleSimulateFraud}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        border: 'none',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        padding: '0.6rem 0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)'
                      }}
                    >
                      <ShieldAlert size={14} color="#fff" />
                      <span>Simulate Fraud Transaction</span>
                    </button>

                    {simFeedback && (
                      <div
                        style={{
                          marginTop: '6px',
                          padding: '4px 8px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '6px',
                          color: '#34d399',
                          fontSize: '0.66rem',
                          textAlign: 'center'
                        }}
                      >
                        {simFeedback}
                      </div>
                    )}

                    {/* Reset Button */}
                    <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '6px' }}>
                      <button
                        className="panel-button"
                        onClick={handleResetFinance}
                        style={{
                          width: '100%',
                          fontSize: '0.68rem',
                          padding: '0.35rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                          color: '#94a3b8'
                        }}
                      >
                        <RotateCcw size={11} />
                        <span>Reset Cards & Incidents</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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

                    {/* Auto-disappear Notification Toggle Button */}
                    <button
                      className={`panel-button ${autoDismissNotification ? 'active' : ''}`}
                      onClick={() => {
                        if (playHapticSound) playHapticSound('click');
                        if (onToggleAutoDismiss) onToggleAutoDismiss();
                      }}
                      title="Toggle whether notification banners automatically disappear from screen"
                      style={{
                        width: '100%',
                        marginBottom: '0.55rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.73rem',
                        background: autoDismissNotification
                          ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.28), rgba(79, 70, 229, 0.22))'
                          : 'rgba(255, 255, 255, 0.04)',
                        border: `1px solid ${autoDismissNotification ? 'rgba(99, 102, 241, 0.45)' : 'rgba(255, 255, 255, 0.09)'
                          }`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={13} color={autoDismissNotification ? '#818cf8' : '#94a3b8'} />
                        <span style={{ fontWeight: 600, color: autoDismissNotification ? '#e0e7ff' : '#cbd5e1' }}>
                          Auto-disappear
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.64rem',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '999px',
                          background: autoDismissNotification
                            ? 'rgba(99, 102, 241, 0.35)'
                            : 'rgba(255, 255, 255, 0.07)',
                          color: autoDismissNotification ? '#c7d2fe' : '#94a3b8',
                          border: `1px solid ${autoDismissNotification ? 'rgba(99, 102, 241, 0.45)' : 'rgba(255, 255, 255, 0.12)'
                            }`
                        }}
                      >
                        {autoDismissNotification ? 'ON (5s)' : 'OFF'}
                      </span>
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
