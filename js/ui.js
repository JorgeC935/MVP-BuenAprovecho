/**
 * BuenAprovecho - UI Renderers, Modals, Toasts, Map & Helpers
 */

const UI = {
  // --- Helpers & Formatters ---
  formatPrice(price, modality) {
    if (modality === 'Precio total del lote') {
      return `Bs ${price.toLocaleString('es-BO')} <span class="unit-badge">(Lote total)</span>`;
    }
    return `Bs ${price.toLocaleString('es-BO')} <span class="unit-badge">${modality || 'Bs/kg'}</span>`;
  },

  formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffHours = Math.round((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Hace unos minutos';
    if (diffHours === 1) return 'Hace 1 hora';
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays === 1) return 'Ayer';
    return `Hace ${diffDays} días`;
  },

  getCategoryIcon(catId) {
    const found = PRODUCT_CATEGORIES.find(c => c.id === catId);
    return found ? found.icon : '🥬';
  },

  // --- Image Fallback Helper ---
  // Returns HTML attributes + onerror for robust image rendering.
  // Uses PRODUCT_PHOTOS for gradient/emoji fallback when photo fails.
  getImgAttrs(src, alt) {
    // Detect which product photo key matches this src URL
    const photoEntry = Object.values(PRODUCT_PHOTOS).find(p => p.url === src);
    const gradient = photoEntry
      ? photoEntry.fallbackGradient
      : 'linear-gradient(135deg, #d4e6d9 0%, #8db89a 100%)';
    const emoji = photoEntry ? photoEntry.emoji : '🌿';
    const label = photoEntry ? photoEntry.label : (alt || 'Producto');

    // onerror: replace img with a styled div fallback
    const onerror = `this.onerror=null; this.style.display='none';
      var fb=document.createElement('div');
      fb.className='img-fallback';
      fb.style.background='${gradient}';
      fb.innerHTML='<span class=\\'fallback-emoji\\'>${emoji}</span><span class=\\'fallback-label\\'>${label}</span>';
      this.parentNode.insertBefore(fb, this.nextSibling);`.replace(/\n\s*/g, ' ');

    return `src="${src}" alt="${alt || label}" loading="lazy" onerror="${onerror}"`;
  },

  // --- Toast Notification System ---
  showToast(message, type = 'success', duration = 3200) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slide-in`;
    
    let icon = '✓';
    if (type === 'error') icon = '✕';
    if (type === 'info') icon = 'ℹ';
    if (type === 'warning') icon = '⚠';

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-message">${message}</div>
      <button class="toast-close" aria-label="Cerrar">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.remove();
    });

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('animate-fade-out');
      setTimeout(() => toast.remove(), 280);
    }, duration);
  },

  // --- Render Lot Card (Buyer View) ---
  renderLotCard(lot, isFavorite = false, showInterestBadge = false) {
    const isQuick = lot.quickExit || lot.commercialReason === 'Salida rápida';
    const mainImg = (lot.images && lot.images.length > 0) ? lot.images[0] : PRODUCT_PHOTOS.papa.url;
    const labSettings = Storage.getLabSettings();
    const imgAttrs = this.getImgAttrs(mainImg, lot.product);

    return `
      <article class="lot-card ${lot.isFeatured ? 'card-is-featured' : ''}" data-lot-id="${lot.id}">
        <div class="lot-card-media" onclick="App.openLotDetail('${lot.id}')">
          <img class="lot-card-img" ${imgAttrs} />
          <div class="lot-card-badges">
            ${isQuick ? `<span class="badge badge-urgent"><span class="badge-dot"></span> Salida rápida</span>` : ''}
            ${lot.isFeatured ? `<span class="badge badge-featured">★ Destacado</span>` : ''}
            ${showInterestBadge ? `<span class="badge badge-match">✓ Para ti</span>` : ''}
          </div>
          <button class="btn-fav ${isFavorite ? 'active' : ''}" 
                  aria-label="${isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}"
                  onclick="event.stopPropagation(); App.handleToggleFavorite('${lot.id}', this)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="${isFavorite ? '#e06d3b' : 'none'}" stroke="${isFavorite ? '#e06d3b' : 'currentColor'}" stroke-width="2.2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>

        <div class="lot-card-body" onclick="App.openLotDetail('${lot.id}')">
          <div class="lot-card-header">
            <h3 class="lot-card-title">${lot.product}</h3>
          </div>

          <div class="lot-card-price-row">
            <span class="lot-card-price">${this.formatPrice(lot.price, lot.priceModality)}</span>
            ${lot.negotiable ? `<span class="tag-negotiable-sm">Negociable</span>` : ''}
          </div>

          <div class="lot-card-stock">
            <span class="stock-pill">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
              ${lot.quantity} ${lot.unit}
            </span>
            ${lot.allowPartial && lot.minPurchase ? `<span class="min-pill">Mín. ${lot.minPurchase} ${lot.unit}</span>` : ''}
          </div>

          ${isQuick ? `
            <div class="lot-quick-tag">
              <span class="tag-reason-urgent">⚡ Salida rápida</span>
            </div>
          ` : labSettings.showCommercialCondition && lot.commercialCondition ? `
            <div class="lot-commercial-tag">
              <span class="tag-reason">${lot.commercialReason || 'Segunda salida'}</span>
            </div>
          ` : `
            <div class="lot-commercial-tag">
              <span class="tag-reason">${lot.commercialReason || 'Oportunidad comercial'}</span>
            </div>
          `}

          <div class="lot-card-footer">
            <div class="seller-info">
              <span class="seller-name">${lot.sellerName}</span>
            </div>
            <div class="location-info">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>${lot.location.replace('Zona ', '')}</span>
            </div>
          </div>
        </div>
      </article>
    `;
  },

  // --- Render Seller Lot Card (Seller Management View) ---
  renderSellerLotCard(lot) {
    const statusLabels = {
      active:   { text: 'Activo',    class: 'status-active' },
      sold:     { text: 'Vendido',   class: 'status-sold' },
      retired:  { text: 'Retirado',  class: 'status-retired' },
      finished: { text: 'Finalizado', class: 'status-finished' }
    };

    const currentStatus = statusLabels[lot.status] || statusLabels.active;
    const mainImg = (lot.images && lot.images.length > 0) ? lot.images[0] : PRODUCT_PHOTOS.papa.url;
    const imgAttrs = this.getImgAttrs(mainImg, lot.product);

    return `
      <div class="seller-lot-card ${lot.isFeatured ? 'card-is-featured' : ''}" data-lot-id="${lot.id}">
        <div class="seller-lot-media">
          <img class="seller-lot-thumb" ${imgAttrs} />
          <span class="status-badge ${currentStatus.class}">${currentStatus.text}</span>
          ${lot.isFeatured ? `<span class="badge badge-featured seller-feat-badge">★ Destacado</span>` : ''}
        </div>

        <div class="seller-lot-details">
          <div class="seller-lot-main">
            <div class="seller-lot-top">
              <h3 class="seller-lot-title">${lot.product}</h3>
              <div class="seller-lot-price">${this.formatPrice(lot.price, lot.priceModality)}</div>
            </div>
            
            <p class="seller-lot-stock">${lot.quantity} ${lot.unit} • ${lot.location}</p>
            
            <div class="seller-lot-metrics-strip">
              <span class="metric-pill">👁️ ${lot.viewsCount || 0}</span>
              <span class="metric-pill">❤️ ${lot.favoritesCount || 0}</span>
              <span class="metric-pill pill-contacts">💬 ${Storage.getContacts().filter(c => c.lotId === lot.id).length}</span>
            </div>

            ${lot.status === 'sold' && lot.declaredSoldQuantity ? `
              <div class="declared-sold-note">✓ Venta declarada: <strong>${lot.declaredSoldQuantity} ${lot.unit}</strong></div>
            ` : ''}
          </div>

          <div class="seller-lot-actions">
            ${lot.status === 'active' ? `
              <button class="btn btn-sm btn-primary" onclick="App.openMarkAsSoldModal('${lot.id}')">
                ✓ Marcar vendido
              </button>
              <button class="btn btn-sm btn-secondary" onclick="App.openEditLot('${lot.id}')">
                ✎ Editar
              </button>
              <button class="btn btn-sm ${lot.isFeatured ? 'btn-featured-active' : 'btn-outline'}" onclick="App.openFeaturedModal('${lot.id}')">
                ★ ${lot.isFeatured ? 'Destacado' : 'Destacar'}
              </button>
              <button class="btn btn-sm btn-outline" onclick="App.duplicateLot('${lot.id}')">
                ⧉ Duplicar
              </button>
              <button class="btn btn-sm btn-danger-outline" onclick="App.retireLot('${lot.id}')">
                ✕ Retirar
              </button>
            ` : `
              <button class="btn btn-sm btn-primary" onclick="App.republishLot('${lot.id}')">
                ↺ Volver a publicar
              </button>
              <button class="btn btn-sm btn-outline" onclick="App.duplicateLot('${lot.id}')">
                ⧉ Duplicar
              </button>
              <button class="btn btn-sm btn-danger-outline" onclick="App.deleteLot('${lot.id}')">
                🗑 Eliminar
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  },

  // --- Empty State Component ---
  renderEmptyState(icon, title, message, actionText, actionFnName) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">${icon}</div>
        <h3 class="empty-state-title">${title}</h3>
        <p class="empty-state-text">${message}</p>
        ${actionText && actionFnName ? `
          <button class="btn btn-primary" onclick="${actionFnName}()">
            ${actionText}
          </button>
        ` : ''}
      </div>
    `;
  },

  // --- Simulated Tarija Interactive SVG Map ---
  renderSimulatedMap(lots) {
    const activeLots = lots.filter(l => l.status === 'active');

    return `
      <div class="simulated-map-container">
        <div class="map-header">
          <div class="map-title-wrap">
            <span class="map-badge">📍 Tarija, Bolivia</span>
            <span class="map-sub">Mapa demostrativo de abastecimiento y recojo</span>
          </div>
          <span class="map-count">${activeLots.length} lotes ubicados</span>
        </div>

        <div class="map-canvas">
          <svg viewBox="0 0 800 500" class="tarija-svg-map">
            <!-- Simulated River Guadalquivir -->
            <path d="M100 50 C250 120, 380 220, 520 280 C650 340, 720 480, 750 500" 
                  fill="none" stroke="#7ac1eb" stroke-width="24" stroke-linecap="round" opacity="0.5"/>
            <path d="M100 50 C250 120, 380 220, 520 280 C650 340, 720 480, 750 500" 
                  fill="none" stroke="#5da9dc" stroke-width="10" stroke-linecap="round" opacity="0.85"/>
            <text x="360" y="195" fill="#3a82b3" font-size="12" font-weight="700" font-family="system-ui" transform="rotate(30 360 195)">Río Guadalquivir</text>

            <!-- Zone Areas -->
            <rect x="340" y="130" width="170" height="115" rx="16" fill="#1b7a43" fill-opacity="0.12" stroke="#1b7a43" stroke-width="2" stroke-dasharray="4"/>
            <text x="425" y="160" fill="#1b7a43" font-size="13" font-weight="800" text-anchor="middle" font-family="system-ui">Zona Mercado Campesino</text>
            <text x="425" y="178" fill="#2e7d32" font-size="10" font-weight="600" text-anchor="middle" font-family="system-ui">Centro mayorista</text>

            <rect x="280" y="265" width="140" height="90" rx="16" fill="#e06d3b" fill-opacity="0.12" stroke="#e06d3b" stroke-width="2" stroke-dasharray="4"/>
            <text x="350" y="295" fill="#c05621" font-size="12" font-weight="800" text-anchor="middle" font-family="system-ui">Mercado Central / Centro</text>

            <circle cx="230" cy="220" r="45" fill="#f6ad55" fill-opacity="0.15" stroke="#dd6b20" stroke-width="1.5" stroke-dasharray="4"/>
            <text x="230" y="220" fill="#c05621" font-size="11" font-weight="700" text-anchor="middle" font-family="system-ui">La Loma</text>

            <rect x="120" y="320" width="130" height="90" rx="16" fill="#4299e1" fill-opacity="0.12" stroke="#3182ce" stroke-width="1.5" stroke-dasharray="4"/>
            <text x="185" y="360" fill="#2b6cb0" font-size="12" font-weight="700" text-anchor="middle" font-family="system-ui">Senac / Tabladita</text>

            <rect x="480" y="310" width="155" height="90" rx="16" fill="#48bb78" fill-opacity="0.12" stroke="#38a169" stroke-width="1.5" stroke-dasharray="4"/>
            <text x="555" y="350" fill="#276749" font-size="12" font-weight="700" text-anchor="middle" font-family="system-ui">San Jerónimo / El Tejar</text>

            <!-- Main avenues -->
            <path d="M120 180 L680 180" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round"/>
            <text x="600" y="172" fill="#94a3b8" font-size="9" font-family="system-ui">Av. Circunvalación</text>
            <path d="M425 50 L425 460" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round"/>
            <text x="432" y="90" fill="#94a3b8" font-size="9" font-family="system-ui">Av. Froilán Tejerina</text>
            <path d="M140 400 L660 260" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round"/>
            <text x="590" y="250" fill="#94a3b8" font-size="9" font-family="system-ui">Av. Las Américas</text>
          </svg>

          <!-- Interactive HTML Map Pins Overlay -->
          <div class="map-pins-layer">
            ${activeLots.map((lot, idx) => {
              const coords = lot.coordinates || { x: 30 + (idx * 6) % 45, y: 30 + (idx * 8) % 45 };
              return `
                <button class="map-pin-btn ${lot.quickExit ? 'pin-urgent' : ''} ${lot.isFeatured ? 'pin-featured' : ''}" 
                        style="left: ${coords.x}%; top: ${coords.y}%;"
                        title="${lot.product} - ${lot.priceModality} ${lot.price}"
                        onclick="App.openLotDetail('${lot.id}')">
                  <span class="pin-icon">${lot.quickExit ? '⚡' : (lot.isFeatured ? '★' : '🧺')}</span>
                  <span class="pin-tooltip">${lot.product.split('(')[0].trim()} · <strong>Bs ${lot.price}</strong></span>
                </button>
              `;
            }).join('')}
          </div>
        </div>
        <p class="map-note">Simulación visual orientativa para el piloto de Tarija. Haz clic en cualquier marcador para ver el lote.</p>
      </div>
    `;
  },

  // --- Image Compressor Helper ---
  compressImage(file, maxWidth = 800, maxHeight = 600, quality = 0.72) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  }
};
