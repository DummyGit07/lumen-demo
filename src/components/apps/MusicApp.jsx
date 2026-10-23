import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Heart, Volume2 } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: 'Midnight Horizon',
    artist: 'Aether & Cyberia',
    album: 'Neon Odyssey (2026)',
    cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
    duration: '3:45'
  },
  {
    id: 2,
    title: 'Solar Wind',
    artist: 'Kroma Soundworks',
    album: 'Prismatic (2025)',
    cover: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&auto=format&fit=crop&q=80',
    duration: '4:12'
  },
  {
    id: 3,
    title: 'Digital Rain',
    artist: 'SynthWave Labs',
    album: 'Subsurface Zero',
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80',
    duration: '3:20'
  }
];

export default function MusicApp({ isPlaying, setIsPlaying }) {
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [progress, setProgress] = useState(38);
  const [isLiked, setIsLiked] = useState(false);

  const track = TRACKS[currentTrackIdx];

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleNext = () => {
    setCurrentTrackIdx((prev) => (prev + 1) % TRACKS.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentTrackIdx((prev) => (prev === 0 ? TRACKS.length - 1 : prev - 1));
    setProgress(0);
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '1.25rem 1.5rem',
        background: 'linear-gradient(180deg, #1f0d2b 0%, #0d0718 60%, #06040a 100%)',
        color: '#fff',
        justifyContent: 'space-between'
      }}
    >
      {/* Top track title & artist */}
      <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
        <span style={{ fontSize: '0.72rem', color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
          Now Streaming
        </span>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '2px' }}>{track.title}</h2>
        <p style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{track.artist}</p>
      </div>

      {/* Album Art with Floating Glow */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
        <motion.div
          animate={{
            scale: isPlaying ? [1, 1.02, 1] : 1,
          }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          style={{
            width: 210,
            height: 210,
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(236, 72, 153, 0.3), 0 0 50px rgba(168, 85, 247, 0.2)',
            border: '1px solid rgba(255,255,255,0.15)',
            position: 'relative'
          }}
        >
          <img
            src={track.cover}
            alt={track.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </motion.div>
      </div>

      {/* Animated Equalizer Wave */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', height: '24px' }}>
        {[14, 22, 18, 24, 10, 20, 16, 22, 12, 19, 15].map((h, i) => (
          <motion.div
            key={i}
            animate={{
              height: isPlaying ? [6, h, 8, h * 0.7, 4] : 4,
            }}
            transition={{
              repeat: Infinity,
              duration: 0.8 + (i % 3) * 0.2,
              ease: 'easeInOut'
            }}
            style={{
              width: 3,
              borderRadius: 2,
              background: 'linear-gradient(180deg, #f472b6, #c084fc)'
            }}
          />
        ))}
      </div>

      {/* Progress Slider */}
      <div>
        <div style={{ position: 'relative', height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2 }}>
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: '#ec4899',
              borderRadius: 2,
              position: 'relative'
            }}
          >
            <div
              style={{
                position: 'absolute',
                right: -4,
                top: -3,
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 0 6px #ec4899'
              }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94a3b8', marginTop: '6px' }}>
          <span>1:24</span>
          <span>{track.duration}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem 0.5rem' }}>
        <button
          onClick={() => setIsLiked(!isLiked)}
          style={{ background: 'transparent', border: 'none', color: isLiked ? '#ec4899' : '#94a3b8', cursor: 'pointer' }}
        >
          <Heart size={18} fill={isLiked ? '#ec4899' : 'none'} />
        </button>

        <button
          onClick={handlePrev}
          style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
        >
          <SkipBack size={20} />
        </button>

        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ec4899, #a855f7)',
            border: 'none',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(236, 72, 153, 0.4)'
          }}
        >
          {isPlaying ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: 3 }} />}
        </motion.button>

        <button
          onClick={handleNext}
          style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
        >
          <SkipForward size={20} />
        </button>

        <button style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
          <Repeat size={18} />
        </button>
      </div>
    </div>
  );
}
