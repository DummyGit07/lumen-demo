import React, { useState, useEffect } from 'react';
import { NotebookPen, Search, Plus, Trash2, ArrowLeft, Check } from 'lucide-react';

export default function NotesApp() {
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('lumen_user_notes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('lumen_user_notes', JSON.stringify(notes));
    } catch { }
  }, [notes]);

  const [activeNoteId, setActiveNoteId] = useState(null);

  const activeNote = notes.find((n) => n.id === activeNoteId);

  const handleCreateNewNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'New Note',
      body: '',
      date: 'Just now'
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const handleUpdateNote = (field, value) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === activeNoteId ? { ...n, [field]: value, date: 'Just now' } : n))
    );
  };

  const handleDeleteNote = (id, e) => {
    if (e) e.stopPropagation();
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.body.toLowerCase().includes(search.toLowerCase())
  );

  // Note Detail / Editor View
  if (activeNote) {
    return (
      <div className="notes-app-detail" style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#090a0f',
        color: '#f8fafc',
        padding: '0.85rem 0.95rem'
      }}>
        {/* Detail Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
          <button
            onClick={() => setActiveNoteId(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '8px',
              color: '#f59e0b',
              padding: '0.35rem 0.6rem',
              fontSize: 'calc(0.72rem * var(--mobile-font-scale, 1))',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={13} />
            <span>Notes</span>
          </button>

          <button
            onClick={(e) => handleDeleteNote(activeNote.id, e)}
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#ef4444',
              padding: '0.35rem 0.55rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: 'calc(0.68rem * var(--mobile-font-scale, 1))'
            }}
          >
            <Trash2 size={12} />
            <span>Delete</span>
          </button>
        </div>

        {/* Note Title Input */}
        <input
          type="text"
          value={activeNote.title}
          placeholder="Title"
          onChange={(e) => handleUpdateNote('title', e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '0.5rem',
            marginBottom: '0.65rem',
            fontSize: 'calc(1.1rem * var(--mobile-font-scale, 1))',
            fontWeight: 800,
            color: '#f8fafc',
            outline: 'none',
            width: '100%'
          }}
        />

        <div style={{ fontSize: 'calc(0.62rem * var(--mobile-font-scale, 1))', color: '#64748b', marginBottom: '0.65rem' }}>
          Last modified: {activeNote.date}
        </div>

        {/* Note Body Textarea */}
        <textarea
          value={activeNote.body}
          placeholder="Start typing your note..."
          onChange={(e) => handleUpdateNote('body', e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: '#cbd5e1',
            fontSize: 'calc(0.76rem * var(--mobile-font-scale, 1))',
            lineHeight: 1.5,
            outline: 'none',
            resize: 'none',
            fontFamily: 'inherit',
            width: '100%'
          }}
        />
      </div>
    );
  }

  // All Notes List View
  return (
    <div className="notes-app" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'linear-gradient(180deg, #0f172a 0%, #090a0f 100%)',
      color: '#f8fafc',
      overflowY: 'auto',
      padding: '0.85rem 0.95rem'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div>
          <span style={{ fontSize: 'calc(0.65rem * var(--mobile-font-scale, 1))', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            iCloud
          </span>
          <h2 style={{ fontSize: 'calc(1.15rem * var(--mobile-font-scale, 1))', fontWeight: 800, color: '#fff', margin: 0 }}>
            Notes
          </h2>
        </div>

        {/* New Note Button */}
        <button
          onClick={handleCreateNewNote}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            padding: '0.35rem 0.65rem',
            fontSize: 'calc(0.68rem * var(--mobile-font-scale, 1))',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.35)'
          }}
        >
          <Plus size={13} strokeWidth={3} />
          <span>New</span>
        </button>
      </div>

      {/* Search Input */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px',
        padding: '0.45rem 0.65rem',
        marginBottom: '0.85rem'
      }}>
        <Search size={13} color="#94a3b8" />
        <input
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#f8fafc',
            fontSize: 'calc(0.72rem * var(--mobile-font-scale, 1))',
            outline: 'none',
            width: '100%'
          }}
        />
      </div>

      {/* Notes List */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        {notes.length === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#64748b',
            padding: '2.5rem 1rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '4px'
            }}>
              <NotebookPen size={22} color="#f59e0b" opacity={0.8} />
            </div>
            <span style={{ fontSize: 'calc(0.85rem * var(--mobile-font-scale, 1))', fontWeight: 700, color: '#f8fafc' }}>
              No Notes
            </span>
            <span style={{ fontSize: 'calc(0.68rem * var(--mobile-font-scale, 1))', color: '#64748b' }}>
              Tap "+ New" above to write a note
            </span>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', fontSize: 'calc(0.72rem * var(--mobile-font-scale, 1))', marginTop: '2rem' }}>
            No matching notes found
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '0.7rem 0.85rem',
                cursor: 'pointer',
                borderLeft: '3px solid #f59e0b',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontSize: 'calc(0.78rem * var(--mobile-font-scale, 1))', fontWeight: 700, color: '#f8fafc' }}>
                  {note.title}
                </span>
                <span style={{ fontSize: 'calc(0.58rem * var(--mobile-font-scale, 1))', color: '#64748b' }}>
                  {note.date}
                </span>
              </div>
              <p style={{
                fontSize: 'calc(0.68rem * var(--mobile-font-scale, 1))',
                color: '#94a3b8',
                margin: 0,
                lineHeight: 1.4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {note.body || 'No additional text'}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Footer Status */}
      <div style={{
        marginTop: 'auto',
        textAlign: 'center',
        fontSize: 'calc(0.64rem * var(--mobile-font-scale, 1))',
        color: '#64748b',
        paddingTop: '0.6rem'
      }}>
        {notes.length === 0 ? 'No Notes' : `${notes.length} ${notes.length === 1 ? 'Note' : 'Notes'} • Synced with iCloud`}
      </div>
    </div>
  );
}
