import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Plus } from 'lucide-react';
import { useGmail } from './hooks/useGmail';

import GmailSearchBar from './components/GmailSearchBar';
import MailList from './components/MailList';
import MailDetail from './components/MailDetail';
import ComposeModal from './components/ComposeModal';
import FolderDrawer from './components/FolderDrawer';

export default function GmailApp({ 
  internalScreen, 
  setInternalScreen, 
  onNewEmailNotification 
}) {
  const {
    account,
    filteredEmails,
    activeMail,
    currentFolder,
    setCurrentFolder,
    openMail,
    closeMail,
    isComposeOpen,
    setIsComposeOpen,
    isDrawerOpen,
    setIsDrawerOpen,
    searchQuery,
    setSearchQuery,
    sendEmail,
    toggleStar,
    deleteEmail
  } = useGmail();

  const [replyTarget, setReplyTarget] = useState(null);

  // Synchronize internalScreen changes (such as hardware back button press)
  React.useEffect(() => {
    if (internalScreen === 'list') {
      setIsComposeOpen(false);
      setIsDrawerOpen(false);
      closeMail();
    }
  }, [internalScreen]);

  const handleSelectMail = (id) => {
    openMail(id);
    setInternalScreen('detail');
  };

  const handleCloseDetail = () => {
    closeMail();
    setInternalScreen('list');
  };

  const handleOpenCompose = (targetMail = null) => {
    if (targetMail) {
      setReplyTarget({
        to: targetMail.fromEmail || targetMail.sender,
        subject: targetMail.subject?.startsWith('Re:') ? targetMail.subject : `Re: ${targetMail.subject}`
      });
    } else {
      setReplyTarget(null);
    }
    setIsComposeOpen(true);
    setInternalScreen('compose');
  };

  const handleCloseCompose = () => {
    setIsComposeOpen(false);
    setReplyTarget(null);
    if (activeMail) {
      setInternalScreen('detail');
    } else {
      setInternalScreen('list');
    }
  };

  const handleSendEmail = (mailData) => {
    sendEmail(mailData);
    handleCloseCompose();
  };

  return (
    <div className="gmail-app-root">
      {/* 1. Compose Screen */}
      <AnimatePresence>
        {(isComposeOpen || internalScreen === 'compose') && (
          <motion.div
            key="gmail-compose-view"
            className="gmail-subscreen-overlay"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          >
            <ComposeModal
              account={account}
              onClose={handleCloseCompose}
              onSend={handleSendEmail}
              initialTo={replyTarget?.to || ''}
              initialSubject={replyTarget?.subject || ''}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Mail Detail Screen */}
      <AnimatePresence>
        {activeMail && internalScreen === 'detail' && !isComposeOpen && (
          <motion.div
            key="gmail-detail-view"
            className="gmail-subscreen-overlay"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.2 }}
          >
            <MailDetail
              mail={activeMail}
              onBack={handleCloseDetail}
              onDelete={(id, e) => {
                deleteEmail(id, e);
                handleCloseDetail();
              }}
              onToggleStar={toggleStar}
              onReply={handleOpenCompose}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Main Inbox / List Screen */}
      <div className="gmail-main-screen">
        <GmailSearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleDrawer={() => setIsDrawerOpen(true)}
          account={account}
        />

        <div className="gmail-scroll-body">
          <MailList
            emails={filteredEmails}
            currentFolder={currentFolder}
            onSelectMail={handleSelectMail}
            onToggleStar={toggleStar}
            onOpenCompose={() => handleOpenCompose()}
          />
        </div>

        {/* Floating Red Action Button (Compose FAB) */}
        <motion.button
          className="gmail-fab-compose"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => handleOpenCompose()}
          title="Compose"
        >
          <Edit2 size={18} strokeWidth={2.5} color="#fff" />
          <span>Compose</span>
        </motion.button>
      </div>

      {/* 4. Slide-out Navigation Drawer */}
      <FolderDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentFolder={currentFolder}
        onSelectFolder={(f) => {
          setCurrentFolder(f);
          setInternalScreen('list');
        }}
      />
    </div>
  );
}
