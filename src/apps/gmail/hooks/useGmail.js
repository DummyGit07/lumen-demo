import { useState, useEffect, useCallback, useMemo } from 'react';
import { gmailStorage } from '../services/gmailStorage';

export function useGmail() {
  const [emails, setEmails] = useState(() => gmailStorage.loadEmails());
  const [account] = useState(() => gmailStorage.loadAccount());
  const [currentFolder, setCurrentFolder] = useState('inbox'); // 'inbox' | 'starred' | 'sent' | 'trash'
  const [selectedMailId, setSelectedMailId] = useState(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync to storage
  useEffect(() => {
    gmailStorage.saveEmails(emails);
  }, [emails]);

  const activeMail = useMemo(() => {
    return emails.find((e) => e.id === selectedMailId) || null;
  }, [emails, selectedMailId]);

  const filteredEmails = useMemo(() => {
    return emails.filter((mail) => {
      // Folder filtering
      if (currentFolder === 'starred') {
        if (!mail.isStarred || mail.isTrash) return false;
      } else if (currentFolder === 'trash') {
        if (!mail.isTrash) return false;
      } else if (currentFolder === 'sent') {
        if (mail.folder !== 'sent' || mail.isTrash) return false;
      } else {
        // default inbox
        if (mail.folder === 'sent' || mail.isTrash) return false;
      }

      // Search query filtering
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inSubject = mail.subject?.toLowerCase().includes(q);
        const inSender = mail.sender?.toLowerCase().includes(q) || mail.fromEmail?.toLowerCase().includes(q);
        const inBody = mail.body?.toLowerCase().includes(q);
        return inSubject || inSender || inBody;
      }

      return true;
    });
  }, [emails, currentFolder, searchQuery]);

  const sendEmail = useCallback(({ to, subject, body }) => {
    const newMail = {
      id: `mail-${Date.now()}`,
      sender: account.name,
      fromEmail: account.email,
      to,
      subject: subject.trim() || '(no subject)',
      body: body.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      isRead: true,
      isStarred: false,
      isTrash: false,
      folder: 'sent'
    };

    setEmails((prev) => [newMail, ...prev]);
    setIsComposeOpen(false);
  }, [account]);

  const receiveEmail = useCallback(({ from, fromEmail, subject, body }) => {
    const newMail = {
      id: `mail-${Date.now()}`,
      sender: from || 'Google Team',
      fromEmail: fromEmail || 'notifications@google.com',
      to: account.email,
      subject: subject || 'New Notification',
      body: body || '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      isRead: false,
      isStarred: false,
      isTrash: false,
      folder: 'inbox'
    };

    setEmails((prev) => [newMail, ...prev]);
    return newMail;
  }, [account]);

  const toggleStar = useCallback((id, e) => {
    e?.stopPropagation();
    setEmails((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isStarred: !m.isStarred } : m))
    );
  }, []);

  const deleteEmail = useCallback((id, e) => {
    e?.stopPropagation();
    setEmails((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          if (m.isTrash) return null; // permanently remove if already in trash
          return { ...m, isTrash: true };
        }
        return m;
      }).filter(Boolean)
    );

    if (selectedMailId === id) {
      setSelectedMailId(null);
    }
  }, [selectedMailId]);

  const openMail = useCallback((id) => {
    setSelectedMailId(id);
    setEmails((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isRead: true } : m))
    );
  }, []);

  const closeMail = useCallback(() => {
    setSelectedMailId(null);
  }, []);

  return {
    account,
    emails,
    filteredEmails,
    activeMail,
    currentFolder,
    setCurrentFolder,
    selectedMailId,
    openMail,
    closeMail,
    isComposeOpen,
    setIsComposeOpen,
    isDrawerOpen,
    setIsDrawerOpen,
    searchQuery,
    setSearchQuery,
    sendEmail,
    receiveEmail,
    toggleStar,
    deleteEmail
  };
}
