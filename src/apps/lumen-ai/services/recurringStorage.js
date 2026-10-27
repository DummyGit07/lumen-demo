// Recurring Payments and Subscription Service for Lumen AI
import { financeStorage, detectCardBrand } from './financeStorage';

const STORAGE_KEY_RECURRING = 'lumen_recurring_subscriptions_v1';

export const SUBSCRIPTION_CATALOG = {
  netflix: {
    id: 'netflix',
    name: 'Netflix',
    brandColor: '#E50914',
    bgGradient: 'linear-gradient(135deg, #E50914, #7f0007)',
    iconText: 'N',
    plans: [
      {
        id: 'netflix-mobile',
        name: 'Mobile',
        price: '₹149',
        cycle: 'month',
        benefits: '480p video; phone and tablet'
      },
      {
        id: 'netflix-basic',
        name: 'Basic',
        price: '₹199',
        cycle: 'month',
        benefits: '720p HD; phone, tablet, laptop and TV'
      },
      {
        id: 'netflix-standard',
        name: 'Standard',
        price: '₹499',
        cycle: 'month',
        benefits: '1080p Full HD; 2 simultaneous devices'
      },
      {
        id: 'netflix-premium',
        name: 'Premium',
        price: '₹649',
        cycle: 'month',
        benefits: '4K UHD + HDR; 4 simultaneous devices'
      }
    ]
  },
  amazon_prime: {
    id: 'amazon_prime',
    name: 'Amazon Prime',
    brandColor: '#00A8E1',
    bgGradient: 'linear-gradient(135deg, #00A8E1, #004d73)',
    iconText: 'Prime',
    plans: [
      {
        id: 'prime-monthly',
        name: 'Prime Monthly',
        price: '₹299',
        cycle: 'month',
        benefits: 'Full shopping; delivery; Prime Video; Music benefits'
      },
      {
        id: 'prime-3month',
        name: 'Prime 3-Month',
        price: '₹599',
        cycle: '3-months',
        benefits: 'Full shopping; delivery; Prime Video; Music benefits'
      },
      {
        id: 'prime-annual',
        name: 'Prime Annual',
        price: '₹1,499',
        cycle: 'year',
        benefits: 'Full Shopping; delivery; Prime Video; Music benefits.'
      }
    ]
  },
  uber_one: {
    id: 'uber_one',
    name: 'Uber One',
    brandColor: '#000000ff',
    bgGradient: 'linear-gradient(135deg, #000000ff, #000000ff)',
    iconText: 'Uber',
    plans: [
      {
        id: 'uber-monthly',
        name: 'Monthly',
        price: '₹149',
        cycle: 'month',
        benefits: 'Eligible ride savings, credits and membership offers'
      },
      {
        id: 'uber-3month',
        name: '3-Month',
        price: '₹349',
        cycle: '3-months',
        benefits: 'Membership benefits; recurring renewal if offered'
      },
      {
        id: 'uber-annual',
        name: 'Annual',
        price: '₹1,499',
        cycle: 'year',
        benefits: 'Membership benefits; renewal depends on checkout'
      }
    ]
  }
};

export const DEFAULT_RECURRING_PAYMENTS = [
  {
    id: 'sub-netflix',
    platformId: 'netflix',
    platformName: 'Netflix',
    planId: 'netflix-standard',
    planName: 'Standard',
    price: '₹499',
    cycle: 'month',
    benefits: '1080p Full HD; 2 simultaneous devices',
    nextBillingDate: '12 Nov 2026',
    status: 'active'
  },
  {
    id: 'sub-amazon',
    platformId: 'amazon_prime',
    platformName: 'Amazon Prime',
    planId: 'prime-annual',
    planName: 'Prime Annual',
    price: '₹1,499',
    cycle: 'year',
    benefits: 'Shopping, delivery, Prime Video and other benefits; renewal depends on checkout',
    nextBillingDate: '24 Jan 2027',
    status: 'active'
  },
  {
    id: 'sub-uber',
    platformId: 'uber_one',
    platformName: 'Uber One',
    planId: 'uber-monthly',
    planName: 'Monthly',
    price: '₹149',
    cycle: 'month',
    benefits: 'Eligible ride savings, credits and membership offers',
    nextBillingDate: '05 Nov 2026',
    status: 'active'
  }
];

export const recurringStorage = {
  listeners: [],

  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  },

  notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.warn('Error in recurringStorage listener:', e);
      }
    });
  },

  loadSubscriptions() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_RECURRING);
      if (!data) return DEFAULT_RECURRING_PAYMENTS;
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_RECURRING_PAYMENTS;
    } catch {
      return DEFAULT_RECURRING_PAYMENTS;
    }
  },

  saveSubscriptions(subs) {
    try {
      localStorage.setItem(STORAGE_KEY_RECURRING, JSON.stringify(subs));
      this.notify();
    } catch (e) {
      console.warn('Failed to save recurring subscriptions:', e);
    }
  },

  addSubscription({ platformId, planId }) {
    const platform = SUBSCRIPTION_CATALOG[platformId];
    if (!platform) return null;
    const plan = platform.plans.find((p) => p.id === planId);
    if (!plan) return null;

    const currentSubs = this.loadSubscriptions();
    const newSub = {
      id: `sub-${platformId}-${Date.now()}`,
      platformId: platform.id,
      platformName: platform.name,
      planId: plan.id,
      planName: plan.name,
      price: plan.price,
      cycle: plan.cycle,
      benefits: plan.benefits,
      nextBillingDate: '27 Nov 2026',
      status: 'active'
    };

    // Filter out previous plan for the same platform if desired or keep multiple
    const updated = [newSub, ...currentSubs.filter((s) => s.platformId !== platformId)];
    this.saveSubscriptions(updated);
    return newSub;
  },

  removeSubscription(subId) {
    const currentSubs = this.loadSubscriptions();
    const updated = currentSubs.filter((s) => s.id !== subId);
    this.saveSubscriptions(updated);
  },

  // Helper to fetch the currently active credit card
  getActiveCard() {
    const cards = financeStorage.loadCards();
    const active = cards.find((c) => c.status === 'active') || cards[0];
    const brand = detectCardBrand(active?.cardNumber);
    return {
      ...active,
      brand,
      maskedDisplay: active?.last4 ? `•••• •••• •••• ${active.last4}` : '•••• •••• •••• 8411'
    };
  },

  // Explicit sync method
  syncWithNewCard(newCard) {
    this.notify();
  }
};

// Automatically sync when credit cards are issued or updated in financeStorage
if (typeof window !== 'undefined') {
  window.addEventListener('lumen_finance_storage_update', () => {
    recurringStorage.notify();
  });
}
