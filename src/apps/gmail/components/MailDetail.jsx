import React from 'react';
import { 
  ArrowLeft, 
  Trash2, 
  Mail, 
  Star, 
  Reply, 
  CornerUpRight, 
  MoreVertical 
} from 'lucide-react';

export default function MailDetail({ 
  mail, 
  onBack, 
  onDelete, 
  onToggleStar, 
  onReply 
}) {
  if (!mail) return null;

  const initial = (mail.sender || mail.fromEmail || 'U').charAt(0).toUpperCase();

  return (
    <div className="gmail-detail-root">
      {/* Top Action Bar */}
      <div className="gmail-detail-top-bar">
        <button className="gmail-icon-btn" onClick={onBack} title="Back">
          <ArrowLeft size={18} />
        </button>

        <div className="gmail-detail-actions">
          <button 
            className="gmail-icon-btn" 
            onClick={(e) => onToggleStar(mail.id, e)} 
            title="Star"
          >
            <Star 
              size={18} 
              fill={mail.isStarred ? '#f59e0b' : 'none'} 
              color={mail.isStarred ? '#f59e0b' : '#94a3b8'} 
            />
          </button>

          <button 
            className="gmail-icon-btn" 
            onClick={(e) => onDelete(mail.id, e)} 
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Email Subject Heading */}
      <div className="gmail-detail-subject-line">
        <h2>{mail.subject}</h2>
        <span className="gmail-inbox-tag">Inbox</span>
      </div>

      {/* Sender Header */}
      <div className="gmail-detail-sender-row">
        <div className="gmail-sender-avatar large">
          <span>{initial}</span>
        </div>

        <div className="gmail-detail-sender-info">
          <div className="gmail-sender-name-line">
            <span className="gmail-sender-name">{mail.sender || mail.fromEmail}</span>
            <span className="gmail-sender-time">{mail.timestamp}</span>
          </div>
          <div className="gmail-sender-sub">
            <span>to {mail.to || 'me'}</span>
          </div>
        </div>
      </div>

      {/* Message Body */}
      <div className="gmail-detail-body">
        {mail.body ? (
          <p style={{ whiteSpace: 'pre-wrap' }}>{mail.body}</p>
        ) : (
          <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>(No message body)</p>
        )}
      </div>

      {/* Bottom Reply / Forward Actions */}
      <div className="gmail-detail-bottom-buttons">
        <button className="gmail-pill-action-btn" onClick={() => onReply(mail)}>
          <Reply size={15} />
          <span>Reply</span>
        </button>
        <button className="gmail-pill-action-btn" onClick={() => onReply(mail)}>
          <CornerUpRight size={15} />
          <span>Forward</span>
        </button>
      </div>
    </div>
  );
}
