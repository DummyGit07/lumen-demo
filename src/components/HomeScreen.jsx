import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, CloudSun, Sparkles, Search, Sun, Calendar as CalendarIcon, MapPin } from 'lucide-react';

/* -------------------------------------------------------------
   Authentic iOS Icon Graphics & SVGs
   ------------------------------------------------------------- */

// Apple Photos 8-petal colored flower pinwheel
function ApplePhotosIcon({ size = 26 }) {
  const petals = [
    { angle: 0, color: '#f43f5e' },    // Rose
    { angle: 45, color: '#f97316' },   // Orange
    { angle: 90, color: '#eab308' },   // Yellow
    { angle: 135, color: '#22c55e' },  // Green
    { angle: 180, color: '#06b6d4' },  // Cyan
    { angle: 225, color: '#3b82f6' },  // Blue
    { angle: 270, color: '#8b5cf6' },  // Purple
    { angle: 315, color: '#d946ef' },  // Magenta
  ];
  const radius = size * 0.48;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {petals.map((p, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            width: `${Math.round(size * 0.3)}px`,
            height: `${Math.round(size * 0.62)}px`,
            borderRadius: '9999px',
            background: p.color,
            opacity: 0.85,
            transformOrigin: 'center center',
            transform: `rotate(${p.angle}deg) translateY(-${Math.round(radius * 0.45)}px)`,
            mixBlendMode: 'multiply',
          }}
        />
      ))}
      {/* Center White Dot */}
      <span
        style={{
          position: 'absolute',
          width: `${Math.round(size * 0.22)}px`,
          height: `${Math.round(size * 0.22)}px`,
          borderRadius: '50%',
          background: '#ffffff',
          boxShadow: '0 0 2px rgba(0,0,0,0.15)',
        }}
      />
    </div>
  );
}

// Apple Messages Speech Bubble
function AppleMessagesIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M20.5 11.5C20.5 16.1944 16.6944 20 12 20C10.5126 20 9.11717 19.6179 7.90487 18.9507L3.5 20.5L4.85698 16.3268C3.99968 14.9333 3.5 13.2758 3.5 11.5C3.5 6.80558 7.30558 3 12 3C16.6944 3 20.5 6.80558 20.5 11.5Z"
        fill="#ffffff"
      />
    </svg>
  );
}

// Apple Music Double Note
function AppleMusicIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M9 18V5L20 3V16"
        stroke="#ffffff"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6" cy="18" r="3" fill="#ffffff" />
      <circle cx="17" cy="16" r="3" fill="#ffffff" />
    </svg>
  );
}

// Apple Mail Icon (White envelope on blue)
function AppleMailIcon({ size = 26 }) {
  return (
    <svg width={size} height={Math.round(size * 0.78)} viewBox="0 0 28 22" fill="none">
      {/* Crisp White Envelope Body */}
      <rect
        x="1"
        y="1.5"
        width="26"
        height="19"
        rx="3"
        fill="#ffffff"
      />
      {/* Subtle Blue Fold Line */}
      <path
        d="M2 3L14 12.5L26 3"
        stroke="#007aff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Subtle Corner Creases */}
      <path
        d="M2 19L9.5 12.5M26 19L18.5 12.5"
        stroke="#007aff"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}

// Live Analog Clock Icon
function AppleLiveClockIcon({ size = 26 }) {
  const [seconds, setSeconds] = useState(() => new Date().getSeconds());
  const [minutes, setMinutes] = useState(() => new Date().getMinutes());
  const [hours, setHours] = useState(() => new Date().getHours() % 12);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setSeconds(now.getSeconds());
      setMinutes(now.getMinutes());
      setHours(now.getHours() % 12);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const secAngle = seconds * 6;
  const minAngle = minutes * 6 + seconds * 0.1;
  const hourAngle = hours * 30 + minutes * 0.5;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: 'inherit',
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* 12 Clock dial markers */}
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            width: i % 3 === 0 ? '2px' : '1px',
            height: i % 3 === 0 ? '4px' : '2.5px',
            background: i % 3 === 0 ? '#ffffff' : 'rgba(255,255,255,0.45)',
            transform: `rotate(${i * 30}deg) translateY(-${Math.round(size * 0.72)}px)`,
          }}
        />
      ))}

      {/* Hour Hand */}
      <div
        style={{
          position: 'absolute',
          width: '2.5px',
          height: `${Math.round(size * 0.42)}px`,
          background: '#ffffff',
          borderRadius: '2px',
          transformOrigin: 'bottom center',
          transform: `translateY(-${Math.round(size * 0.21)}px) rotate(${hourAngle}deg)`,
        }}
      />

      {/* Minute Hand */}
      <div
        style={{
          position: 'absolute',
          width: '1.8px',
          height: `${Math.round(size * 0.6)}px`,
          background: '#ffffff',
          borderRadius: '2px',
          transformOrigin: 'bottom center',
          transform: `translateY(-${Math.round(size * 0.3)}px) rotate(${minAngle}deg)`,
        }}
      />

      {/* Orange Second Hand */}
      <div
        style={{
          position: 'absolute',
          width: '1px',
          height: `${Math.round(size * 0.68)}px`,
          background: '#f97316',
          transformOrigin: 'bottom center',
          transform: `translateY(-${Math.round(size * 0.34)}px) rotate(${secAngle}deg)`,
        }}
      />

      {/* Center Pivot Pin */}
      <div
        style={{
          position: 'absolute',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: '#f97316',
          zIndex: 4,
        }}
      />
    </div>
  );
}

