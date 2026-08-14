/**
 * PashuRakshak AI - Screening History API Service
 * Manages screening logs, filters, search, and persistence
 */

const STORAGE_KEY = 'pashurakshak_screening_history';

// Default realistic seed screenings
const SEED_DATA = [
  {
    id: 'PR-8921',
    animalName: 'Gauri (Jersey Cow)',
    animalType: 'Cattle',
    date: '2026-08-14T18:20:00Z',
    dateFormatted: 'Today, 6:20 PM',
    prediction: 'Healthy',
    rawClass: 'healthy',
    confidence: 97.4,
    statusText: 'Normal',
    badgeClass: 'ok',
    symptoms: ['Normal appetite', 'Active movement'],
    notes: 'Routine weekly herd inspection. Clean coat and normal body temperature.',
    imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=500&auto=format&fit=crop&q=80',
    title: 'Healthy Cattle',
    summary: 'No clinical symptoms or visible lesions detected. Animal exhibits normal rumination and vitals.',
    action: 'Maintain regular vaccination and clean water supply.'
  },
  {
    id: 'PR-8919',
    animalName: 'Kaveri (Holstein)',
    animalType: 'Cattle',
    date: '2026-08-13T14:45:00Z',
    dateFormatted: 'Yesterday, 2:45 PM',
    prediction: 'Lumpy Skin Disease (LSD)',
    rawClass: 'lumpy',
    confidence: 95.2,
    statusText: 'Needs Attention',
    badgeClass: 'warn',
    symptoms: ['Skin lesions', 'Lumps/swelling', 'Fever', 'Reduced milk production'],
    notes: 'Noticed small circular skin nodules around neck and dorsal region. Milk yield dropped by 30%.',
    imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=500&auto=format&fit=crop&q=80',
    title: 'Lumpy Skin Disease Detected',
    summary: 'Multiple circumscribed nodular cutaneous lesions observed. Characteristic signs of Capripoxvirus infection.',
    action: 'Isolate animal in well-ventilated shed. Apply antiseptic spray on nodules and consult Dr. Ramesh Deshmukh.'
  },
  {
    id: 'PR-8914',
    animalName: 'Bhim (Murrah Buffalo)',
    animalType: 'Buffalo',
    date: '2026-08-12T11:15:00Z',
    dateFormatted: '2 days ago',
    prediction: 'Healthy',
    rawClass: 'healthy',
    confidence: 93.8,
    statusText: 'Normal',
    badgeClass: 'ok',
    symptoms: ['Healthy grazing'],
    notes: 'Pre-monsoon routine health verification. No abnormalities recorded.',
    imageUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=500&auto=format&fit=crop&q=80',
    title: 'Healthy Buffalo',
    summary: 'Clear muzzle, normal locomotion, no mucosal lesions.',
    action: 'Continue regular mineral supplement feeding.'
  },
  {
    id: 'PR-8908',
    animalName: 'Rani (Desi Cow)',
    animalType: 'Cattle',
    date: '2026-08-10T09:30:00Z',
    dateFormatted: '4 days ago',
    prediction: 'Foot-and-Mouth Disease (FMD)',
    rawClass: 'foot-and-mouth',
    confidence: 91.5,
    statusText: 'Needs Attention',
    badgeClass: 'warn',
    symptoms: ['Excessive salivation', 'Mouth lesions', 'Difficulty walking', 'Loss of appetite'],
    notes: 'Stringy frothy salivation and mild lameness in hind legs. Reduced feed intake.',
    imageUrl: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?w=500&auto=format&fit=crop&q=80',
    title: 'Foot-and-Mouth Disease Detected',
    summary: 'Oral blister vesicles and coronary band inflammation consistent with Aphthovirus.',
    action: 'Wash oral cavity with 1% potassium permanganate solution. Restrict movement and isolate.'
  },
  {
    id: 'PR-8902',
    animalName: 'Shambhu (Sirohi Goat)',
    animalType: 'Goat',
    date: '2026-08-08T16:00:00Z',
    dateFormatted: '6 days ago',
    prediction: 'Healthy',
    rawClass: 'healthy',
    confidence: 96.1,
    statusText: 'Normal',
    badgeClass: 'ok',
    symptoms: ['Active', 'Normal appetite'],
    notes: 'Herd grazing checkup.',
    imageUrl: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=500&auto=format&fit=crop&q=80',
    title: 'Healthy Goat',
    summary: 'No skin lesions or oral blisters detected.',
    action: 'Routine deworming recommended next month.'
  },
  {
    id: 'PR-8895',
    animalName: 'Ganga (Gir Cow)',
    animalType: 'Cattle',
    date: '2026-08-05T10:10:00Z',
    dateFormatted: '9 days ago',
    prediction: 'Healthy',
    rawClass: 'healthy',
    confidence: 98.2,
    statusText: 'Normal',
    badgeClass: 'ok',
    symptoms: ['High milk yield', 'Healthy grazing'],
    notes: 'Monthly veterinary wellness screening.',
    imageUrl: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=500&auto=format&fit=crop&q=80',
    title: 'Healthy Cattle',
    summary: 'Excellent body condition score with optimal rumination.',
    action: 'Maintain seasonal green fodder ratio.'
  }
];

