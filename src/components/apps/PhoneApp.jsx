import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Delete, User, Mic, MicOff, Volume2 } from 'lucide-react';

const DIAL_KEYS = [
  { num: '1', sub: '' },
  { num: '2', sub: 'ABC' },
  { num: '3', sub: 'DEF' },
  { num: '4', sub: 'GHI' },
  { num: '5', sub: 'JKL' },
  { num: '6', sub: 'MNO' },
  { num: '7', sub: 'PQRS' },
  { num: '8', sub: 'TUV' },
  { num: '9', sub: 'WXYZ' },
  { num: '*', sub: '' },
  { num: '0', sub: '+' },
  { num: '#', sub: '' },
];

export default function PhoneApp({ internalScreen, setInternalScreen }) {
  const [dialedNumber, setDialedNumber] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  // Call timer
  useEffect(() => {
    let timer;
    if (internalScreen === 'in-call') {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [internalScreen]);

  const handleKeyPress = (num) => {
    if (dialedNumber.length < 15) {
      setDialedNumber((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    setDialedNumber((prev) => prev.slice(0, -1));
  };

  const handleStartCall = () => {
    if (dialedNumber || '555-0199') {
      setInternalScreen('in-call');
    }
  };

  const handleEndCall = () => {
    setInternalScreen('dialpad');
    setCallDuration(0);
  };

  const formatDuration = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0d14', color: '#fff' }}>
      <AnimatePresence mode="wait">
        {internalScreen === 'in-call' ? (
          /* Active Call Screen */
          <motion.div
            key="in-call-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '3rem 1.5rem 2rem',
              background: 'linear-gradient(180deg, #101827 0%, #0a0d14 100%)'
            }}
          >
            {/* Top Contact info */}
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  color: '#94a3b8'
                }}
              >
                <User size={40} />
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {dialedNumber || '+1 (555) 019-2834'}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#10b981', marginTop: '4px', fontWeight: 500 }}>
                Calling... {formatDuration(callDuration)}
              </div>
            </div>

            {/* In-Call controls */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', width: '100%', maxWidth: '280px' }}>
              <button
                onClick={() => setIsMuted(!isMuted)}
                style={{
                  background: isMuted ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
                  color: isMuted ? '#000000' : '#ffffff',
                  border: 'none',
                  borderRadius: '50%',
                  width: 56,
                  height: 56,
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
              </button>

              <button
                onClick={() => setIsSpeaker(!isSpeaker)}
                style={{
                  background: isSpeaker ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
                  color: isSpeaker ? '#000000' : '#ffffff',
                  border: 'none',
                  borderRadius: '50%',
                  width: 56,
                  height: 56,
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Volume2 size={22} />
              </button>

              <div style={{ width: 56, height: 56 }} />
            </div>

            {/* End Call Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleEndCall}
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#ef4444',
                border: 'none',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)'
              }}
            >
              <PhoneOff size={28} />
            </motion.button>
          </motion.div>
        ) : (
          /* Dialpad Screen */
          <motion.div
            key="dialpad-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: '1.5rem 1.5rem 1rem',
              justifyContent: 'space-between'
            }}
          >
            {/* Number Display */}
            <div style={{ textAlign: 'center', minHeight: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '0.04em' }}>
                {dialedNumber || <span style={{ color: '#475569' }}>Dial a number</span>}
              </span>
            </div>

            {/* Dialpad Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.9rem',
                justifyItems: 'center',
                margin: '1rem 0'
              }}
            >
              {DIAL_KEYS.map((k) => (
                <motion.button
                  key={k.num}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleKeyPress(k.num)}
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: '1.35rem', fontWeight: 600, lineHeight: 1 }}>{k.num}</span>
                  {k.sub && (
                    <span style={{ fontSize: '0.55rem', color: '#94a3b8', letterSpacing: '0.08em', marginTop: '2px' }}>
                      {k.sub}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Bottom Call Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginTop: '0.5rem' }}>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleStartCall}
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: '50%',
                  background: '#22c55e',
                  border: 'none',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(34, 197, 94, 0.35)'
                }}
              >
                <Phone size={26} />
              </motion.button>

              {dialedNumber.length > 0 && (
                <button
                  onClick={handleDelete}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Delete size={22} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