// Apple Intelligence Glowing Aura with Cursive Small "l"
function AppleIntelligenceLumenIcon({ size = 30 }) {
  const auraSize = Math.round(size * 0.88);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'inherit',
        overflow: 'hidden',
      }}
    >
      {/* 1. Diffuse Ambient Glowing Halo */}
      <div
        style={{
          position: 'absolute',
          width: auraSize * 1.18,
          height: auraSize * 1.18,
          borderRadius: '50%',
          background: 'conic-gradient(from 180deg at 50% 50%, #38bdf8 0deg, #818cf8 70deg, #c084fc 140deg, #f43f5e 210deg, #fb923c 280deg, #38bdf8 360deg)',
          filter: 'blur(7px)',
          opacity: 0.85,
        }}
      />

      {/* 2. Sharp Apple Intelligence Chromatic Ribbon Ring */}
      <div
        style={{
          position: 'absolute',
          width: auraSize,
          height: auraSize,
          borderRadius: '50%',
          background: 'conic-gradient(from 180deg at 50% 50%, #38bdf8 0deg, #818cf8 70deg, #c084fc 140deg, #f43f5e 210deg, #fb923c 280deg, #38bdf8 360deg)',
          WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2.8px), #fff calc(100% - 2.5px))',
          mask: 'radial-gradient(farthest-side, transparent calc(100% - 2.8px), #fff calc(100% - 2.5px))',
        }}
      />

      {/* 3. Dark Frosted Inner Core Shield */}
      <div
        style={{
          position: 'absolute',
          width: Math.round(auraSize * 0.72),
          height: Math.round(auraSize * 0.72),
          borderRadius: '50%',
          background: 'rgba(12, 14, 22, 0.76)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* 4. Perfectly Centered Elegant Capital Cursive "L" */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 3,
          overflow: 'visible',
          pointerEvents: 'none',
        }}
        viewBox="0 0 100 100"
      >
        <text
          x="47"
          y="52"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#ffffff"
          fontFamily="'Great Vibes', 'Snell Roundhand', 'Segoe Script', 'Dancing Script', 'Brush Script MT', cursive"
          fontSize="68"
          fontWeight="400"
          style={{
            filter: 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.7)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.25))',
            userSelect: 'none',
          }}
        >
          L
        </text>
      </svg>
    </div>
  );
}

