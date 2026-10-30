import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function BottomNavBar({ onBack, onHome, onRecents, currentMode }) {
  const [isHoldingUp, setIsHoldingUp] = useState(false);
  const dragStartTimeRef = useRef(null);
  const holdTimerRef = useRef(null);
  const triggeredRecentsRef = useRef(false);

  const startHoldTimer = () => {
    if (holdTimerRef.current) return;
    dragStartTimeRef.current = Date.now();
    triggeredRecentsRef.current = false;

    // After 1 second of sliding/holding up, auto-open recent apps screen
    holdTimerRef.current = setTimeout(() => {
      setIsHoldingUp(true);
      triggeredRecentsRef.current = true;
      onRecents();
    }, 1000);
  };

  const clearHoldTimer = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setIsHoldingUp(false);
  };

  return (
    <div className="phone-bottom-nav-bar ios-home-bar-area">
      {/* iOS Interactive Home Indicator Bar */}
      <motion.div
        className={`ios-home-indicator ${isHoldingUp ? 'holding-recents' : ''}`}
        title="Slide up to go Home • Slide up & hold 1 sec to auto-open App Switcher"
        animate={{
          scaleX: isHoldingUp ? 1.15 : 1,
          scaleY: isHoldingUp ? 1.25 : 1,
          backgroundColor: isHoldingUp ? '#ffffff' : 'rgba(255, 255, 255, 0.92)'
        }}
        whileTap={{ scaleY: 0.85 }}
        whileHover={{ opacity: 1, scaleX: 1.05 }}
        onClick={() => {
          // Quick tap returns Home (or toggles Recents if already at Home)
          if (currentMode !== 'home') {
            onHome();
          } else {
            onRecents();
          }
        }}
        drag="y"
        dragSnapToOrigin={true}
        dragConstraints={{ top: -50, bottom: 0 }}
        dragElastic={0.25}
        onDragStart={() => {
          startHoldTimer();
        }}
        onDrag={(e, info) => {
          if (info.offset.y < -12) {
            startHoldTimer();
          }
        }}
        onDragEnd={(e, info) => {
          const wasTriggered = triggeredRecentsRef.current;
          clearHoldTimer();

          // If recents was already auto-opened during the 1-second hold, do nothing more
          if (!wasTriggered) {
            if (info.offset.y < -15 || info.velocity.y < -120) {
              // Quick slide up without waiting 1 sec -> Go to Home
              onHome();
            }
          }

          dragStartTimeRef.current = null;
          triggeredRecentsRef.current = false;
        }}
      />
    </div>
  );
}
