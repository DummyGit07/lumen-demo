import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Circle, Square } from 'lucide-react';

export default function BottomNavBar({ onBack, onHome, onRecents, currentMode }) {
  return (
    <div className="phone-bottom-nav-bar">
      {/* 1. BACK BUTTON */}
      <motion.button
        className={`nav-bar-btn ${currentMode !== 'home' ? 'active' : ''}`}
        whileTap={{ scale: 0.8 }}
        whileHover={{ scale: 1.15 }}
        onClick={onBack}
        title="Back (Esc / Alt+Left)"
      >
        <ChevronLeft size={22} strokeWidth={2.4} />
      </motion.button>

      {/* 2. HOME BUTTON */}
      <motion.button
        className="nav-bar-btn"
        whileTap={{ scale: 0.78 }}
        whileHover={{ scale: 1.15 }}
        onClick={onHome}
        title="Home (Alt+H)"
      >
        <Circle size={18} strokeWidth={2.6} />
      </motion.button>

      {/* 3. RECENTS / REMOVE BUTTON */}
      <motion.button
        className={`nav-bar-btn ${currentMode === 'recents' ? 'active' : ''}`}
        whileTap={{ scale: 0.8 }}
        whileHover={{ scale: 1.15 }}
        onClick={onRecents}
        title="Recents / Task Switcher (Alt+R)"
      >
        <Square size={16} strokeWidth={2.6} />
      </motion.button>
    </div>
  );
}