export const HistoryAPI = {
  /**
   * Fetch all screening records
   */
  getAll() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading history from storage:', e);
    }
    // Initialize seed data if empty
    this.saveAll(SEED_DATA);
    return SEED_DATA;
  },

  /**
   * Save all screening records to localStorage
   */
  saveAll(records) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn('Error writing history to storage:', e);
    }
  },

  /**
   * Get single screening by ID
   */
  getById(id) {
    const all = this.getAll();
    return all.find(r => r.id === id) || null;
  },

  /**
   * Add a new screening record
   */
  add(screening) {
    const all = this.getAll();
    const newRecord = {
      id: 'PR-' + Math.floor(1000 + Math.random() * 9000),
      animalName: screening.animalName || (screening.animalType ? `${screening.animalType} #${Math.floor(100 + Math.random() * 900)}` : 'Livestock'),
      animalType: screening.animalType || 'Cattle',
      date: new Date().toISOString(),
      dateFormatted: 'Just now',
      prediction: screening.prediction || 'Healthy',
      rawClass: screening.rawClass || 'healthy',
      confidence: screening.confidence || 90.0,
      statusText: screening.statusText || (screening.isHealthy ? 'Normal' : 'Needs Attention'),
      badgeClass: screening.badgeClass || (screening.isHealthy ? 'ok' : 'warn'),
      symptoms: screening.symptoms || [],
      notes: screening.notes || '',
      imageUrl: screening.imageUrl || '',
      title: screening.title || 'Screening Result',
      summary: screening.summary || '',
      action: screening.action || '',
      probabilities: screening.probabilities || {}
    };

    all.unshift(newRecord);
    this.saveAll(all);
    return newRecord;
  },

  /**
   * Delete a record by ID
   */
  delete(id) {
    const all = this.getAll().filter(r => r.id !== id);
    this.saveAll(all);
    return all;
  },

  /**
   * Filter and search screening records
   */
  filter({ search = '', animalType = 'all', disease = 'all', status = 'all', dateRange = 'all' } = {}) {
    let list = this.getAll();
    const query = search.trim().toLowerCase();

    if (query) {
      list = list.filter(r => 
        (r.animalName && r.animalName.toLowerCase().includes(query)) ||
        (r.id && r.id.toLowerCase().includes(query)) ||
        (r.prediction && r.prediction.toLowerCase().includes(query)) ||
        (r.notes && r.notes.toLowerCase().includes(query)) ||
        (r.animalType && r.animalType.toLowerCase().includes(query))
      );
    }

    if (animalType && animalType !== 'all') {
      list = list.filter(r => (r.animalType || '').toLowerCase() === animalType.toLowerCase());
    }

    if (disease && disease !== 'all') {
      list = list.filter(r => {
        const p = (r.prediction || '').toLowerCase();
        if (disease === 'healthy') return p.includes('healthy');
        if (disease === 'lumpy') return p.includes('lumpy');
        if (disease === 'fmd') return p.includes('foot') || p.includes('fmd');
        return true;
      });
    }

    if (status && status !== 'all') {
      list = list.filter(r => {
        if (status === 'normal') return r.badgeClass === 'ok';
        if (status === 'attention') return r.badgeClass === 'warn';
        return true;
      });
    }

    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      list = list.filter(r => {
        const itemDate = new Date(r.date);
        const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24);
        if (dateRange === 'today') return diffDays <= 1;
        if (dateRange === 'week') return diffDays <= 7;
        if (dateRange === 'month') return diffDays <= 30;
        return true;
      });
    }

    return list;
  }
};
