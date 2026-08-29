/**
 * BuenAprovecho - Main Application Controller
 */

const App = {
  currentView: 'inicio',
  activeCategory: 'all',
  filters: {
    query: '',
    category: 'all',
    zone: 'all',
    sellerType: 'all',
    maxPrice: null,
    quickExitOnly: false,
    sortBy: 'recent'
  },
  currentLotInDetail: null,
  currentLotInSoldModal: null,
  currentEditingLotId: null,
  publishedImages: [], // temp store for upload form

  // --- Initialization ---
  init() {
    Storage.init();
    this.setupEventListeners();
    this.updateUserModeUI();
    this.navigate('inicio');
    this.registerServiceWorker();
    this.updateAlertsBadge();
  },

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => {
          console.log('Service Worker registration skipped or failed:', err);
        });
      });
    }
  },

  // --- Navigation & View Switching ---
  navigate(viewId) {
    this.currentView = viewId;

    // Update bottom & top nav active classes
    document.querySelectorAll('.nav-link, .bottom-nav-item').forEach(el => {
      if (el.dataset.view === viewId) {
        el.classList.add('active');
        el.setAttribute('aria-current', 'page');
      } else {
        el.classList.remove('active');
        el.removeAttribute('aria-current');
      }
    });

    // Hide all view containers
    document.querySelectorAll('.app-view').forEach(view => {
      view.classList.remove('active');
    });

    // Show target view
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Render corresponding view data
    this.renderCurrentView();
    this.updateAlertsBadge();
  },

  renderCurrentView() {
    const profile = Storage.getProfile();
    const isSeller = profile.activeRole === 'seller';

    switch (this.currentView) {
      case 'inicio':
        this.renderHomeView();
        break;
      case 'explorar':
        this.renderExploreView();
        break;
      case 'guardados':
        this.renderSavedView();
        break;
      case 'actividad':
        if (isSeller) {
          this.renderSellerActivityView();
        } else {
          this.renderBuyerActivityView();
        }
        break;
      case 'perfil':
        this.renderProfileView();
        break;
      case 'mis-lotes':
        this.renderMyLotsView();
        break;
      case 'publicar':
        this.renderPublishView();
        break;
      default:
        this.renderHomeView();
    }
  },

  // --- Role Switching (Buyer <-> Seller) ---
  toggleUserRole() {
    const profile = Storage.getProfile();
    const newRole = profile.activeRole === 'seller' ? 'buyer' : 'seller';
    Storage.switchRole(newRole);
    this.updateUserModeUI();
    UI.showToast(`Modo cambiado a: ${newRole === 'seller' ? 'Vendedor' : 'Comprador'}`);
    
    if (newRole === 'seller') {
      this.navigate('mis-lotes');
    } else {
      this.navigate('inicio');
    }
  },

  setUserRole(role) {
    Storage.switchRole(role);
    this.updateUserModeUI();
    UI.showToast(`Modo cambiado a: ${role === 'seller' ? 'Vendedor' : 'Comprador'}`);
    this.navigate(role === 'seller' ? 'mis-lotes' : 'inicio');
  },

  updateUserModeUI() {
    const profile = Storage.getProfile();
    const isSeller = profile.activeRole === 'seller';

    const roleBadge = document.getElementById('header-role-badge');
    if (roleBadge) {
      roleBadge.textContent = isSeller ? 'Modo Vendedor' : 'Modo Comprador';
      roleBadge.className = `role-badge ${isSeller ? 'role-seller' : 'role-buyer'}`;
    }

    // Toggle seller-only / buyer-only navigation items
    document.querySelectorAll('.seller-only').forEach(el => {
      el.style.display = isSeller ? '' : 'none';
    });
    document.querySelectorAll('.buyer-only').forEach(el => {
      el.style.display = isSeller ? 'none' : '';
    });
  },

  updateAlertsBadge() {
    const alerts = Storage.getSimulatedAlerts();
    const badge = document.getElementById('alerts-count-badge');
    if (badge) {
      badge.textContent = alerts.length;
      badge.style.display = alerts.length > 0 ? 'inline-flex' : 'none';
    }
  },

  // --- View: Home (Inicio) ---
  renderHomeView() {
    const container = document.getElementById('view-inicio');
    if (!container) return;

    const lots = Storage.getLots().filter(l => l.status === 'active');
    const profile = Storage.getProfile();
    const labSettings = Storage.getLabSettings();
    const favorites = Storage.getFavorites();
    const alerts = Storage.getSimulatedAlerts();

    // Urgent / Quick Exit Lots
    const urgentLots = lots.filter(l => l.quickExit || l.commercialReason === 'Salida rápida').slice(0, 4);

    // "Para ti" matches user saved interests
    const userInterests = profile.interests || [];
    const forYouLots = lots.filter(l => {
      const prodLower = l.product.toLowerCase();
      return userInterests.some(interest => prodLower.includes(interest.toLowerCase()));
    }).slice(0, 4);

    // Tarija Zone Lots (e.g. Mercado Campesino default or all)
    const nearLots = lots.slice(0, 4);

    // Categories markup
    const categoriesHtml = PRODUCT_CATEGORIES.map(cat => `
      <button class="category-pill ${this.activeCategory === cat.id ? 'active' : ''}" 
              onclick="App.selectCategoryHome('${cat.id}')">
        <span class="cat-icon">${cat.icon}</span>
        <span class="cat-name">${cat.name}</span>
      </button>
    `).join('');

    container.innerHTML = `
      <!-- Hero Banner -->
      <section class="home-hero">
        <div class="hero-content">
          <div class="hero-top-tag">Marketplace Agrícola · Tarija</div>
          <h1 class="hero-title">Aprovecha más.<br><span class="highlight">Desperdicia menos.</span></h1>
          <p class="hero-subtitle">Segunda salida comercial directa a lotes agrícolas en Tarija. Conectamos sobreoferta y baja rotación con compradores inmediatos.</p>
          
          <div class="search-bar-wrap">
            <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" id="home-search-input" placeholder="Buscar papa, cebolla, naranja, limón, zapallo..." onkeypress="if(event.key==='Enter') App.handleHomeSearch()" />
            <button class="btn btn-primary btn-search" onclick="App.handleHomeSearch()">Buscar</button>
          </div>
        </div>
      </section>

      <!-- Simulated News Banner / Alertas Destacadas -->
      ${alerts.length > 0 ? `
        <div class="home-alerts-bar" onclick="App.openAlertsModal()">
          <div class="alert-pulse-icon">🔔</div>
          <div class="alert-bar-text">
            <strong>${alerts[0].title}:</strong> ${alerts[0].desc}
          </div>
          <span class="alert-bar-link">Ver avisos (${alerts.length}) &rarr;</span>
        </div>
      ` : ''}

      <!-- Category Filter Pills -->
      <section class="section-categories">
        <div class="categories-scroll">
          ${categoriesHtml}
        </div>
      </section>

      <!-- Section: Salida Rápida (Urgent) -->
      ${urgentLots.length > 0 ? `
        <section class="home-section">
          <div class="section-header">
            <div>
              <h2 class="section-title"><span class="urgent-bolt">⚡</span> Salida Rápida</h2>
              <p class="section-desc">Lotes con necesidad de salida prioritaria a precios convenientes en Tarija</p>
            </div>
            <button class="btn-link" onclick="App.filterQuickExitAndExplore()">Ver todos &rarr;</button>
          </div>
          <div class="lots-grid">
            ${urgentLots.map(l => UI.renderLotCard(l, favorites.includes(l.id), false)).join('')}
          </div>
        </section>
      ` : ''}

      <!-- Section: Para ti (Based on interests) -->
      ${labSettings.showInterestSuggestions && forYouLots.length > 0 ? `
        <section class="home-section for-you-section">
          <div class="section-header">
            <div>
              <h2 class="section-title">✨ Para ti</h2>
              <p class="section-desc">Seleccionado según tus intereses guardados (${userInterests.join(', ') || 'personalizados'})</p>
            </div>
            <button class="btn-link" onclick="App.navigate('perfil')">Configurar intereses</button>
          </div>
          <div class="lots-grid">
            ${forYouLots.map(l => UI.renderLotCard(l, favorites.includes(l.id), true)).join('')}
          </div>
        </section>
      ` : ''}

      <!-- Section: Cerca de ti en Tarija -->
      <section class="home-section">
        <div class="section-header">
          <div>
            <h2 class="section-title">📍 Cerca de ti en Tarija</h2>
            <p class="section-desc">Lotes disponibles en zonas céntricas y centros de acopio</p>
          </div>
          <button class="btn-link" onclick="App.navigate('explorar')">Explorar catálogo &rarr;</button>
        </div>
        <div class="lots-grid">
          ${nearLots.map(l => UI.renderLotCard(l, favorites.includes(l.id), false)).join('')}
        </div>
      </section>

      <!-- Simulated Map Preview if lab enabled -->
      ${labSettings.showSimulatedMap ? `
        <section class="home-section">
          <div class="section-header">
            <div>
              <h2 class="section-title">🗺️ Mapa de Abastecimiento en Tarija</h2>
              <p class="section-desc">Ubicaciones orientativas de recojo en centros de abasto</p>
            </div>
          </div>
          ${UI.renderSimulatedMap(lots)}
        </section>
      ` : ''}
    `;
  },

  selectCategoryHome(catId) {
    this.activeCategory = catId;
    this.filters.category = catId;
    this.navigate('explorar');
  },

  handleHomeSearch() {
    const input = document.getElementById('home-search-input');
    if (input) {
      this.filters.query = input.value.trim();
    }
    this.navigate('explorar');
  },

  filterQuickExitAndExplore() {
    this.filters.quickExitOnly = true;
    this.navigate('explorar');
  },

  // --- View: Explore (Explorar) ---
  renderExploreView() {
    const container = document.getElementById('view-explorar');
    if (!container) return;

    const allLots = Storage.getLots();
    const activeLots = allLots.filter(l => l.status === 'active');
    const favorites = Storage.getFavorites();

    // Apply filters
    let filtered = activeLots.filter(lot => {
      // Query filter
      if (this.filters.query) {
        const q = this.filters.query.toLowerCase();
        const matchTitle = lot.product.toLowerCase().includes(q);
        const matchDesc = lot.description && lot.description.toLowerCase().includes(q);
        const matchLoc = lot.location.toLowerCase().includes(q);
        const matchSeller = lot.sellerName.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchLoc && !matchSeller) return false;
      }

      // Category filter
      if (this.filters.category && this.filters.category !== 'all') {
        if (lot.category !== this.filters.category) return false;
      }

      // Zone filter
      if (this.filters.zone && this.filters.zone !== 'all') {
        if (lot.location !== this.filters.zone) return false;
      }

      // Seller Type filter
      if (this.filters.sellerType && this.filters.sellerType !== 'all') {
        if (lot.sellerType !== this.filters.sellerType) return false;
      }

      // Quick Exit filter
      if (this.filters.quickExitOnly) {
        if (!lot.quickExit && lot.commercialReason !== 'Salida rápida') return false;
      }

      // Price filter
      if (this.filters.maxPrice && this.filters.maxPrice > 0) {
        if (lot.price > this.filters.maxPrice) return false;
      }

      return true;
    });

    // Sorting: Featured first, then chosen criteria
    filtered.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;

      if (this.filters.sortBy === 'price-asc') {
        return a.price - b.price;
      } else if (this.filters.sortBy === 'price-desc') {
        return b.price - a.price;
      } else if (this.filters.sortBy === 'qty-desc') {
        return b.quantity - a.quantity;
      } else {
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      }
    });

    const zonesOptions = ['all', ...TARIJA_ZONES].map(z => `
      <option value="${z}" ${this.filters.zone === z ? 'selected' : ''}>${z === 'all' ? 'Todas las zonas de Tarija' : z}</option>
    `).join('');

    const sellerTypeOptions = ['all', ...SELLER_TYPES.map(s => s.name)].map(st => `
      <option value="${st}" ${this.filters.sellerType === st ? 'selected' : ''}>${st === 'all' ? 'Todos los tipos de vendedor' : st}</option>
    `).join('');

    const categoriesButtons = PRODUCT_CATEGORIES.map(cat => `
      <button class="filter-chip ${this.filters.category === cat.id ? 'active' : ''}" 
              onclick="App.setCategoryFilter('${cat.id}')">
        ${cat.icon} ${cat.name}
      </button>
    `).join('');

    container.innerHTML = `
      <div class="explore-header">
        <h1 class="page-title">Explorar Lotes Agrícolas</h1>
        <p class="page-subtitle">Mercadería disponible con oportunidad comercial en Tarija</p>

        <!-- Search Bar -->
        <div class="search-bar-wrap">
          <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="explore-search-input" value="${this.filters.query}" placeholder="Buscar por producto, vendedor o zona..." oninput="App.handleFilterQueryChange(this.value)" />
          ${this.filters.query ? `<button class="search-clear-btn" onclick="App.clearSearchQuery()">&times;</button>` : ''}
        </div>

        <!-- Horizontal Category Pills -->
        <div class="filter-chips-scroll">
          ${categoriesButtons}
        </div>

        <!-- Filter Card -->
        <div class="filters-card">
          <div class="filters-grid">
            <div class="filter-group">
              <label class="filter-label">Zona en Tarija</label>
              <select class="form-select" onchange="App.setZoneFilter(this.value)">
                ${zonesOptions}
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Tipo de Vendedor</label>
              <select class="form-select" onchange="App.setSellerTypeFilter(this.value)">
                ${sellerTypeOptions}
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Ordenar por</label>
              <select class="form-select" onchange="App.setSortFilter(this.value)">
                <option value="recent" ${this.filters.sortBy === 'recent' ? 'selected' : ''}>Más recientes</option>
                <option value="price-asc" ${this.filters.sortBy === 'price-asc' ? 'selected' : ''}>Menor precio</option>
                <option value="price-desc" ${this.filters.sortBy === 'price-desc' ? 'selected' : ''}>Mayor precio</option>
                <option value="qty-desc" ${this.filters.sortBy === 'qty-desc' ? 'selected' : ''}>Mayor cantidad disponible</option>
              </select>
            </div>

            <div class="filter-group filter-checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" ${this.filters.quickExitOnly ? 'checked' : ''} onchange="App.setQuickExitFilter(this.checked)" />
                <span>⚡ Solo salida rápida</span>
              </label>
            </div>
          </div>

          <div class="filter-actions">
            <span class="results-count">${filtered.length} lote${filtered.length === 1 ? '' : 's'} disponible${filtered.length === 1 ? '' : 's'}</span>
            <button class="btn-text-danger" onclick="App.clearAllFilters()">Limpiar filtros</button>
          </div>
        </div>
      </div>

      <!-- Results Grid -->
      <div class="explore-results">
        ${filtered.length > 0 ? `
          <div class="lots-grid">
            ${filtered.map(l => UI.renderLotCard(l, favorites.includes(l.id), false)).join('')}
          </div>
        ` : UI.renderEmptyState(
          '🔍',
          'No se encontraron lotes',
          'No hay publicaciones que coincidan con los filtros seleccionados en este momento.',
          'Limpiar todos los filtros',
          'App.clearAllFilters'
        )}
      </div>
    `;
  },

  handleFilterQueryChange(val) {
    this.filters.query = val.trim();
    this.renderExploreView();
  },

  clearSearchQuery() {
    this.filters.query = '';
    this.renderExploreView();
  },

  setCategoryFilter(catId) {
    this.filters.category = catId;
    this.renderExploreView();
  },

  setZoneFilter(zone) {
    this.filters.zone = zone;
    this.renderExploreView();
  },

  setSellerTypeFilter(type) {
    this.filters.sellerType = type;
    this.renderExploreView();
  },

  setSortFilter(sort) {
    this.filters.sortBy = sort;
    this.renderExploreView();
  },

  setQuickExitFilter(checked) {
    this.filters.quickExitOnly = checked;
    this.renderExploreView();
  },

  clearAllFilters() {
    this.filters = {
      query: '',
      category: 'all',
      zone: 'all',
      sellerType: 'all',
      maxPrice: null,
      quickExitOnly: false,
      sortBy: 'recent'
    };
    this.activeCategory = 'all';
    this.renderExploreView();
    UI.showToast('Filtros restablecidos', 'info');
  },

  // --- View: Saved / Favorites (Guardados) ---
  renderSavedView() {
    const container = document.getElementById('view-guardados');
    if (!container) return;

    const favoriteIds = Storage.getFavorites();
    const allLots = Storage.getLots();
    const savedLots = allLots.filter(l => favoriteIds.includes(l.id) && l.status === 'active');

    container.innerHTML = `
      <div class="view-header">
        <h1 class="page-title">Lotes Guardados</h1>
        <p class="page-subtitle">Publicaciones que has marcado para seguimiento rápido</p>
      </div>

      <div class="saved-content">
        ${savedLots.length > 0 ? `
          <div class="lots-grid">
            ${savedLots.map(l => UI.renderLotCard(l, true, false)).join('')}
          </div>
        ` : UI.renderEmptyState(
          '❤️',
          'Aún no tienes lotes guardados',
          'Explora el marketplace y guarda los lotes que te interesen para acceder a ellos rápidamente.',
          'Explorar marketplace',
          "() => App.navigate('explorar')"
        )}
      </div>
    `;
  },

  // --- View: Buyer Activity ---
  renderBuyerActivityView() {
    const container = document.getElementById('view-actividad');
    if (!container) return;

    const contacts = Storage.getContacts();
    const favorites = Storage.getFavorites();

    container.innerHTML = `
      <div class="view-header">
        <h1 class="page-title">Tu Actividad de Comprador</h1>
        <p class="page-subtitle">Historial de intereses manifestados y contactos a vendedores</p>
      </div>

      <div class="activity-stats-row">
        <div class="stat-card">
          <div class="stat-num">${contacts.length}</div>
          <div class="stat-label">Contactos iniciados</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${favorites.length}</div>
          <div class="stat-label">Lotes en seguimiento</div>
        </div>
      </div>

      <div class="activity-section">
        <h2 class="activity-sub-title">Contactos recientes a vendedores</h2>
        ${contacts.length > 0 ? `
          <div class="contacts-list">
            ${contacts.map(c => `
              <div class="contact-item">
                <div class="contact-icon">💬</div>
                <div class="contact-info">
                  <div class="contact-prod">${c.productName}</div>
                  <div class="contact-meta">Interés: <strong>${c.quantity}</strong> • Recojo est.: <strong>${c.time || 'A coordinar'}</strong></div>
                  <div class="contact-date">${UI.formatDate(c.timestamp)}</div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : UI.renderEmptyState(
          '📋',
          'Sin actividad reciente',
          'Cuando presiones "Me interesa" en algún lote, verás el registro aquí.',
          'Ver ofertas disponibles',
          "() => App.navigate('explorar')"
        )}
      </div>
    `;
  },

  // --- View: Seller Management (Mis Lotes) ---
  renderMyLotsView(activeTab = 'all') {
    const container = document.getElementById('view-mis-lotes');
    if (!container) return;

    const stats = Storage.getSellerStats();
    let lotsToShow = stats.myLots;

    if (activeTab === 'active') lotsToShow = lotsToShow.filter(l => l.status === 'active');
    if (activeTab === 'sold') lotsToShow = lotsToShow.filter(l => l.status === 'sold');
    if (activeTab === 'retired') lotsToShow = lotsToShow.filter(l => l.status === 'retired');

    container.innerHTML = `
      <div class="seller-management-header">
        <div>
          <h1 class="page-title">Gestión de Mis Lotes</h1>
          <p class="page-subtitle">${stats.activeLotsCount} activos · ${stats.soldLotsCount} vendidos · ${stats.receivedContactsCount} contactos recibidos</p>
        </div>
        <button class="btn btn-primary btn-publish-cta" onclick="App.navigate('publicar')">
          + Publicar Nuevo Lote
        </button>
      </div>

      <!-- Status Tabs -->
      <div class="seller-tabs">
        <button class="tab-btn ${activeTab === 'all' ? 'active' : ''}" onclick="App.renderMyLotsView('all')">
          Todos (${stats.myLots.length})
        </button>
        <button class="tab-btn ${activeTab === 'active' ? 'active' : ''}" onclick="App.renderMyLotsView('active')">
          Activos (${stats.activeLotsCount})
        </button>
        <button class="tab-btn ${activeTab === 'sold' ? 'active' : ''}" onclick="App.renderMyLotsView('sold')">
          Vendidos (${stats.soldLotsCount})
        </button>
        <button class="tab-btn ${activeTab === 'retired' ? 'active' : ''}" onclick="App.renderMyLotsView('retired')">
          Retirados (${stats.myLots.filter(l => l.status === 'retired').length})
        </button>
      </div>

      <!-- Lots List -->
      <div class="seller-lots-list">
        ${lotsToShow.length > 0 ? `
          <div class="seller-lots-grid">
            ${lotsToShow.map(l => UI.renderSellerLotCard(l)).join('')}
          </div>
        ` : UI.renderEmptyState(
          '📦',
          'No tienes lotes en esta sección',
          'Publica un lote nuevo en menos de un minuto para conectar con compradores en Tarija.',
          'Publicar mi primer lote',
          "() => App.navigate('publicar')"
        )}
      </div>
    `;
  },

  // --- View: Seller Activity / Dashboard (Tu Actividad) ---
  renderSellerActivityView() {
    const container = document.getElementById('view-actividad');
    if (!container) return;

    const stats = Storage.getSellerStats();

    // Volume breakdown html
    const soldBreakdownEntries = Object.entries(stats.soldByProduct || {});
    const soldBreakdownHtml = soldBreakdownEntries.length > 0 ? `
      <div class="sold-breakdown-card">
        <h3 class="breakdown-title">📦 Productos Comercializados (Autodeclarado)</h3>
        <div class="breakdown-pills-wrap">
          ${soldBreakdownEntries.map(([prod, qty]) => `
            <span class="breakdown-pill"><strong>${prod}:</strong> ${qty} kg/uds</span>
          `).join('')}
        </div>
      </div>
    ` : '';

    container.innerHTML = `
      <div class="view-header">
        <h1 class="page-title">Tu Actividad de Vendedor</h1>
        <p class="page-subtitle">Rendimiento comercial y métricas locales de tus publicaciones en Tarija</p>
      </div>

      <!-- Top Summary Metrics -->
      <div class="seller-metrics-grid">
        <div class="metric-card metric-primary">
          <div class="metric-icon">📦</div>
          <div class="metric-value">${stats.activeLotsCount}</div>
          <div class="metric-label">Lotes Activos</div>
        </div>

        <div class="metric-card metric-accent">
          <div class="metric-icon">💬</div>
          <div class="metric-value">${stats.receivedContactsCount}</div>
          <div class="metric-label">Contactos Recibidos</div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">✓</div>
          <div class="metric-value">${stats.soldLotsCount}</div>
          <div class="metric-label">Lotes Vendidos</div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">⚖️</div>
          <div class="metric-value">${stats.totalSoldDeclared} <span class="metric-unit">kg/uds</span></div>
          <div class="metric-label">Volumen Total Declarado</div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">👁️</div>
          <div class="metric-value">${stats.totalViews}</div>
          <div class="metric-label">Vistas Totales</div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">❤️</div>
          <div class="metric-value">${stats.totalFavs}</div>
          <div class="metric-label">Favoritos Recibidos</div>
        </div>
      </div>

      ${soldBreakdownHtml}

      <!-- Performance Leaderboard: What works best -->
      <div class="activity-section" style="margin-bottom: 24px;">
        <h2 class="activity-sub-title">🏆 ¿Qué publicaciones funcionan mejor?</h2>
        <p class="section-desc" style="margin-bottom: 14px;">Ranking de tus lotes por volumen de contactos y vistas recibidas</p>
        
        ${stats.rankedLots.length > 0 ? `
          <div class="ranking-table-wrap">
            <table class="ranking-table">
              <thead>
                <tr>
                  <th>Lote</th>
                  <th>Estado</th>
                  <th>Vistas</th>
                  <th>Favoritos</th>
                  <th>Contactos</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                ${stats.rankedLots.map(l => `
                  <tr>
                    <td><strong>${l.product}</strong></td>
                    <td><span class="status-badge ${l.status === 'active' ? 'status-active' : 'status-sold'}">${l.status === 'active' ? 'Activo' : 'Vendido'}</span></td>
                    <td>👁️ ${l.viewsCount || 0}</td>
                    <td>❤️ ${l.favoritesCount || 0}</td>
                    <td><strong class="highlight-contacts">💬 ${l.contactsCount}</strong></td>
                    <td>
                      <button class="btn btn-sm btn-secondary" onclick="App.openLotDetail('${l.id}')">Ver</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : `<p class="empty-text">Aún no hay publicaciones suficientes para comparar rendimiento.</p>`}
      </div>

      <!-- Recent Buyer Inquiries -->
      <div class="activity-section">
        <h2 class="activity-sub-title">Intereses y Contactos Recientes de Compradores</h2>
        ${stats.recentContacts.length > 0 ? `
          <div class="contacts-list">
            ${stats.recentContacts.map(c => `
              <div class="contact-item">
                <div class="contact-icon">📲</div>
                <div class="contact-info">
                  <div class="contact-prod">${c.productName}</div>
                  <div class="contact-buyer">Comprador: <strong>${c.buyerName || 'Comprador de Tarija'}</strong></div>
                  <div class="contact-meta">Cantidad solicitada: <strong>${c.quantity}</strong> • Horario recojo: <strong>${c.time || 'Por definir'}</strong></div>
                  <div class="contact-date">${UI.formatDate(c.timestamp)}</div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : UI.renderEmptyState(
          '📊',
          'Sin contactos registrados aún',
          'Los compradores que manifiesten interés en tus lotes aparecerán reflejados aquí en tiempo real.',
          'Ver mis publicaciones',
          "() => App.navigate('mis-lotes')"
        )}
      </div>
    `;
  },

  // --- View: Publish / Edit Lot (Ultra-Fast Form) ---
  renderPublishView(editLotId = null) {
    const container = document.getElementById('view-publicar');
    if (!container) return;

    this.currentEditingLotId = editLotId;
    const defaults = Storage.getLastPublishDefaults();

    let lotData = {
      product: '',
      category: 'tuberculos',
      quantity: '',
      unit: defaults.unit || 'kg',
      price: '',
      priceModality: defaults.priceModality || 'Bs/kg',
      allowPartial: false,
      minPurchase: '',
      negotiable: false,
      quickExit: true,
      commercialReason: 'Salida rápida',
      commercialCondition: 'Tamaño / calibre mixto',
      location: defaults.location || 'Zona Mercado Campesino',
      locationRef: defaults.locationRef || '',
      pickupSchedule: defaults.pickupSchedule || '07:00 a 14:00 (Lunes a Sábado)',
      description: '',
      images: []
    };

    if (editLotId) {
      const existing = Storage.getLotById(editLotId);
      if (existing) {
        lotData = { ...lotData, ...existing };
        this.publishedImages = existing.images || [];
      }
    } else {
      this.publishedImages = [];
    }

    const zonesOptions = TARIJA_ZONES.map(z => `
      <option value="${z}" ${lotData.location === z ? 'selected' : ''}>${z}</option>
    `).join('');

    const unitsOptions = UNITS.map(u => `
      <option value="${u.id}" ${lotData.unit === u.id ? 'selected' : ''}>${u.name}</option>
    `).join('');

    const modalitiesOptions = PRICE_MODALITIES.map(m => `
      <option value="${m}" ${lotData.priceModality === m ? 'selected' : ''}>${m}</option>
    `).join('');

    const reasonsOptions = COMMERCIAL_REASONS.map(r => `
      <option value="${r}" ${lotData.commercialReason === r ? 'selected' : ''}>${r}</option>
    `).join('');

    const conditionsOptions = COMMERCIAL_CONDITIONS.map(c => `
      <option value="${c}" ${lotData.commercialCondition === c ? 'selected' : ''}>${c}</option>
    `).join('');

    // Quick presets buttons for 1-tap fill
    const presetsButtonsHtml = QUICK_PUBLISH_PRESETS.map(p => `
      <button type="button" class="preset-pill-btn" onclick="App.applyQuickPreset('${p.key}')">
        ${p.label}
      </button>
    `).join('');

    container.innerHTML = `
      <div class="publish-header">
        <h1 class="page-title">${editLotId ? 'Editar Lote Agrícola' : 'Publicar Lote Agrícola'}</h1>
        <p class="page-subtitle">Publicación ágil con guardado automático de tu ubicación y horario habitual en Tarija</p>
      </div>

      <!-- 1-Tap Quick Setup Presets -->
      ${!editLotId ? `
        <div class="quick-presets-box">
          <div class="quick-presets-header">
            <span class="flash-icon">⚡</span>
            <div>
              <strong>Llenado en 1 toque (Plantillas frecuentes):</strong>
              <div class="presets-sub">Toca cualquier producto para autocompletar precio, fotos y detalles:</div>
            </div>
          </div>
          <div class="presets-scroll">
            ${presetsButtonsHtml}
          </div>
        </div>
      ` : ''}

      <form id="publish-form" class="publish-form" onsubmit="App.handlePublishSubmit(event)">
        <!-- Step 1: Producto y Fotos -->
        <div class="form-section">
          <h2 class="form-section-title"><span class="step-num">1</span> Producto y Fotografías</h2>
          
          <div class="form-group">
            <label class="form-label" for="pub-product">Nombre del producto o lote <span class="required">*</span></label>
            <input type="text" id="pub-product" class="form-input" required 
                   placeholder="Ej: Papa Holandesa de Valle, Cebolla Roja en bolsa..." 
                   value="${lotData.product}" />
          </div>

          <div class="form-group">
            <label class="form-label" for="pub-category">Categoría <span class="required">*</span></label>
            <select id="pub-category" class="form-select">
              ${PRODUCT_CATEGORIES.filter(c => c.id !== 'all').map(c => `
                <option value="${c.id}" ${lotData.category === c.id ? 'selected' : ''}>${c.icon} ${c.name}</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Fotografías del lote (1 a 3 fotos) <span class="required">*</span></label>
            <p class="form-help">Selecciona fotos de tu dispositivo o usa las ilustraciones optimizadas.</p>
            
            <div class="photo-uploader">
              <input type="file" id="pub-file-input" accept="image/*" multiple style="display:none" onchange="App.handleImageUpload(event)" />
              <button type="button" class="btn btn-outline btn-upload" onclick="document.getElementById('pub-file-input').click()">
                📷 Cargar desde dispositivo
              </button>
              
              <div class="preset-photos-picker">
                <span class="preset-label">O fotos demo:</span>
                <button type="button" class="btn-preset" onclick="App.addPresetImage('papa')">🥔 Papa</button>
                <button type="button" class="btn-preset" onclick="App.addPresetImage('cebolla')">🧅 Cebolla</button>
                <button type="button" class="btn-preset" onclick="App.addPresetImage('zanahoria')">🥕 Zanahoria</button>
                <button type="button" class="btn-preset" onclick="App.addPresetImage('zapallo')">🎃 Zapallo</button>
                <button type="button" class="btn-preset" onclick="App.addPresetImage('naranja')">🍊 Naranja</button>
                <button type="button" class="btn-preset" onclick="App.addPresetImage('limon')">🍋 Limón</button>
              </div>

              <div id="photos-preview-container" class="photos-preview-grid">
                ${this.renderPhotosPreviewHtml()}
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Cantidad y Precio -->
        <div class="form-section">
          <h2 class="form-section-title"><span class="step-num">2</span> Cantidad y Precio</h2>
          
          <div class="form-row">
            <div class="form-group col-6">
              <label class="form-label" for="pub-quantity">Cantidad disponible <span class="required">*</span></label>
              <input type="number" id="pub-quantity" class="form-input" min="1" step="any" required 
                     placeholder="Ej: 100" value="${lotData.quantity}" />
            </div>
            <div class="form-group col-6">
              <label class="form-label" for="pub-unit">Unidad <span class="required">*</span></label>
              <select id="pub-unit" class="form-select">
                ${unitsOptions}
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group col-6">
              <label class="form-label" for="pub-price">Precio (Bs) <span class="required">*</span></label>
              <input type="number" id="pub-price" class="form-input" min="0.1" step="any" required 
                     placeholder="Ej: 3.50" value="${lotData.price}" />
            </div>
            <div class="form-group col-6">
              <label class="form-label" for="pub-modality">Modalidad del precio <span class="required">*</span></label>
              <select id="pub-modality" class="form-select">
                ${modalitiesOptions}
              </select>
            </div>
          </div>

          <!-- Partial Sale Toggle -->
          <div class="toggle-box">
            <label class="switch-label">
              <input type="checkbox" id="pub-allow-partial" ${lotData.allowPartial ? 'checked' : ''} onchange="App.togglePartialSaleUI(this.checked)" />
              <span class="switch-text"><strong>Permitir venta parcial</strong> (vender fracciones del lote)</span>
            </label>

            <div id="min-purchase-wrap" class="form-group" style="${lotData.allowPartial ? '' : 'display:none;'} margin-top: 12px;">
              <label class="form-label" for="pub-min-purchase">Compra mínima requerida</label>
              <input type="number" id="pub-min-purchase" class="form-input" min="1" placeholder="Ej: 10" value="${lotData.minPurchase || ''}" />
            </div>
          </div>

          <!-- Negotiable Toggle -->
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="pub-negotiable" ${lotData.negotiable ? 'checked' : ''} />
              <span>Precio negociable por volumen o prontitud</span>
            </label>
          </div>
        </div>

        <!-- Step 3: Ubicación y Recojo en Tarija -->
        <div class="form-section">
          <h2 class="form-section-title"><span class="step-num">3</span> Ubicación y Horario de Recojo</h2>
          
          <div class="form-group">
            <label class="form-label" for="pub-zone">Zona en Tarija <span class="required">*</span></label>
            <select id="pub-zone" class="form-select">
              ${zonesOptions}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="pub-ref">Referencia para encontrar el lugar</label>
            <input type="text" id="pub-ref" class="form-input" 
                   placeholder="Ej: Tinglado verde puesto 12, frente a la plazuela..." 
                   value="${lotData.locationRef || ''}" />
          </div>

          <div class="form-group">
            <label class="form-label" for="pub-schedule">Horario disponible de recojo <span class="required">*</span></label>
            <input type="text" id="pub-schedule" class="form-input" required 
                   placeholder="Ej: 07:00 a 14:00 (Lunes a Sábado)" 
                   value="${lotData.pickupSchedule}" />
          </div>
        </div>

        <!-- Step 4: Motivo comercial y Detalles -->
        <div class="form-section">
          <h2 class="form-section-title"><span class="step-num">4</span> Motivo Comercial y Descripción</h2>
          
          <div class="form-group">
            <label class="form-label" for="pub-reason">Motivo comercial de la oferta</label>
            <select id="pub-reason" class="form-select">
              ${reasonsOptions}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="pub-condition">Estado comercial declarado</label>
            <select id="pub-condition" class="form-select">
              ${conditionsOptions}
            </select>
            <p class="form-help">Nota: BuenAprovecho facilita el contacto entre las partes. La información y condición declarada del producto es responsabilidad del vendedor.</p>
          </div>

          <div class="form-group">
            <label class="form-label" for="pub-desc">Descripción breve (opcional)</label>
            <textarea id="pub-desc" class="form-textarea" rows="3" 
                      placeholder="Indica detalles útiles sobre el sabor, punto de maduración o condiciones...">${lotData.description || ''}</textarea>
          </div>
        </div>

        <!-- Actions -->
        <div class="form-actions-bar">
          <button type="button" class="btn btn-secondary" onclick="App.navigate('mis-lotes')">Cancelar</button>
          <button type="submit" class="btn btn-primary btn-submit-large">
            ${editLotId ? 'Guardar Cambios' : 'Publicar Lote Ahora'}
          </button>
        </div>
      </form>
    `;
  },

  applyQuickPreset(presetKey) {
    const preset = QUICK_PUBLISH_PRESETS.find(p => p.key === presetKey);
    if (!preset) return;

    const prodInput = document.getElementById('pub-product');
    const catSelect = document.getElementById('pub-category');
    const qtyInput = document.getElementById('pub-quantity');
    const unitSelect = document.getElementById('pub-unit');
    const priceInput = document.getElementById('pub-price');
    const modSelect = document.getElementById('pub-modality');
    const allowPartialCheck = document.getElementById('pub-allow-partial');
    const minPurchaseInput = document.getElementById('pub-min-purchase');
    const reasonSelect = document.getElementById('pub-reason');
    const condSelect = document.getElementById('pub-condition');
    const descText = document.getElementById('pub-desc');

    if (prodInput) prodInput.value = preset.product;
    if (catSelect) catSelect.value = preset.category;
    if (qtyInput) qtyInput.value = preset.quantity;
    if (unitSelect) unitSelect.value = preset.unit;
    if (priceInput) priceInput.value = preset.price;
    if (modSelect) modSelect.value = preset.priceModality;
    if (allowPartialCheck) {
      allowPartialCheck.checked = preset.allowPartial;
      this.togglePartialSaleUI(preset.allowPartial);
    }
    if (minPurchaseInput && preset.minPurchase) minPurchaseInput.value = preset.minPurchase;
    if (reasonSelect) reasonSelect.value = preset.commercialReason;
    if (condSelect) condSelect.value = preset.commercialCondition;
    if (descText) descText.value = preset.description;

    // Apply preset artwork
    if (preset.imageKey && PRODUCT_ART[preset.imageKey]) {
      this.publishedImages = [PRODUCT_ART[preset.imageKey]];
      const preview = document.getElementById('photos-preview-container');
      if (preview) preview.innerHTML = this.renderPhotosPreviewHtml();
    }

    UI.showToast(`Plantilla de ${preset.label} aplicada con éxito`, 'success', 2500);
  },

  renderPhotosPreviewHtml() {
    if (!this.publishedImages || this.publishedImages.length === 0) {
      return `<div class="no-photos-msg">Debes tener al menos 1 fotografía.</div>`;
    }

    return this.publishedImages.map((img, idx) => `
      <div class="preview-item">
        <img class="preview-thumb" ${UI.getImgAttrs(img, 'Foto ' + (idx + 1))} />
        <button type="button" class="btn-remove-photo" aria-label="Eliminar foto" onclick="App.removePublishedImage(${idx})">&times;</button>
      </div>
    `).join('');
  },

  async handleImageUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      if (this.publishedImages.length >= 3) {
        UI.showToast('Máximo 3 fotografías por lote', 'warning');
        break;
      }
      try {
        const compressed = await UI.compressImage(files[i]);
        this.publishedImages.push(compressed);
      } catch (err) {
        console.error('Error compressing image', err);
      }
    }

    const container = document.getElementById('photos-preview-container');
    if (container) container.innerHTML = this.renderPhotosPreviewHtml();
  },

  addPresetImage(presetKey) {
    if (this.publishedImages.length >= 3) {
      UI.showToast('Máximo 3 fotografías por lote', 'warning');
      return;
    }
    const art = PRODUCT_ART[presetKey];
    if (art) {
      this.publishedImages.push(art);
      const container = document.getElementById('photos-preview-container');
      if (container) container.innerHTML = this.renderPhotosPreviewHtml();
    }
  },

  removePublishedImage(index) {
    this.publishedImages.splice(index, 1);
    const container = document.getElementById('photos-preview-container');
    if (container) container.innerHTML = this.renderPhotosPreviewHtml();
  },

  togglePartialSaleUI(checked) {
    const wrap = document.getElementById('min-purchase-wrap');
    if (wrap) wrap.style.display = checked ? 'block' : 'none';
  },

  handlePublishSubmit(event) {
    event.preventDefault();

    if (!this.publishedImages || this.publishedImages.length === 0) {
      UI.showToast('Por favor incluye al menos 1 fotografía para el lote', 'error');
      return;
    }

    const profile = Storage.getProfile();
    const product = document.getElementById('pub-product').value.trim();
    const category = document.getElementById('pub-category').value;
    const quantity = parseFloat(document.getElementById('pub-quantity').value);
    const unit = document.getElementById('pub-unit').value;
    const price = parseFloat(document.getElementById('pub-price').value);
    const priceModality = document.getElementById('pub-modality').value;
    const allowPartial = document.getElementById('pub-allow-partial').checked;
    const minPurchase = allowPartial ? parseFloat(document.getElementById('pub-min-purchase').value || 1) : null;
    const negotiable = document.getElementById('pub-negotiable').checked;
    const location = document.getElementById('pub-zone').value;
    const locationRef = document.getElementById('pub-ref').value.trim();
    const pickupSchedule = document.getElementById('pub-schedule').value.trim();
    const commercialReason = document.getElementById('pub-reason').value;
    const commercialCondition = document.getElementById('pub-condition').value;
    const description = document.getElementById('pub-desc').value.trim();

    const lotPayload = {
      product,
      category,
      quantity,
      unit,
      price,
      priceModality,
      allowPartial,
      minPurchase,
      negotiable,
      quickExit: commercialReason === 'Salida rápida',
      commercialReason,
      commercialCondition,
      location,
      locationRef,
      pickupSchedule,
      description,
      images: this.publishedImages,
      sellerName: profile.businessName || profile.name,
      sellerType: profile.sellerType || 'Mayorista / Distribuidor',
      sellerPhone: profile.phone || '+59172981234',
      sellerRating: 4.9,
      sellerReviewsCount: 1
    };

    if (this.currentEditingLotId) {
      lotPayload.id = this.currentEditingLotId;
    }

    Storage.saveLot(lotPayload);

    UI.showToast(this.currentEditingLotId ? 'Lote actualizado correctamente' : '¡Lote publicado con éxito en Tarija!');
    this.publishedImages = [];
    this.currentEditingLotId = null;
    this.navigate('mis-lotes');
  },

  openEditLot(lotId) {
    this.navigate('publicar');
    this.renderPublishView(lotId);
  },

  duplicateLot(lotId) {
    const dup = Storage.duplicateLot(lotId);
    if (dup) {
      UI.showToast('Lote duplicado como borrador activo');
      this.renderMyLotsView();
    }
  },

  republishLot(lotId) {
    const rep = Storage.republishLot(lotId);
    if (rep) {
      UI.showToast('Lote reactivado y vuelto a publicar');
      this.renderMyLotsView();
    }
  },

  retireLot(lotId) {
    if (confirm('¿Deseas retirar temporalmente esta publicación? Podrás republicarla cuando quieras.')) {
      Storage.updateLotStatus(lotId, 'retired');
      UI.showToast('Lote marcado como retirado', 'info');
      this.renderMyLotsView();
    }
  },

  deleteLot(lotId) {
    if (confirm('¿Eliminar definitivamente este lote?')) {
      Storage.deleteLot(lotId);
      UI.showToast('Lote eliminado');
      this.renderMyLotsView();
    }
  },

  // --- View: Profile (Perfil) ---
  renderProfileView() {
    const container = document.getElementById('view-perfil');
    if (!container) return;

    const profile = Storage.getProfile();
    const labSettings = Storage.getLabSettings();
    const isSeller = profile.activeRole === 'seller';

    const interestCheckboxes = PRODUCT_INTEREST_OPTIONS.map(item => `
      <label class="interest-chip ${profile.interests.includes(item) ? 'selected' : ''}">
        <input type="checkbox" value="${item}" ${profile.interests.includes(item) ? 'checked' : ''} onchange="App.handleInterestToggle('${item}', this.checked)" />
        <span>${item}</span>
      </label>
    `).join('');

    container.innerHTML = `
      <div class="view-header">
        <h1 class="page-title">Perfil y Configuración</h1>
        <p class="page-subtitle">Gestiona tu identidad simulada, intereses y modo de uso en Tarija</p>
      </div>

      <!-- Mode Switcher Banner -->
      <div class="profile-mode-card">
        <div class="mode-info">
          <div class="mode-title">Estás en: <strong>${isSeller ? 'Modo Vendedor' : 'Modo Comprador'}</strong></div>
          <p class="mode-desc">${isSeller ? 'Publicas y gestionas tus lotes agrícolas.' : 'Exploras y contactas por lotes convenientes.'}</p>
        </div>
        <button class="btn btn-primary" onclick="App.toggleUserRole()">
          Cambiar a Modo ${isSeller ? 'Comprador' : 'Vendedor'}
        </button>
      </div>

      <!-- User Information Form (Simulated) -->
      <div class="profile-card">
        <h2 class="card-section-title">Datos Básicos del Usuario</h2>
        <form onsubmit="App.handleProfileSave(event)">
          <div class="form-row">
            <div class="form-group col-6">
              <label class="form-label" for="prof-name">Nombre y Apellidos</label>
              <input type="text" id="prof-name" class="form-input" value="${profile.name}" required />
            </div>
            <div class="form-group col-6">
              <label class="form-label" for="prof-business">Nombre del negocio (opcional)</label>
              <input type="text" id="prof-business" class="form-input" value="${profile.businessName || ''}" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group col-6">
              <label class="form-label" for="prof-phone">Teléfono / WhatsApp simulado</label>
              <input type="text" id="prof-phone" class="form-input" value="${profile.phone}" required />
            </div>
            <div class="form-group col-6">
              <label class="form-label" for="prof-zone">Zona habitual en Tarija</label>
              <select id="prof-zone" class="form-select">
                ${TARIJA_ZONES.map(z => `<option value="${z}" ${profile.zone === z ? 'selected' : ''}>${z}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group col-6">
              <label class="form-label" for="prof-ref">Breve referencia de ubicación</label>
              <input type="text" id="prof-ref" class="form-input" value="${profile.locationRef || ''}" />
            </div>
            <div class="form-group col-6">
              <label class="form-label" for="prof-schedule">Horario habitual de atención</label>
              <input type="text" id="prof-schedule" class="form-input" value="${profile.habitualSchedule || '07:00 a 14:00 (Lunes a Sábado)'}" />
            </div>
          </div>

          <button type="submit" class="btn btn-secondary">Guardar datos del perfil</button>
        </form>
      </div>

      <!-- Interests Section -->
      <div class="profile-card">
        <h2 class="card-section-title">Tus Intereses de Compra</h2>
        <p class="card-section-desc">Selecciona los productos que sueles comprar para alimentar las sugerencias y avisos:</p>
        <div class="interests-grid">
          ${interestCheckboxes}
        </div>
      </div>

      <!-- Monetization Demonstration Plans -->
      <div class="profile-card">
        <h2 class="card-section-title">Planes y Membresías (Demostrativo)</h2>
        <p class="card-section-desc"><span class="badge badge-warning">Precio piloto por validar</span></p>

        <div class="plans-grid">
          <div class="plan-card">
            <div class="plan-badge">Actual</div>
            <h3 class="plan-name">Básico</h3>
            <div class="plan-price">Gratuito</div>
            <ul class="plan-features">
              <li>✓ Funcionalidades esenciales de publicación</li>
              <li>✓ Presencia en Marketplace Tarija</li>
              <li>✓ Contacto directo vía WhatsApp</li>
            </ul>
          </div>

          <div class="plan-card plan-card-pro">
            <div class="plan-badge-pro">Piloto Pro</div>
            <h3 class="plan-name">BuenAprovecho Pro</h3>
            <div class="plan-price">Bs 49 <span class="plan-period">/mes (Por validar)</span></div>
            <ul class="plan-features">
              <li>✓ Mayor cantidad de publicaciones simultáneas</li>
              <li>✓ Posibilidad de destacar lotes prioritarios</li>
              <li>✓ Estadísticas de demanda y contactos</li>
              <li>✓ Herramientas futuras de visibilidad</li>
            </ul>
            <button class="btn btn-primary btn-sm" onclick="App.openPlansValidationModal()">Consultar plan piloto</button>
          </div>
        </div>
      </div>

      <!-- Beta Lab Hypotheses Toggles -->
      <div class="profile-card lab-card">
        <h2 class="card-section-title">🧪 Laboratorio Beta / Hipótesis MVP</h2>
        <p class="card-section-desc">Activa o desactiva funciones demostrativas para validar las diferentes hipótesis del modelo:</p>
        
        <div class="lab-toggles-list">
          <label class="lab-toggle-item">
            <input type="checkbox" ${labSettings.showCommercialCondition ? 'checked' : ''} onchange="App.handleLabToggle('showCommercialCondition', this.checked)" />
            <div>
              <strong>Mostrar estado comercial declarado</strong>
              <div class="lab-item-desc">Muestra detalles como 'calibre mixto' o 'forma irregular' sin certificar inocuidad.</div>
            </div>
          </label>

          <label class="lab-toggle-item">
            <input type="checkbox" ${labSettings.showSimulatedMap ? 'checked' : ''} onchange="App.handleLabToggle('showSimulatedMap', this.checked)" />
            <div>
              <strong>Mostrar mapa demostrativo</strong>
              <div class="lab-item-desc">Habilita la simulación visual interactiva de zonas de Tarija.</div>
            </div>
          </label>

          <label class="lab-toggle-item">
            <input type="checkbox" ${labSettings.showInterestSuggestions ? 'checked' : ''} onchange="App.handleLabToggle('showInterestSuggestions', this.checked)" />
            <div>
              <strong>Mostrar sugerencias según intereses</strong>
              <div class="lab-item-desc">Sección 'Para ti' en el inicio según tus preferencias guardadas.</div>
            </div>
          </label>

          <label class="lab-toggle-item">
            <input type="checkbox" ${labSettings.showMonetizationToggles ? 'checked' : ''} onchange="App.handleLabToggle('showMonetizationToggles', this.checked)" />
            <div>
              <strong>Mostrar opciones de monetización</strong>
              <div class="lab-item-desc">Habilita botones para destacar lotes y comparativas de planes.</div>
            </div>
          </label>
        </div>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
          <button class="btn btn-danger-outline btn-sm" onclick="App.handleResetDemo()">
            ↺ Restablecer datos demostrativos iniciales
          </button>
        </div>
      </div>
    `;
  },

  handleInterestToggle(item, checked) {
    const profile = Storage.getProfile();
    let interests = profile.interests || [];
    if (checked) {
      if (!interests.includes(item)) interests.push(item);
    } else {
      interests = interests.filter(i => i !== item);
    }
    Storage.saveProfile({ interests });
    UI.showToast(`Intereses actualizados: ${interests.length} seleccionados`, 'info', 2000);
    this.updateAlertsBadge();
  },

  handleProfileSave(event) {
    event.preventDefault();
    const name = document.getElementById('prof-name').value.trim();
    const businessName = document.getElementById('prof-business').value.trim();
    const phone = document.getElementById('prof-phone').value.trim();
    const zone = document.getElementById('prof-zone').value;
    const locationRef = document.getElementById('prof-ref').value.trim();
    const habitualSchedule = document.getElementById('prof-schedule').value.trim();

    Storage.saveProfile({ name, businessName, phone, zone, locationRef, habitualSchedule });
    UI.showToast('Datos del perfil guardados');
  },

  handleLabToggle(settingKey, checked) {
    const settings = Storage.getLabSettings();
    settings[settingKey] = checked;
    Storage.saveLabSettings(settings);
    UI.showToast('Configuración del Laboratorio guardada', 'info');
  },

  handleResetDemo() {
    if (confirm('¿Deseas restablecer todos los lotes, contactos y datos demostrativos a los valores originales?')) {
      Storage.resetDemoData();
      UI.showToast('Datos demostrativos restablecidos');
      this.navigate('inicio');
    }
  },

  // --- Modal: Lot Detail ---
  openLotDetail(lotId) {
    const lot = Storage.getLotById(lotId);
    if (!lot) return;

    this.currentLotInDetail = lot;
    Storage.incrementView(lotId);
    const isFav = Storage.isFavorite(lotId);
    const mainImg = (lot.images && lot.images.length > 0) ? lot.images[0] : PRODUCT_ART.papa;

    const modal = document.getElementById('modal-lot-detail');
    const content = document.getElementById('lot-detail-body');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="lot-detail-layout">
        <!-- Media Gallery -->
        <div class="lot-detail-gallery">
          <div class="main-image-wrap">
            <img id="detail-main-image" class="detail-hero-img" ${UI.getImgAttrs(mainImg, lot.product)} />
            <div class="detail-badges">
              ${(lot.quickExit || lot.commercialReason === 'Salida rápida') ? `<span class="badge badge-urgent"><span class="badge-dot"></span> Salida rápida</span>` : ''}
              ${lot.isFeatured ? `<span class="badge badge-featured">★ Destacado</span>` : ''}
            </div>
          </div>

          ${lot.images && lot.images.length > 1 ? `
            <div class="detail-thumbs-strip">
              ${lot.images.map((img, idx) => `
                <img class="thumb-strip-item ${idx === 0 ? 'active' : ''}" 
                     ${UI.getImgAttrs(img, lot.product + ' foto ' + (idx+1))}
                     onclick="App.switchDetailMainImage('${img}', this)" />
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Details Info -->
        <div class="lot-detail-info">
          <div class="detail-header">
            <span class="detail-category-tag">${UI.getCategoryIcon(lot.category)} ${lot.commercialReason || 'Oportunidad'}</span>
            <h2 class="detail-title">${lot.product}</h2>
            <div class="detail-price-row">
              <div class="detail-price">${UI.formatPrice(lot.price, lot.priceModality)}</div>
              ${lot.negotiable ? `<span class="badge-negotiable">Precio negociable</span>` : ''}
            </div>
          </div>

          <!-- Availability Box -->
          <div class="availability-card">
            <div class="avail-row">
              <span class="avail-label">📦 Cantidad disponible:</span>
              <span class="avail-val"><strong>${lot.quantity} ${lot.unit}</strong></span>
            </div>
            ${lot.allowPartial ? `
              <div class="avail-row">
                <span class="avail-label">⚖️ Compra mínima:</span>
                <span class="avail-val">${lot.minPurchase || 1} ${lot.unit}</span>
              </div>
              <div class="avail-row">
                <span class="avail-label">🔄 Modalidad:</span>
                <span class="avail-val">Venta parcial permitida</span>
              </div>
            ` : `
              <div class="avail-row">
                <span class="avail-label">🔄 Modalidad:</span>
                <span class="avail-val">Venta de lote completo</span>
              </div>
            `}
          </div>

          <!-- Reason & Description -->
          <div class="detail-section">
            <h4 class="detail-subhead">Motivo Comercial & Estado</h4>
            <p class="commercial-note"><strong>${lot.commercialReason || 'Salida rápida'}:</strong> ${lot.commercialCondition || 'Producto en condiciones óptimas para aprovechamiento comercial.'}</p>
            ${lot.description ? `<p class="detail-desc-text">${lot.description}</p>` : ''}
          </div>

          <!-- Location & Schedule -->
          <div class="detail-section">
            <h4 class="detail-subhead">Ubicación y Horario de Recojo (Tarija)</h4>
            <div class="location-box">
              <div class="loc-item">
                <span class="loc-icon">📍</span>
                <div>
                  <strong>${lot.location}</strong>
                  ${lot.locationRef ? `<div class="loc-ref">${lot.locationRef}</div>` : ''}
                </div>
              </div>
              <div class="loc-item">
                <span class="loc-icon">⏰</span>
                <div>
                  <strong>Horario de recojo:</strong>
                  <div>${lot.pickupSchedule}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Seller Info -->
          <div class="detail-section seller-card-box">
            <div class="seller-header-flex">
              <div>
                <span class="seller-chip-type">${lot.sellerType}</span>
                <h4 class="seller-box-name">${lot.sellerName}</h4>
                <div class="seller-rating">★ ${lot.sellerRating || 4.8} (${lot.sellerReviewsCount || 10} operaciones en Tarija)</div>
              </div>
            </div>
          </div>

          <!-- Discreet Responsibility Notice -->
          <p class="platform-disclaimer">BuenAprovecho facilita el contacto entre las partes. La información y condición declarada del producto es responsabilidad del vendedor.</p>

          <!-- Action Buttons -->
          <div class="detail-actions-footer">
            <button class="btn btn-primary btn-cta-interest" onclick="App.openInterestModal('${lot.id}')">
              💬 Me interesa
            </button>
            <button class="btn btn-fav-detail ${isFav ? 'active' : ''}" onclick="App.handleToggleFavorite('${lot.id}', this)">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="${isFav ? '#e06d3b' : 'none'}" stroke="${isFav ? '#e06d3b' : 'currentColor'}" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span>${isFav ? 'Guardado' : 'Guardar'}</span>
            </button>
            <button class="btn btn-outline" onclick="App.openReportModal('${lot.id}')">
              🚩 Reportar
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  switchDetailMainImage(imgUrl, thumbEl) {
    const mainImg = document.getElementById('detail-main-image');
    if (mainImg) mainImg.src = imgUrl;

    document.querySelectorAll('.thumb-strip-item').forEach(el => el.classList.remove('active'));
    if (thumbEl) thumbEl.classList.add('active');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  },

  // --- Favorite Toggle Handler ---
  handleToggleFavorite(lotId, btnElement) {
    const res = Storage.toggleFavorite(lotId);
    if (btnElement) {
      if (res.isFavorite) {
        btnElement.classList.add('active');
        btnElement.setAttribute('aria-label', 'Quitar de favoritos');
      } else {
        btnElement.classList.remove('active');
        btnElement.setAttribute('aria-label', 'Guardar en favoritos');
      }
    }
    UI.showToast(res.isFavorite ? 'Lote guardado en tus favoritos' : 'Lote quitado de favoritos', 'info', 2000);
    this.updateAlertsBadge();
    if (this.currentView === 'guardados') {
      this.renderSavedView();
    }
  },

  // --- Modal: "Me interesa" (WhatsApp flow) ---
  openInterestModal(lotId) {
    const lot = Storage.getLotById(lotId);
    if (!lot) return;

    this.currentLotInDetail = lot;
    const modal = document.getElementById('modal-interest');
    const content = document.getElementById('interest-modal-body');
    if (!modal || !content) return;

    const defaultQty = lot.allowPartial && lot.minPurchase ? `${lot.minPurchase} ${lot.unit}` : `${lot.quantity} ${lot.unit}`;

    content.innerHTML = `
      <div class="interest-flow">
        <h2 class="modal-title">Manifestar Interés en el Lote</h2>
        <p class="modal-subtitle">${lot.product} • <strong>${lot.sellerName}</strong></p>

        <div class="form-group">
          <label class="form-label" for="int-quantity">Cantidad deseada</label>
          <input type="text" id="int-quantity" class="form-input" value="${defaultQty}" placeholder="Ej: 20 ${lot.unit}..." />
        </div>

        <div class="form-group">
          <label class="form-label" for="int-time">Horario aproximado de recojo</label>
          <input type="text" id="int-time" class="form-input" placeholder="Ej: Hoy a las 11:30 am, mañana temprano..." value="Hoy dentro del horario de recojo" />
        </div>

        <div class="whatsapp-preview-box">
          <div class="wa-header">
            <span class="wa-icon">💬</span>
            <span>Mensaje que se enviará al vendedor vía WhatsApp:</span>
          </div>
          <div id="wa-preview-text" class="wa-text-body">
            Hola, vi tu lote de "${lot.product}" en BuenAprovecho Tarija. Me interesan ${defaultQty}. ¿Sigue disponible para coordinar recojo?
          </div>
        </div>

        <div class="modal-actions-stacked">
          <button class="btn btn-whatsapp" onclick="App.proceedToWhatsApp()">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"></path></svg>
            Contactar por WhatsApp
          </button>

          <button class="btn btn-secondary" onclick="App.copyInterestMessage()">
            📋 Copiar mensaje prellenado
          </button>

          <button class="btn btn-text" onclick="App.closeModal('modal-interest')">
            Cancelar
          </button>
        </div>
      </div>
    `;

    modal.classList.add('active');
  },

  proceedToWhatsApp() {
    const lot = this.currentLotInDetail;
    if (!lot) return;

    const qty = document.getElementById('int-quantity')?.value.trim() || `${lot.quantity} ${lot.unit}`;
    const time = document.getElementById('int-time')?.value.trim() || 'Horario a coordinar';
    const profile = Storage.getProfile();

    const text = `Hola, vi tu lote de "${lot.product}" en BuenAprovecho Tarija. Me interesan ${qty} y podría pasar (${time}). ¿Sigue disponible?`;

    // Record contact in localStorage for seller metrics
    Storage.recordContact({
      lotId: lot.id,
      productName: lot.product,
      buyerName: profile.name || 'Comprador Tarija',
      quantity: qty,
      time: time
    });

    const phoneSanitized = (lot.sellerPhone || '+59172981234').replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${phoneSanitized}?text=${encodeURIComponent(text)}`;

    UI.showToast('Abriendo WhatsApp y registrando contacto...', 'success');
    window.open(waUrl, '_blank');
    this.closeModal('modal-interest');
    this.closeModal('modal-lot-detail');
  },

  copyInterestMessage() {
    const lot = this.currentLotInDetail;
    if (!lot) return;

    const qty = document.getElementById('int-quantity')?.value.trim() || `${lot.quantity} ${lot.unit}`;
    const time = document.getElementById('int-time')?.value.trim() || 'Horario a coordinar';
    const profile = Storage.getProfile();

    const text = `Hola, vi tu lote de "${lot.product}" en BuenAprovecho Tarija. Me interesan ${qty} y podría pasar (${time}). ¿Sigue disponible?`;

    // Record contact
    Storage.recordContact({
      lotId: lot.id,
      productName: lot.product,
      buyerName: profile.name || 'Comprador Tarija',
      quantity: qty,
      time: time
    });

    navigator.clipboard.writeText(text).then(() => {
      UI.showToast('Mensaje copiado al portapapeles');
    }).catch(() => {
      UI.showToast('Interés registrado con éxito');
    });

    this.closeModal('modal-interest');
  },

  // --- Modal: Mark as Sold ---
  openMarkAsSoldModal(lotId) {
    const lot = Storage.getLotById(lotId);
    if (!lot) return;

    this.currentLotInSoldModal = lot;
    const modal = document.getElementById('modal-mark-sold');
    const content = document.getElementById('mark-sold-body');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="sold-flow">
        <h2 class="modal-title">Marcar Lote como Vendido</h2>
        <p class="modal-subtitle">${lot.product}</p>

        <div class="form-group">
          <label class="form-label" for="sold-qty-input">¿Cuántos ${lot.unit} lograste vender? (Opcional)</label>
          <input type="number" id="sold-qty-input" class="form-input" value="${lot.quantity}" min="1" step="any" placeholder="Ej: ${lot.quantity}" />
          <p class="form-help">Dato autodeclarado para tu registro comercial y estadísticas.</p>
        </div>

        <div class="demo-rating-box">
          <div class="rating-label">Autoevaluación de la operación (Demostración):</div>
          <div class="stars-picker">
            <button type="button" class="star-btn active" onclick="App.selectRatingStar(1)">★</button>
            <button type="button" class="star-btn active" onclick="App.selectRatingStar(2)">★</button>
            <button type="button" class="star-btn active" onclick="App.selectRatingStar(3)">★</button>
            <button type="button" class="star-btn active" onclick="App.selectRatingStar(4)">★</button>
            <button type="button" class="star-btn active" onclick="App.selectRatingStar(5)">★</button>
          </div>
          <p class="rating-criteria">Criterios: Coincidencia de lote, puntualidad y buena atención.</p>
        </div>

        <div class="modal-actions-bar">
          <button class="btn btn-secondary" onclick="App.closeModal('modal-mark-sold')">Cancelar</button>
          <button class="btn btn-primary" onclick="App.confirmMarkAsSold()">Confirmar Venta</button>
        </div>
      </div>
    `;

    modal.classList.add('active');
  },

  selectRatingStar(count) {
    document.querySelectorAll('.star-btn').forEach((btn, idx) => {
      if (idx < count) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  },

  confirmMarkAsSold() {
    const lot = this.currentLotInSoldModal;
    if (!lot) return;

    const soldQty = document.getElementById('sold-qty-input')?.value || lot.quantity;
    Storage.updateLotStatus(lot.id, 'sold', soldQty);

    Storage.addReview({
      lotId: lot.id,
      product: lot.product,
      rating: 5,
      note: 'Venta completada satisfactoriamente en Tarija'
    });

    UI.showToast(`¡Lote marcado como vendido! Registrado: ${soldQty} ${lot.unit}`);
    this.closeModal('modal-mark-sold');
    this.renderMyLotsView();
  },

  // --- Modal: Report Lot ---
  openReportModal(lotId) {
    const lot = Storage.getLotById(lotId);
    if (!lot) return;

    const modal = document.getElementById('modal-report');
    const content = document.getElementById('report-modal-body');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="report-flow">
        <h2 class="modal-title">Reportar Publicación</h2>
        <p class="modal-subtitle">${lot.product}</p>

        <div class="form-group">
          <label class="form-label">Selecciona el motivo del reporte:</label>
          <div class="report-reasons-list">
            <label class="radio-label"><input type="radio" name="report-reason" value="información incorrecta" checked /> Información incorrecta</label>
            <label class="radio-label"><input type="radio" name="report-reason" value="producto diferente" /> Producto diferente al anunciado</label>
            <label class="radio-label"><input type="radio" name="report-reason" value="cantidad incorrecta" /> Cantidad o precio incorrecto</label>
            <label class="radio-label"><input type="radio" name="report-reason" value="vendedor no disponible" /> Vendedor no disponible / número inactivo</label>
            <label class="radio-label"><input type="radio" name="report-reason" value="publicación sospechosa" /> Publicación sospechosa</label>
            <label class="radio-label"><input type="radio" name="report-reason" value="otro" /> Otro motivo</label>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="report-comments">Detalles adicionales (opcional)</label>
          <textarea id="report-comments" class="form-textarea" rows="2" placeholder="Explica brevemente lo ocurrido..."></textarea>
        </div>

        <div class="modal-actions-bar">
          <button class="btn btn-secondary" onclick="App.closeModal('modal-report')">Cancelar</button>
          <button class="btn btn-danger" onclick="App.submitReport('${lot.id}')">Enviar Reporte</button>
        </div>
      </div>
    `;

    modal.classList.add('active');
  },

  submitReport(lotId) {
    const selected = document.querySelector('input[name="report-reason"]:checked')?.value || 'otro';
    const comments = document.getElementById('report-comments')?.value || '';

    Storage.addReport({
      lotId,
      reason: selected,
      comments
    });

    UI.showToast('Reporte registrado para revisión en el piloto', 'info');
    this.closeModal('modal-report');
  },

  // --- Modal: Feature Lot (Destacar Lote / Monetization Demo) ---
  openFeaturedModal(lotId) {
    const lot = Storage.getLotById(lotId);
    if (!lot) return;

    const modal = document.getElementById('modal-featured');
    const content = document.getElementById('featured-modal-body');
    if (!modal || !content) return;

    const isCurrentlyFeat = lot.isFeatured;

    content.innerHTML = `
      <div class="featured-flow">
        <div class="featured-icon">★</div>
        <h2 class="modal-title">${isCurrentlyFeat ? 'Lote Actualmente Destacado' : 'Destacar Lote en Tarija'}</h2>
        <div class="badge badge-warning">Función en validación</div>
        <p class="featured-explanation">
          En el modelo definitivo, esta opción permite posicionar tu lote en los primeros lugares del marketplace y alertar prioritariamente a compradores de Tarija interesados en este rubro.
        </p>
        <div class="pilot-note-box">
          <strong>Precio piloto por validar:</strong> Sin cobro durante la fase de prueba.
        </div>
        <div class="modal-actions-bar">
          <button class="btn btn-secondary" onclick="App.closeModal('modal-featured')">Cerrar</button>
          <button class="btn btn-primary" onclick="App.confirmToggleFeatured('${lotId}')">
            ${isCurrentlyFeat ? 'Quitar destacado' : 'Probar como destacado'}
          </button>
        </div>
      </div>
    `;

    modal.classList.add('active');
  },

  confirmToggleFeatured(lotId) {
    const lot = Storage.toggleFeatured(lotId);
    UI.showToast(lot.isFeatured ? '¡Lote marcado como destacado!' : 'Lote devuelto a visibilidad regular');
    this.closeModal('modal-featured');
    this.renderMyLotsView();
  },

  openPlansValidationModal() {
    const modal = document.getElementById('modal-featured');
    const content = document.getElementById('featured-modal-body');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="featured-flow">
        <div class="featured-icon">🚀</div>
        <h2 class="modal-title">BuenAprovecho Pro</h2>
        <div class="badge badge-warning">Precio piloto por validar</div>
        <p class="featured-explanation">
          Estamos validando qué herramientas de alto valor justifican una membresía comercial para productores y mayoristas en Tarija:
        </p>
        <ul class="plan-preview-list">
          <li>✓ Publicación ilimitada y rotación rápida de excedentes</li>
          <li>✓ Posicionamiento prioritario en Mercado Campesino y Centro</li>
          <li>✓ Panel extendido de demanda y contactos de compradores</li>
        </ul>
        <button class="btn btn-primary" onclick="App.closeModal('modal-featured')">Entendido</button>
      </div>
    `;

    modal.classList.add('active');
  },

  // --- Modal: Simulated News & Alerts Center ---
  openAlertsModal() {
    const alerts = Storage.getSimulatedAlerts();
    const modal = document.getElementById('modal-alerts');
    const content = document.getElementById('alerts-modal-body');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="alerts-center-flow">
        <div class="alerts-center-header">
          <div>
            <h2 class="modal-title">Centro de Novedades y Avisos</h2>
            <p class="modal-subtitle">Demostración de alertas de oferta y demanda en Tarija</p>
          </div>
        </div>

        <div class="alerts-items-list">
          ${alerts.map(a => `
            <div class="alert-card-item" onclick="${a.lotId ? `App.openLotDetail('${a.lotId}'); App.closeModal('modal-alerts');` : `App.navigate('explorar'); App.closeModal('modal-alerts');`}">
              <div class="alert-item-icon">${a.icon}</div>
              <div class="alert-item-body">
                <div class="alert-item-title">${a.title}</div>
                <div class="alert-item-desc">${a.desc}</div>
                <div class="alert-item-time">${a.time}</div>
              </div>
              <div class="alert-item-arrow">&rarr;</div>
            </div>
          `).join('')}
        </div>

        <div class="alerts-modal-footer">
          <p class="alerts-footer-note">Avisos simulados basados en tus intereses guardados y movimientos del mercado local.</p>
          <button class="btn btn-secondary" onclick="App.closeModal('modal-alerts')">Cerrar</button>
        </div>
      </div>
    `;

    modal.classList.add('active');
  },

  // --- Global Event Listeners ---
  setupEventListeners() {
    // Navigation clicks
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const view = el.dataset.nav;
        this.navigate(view);
      });
    });

    // Close modals on overlay backdrop click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
        document.body.style.overflow = '';
      }
    });
  }
};

// Auto-boot on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
