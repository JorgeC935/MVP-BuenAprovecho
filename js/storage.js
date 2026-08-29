/**
 * BuenAprovecho - LocalStorage & Persistence Management
 */

const STORAGE_KEYS = {
  LOTS: 'ba_lots_v1',
  PROFILE: 'ba_profile_v1',
  FAVORITES: 'ba_favorites_v1',
  CONTACTS: 'ba_contacts_v1',
  REVIEWS: 'ba_reviews_v1',
  REPORTS: 'ba_reports_v1',
  LAB: 'ba_lab_v1',
  VIEWED_LOTS: 'ba_viewed_v1'
};

const Storage = {
  // --- Initialization ---
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.LOTS)) {
      localStorage.setItem(STORAGE_KEYS.LOTS, JSON.stringify(INITIAL_DEMO_LOTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FAVORITES)) {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(['lot-01', 'lot-04']));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONTACTS)) {
      // Seed a few initial demo contact records
      const demoContacts = [
        { id: 'c1', lotId: 'lot-01', productName: 'Papa Holandesa', buyerName: 'Doña Teresa (Pensión)', quantity: '40 kg', time: '09:30', timestamp: '2026-08-29T07:10:00Z' },
        { id: 'c2', lotId: 'lot-01', productName: 'Papa Holandesa', buyerName: 'Restaurante Central', quantity: '50 kg', time: '11:00', timestamp: '2026-08-29T08:00:00Z' },
        { id: 'c3', lotId: 'lot-04', productName: 'Naranja Dulce Bermejeña', buyerName: 'Juguería El Valle', quantity: '5 cajas', time: '15:00', timestamp: '2026-08-29T06:50:00Z' }
      ];
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(demoContacts));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LAB)) {
      localStorage.setItem(STORAGE_KEYS.LAB, JSON.stringify(DEFAULT_LAB_SETTINGS));
    }
  },

  // --- Lots Management ---
  getLots() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading lots from localStorage', e);
      return INITIAL_DEMO_LOTS;
    }
  },

  saveLots(lots) {
    localStorage.setItem(STORAGE_KEYS.LOTS, JSON.stringify(lots));
  },

  getLotById(id) {
    const lots = this.getLots();
    return lots.find(l => l.id === id) || null;
  },

  saveLot(lotData) {
    const lots = this.getLots();
    if (lotData.id) {
      // Update existing
      const index = lots.findIndex(l => l.id === lotData.id);
      if (index !== -1) {
        lots[index] = { ...lots[index], ...lotData, updatedAt: new Date().toISOString() };
      } else {
        lots.unshift(lotData);
      }
    } else {
      // Create new lot
      const newLot = {
        id: 'lot-' + Date.now(),
        ...lotData,
        publishedAt: new Date().toISOString(),
        viewsCount: 1,
        favoritesCount: 0,
        status: 'active',
        isFeatured: false,
        coordinates: {
          x: Math.floor(Math.random() * 50) + 25,
          y: Math.floor(Math.random() * 50) + 25
        }
      };
      lots.unshift(newLot);
    }
    this.saveLots(lots);
    return lots;
  },

  deleteLot(id) {
    let lots = this.getLots();
    lots = lots.filter(l => l.id !== id);
    this.saveLots(lots);
    return lots;
  },

  updateLotStatus(id, newStatus, soldQuantity = null) {
    const lots = this.getLots();
    const lot = lots.find(l => l.id === id);
    if (lot) {
      lot.status = newStatus;
      if (newStatus === 'sold' && soldQuantity) {
        lot.declaredSoldQuantity = soldQuantity;
      }
      lot.updatedAt = new Date().toISOString();
      this.saveLots(lots);
    }
    return lots;
  },

  duplicateLot(id) {
    const lots = this.getLots();
    const source = lots.find(l => l.id === id);
    if (!source) return null;

    const duplicated = {
      ...source,
      id: 'lot-' + Date.now(),
      product: `${source.product} (Copia)`,
      publishedAt: new Date().toISOString(),
      viewsCount: 0,
      favoritesCount: 0,
      status: 'active',
      isFeatured: false
    };

    lots.unshift(duplicated);
    this.saveLots(lots);
    return duplicated;
  },

  republishLot(id) {
    const lots = this.getLots();
    const lot = lots.find(l => l.id === id);
    if (!lot) return null;

    lot.status = 'active';
    lot.publishedAt = new Date().toISOString();
    lot.updatedAt = new Date().toISOString();
    this.saveLots(lots);
    return lot;
  },

  toggleFeatured(id) {
    const lots = this.getLots();
    const lot = lots.find(l => l.id === id);
    if (lot) {
      lot.isFeatured = !lot.isFeatured;
      this.saveLots(lots);
    }
    return lot;
  },

  incrementView(id) {
    const lots = this.getLots();
    const lot = lots.find(l => l.id === id);
    if (lot) {
      lot.viewsCount = (lot.viewsCount || 0) + 1;
      this.saveLots(lots);
    }
  },

  // --- Profile & Mode ---
  getProfile() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : DEFAULT_PROFILE;
    } catch (e) {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profileData) {
    const current = this.getProfile();
    const updated = { ...current, ...profileData };
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    return updated;
  },

  switchRole(role) {
    const profile = this.getProfile();
    profile.activeRole = role; // 'buyer' or 'seller'
    this.saveProfile(profile);
    return profile;
  },

  // --- Favorites ---
  getFavorites() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  toggleFavorite(lotId) {
    let favs = this.getFavorites();
    let isFav = false;
    if (favs.includes(lotId)) {
      favs = favs.filter(id => id !== lotId);
      isFav = false;
    } else {
      favs.push(lotId);
      isFav = true;
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));

    // Update lot counter
    const lots = this.getLots();
    const lot = lots.find(l => l.id === lotId);
    if (lot) {
      lot.favoritesCount = Math.max(0, (lot.favoritesCount || 0) + (isFav ? 1 : -1));
      this.saveLots(lots);
    }

    return { favorites: favs, isFavorite: isFav };
  },

  isFavorite(lotId) {
    return this.getFavorites().includes(lotId);
  },

  // --- Contact / Interest Records ---
  getContacts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  recordContact(record) {
    const contacts = this.getContacts();
    const newRecord = {
      id: 'contact-' + Date.now(),
      timestamp: new Date().toISOString(),
      ...record
    };
    contacts.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
    return newRecord;
  },

  // --- Reviews / Ratings Demo ---
  getReviews() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  addReview(review) {
    const reviews = this.getReviews();
    reviews.unshift({
      id: 'rev-' + Date.now(),
      createdAt: new Date().toISOString(),
      ...review
    });
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    return reviews;
  },

  // --- Reports ---
  getReports() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  addReport(report) {
    const reports = this.getReports();
    reports.unshift({
      id: 'rep-' + Date.now(),
      createdAt: new Date().toISOString(),
      ...report
    });
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    return reports;
  },

  // --- Lab Settings ---
  getLabSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAB);
      return data ? JSON.parse(data) : DEFAULT_LAB_SETTINGS;
    } catch (e) {
      return DEFAULT_LAB_SETTINGS;
    }
  },

  saveLabSettings(settings) {
    const current = this.getLabSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.LAB, JSON.stringify(updated));
    return updated;
  },

  // --- Stats Calculations for "Tu Actividad" ---
  getSellerStats() {
    const profile = this.getProfile();
    const lots = this.getLots();
    const contacts = this.getContacts();

    // Seller's own lots match by business name or sellerName
    const myLots = lots.filter(l => 
      l.sellerName === profile.businessName || 
      l.sellerName === profile.name ||
      l.sellerName === 'Distribuidora San Luis'
    );

    const activeLots = myLots.filter(l => l.status === 'active');
    const soldLots = myLots.filter(l => l.status === 'sold');
    
    // Count contacts for my lots
    const myLotIds = new Set(myLots.map(l => l.id));
    const receivedContacts = contacts.filter(c => myLotIds.has(c.lotId));

    // Sum declared sold quantities
    let totalSoldKg = 0;
    soldLots.forEach(l => {
      if (l.declaredSoldQuantity) {
        const num = parseFloat(l.declaredSoldQuantity);
        if (!isNaN(num)) totalSoldKg += num;
      } else {
        totalSoldKg += (l.quantity || 0);
      }
    });

    const totalViews = myLots.reduce((acc, l) => acc + (l.viewsCount || 0), 0);
    const totalFavs = myLots.reduce((acc, l) => acc + (l.favoritesCount || 0), 0);

    return {
      totalLots: myLots.length,
      activeLotsCount: activeLots.length,
      soldLotsCount: soldLots.length,
      receivedContactsCount: receivedContacts.length,
      totalSoldDeclared: totalSoldKg,
      totalViews,
      totalFavs,
      myLots,
      recentContacts: receivedContacts.slice(0, 5)
    };
  },

  // Reset to initial demo data
  resetDemoData() {
    localStorage.setItem(STORAGE_KEYS.LOTS, JSON.stringify(INITIAL_DEMO_LOTS));
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(['lot-01', 'lot-04']));
    localStorage.removeItem(STORAGE_KEYS.CONTACTS);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
    localStorage.setItem(STORAGE_KEYS.LAB, JSON.stringify(DEFAULT_LAB_SETTINGS));
    this.init();
  }
};