function renderAppIconContent(app, boxSize = 48, dayName, dayNum) {
  // Fit graphics close to frame with small breathing room
  const largeFitSize = Math.round(boxSize * 0.78);

  if (app.id === 'lumen_ai') {
    return <AppleIntelligenceLumenIcon size={boxSize} />;
  }

  if (app.id === 'phone') {
    return (
      <Phone
        size={Math.round(boxSize * 0.72)}
        color="#ffffff"
        fill="#ffffff"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transform: 'rotate(12deg)' }}
      />
    );
  }

  if (app.id === 'sms') {
    return <AppleMessagesIcon size={largeFitSize} />;
  }

  if (app.id === 'gallery') {
    return <ApplePhotosIcon size={Math.round(boxSize * 0.8)} />;
  }

  if (app.id === 'music') {
    return <AppleMusicIcon size={largeFitSize} />;
  }

  if (app.id === 'gmail') {
    return <AppleMailIcon size={largeFitSize} />;
  }

  if (app.id === 'calendar') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        background: '#ffffff',
        borderRadius: 'inherit',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(0,0,0,0.06)',
        padding: '2px 0 3px',
      }}>
        {/* Small day with red color */}
        <div style={{
          fontSize: Math.max(8, Math.round(boxSize * 0.2)),
          fontWeight: 800,
          color: '#ff3b30',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          lineHeight: 1,
          marginTop: '1px',
        }}>
          {dayName || 'TODAY'}
        </div>
        {/* Date number in black on white background */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: Math.max(16, Math.round(boxSize * 0.48)),
          fontWeight: 400,
          color: '#000000',
          lineHeight: 1,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
          letterSpacing: '-0.03em',
        }}>
          {dayNum || '28'}
        </div>
      </div>
    );
  }

  if (app.id === 'clock') {
    return <AppleLiveClockIcon size={Math.round(boxSize * 0.76)} />;
  }

  if (app.id === 'notes') {
    return (
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'inherit',
        overflow: 'hidden',
      }}>
        {/* Apple Notes Top Amber Header */}
        <div style={{
          height: '27%',
          width: '100%',
          background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
          borderBottom: '1px solid rgba(180, 83, 9, 0.7)',
          position: 'relative',
        }}>
          {/* Subtle Stitch / Perforation Dots */}
          <div style={{
            position: 'absolute',
            bottom: '2px',
            left: '4px',
            right: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            opacity: 0.65
          }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} style={{ width: 1.5, height: 1.5, borderRadius: '50%', background: '#78350f' }} />
            ))}
          </div>
        </div>

        {/* Lined Paper Body - Completely filling the rest of the tile edge-to-edge */}
        <div style={{
          flex: 1,
          width: '100%',
          background: '#fafaf9',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          padding: '2px 0',
          position: 'relative',
        }}>
          {/* Faint Red Left Margin Line */}
          <div style={{
            position: 'absolute',
            left: '10px',
            top: 0,
            bottom: 0,
            width: '1px',
            background: 'rgba(239, 68, 68, 0.35)'
          }} />

          {/* Horizontal Ruled Lines extending across the note page */}
          <div style={{ width: '82%', height: '1.5px', background: 'rgba(148, 163, 184, 0.45)', borderRadius: '1px', marginLeft: '6px' }} />
          <div style={{ width: '82%', height: '1.5px', background: 'rgba(148, 163, 184, 0.45)', borderRadius: '1px', marginLeft: '6px' }} />
          <div style={{ width: '82%', height: '1.5px', background: 'rgba(148, 163, 184, 0.45)', borderRadius: '1px', marginLeft: '6px' }} />
          <div style={{ width: '60%', height: '1.5px', background: 'rgba(148, 163, 184, 0.45)', borderRadius: '1px', marginLeft: '6px' }} />
        </div>
      </div>
    );
  }

  return <Sparkles size={largeFitSize} strokeWidth={2.2} />;
}

