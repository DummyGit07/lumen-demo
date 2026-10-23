import React from 'react';
import { Star, MailOpen, Inbox, Send, Trash2 } from 'lucide-react';

export default function MailList({ 
  emails, 
  currentFolder, 
  onSelectMail, 
  onToggleStar, 
  onOpenCompose 
}) {
  const getFolderLabel = () => {
    switch (currentFolder) {
      case 'sent':
        return 'Sent';
      case 'starred':
        return 'Starred';
      case 'trash':
        return 'Trash';
      default:
        return 'Primary';
    }
  };

  if (emails.length === 0) {
    return (
      <div className="gmail-empty-wrapper">
        <div className="gmail-empty-circle">
          {currentFolder === 'sent' ? (
            <Send size={32} color="#ea4335" />
          ) : currentFolder === 'trash' ? (
            <Trash2 size={32} color="#ea4335" />
          ) : (
            <Inbox size={32} color="#ea4335" />
          )}
        </div>
        <div className="gmail-empty-title">
          {currentFolder === 'sent' 
            ? 'Nothing in Sent' 
            : currentFolder === 'trash' 
            ? 'Trash is empty' 
            : "You're all done"}
        </div>
        <p className="gmail-empty-desc">
          {currentFolder === 'inbox' 
            ? 'No mail in your inbox. Tap Compose to start a new email.'
            : 'Messages you send or move here will appear in this list.'}
        </p>

        {currentFolder === 'inbox' && (
          <button className="gmail-empty-compose-btn" onClick={onOpenCompose}>
            Compose an email
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="gmail-mail-stream">
      <div className="gmail-category-tag">
        <span>{getFolderLabel()}</span>
      </div>

      {emails.map((mail) => {
        const initial = (mail.sender || mail.fromEmail || 'U').charAt(0).toUpperCase();

        return (
          <div
            key={mail.id}
            className={`gmail-mail-row ${!mail.isRead ? 'unread' : ''}`}
            onClick={() => onSelectMail(mail.id)}
          >
            <div className="gmail-sender-avatar">
              <span>{initial}</span>
            </div>

            <div className="gmail-row-content">
              <div className="gmail-row-top">
                <span className="gmail-row-sender">{mail.sender || mail.fromEmail}</span>
                <span className="gmail-row-time">{mail.timestamp}</span>
              </div>
              <div className="gmail-row-subject">{mail.subject}</div>
              <div className="gmail-row-snippet">{mail.body}</div>
            </div>

            <button
              className={`gmail-star-btn ${mail.isStarred ? 'starred' : ''}`}
              onClick={(e) => onToggleStar(mail.id, e)}
              title={mail.isStarred ? 'Unstar' : 'Star'}
            >
              <Star size={16} fill={mail.isStarred ? '#f59e0b' : 'none'} color={mail.isStarred ? '#f59e0b' : '#94a3b8'} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
