import React from 'react';
import { motion } from 'framer-motion';

const TABS = [
  { id: 'glance', label: 'Glance' },
  { id: 'ask', label: 'Ask' },
  { id: 'act', label: 'Act' },
  { id: 'trust', label: 'Trust' }
];

export default function LumenBottomNav({ activeTab, onSelectTab }) {
  return (
    <div className="lumen-bottom-nav">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`lumen-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onSelectTab(tab.id)}
          >
            {isActive && (
              <motion.div
                className="lumen-nav-indicator"
                layoutId="lumen-active-tab"
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              />
            )}
            <span className="lumen-nav-label">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
