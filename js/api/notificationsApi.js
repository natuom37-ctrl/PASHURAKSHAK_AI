/**
 * PashuRakshak AI - Notifications API Service
 * Manages health alerts, screening notifications, and unread states
 */

const NOTIF_STORAGE_KEY = 'pashurakshak_notifications';

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'n-1',
    title: 'Screening Completed',
    message: 'Your screening for Gauri (Jersey Cow) has finished with result: Healthy (97.4% confidence).',
    type: 'success',
    date: '2026-08-14T18:22:00Z',
    dateFormatted: 'Today, 6:22 PM',
    isRead: false,
    link: '#/history'
  },
  {
    id: 'n-2',
    title: 'Veterinary Attention Recommended',
    message: 'Screening for Kaveri (Holstein) detected Lumpy Skin Disease indicators (95.2% confidence). Immediate isolation advised.',
    type: 'warning',
    date: '2026-08-13T14:46:00Z',
    dateFormatted: 'Yesterday, 2:46 PM',
    isRead: false,
    link: '#/veterinary-help'
  },
  {
    id: 'n-3',
    title: 'New Health Insight Available',
    message: 'Weekly livestock summary is ready: 83% of screened animals in your herd are in optimal health.',
    type: 'info',
    date: '2026-08-12T09:00:00Z',
    dateFormatted: '2 days ago',
    isRead: true,
    link: '#/analytics'
  },
  {
    id: 'n-4',
    title: 'FMD Vaccination Reminder',
    message: 'Semi-annual Foot-and-Mouth Disease booster vaccination drive scheduled in your district next week.',
    type: 'info',
    date: '2026-08-10T08:30:00Z',
    dateFormatted: '4 days ago',
    isRead: true,
    link: '#/veterinary-help'
  }
];

export const NotificationsAPI = {
  getAll() {
    try {
      const stored = localStorage.getItem(NOTIF_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading notifications:', e);
    }
    this.saveAll(DEFAULT_NOTIFICATIONS);
    return DEFAULT_NOTIFICATIONS;
  },

  saveAll(list) {
    try {
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Error writing notifications:', e);
    }
  },

  getUnreadCount() {
    const list = this.getAll();
    return list.filter(n => !n.isRead).length;
  },

  markAsRead(id) {
    const list = this.getAll().map(n => n.id === id ? { ...n, isRead: true } : n);
    this.saveAll(list);
    return list;
  },

  markAllAsRead() {
    const list = this.getAll().map(n => ({ ...n, isRead: true }));
    this.saveAll(list);
    return list;
  },

  add(notification) {
    const list = this.getAll();
    const newNotif = {
      id: 'n-' + Date.now(),
      title: notification.title || 'Health Alert',
      message: notification.message || '',
      type: notification.type || 'info',
      date: new Date().toISOString(),
      dateFormatted: 'Just now',
      isRead: false,
      link: notification.link || '#/history'
    };
    list.unshift(newNotif);
    this.saveAll(list);
    return newNotif;
  }
};
