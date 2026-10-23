import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, Paperclip, MoreVertical } from 'lucide-react';

export default function ComposeModal({ 
  account, 
  onClose, 
  onSend, 
  initialTo = '', 
  initialSubject = '' 
}) {
  const [to, setTo] = useState(initialTo);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState('');

  useEffect(() => {
    setTo(initialTo);
    setSubject(initialSubject);
  }, [initialTo, initialSubject]);

  const handleSend = () => {
    if (!to.trim()) {
      alert('Please specify at least one recipient.');
      return;
    }

    onSend({
      to: to.trim(),
      subject: subject.trim(),
      body: body.trim()
    });
  };

  return (
    <div className="gmail-compose-root">
      {/* Top Header */}
      <div className="gmail-compose-header">
        <button className="gmail-icon-btn" onClick={onClose} title="Discard or save draft">
          <ArrowLeft size={18} />
        </button>

        <span className="gmail-compose-title">Compose</span>

        <div className="gmail-compose-header-right">
          <button className="gmail-icon-btn" title="Attach file">
            <Paperclip size={18} />
          </button>

          <button 
            className={`gmail-send-btn ${to.trim() ? 'active' : ''}`}
            onClick={handleSend}
            title="Send email"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="gmail-compose-fields">
        {/* From */}
        <div className="gmail-field-row">
          <span className="gmail-field-label">From</span>
          <span className="gmail-field-value-static">{account.email}</span>
        </div>

        {/* To */}
        <div className="gmail-field-row">
          <span className="gmail-field-label">To</span>
          <input
            type="email"
            className="gmail-field-input"
            placeholder="Recipient email address"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            autoFocus
          />
        </div>

        {/* Subject */}
        <div className="gmail-field-row">
          <input
            type="text"
            className="gmail-field-input subject-input"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        {/* Body Textarea */}
        <div className="gmail-compose-body-wrapper">
          <textarea
            className="gmail-body-textarea"
            placeholder="Compose email"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
