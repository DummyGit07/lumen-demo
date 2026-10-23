import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Heart, Share2, Info } from 'lucide-react';

const PHOTOS = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    title: 'Alpine Vista',
    location: 'Yosemite Valley',
    date: 'Yesterday'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    title: 'Cyber Skyline',
    location: 'Tokyo, Japan',
    date: 'Oct 20'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80',
    title: 'Starry Peaks',
    location: 'Swiss Alps',
    date: 'Oct 18'
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    title: 'Golden Sunset',
    location: 'Malibu Beach',
    date: 'Oct 15'
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=600&auto=format&fit=crop&q=80',
    title: 'Prism Light',
    location: 'Modern Art Museum',
    date: 'Oct 12'
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80',
    title: 'Morning Fog',
    location: 'Redwood Forest',
    date: 'Oct 10'
  }
];

export default function GalleryApp({ internalScreen, setInternalScreen }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isLiked, setIsLiked] = useState(false);

  const handleSelectPhoto = (photo) => {
    setSelectedPhoto(photo);
    setInternalScreen('photo-detail');
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0d14', color: '#fff' }}>
      <AnimatePresence mode="wait">
        {internalScreen === 'photo-detail' && selectedPhoto ? (
          /* Fullscreen Photo View */
          <motion.div
            key="photo-detail"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: '#000000',
              padding: '1rem 0'
            }}
          >
            {/* Top info */}
            <div style={{ padding: '0 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedPhoto.title}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{selectedPhoto.location}</div>
              </div>
              <button
                onClick={() => setIsLiked(!isLiked)}
                style={{ background: 'transparent', border: 'none', color: isLiked ? '#ef4444' : '#fff', cursor: 'pointer' }}
              >
                <Heart size={20} fill={isLiked ? '#ef4444' : 'none'} />
              </button>
            </div>

            {/* Photo */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}>
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                style={{
                  maxHeight: '100%',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  borderRadius: '12px'
                }}
              />
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-around', color: '#94a3b8', padding: '0.5rem 0' }}>
              <Share2 size={18} style={{ cursor: 'pointer' }} />
              <Info size={18} style={{ cursor: 'pointer' }} />
            </div>
          </motion.div>
        ) : (
          /* Grid View */
          <motion.div
            key="grid-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700 }}>Gallery</span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: '0.5rem' }}>{PHOTOS.length} items</span>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '4px',
                padding: '4px'
              }}
            >
              {PHOTOS.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => handleSelectPhoto(photo)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '4px 6px',
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                      fontSize: '0.65rem',
                      color: '#fff'
                    }}
                  >
                    {photo.title}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
