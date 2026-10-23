import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Star, Send, Trash2, Mail } from 'lucide-react';

export default function FolderDrawer({ 
  isOpen, 
  onClose, 
  currentFolder, 
  onSelectFolder 
}) {
  const folders = [
    { id: 'inbox', label: 'Primary', icon: Inbox },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'sent', label: 'Sent', icon: Send },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="gmail-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer Sidebar */}
          <motion.div
            className="gmail-drawer-panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header with Gmail brand */}
            <div className="gmail-drawer-header">
              <span className="gmail-drawer-logo-text">Gmail</span>
            </div>

            {/* Folder list */}
            <div className="gmail-drawer-list">
              <div className="gmail-drawer-section-title">All labels</div>
              {folders.map((f) => {
                const IconComponent = f.icon;
                const isActive = currentFolder === f.id;

                return (
                  <div
                    key={f.id}
                    className={`gmail-drawer-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      onSelectFolder(f.id);
                      onClose();
                    }}
                  >
                    <IconComponent size={18} />
                    <span>{f.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
