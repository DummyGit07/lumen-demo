import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone,
  Bell,
  Palette,
  RotateCcw,
  Sparkles,
  Info,
  ChevronLeft,
  Circle,
  Square,
  Check,
  Send,
  Phone,
  MessageSquare,
  Image,
  Music2,
  Sliders,
  ChevronDown,
  Battery,
  Wifi
} from 'lucide-react';

import StatusBar from './components/StatusBar';
import BottomNavBar from './components/BottomNavBar';
import NotificationBanner from './components/NotificationBanner';
import NotificationShade from './components/NotificationShade';
import HomeScreen from './components/HomeScreen';
import RecentsScreen from './components/RecentsScreen';

// 4 Core Apps
import PhoneApp from './components/apps/PhoneApp';
import SmsApp from './components/apps/SmsApp';
import GalleryApp from './components/apps/GalleryApp';
import MusicApp from './components/apps/MusicApp';

import { INITIAL_APPS, WALLPAPERS, SAMPLE_NOTIFICATIONS } from './constants/apps';

// Web Audio subtle haptic tick sound
function playHapticSound(type = 'click') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'click') {
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } else if (type === 'chime') {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch {
    // AudioContext blocked or unsupported, fail silently
  }
}

export default function App() {
  // Mobile OS States
  const [mode, setMode] = useState('home'); // 'home' | 'app' | 'recents'
  const [activeAppId, setActiveAppId] = useState(null);
  const [runningApps, setRunningApps] = useState(['phone', 'music']); // initially phone & music active in memory
  const [internalAppScreens, setInternalAppScreens] = useState({}); // e.g. { phone: 'dialpad', sms: 'list', gallery: 'grid' }
  const [activeNotification, setActiveNotification] = useState(null);
  const [currentWallpaper, setCurrentWallpaper] = useState(WALLPAPERS[0]);

  // Hardware status
  const [battery, setBattery] = useState(92);
  const [wifi, setWifi] = useState(true);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [phoneFinish, setPhoneFinish] = useState('titanium'); // 'titanium' | 'midnight' | 'silver'
  const [phoneScale, setPhoneScale] = useState(1); // 0.85 | 1 | 1.1
  const [openSections, setOpenSections] = useState({}); // by default all sub-simulators are minimized

  const toggleSection = (id) => {
    playHapticSound('click');
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Update internal sub-screen for a particular app
  const setAppScreen = (appId, screen) => {
    setInternalAppScreens((prev) => ({ ...prev, [appId]: screen }));
  };

  const [apps, setApps] = useState(INITIAL_APPS);
  const [isNotificationShadeOpen, setIsNotificationShadeOpen] = useState(false);
  const [notificationList, setNotificationList] = useState([]); // Completely empty by default, dynamic like a real phone!

  // Launch / Open an App
  const handleLaunchApp = (appId) => {
    playHapticSound('click');
    setActiveAppId(appId);
    setMode('app');
    if (!runningApps.includes(appId)) {
      setRunningApps((prev) => [...prev, appId]);
    }
    // Clear unread notification badge when opening the app, just like a real phone
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, badge: null } : a))
    );
  };

  // Bottom 1: BACK BUTTON (◁)
  const handleBack = () => {
    playHapticSound('click');

    // If Notification Shade is open -> slide it back up
    if (isNotificationShadeOpen) {
      setIsNotificationShadeOpen(false);
      return;
    }

    if (mode === 'recents') {
      setMode('home');
      return;
    }

    if (mode === 'app' && activeAppId) {
      const currentSubScreen = internalAppScreens[activeAppId];

      // If Phone is in active call -> exit call to dialpad
      if (activeAppId === 'phone' && currentSubScreen === 'in-call') {
        setAppScreen('phone', 'dialpad');
        return;
      }

      // If SMS is inside a conversation thread -> return to threads list
      if (activeAppId === 'sms' && currentSubScreen === 'thread') {
        setAppScreen('sms', 'list');
        return;
      }

      // If Gallery is inside single photo detail -> return to photo grid
      if (activeAppId === 'gallery' && currentSubScreen === 'photo-detail') {
        setAppScreen('gallery', 'grid');
        return;
      }

      // Otherwise, back exits to home screen
      setMode('home');
    }
  };

  // Bottom 2: HOME BUTTON (○)
  const handleHome = () => {
    playHapticSound('click');
    if (isNotificationShadeOpen) {
      setIsNotificationShadeOpen(false);
    }
    setMode('home');
    // App stays preserved in runningApps!
  };

  // Bottom 3: RECENTS BUTTON (□)
  const handleRecents = () => {
    playHapticSound('click');
    if (isNotificationShadeOpen) {
      setIsNotificationShadeOpen(false);
    }
    if (mode === 'recents') {
      setMode('home');
    } else {
      setMode('recents');
    }
  };

  // Remove app from running apps (e.g. Swiping up on card in Recents)
  const handleRemoveApp = (appId) => {
    playHapticSound('click');
    setRunningApps((prev) => prev.filter((id) => id !== appId));
    if (activeAppId === appId) {
      setActiveAppId(null);
      setMode('home');
    }
  };

  const handleClearAllApps = () => {
    playHapticSound('click');
    setRunningApps([]);
    setActiveAppId(null);
    setMode('home');
  };

  // Trigger dynamic push notification
  const triggerNotification = (notifTemplate) => {
    playHapticSound('chime');
    const newNotif = {
      ...notifTemplate,
      id: `notif-${Date.now()}`
    };
    setActiveNotification(newNotif);
    // Push to notification screen tray
    setNotificationList((prev) => [newNotif, ...prev]);

    // Dynamically update unread badge on the app icon if user is not currently inside that app
    if (activeAppId !== newNotif.appId) {
      setApps((prevApps) =>
        prevApps.map((a) =>
          a.id === newNotif.appId ? { ...a, badge: (a.badge || 0) + 1 } : a
        )
      );
    }

    // Auto dismiss banner after 4.5 seconds
    setTimeout(() => {
      setActiveNotification((curr) => (curr?.id === newNotif.id ? null : curr));
    }, 4500);
  };

  // Keyboard Navigation Listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        handleBack();
      } else if (e.key === 'h' || e.key === 'H') {
        handleHome();
      } else if (e.key === 'r' || e.key === 'R') {
        handleRecents();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, activeAppId, internalAppScreens]);

  // Frame finish border styles
  const chassisStyles = {
    titanium: {
      chassisBg: '#1b1d24',
      edgeBorder: '#3f4350',
      shadowTint: 'rgba(99, 102, 241, 0.15)'
    },
    midnight: {
      chassisBg: '#090b10',
      edgeBorder: '#1e2433',
      shadowTint: 'rgba(6, 182, 212, 0.15)'
    },
    silver: {
      chassisBg: '#374151',
      edgeBorder: '#9ca3af',
      shadowTint: 'rgba(255, 255, 255, 0.1)'
    }
  }[phoneFinish];

  return (
    <div className="app-layout">
      {/* Studio Lighting Background */}
      <div className="studio-background">
        <div className="studio-grid-pattern" />
      </div>

      {/* Main Studio Area */}
      <main className="studio-canvas">
        {/* 1. Left Spacer (keeps the phone mathematically centered on screen) */}
        <div className="studio-left-spacer" />

        {/* 2. Center: The Phone Hardware Simulation */}
        <div className="phone-stage-wrapper">
          <div
            className="phone-hardware"
            style={{
              transform: `scale(${phoneScale})`,
              transformOrigin: 'center center',
              boxShadow: `
                0 0 0 2px ${chassisStyles.edgeBorder},
                0 0 0 6px ${chassisStyles.chassisBg},
                0 0 0 7px ${chassisStyles.edgeBorder},
                0 25px 50px -12px rgba(0, 0, 0, 0.8),
                0 50px 100px -20px rgba(0, 0, 0, 0.9),
                0 0 80px ${chassisStyles.shadowTint}
              `
            }}
          >
            {/* Screen Chassis (Inner phone viewport) */}
            <div className="screen-chassis">
              {/* Wallpaper Layer */}
              <div
                className="phone-wallpaper"
                style={{ backgroundImage: currentWallpaper.url }}
              />

              {/* Glossy Screen Glare effect */}
              <div className="phone-screen-glare" />

              {/* Status Bar with Dynamic Island */}
              <StatusBar
                battery={battery}
                wifi={wifi}
                isPlayingMusic={isPlayingMusic}
                activeNotification={activeNotification}
                onDynamicIslandClick={() => {
                  if (activeNotification) {
                    handleLaunchApp(activeNotification.appId);
                    setActiveNotification(null);
                  } else if (isPlayingMusic) {
                    handleLaunchApp('music');
                  }
                }}
                onSlideDown={() => {
                  playHapticSound('click');
                  setIsNotificationShadeOpen(true);
                }}
              />

              {/* Slide-Down Notification Screen (Shade) */}
              <NotificationShade
                isOpen={isNotificationShadeOpen}
                onClose={() => {
                  playHapticSound('click');
                  setIsNotificationShadeOpen(false);
                }}
                notifications={notificationList}
                onClearAll={() => {
                  playHapticSound('click');
                  setNotificationList([]);
                  setApps((prev) => prev.map((a) => ({ ...a, badge: null })));
                }}
                onDismissOne={(id) => {
                  playHapticSound('click');
                  const targetItem = notificationList.find((n) => n.id === id);
                  setNotificationList((prev) => prev.filter((n) => n.id !== id));
                  if (targetItem?.appId) {
                    setApps((prev) =>
                      prev.map((a) => {
                        if (a.id === targetItem.appId && a.badge) {
                          const nextBadge = a.badge - 1;
                          return { ...a, badge: nextBadge > 0 ? nextBadge : null };
                        }
                        return a;
                      })
                    );
                  }
                }}
                onOpenApp={handleLaunchApp}
                wifi={wifi}
                setWifi={setWifi}
              />

              {/* Drop-down Notification Banner */}
              <NotificationBanner
                notification={activeNotification}
                onOpenApp={handleLaunchApp}
                onDismiss={() => setActiveNotification(null)}
              />

              {/* Main Viewport for Apps, Home & Recents */}
              <div className="phone-screen-viewport">
                <AnimatePresence mode="wait">
                  {mode === 'home' && (
                    <HomeScreen
                      key="home-screen"
                      apps={apps}
                      onLaunchApp={handleLaunchApp}
                    />
                  )}

                  {mode === 'recents' && (
                    <RecentsScreen
                      key="recents-screen"
                      runningApps={runningApps}
                      allApps={apps}
                      onSelectApp={(appId) => {
                        playHapticSound('click');
                        setActiveAppId(appId);
                        setMode('app');
                      }}
                      onRemoveApp={handleRemoveApp}
                      onClearAll={handleClearAllApps}
                    />
                  )}

                  {mode === 'app' && activeAppId && (
                    <motion.div
                      key={`active-app-${activeAppId}`}
                      className="active-app-viewport"
                      initial={{ scale: 0.88, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.88, opacity: 0 }}
                      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                    >
                      {/* Internal App Router */}
                      {activeAppId === 'phone' && (
                        <PhoneApp
                          internalScreen={internalAppScreens.phone || 'dialpad'}
                          setInternalScreen={(s) => setAppScreen('phone', s)}
                        />
                      )}

                      {activeAppId === 'sms' && (
                        <SmsApp
                          internalScreen={internalAppScreens.sms || 'list'}
                          setInternalScreen={(s) => setAppScreen('sms', s)}
                          onNewMessageNotification={triggerNotification}
                        />
                      )}

                      {activeAppId === 'gallery' && (
                        <GalleryApp
                          internalScreen={internalAppScreens.gallery || 'grid'}
                          setInternalScreen={(s) => setAppScreen('gallery', s)}
                        />
                      )}

                      {activeAppId === 'music' && (
                        <MusicApp
                          isPlaying={isPlayingMusic}
                          setIsPlaying={setIsPlayingMusic}
                        />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom 3-Button Navigation Bar (◁ Back, ○ Home, □ Recents) */}
              <BottomNavBar
                onBack={handleBack}
                onHome={handleHome}
                onRecents={handleRecents}
                currentMode={mode}
              />
            </div>
          </div>
        </div>

        {/* 3. Right Side: Simulation Controller */}
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
                            playHapticSound('click');
                            setIsNotificationShadeOpen(!isNotificationShadeOpen);
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
                          <span>{isNotificationShadeOpen ? 'Slide Up Notification Screen' : 'Slide Down Notification Screen'}</span>
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
                          {SAMPLE_NOTIFICATIONS.map((item) => (
                            <div
                              key={item.id}
                              className="preset-chip"
                              onClick={() => triggerNotification(item)}
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

                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>Wi-Fi Connection</div>
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
                          {WALLPAPERS.map((wp) => (
                            <button
                              key={wp.id}
                              className={`panel-button ${currentWallpaper.id === wp.id ? 'active' : ''}`}
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
      </main>
    </div>
  );
}
