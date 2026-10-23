export const WALLPAPERS = [
  {
    id: 'aurora',
    name: 'Cosmic Aurora',
    url: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 35%, #311042 70%, #030712 100%)',
    accent: '#a855f7'
  },
  {
    id: 'cyber',
    name: 'Cyberpunk Neon',
    url: 'radial-gradient(circle at 80% 20%, #4338ca 0%, #1e1b4b 40%, #0f172a 90%)',
    accent: '#06b6d4'
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    url: 'linear-gradient(180deg, #4c0519 0%, #831843 30%, #431407 70%, #0f172a 100%)',
    accent: '#f43f5e'
  },
  {
    id: 'emerald',
    name: 'Deep Emerald',
    url: 'linear-gradient(135deg, #064e3b 0%, #022c22 45%, #052e16 80%, #020617 100%)',
    accent: '#10b981'
  }
];

export const INITIAL_APPS = [
  {
    id: 'phone',
    name: 'Phone',
    icon: 'Phone',
    color: 'linear-gradient(135deg, #22c55e, #16a34a)',
    badge: null,
    inDock: true
  },
  {
    id: 'sms',
    name: 'Messages',
    icon: 'MessageSquare',
    color: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    badge: 1,
    inDock: true
  },
  {
    id: 'gallery',
    name: 'Gallery',
    icon: 'Image',
    color: 'linear-gradient(135deg, #f59e0b, #d97706)',
    badge: null,
    inDock: true
  },
  {
    id: 'music',
    name: 'Music',
    icon: 'Music2',
    color: 'linear-gradient(135deg, #ec4899, #db2777)',
    badge: null,
    inDock: true
  }
];

export const SAMPLE_NOTIFICATIONS = [
  {
    id: 'notif-1',
    appId: 'phone',
    appName: 'Phone',
    title: 'Missed Call',
    body: 'Missed call from Alex Morgan (+1 555-0199)',
    time: 'Just now',
    icon: 'Phone',
    color: '#22c55e'
  },
  {
    id: 'notif-2',
    appId: 'sms',
    appName: 'Messages',
    title: 'Alex Morgan',
    body: 'Are we still meeting up this evening?',
    time: '2m ago',
    icon: 'MessageSquare',
    color: '#3b82f6'
  },
  {
    id: 'notif-3',
    appId: 'music',
    appName: 'Music',
    title: 'Now Playing',
    body: 'Midnight Horizon • Aether & Cyberia',
    time: 'Streaming',
    icon: 'Music2',
    color: '#ec4899'
  }
];