export default function HomeScreen({ apps, onLaunchApp, iconScale = 0.8 }) {
  const [dayName, setDayName] = useState(() => new Date().toLocaleDateString([], { weekday: 'short' }).toUpperCase());
  const [dayNum, setDayNum] = useState(() => new Date().getDate());
  const [fullDayName, setFullDayName] = useState(() => new Date().toLocaleDateString([], { weekday: 'long' }));

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setDayName(now.toLocaleDateString([], { weekday: 'short' }).toUpperCase());
      setDayNum(now.getDate());
      setFullDayName(now.toLocaleDateString([], { weekday: 'long' }));
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  const mainApps = apps.filter((a) => !a.inDock);
  const dockApps = apps.filter((a) => a.inDock);

  const gridBoxSize = Math.round(52 * iconScale);
  const dockBoxSize = Math.round(50 * iconScale);
  // Increase icon glyph size inside the app squircle (~62% of box size)
  const gridIconSize = Math.max(22, Math.round(gridBoxSize * 0.62));
  const dockIconSize = Math.max(20, Math.round(dockBoxSize * 0.60));
  // Apple squircle curve (~22.5% continuous radius)
  const gridBorderRadius = Math.round(gridBoxSize * 0.225);
  const dockBorderRadius = Math.round(dockBoxSize * 0.225);

  return (
    <motion.div
      className="home-screen"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.08 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      {/* 1. iOS Top 2x2 Squircle Widgets Row */}
      <div className="ios-widgets-row">
        {/* Weather Widget (2x2) */}
        <motion.div
          className="ios-widget ios-weather-widget"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="ios-widget-header">
            <span className="ios-widget-city">Cupertino</span>
            <Sun size={18} color="#fde047" className="sun-icon-spin" />
          </div>
          <div className="ios-weather-temp">72°</div>
          <div className="ios-widget-footer">
            <div className="ios-weather-desc">Sunny</div>
            <div className="ios-weather-hl">H: 78° L: 56°</div>
          </div>
        </motion.div>

        {/* Calendar / Smart Stack Widget (2x2) */}
        <motion.div
          className="ios-widget ios-calendar-widget"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onLaunchApp('calendar')}
        >
          <div className="ios-calendar-date-header">
            <span className="ios-cal-weekday">{dayName}</span>
            <span className="ios-cal-daynum">{dayNum}</span>
          </div>
          <div className="ios-cal-loc">No events today</div>
        </motion.div>
      </div>

      {/* 2. Main 4-Column App Grid */}
      <div
        className="app-grid"
        style={{
          gridTemplateColumns: 'repeat(4, 1fr)',
          marginTop: '1.2rem',
          marginBottom: 'auto',
          gap: '1.1rem 0.6rem',
        }}
      >
        {mainApps.map((app) => (
          <motion.div
            key={app.id}
            className="app-icon-item"
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => onLaunchApp(app.id)}
          >
            <div
              className="app-icon-box"
              style={{
                background: app.color,
                width: gridBoxSize,
                height: gridBoxSize,
                borderRadius: gridBorderRadius,
                border: (app.id === 'gmail' || app.id === 'calendar' || app.id === 'notes' || app.id === 'gallery')
                  ? '1px solid rgba(255, 255, 255, 0.28)'
                  : '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35), inset 0 0 0 0.5px rgba(255,255,255,0.2)',
              }}
            >
              {renderAppIconContent(app, gridBoxSize, dayName, dayNum)}
              {app.badge && <span className="app-badge-unread">{app.badge}</span>}
            </div>
            <span className="app-label">{app.id === 'clock' ? 'Notes' : app.name}</span>
          </motion.div>
        ))}
      </div>

      {/* 3. iOS Search Pill Capsule (Positioned above dock) */}
      <div className="ios-search-pill-container">
        <motion.div
          className="ios-search-pill"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Search size={11} strokeWidth={2.6} color="rgba(255, 255, 255, 0.9)" />
          <span>Search</span>
        </motion.div>
      </div>

      {/* 4. Bottom Floating Frosted Glass Dock */}
      <div className="home-dock">
        {dockApps.map((app) => (
          <motion.div
            key={app.id}
            className="app-icon-item"
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.08 }}
            onClick={() => onLaunchApp(app.id)}
          >
            <div
              className="app-icon-box"
              style={{
                background: app.color,
                width: dockBoxSize,
                height: dockBoxSize,
                borderRadius: dockBorderRadius,
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35), inset 0 0 0 0.5px rgba(255,255,255,0.2)',
              }}
            >
              {renderAppIconContent(app, dockBoxSize, dayName, dayNum)}
              {app.badge && <span className="app-badge-unread">{app.badge}</span>}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
