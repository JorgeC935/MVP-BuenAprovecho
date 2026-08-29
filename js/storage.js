/**
 * BuenAprovecho - LocalStorage & Persistence Management
 */

const STORAGE_KEYS = {
  LOTS:        'ba_lots_v2',
  PROFILE:     'ba_profile_v2',
  FAVORITES:   'ba_favorites_v2',
  CONTACTS:    'ba_contacts_v2',
  REVIEWS:     'ba_reviews_v2',
  REPORTS:     'ba_reports_v2',
  LAB:         'ba_lab_v2',
  VIEWED_LOTS: 'ba_viewed_v2'
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
      const demoContacts = [
        { id: 'c1', lotId: 'lot-01', productName: 'Papa Holandesa (Calibre Mediano-Pequeño)', buyerName: 'Doña Teresa (Pensión El Buen Sabor)', quantity: '40 kg', time: '09:30', timestamp: '2026-08-29T07:10:00Z' },
        { id: 'c2', lotId: 'lot-01', productName: 'Papa Holandesa (Calibre Mediano-Pequeño)', buyerName: 'Restaurante Central Tarija', quantity: '50 kg', time: '11:00', timestamp: '2026-08-29T08:00:00Z' },
        { id: 'c3', lotId: 'lot-04', productName: 'Naranja Dulce Bermejeña (Lote Completo)', buyerName: 'Juguería El Valle', quantity: '5 cajas', time: '15:00', timestamp: '2026-08-29T06:50:00Z' }
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
    const profile = this.getProfile();

    // Persist habitual location & schedule into profile for future ultra-fast publishing
    if (lotData.location || lotData.pickupSchedule) {
      this.saveProfile({
        zone: lotData.location || profile.zone,
        locationRef: lotData.locationRef || profile.locationRef,
        habitualSchedule: lotData.pickupSchedule || profile.habitualSchedule
      });
    }

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
          x: Math.floor(Math.random() * 45) + 30,
          y: Math.floor(Math.random() * 45) + 25
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

  // Get smart defaults for fast publishing from previous publications or profile
  getLastPublishDefaults() {
    const profile = this.getProfile();
    const myLots = this.getSellerLots();
    if (myLots.length > 0) {
      const last = myLots[0];
      return {
        location: last.location || profile.zone || 'Zona Mercado Campesino',
        locationRef: last.locationRef || profile.locationRef || '',
        pickupSchedule: last.pickupSchedule || profile.habitualSchedule || '07:00 a 14:00 (Lunes a Sábado)',
        unit: last.unit || 'kg',
        priceModality: last.priceModality || 'Bs/kg',
        phone: profile.phone || last.sellerPhone || '+59172981234'
      };
    }
    return {
      location: profile.zone || 'Zona Mercado Campesino',
      locationRef: profile.locationRef || 'Av. Froilán Tejerina, tinglado verde puesto 44',
      pickupSchedule: profile.habitualSchedule || '07:00 a 14:00 (Lunes a Sábado)',
      unit: 'kg',
      priceModality: 'Bs/kg',
      phone: profile.phone || '+59172981234'
    };
  },

  getSellerLots() {
    const profile = this.getProfile();
    const lots = this.getLots();
    return lots.filter(l => 
      l.sellerName === profile.businessName || 
      l.sellerName === profile.name ||
      l.sellerName === 'Distribuidora San Luis'
    );
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
    profile.activeRole = role;
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

  // --- Simulated Internal News / Novedades & Alerts Center ---
  getSimulatedAlerts() {
    const profile = this.getProfile();
    const interests = profile.interests || [];
    const lots = this.getLots().filter(l => l.status === 'active');
    const favs = this.getFavorites();

    const alerts = [];

    // 1. Matches with user interests
    const interestMatches = lots.filter(l => 
      interests.some(i => l.product.toLowerCase().includes(i.toLowerCase()))
    );

    if (interestMatches.length > 0) {
      const topMatch = interestMatches[0];
      alerts.push({
        id: 'alt-interest',
        type: 'match',
        icon: '✨',
        title: `Nuevo lote de ${topMatch.product.split('(')[0].trim()}`,
        desc: `Disponible en ${topMatch.location} por ${topMatch.priceModality} ${topMatch.price}`,
        lotId: topMatch.id,
        time: 'Hace 25 min'
      });
    }

    // 2. Urgent / Quick exit alert
    const urgentLots = lots.filter(l => l.quickExit);
    if (urgentLots.length > 0) {
      const topUrgent = urgentLots[0];
      alerts.push({
        id: 'alt-urgent',
        type: 'urgent',
        icon: '⚡',
        title: `Salida rápida en ${topUrgent.location}`,
        desc: `${topUrgent.product} con precio de liquidación conveniente.`,
        lotId: topUrgent.id,
        time: 'Hace 1 hora'
      });
    }

    // 3. Saved lots reminder / price notification
    if (favs.length > 0) {
      const favLot = lots.find(l => favs.includes(l.id));
      if (favLot) {
        alerts.push({
          id: 'alt-fav',
          type: 'price',
          icon: '🏷️',
          title: `Oportunidad en lote guardado`,
          desc: `${favLot.product} sigue disponible para coordinar recojo inmediato.`,
          lotId: favLot.id,
          time: 'Hoy'
        });
      }
    }

    // 4. Market demand insight for Tarija
    alerts.push({
      id: 'alt-demand',
      type: 'market',
      icon: '📈',
      title: `Demanda activa en Mercado Campesino`,
      desc: `Compradores gastronómicos buscando lotes de cebolla y cítricos esta mañana.`,
      lotId: null,
      time: 'Hoy'
    });

    return alerts;
  },

  // --- Stats Calculations for "Tu Actividad" ---
  getSellerStats() {
    const myLots = this.getSellerLots();
    const contacts = this.getContacts();

    const activeLots = myLots.filter(l => l.status === 'active');
    const soldLots = myLots.filter(l => l.status === 'sold');
    
    // Count contacts for my lots
    const myLotIds = new Set(myLots.map(l => l.id));
    const receivedContacts = contacts.filter(c => myLotIds.has(c.lotId));

    // Breakdown of volume sold by product
    const soldByProduct = {};
    let totalSoldKg = 0;

    soldLots.forEach(l => {
      let qty = l.declaredSoldQuantity ? parseFloat(l.declaredSoldQuantity) : (l.quantity || 0);
      if (isNaN(qty)) qty = l.quantity || 0;
      totalSoldKg += qty;

      const prodShort = l.product.split('(')[0].trim();
      soldByProduct[prodShort] = (soldByProduct[prodShort] || 0) + qty;
    });

    // Rank my lots by total buyer interactions (contacts + views + favorites)
    const rankedLots = [...myLots].map(l => {
      const lotContacts = contacts.filter(c => c.lotId === l.id).length;
      const score = (lotContacts * 10) + (l.favoritesCount || 0) * 3 + (l.viewsCount || 0);
      return {
        ...l,
        contactsCount: lotContacts,
        score
      };
    }).sort((a, b) => b.score - a.score);

    const totalViews = myLots.reduce((acc, l) => acc + (l.viewsCount || 0), 0);
    const totalFavs = myLots.reduce((acc, l) => acc + (l.favoritesCount || 0), 0);

    return {
      totalLots: myLots.length,
      activeLotsCount: activeLots.length,
      soldLotsCount: soldLots.length,
      receivedContactsCount: receivedContacts.length,
      totalSoldDeclared: totalSoldKg,
      soldByProduct,
      totalViews,
      totalFavs,
      myLots,
      rankedLots,
      recentContacts: receivedContacts.slice(0, 8)
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
