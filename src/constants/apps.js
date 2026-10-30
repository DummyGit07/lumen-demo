export const WALLPAPERS = [
  {
    id: 'ios_glass_flow',
    name: 'iOS 18 Glass Wave',
    url: 'radial-gradient(ellipse at 85% 15%, rgba(59, 130, 246, 0.85) 0%, rgba(37, 99, 235, 0.4) 40%, transparent 70%), radial-gradient(ellipse at 15% 85%, rgba(168, 85, 247, 0.85) 0%, rgba(126, 34, 206, 0.4) 40%, transparent 70%), linear-gradient(150deg, #090d16 0%, #0f172a 50%, #030712 100%)',
    accent: '#38bdf8'
  },
  {
    id: 'ios_solar_bloom',
    name: 'iOS 17 Solar Bloom',
    url: 'radial-gradient(circle at 20% 25%, rgba(244, 63, 94, 0.85) 0%, rgba(225, 29, 72, 0.35) 45%, transparent 70%), radial-gradient(circle at 85% 75%, rgba(251, 146, 60, 0.8) 0%, rgba(234, 88, 12, 0.35) 45%, transparent 75%), linear-gradient(165deg, #190624 0%, #0f172a 60%, #020617 100%)',
    accent: '#f43f5e'
  },
  {
    id: 'titanium_slate',
    name: 'Titanium Graphite',
    url: 'radial-gradient(circle at 50% 20%, rgba(148, 163, 184, 0.35) 0%, rgba(100, 116, 139, 0.15) 50%, transparent 80%), radial-gradient(circle at 80% 80%, rgba(51, 65, 85, 0.6) 0%, transparent 60%), linear-gradient(180deg, #1e293b 0%, #0f172a 50%, #020617 100%)',
    accent: '#94a3b8'
  },
  {
    id: 'emerald_mesh',
    name: 'iOS Deep Emerald',
    url: 'radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.75) 0%, rgba(5, 150, 105, 0.3) 50%, transparent 75%), radial-gradient(circle at 20% 80%, rgba(6, 182, 212, 0.6) 0%, transparent 65%), linear-gradient(155deg, #022c22 0%, #031e17 40%, #020617 100%)',
    accent: '#10b981'
  }
];

export const INITIAL_APPS = [
  // 1. Main Home Screen Apps (Row 1)
  {
    id: 'calendar',
    name: 'Calendar',
    icon: 'Calendar',
    color: '#ffffff',
    badge: null,
    inDock: false
  },
  {
    id: 'notes',
    name: 'Notes',
    icon: 'NotebookPen',
    color: '#fafaf9',
    badge: null,
    inDock: false
  },
  {
    id: 'gmail',
    name: 'Mail',
    isGmail: true,
    icon: 'Mail',
    color: 'linear-gradient(180deg, #2ea5ff 0%, #007aff 100%)',
    badge: null,
    inDock: false
  },
  {
    id: 'lumen_ai',
    name: 'Lumen AI',
    isLetterLogo: true,
    letter: 'L',
    color: 'radial-gradient(circle at 50% 40%, #1e1e2e 0%, #0f1016 70%, #090a0f 100%)',
    badge: null,
    inDock: false
  },

  // 2. Bottom Quick Launch Dock Apps (Pinned at Bottom)
  {
    id: 'phone',
    name: 'Phone',
    icon: 'Phone',
    color: 'linear-gradient(180deg, #38d664 0%, #28a745 100%)',
    badge: null,
    inDock: true
  },
  {
    id: 'sms',
    name: 'Messages',
    icon: 'MessageSquare',
    color: 'linear-gradient(180deg, #38d664 0%, #28a745 100%)',
    badge: null,
    inDock: true
  },
  {
    id: 'gallery',
    name: 'Photos',
    icon: 'Image',
    color: '#ffffff',
    badge: null,
    inDock: true
  },
  {
    id: 'music',
    name: 'Music',
    icon: 'Music2',
    color: 'linear-gradient(180deg, #fc3c44 0%, #fa233b 100%)',
    badge: null,
    inDock: true
  }
];

export const SAMPLE_NOTIFICATIONS = [
  {
    id: 'notif-1',
    appId: 'gmail',
    appName: 'Gmail',
    title: 'Elena Vance',
    body: 'Product Prototype Roadmap - Final Review document attached',
    time: 'Just now',
    icon: 'Mail',
    color: '#ea4335'
  },
  {
    id: 'notif-2',
    appId: 'lumen_ai',
    appName: 'Lumen',
    title: 'Daily Financial Summary',
    body: 'Your summary for today is ready. Tap to view insights.',
    time: 'Just now',
    icon: 'Sparkles',
    color: '#6366f1'
  }
];
