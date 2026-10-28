import React from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function CalendarApp() {
  const today = new Date();
  const monthName = today.toLocaleDateString([], { month: 'long', year: 'numeric' });
  const dayNum = today.getDate();

  // Generate 31 days for current month view
  const daysInMonth = 31;
  const startDayOffset = 4; // Simulated Thursday start

  return (
    <div className="calendar-app" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'linear-gradient(180deg, #0f172a 0%, #090a0f 100%)',
      color: '#f8fafc',
      overflowY: 'auto',
      padding: '0.85rem 0.95rem'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
        <div>
          <span style={{ fontSize: 'calc(0.65rem * var(--mobile-font-scale, 1))', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#ef4444', fontWeight: 800 }}>
            Today
          </span>
          <h2 style={{ fontSize: 'calc(1.15rem * var(--mobile-font-scale, 1))', fontWeight: 800, color: '#fff', margin: 0 }}>
            {monthName}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarIcon size={14} color="#38bdf8" />
          </div>
        </div>
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '6px' }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((w, idx) => (
          <span key={idx} style={{ fontSize: 'calc(0.65rem * var(--mobile-font-scale, 1))', fontWeight: 700, color: '#64748b' }}>
            {w}
          </span>
        ))}
      </div>

      {/* Month Days Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '4px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '14px',
        padding: '8px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        marginBottom: '1rem'
      }}>
        {Array.from({ length: startDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1;
          const isToday = d === dayNum;
          return (
            <div
              key={d}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '26px',
                borderRadius: '50%',
                fontSize: 'calc(0.7rem * var(--mobile-font-scale, 1))',
                fontWeight: isToday ? 800 : 500,
                color: isToday ? '#ffffff' : '#cbd5e1',
                background: isToday ? '#ef4444' : 'transparent',
                boxShadow: isToday ? '0 0 10px rgba(239, 68, 68, 0.6)' : 'none'
              }}
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}

