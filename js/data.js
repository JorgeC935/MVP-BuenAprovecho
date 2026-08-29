/**
 * BuenAprovecho - Seed Data and Constants
 * Pilot Location: Tarija, Bolivia
 *
 * IMAGES: Unsplash free-use photos (no account required, no watermark).
 * All URLs use the Unsplash CDN with explicit size params for performance.
 * Fallback gradient + emoji is handled via onerror in UI renderers.
 */

const PRODUCT_CATEGORIES = [
  { id: 'all',          name: 'Todos',      icon: '🧺' },
  { id: 'tuberculos',   name: 'Tubérculos', icon: '🥔' },
  { id: 'hortalizas',  name: 'Hortalizas', icon: '🧅' },
  { id: 'citricos',    name: 'Cítricos',   icon: '🍊' },
  { id: 'frutas',      name: 'Frutas',     icon: '🍎' },
  { id: 'cucurbitaceas', name: 'Zapallos',  icon: '🎃' }
];

const TARIJA_ZONES = [
  'Zona Mercado Campesino',
  'Mercado Central',
  'Zona La Loma',
  'Zona Senac',
  'Centro',
  'Zona San Jerónimo',
  'Zona Tabladita',
  'Zona El Tejar'
];

const SELLER_TYPES = [
  { id: 'productor',   name: 'Productor Agrícola' },
  { id: 'mayorista',  name: 'Mayorista / Distribuidor' },
  { id: 'comerciante', name: 'Comerciante de Mercado' }
];

const BUYER_TYPES = [
  { id: 'hogar',       name: 'Hogar / Familia' },
  { id: 'gastronomico', name: 'Pequeño negocio gastronómico' },
  { id: 'general',    name: 'Comprador general' }
];

const COMMERCIAL_REASONS = [
  'Salida rápida',
  'Sobreoferta',
  'Segunda categoría',
  'Baja rotación'
];

const COMMERCIAL_CONDITIONS = [
  'Tamaño / calibre mixto',
  'Apariencia irregular (forma no estándar)',
  'Maduración avanzada para consumo pronto',
  'Excedente de cosecha fresca',
  'Presentación comercial no clasificada'
];

const UNITS = [
  { id: 'kg',     name: 'Kilogramos (kg)' },
  { id: 'bolsa',  name: 'Bolsas / Quintales' },
  { id: 'caja',   name: 'Cajas' },
  { id: 'unidad', name: 'Unidades' },
  { id: 'lote',   name: 'Lote completo' }
];

const PRICE_MODALITIES = [
  'Bs/kg',
  'Bs/bolsa',
  'Bs/caja',
  'Bs/unidad',
  'Precio total del lote'
];

// ---------------------------------------------------------------------------
// PRODUCT PHOTOS
// ---------------------------------------------------------------------------
// Primary: Unsplash CDN images (real photographs, no watermarks, no text).
// Format: ?w=800&q=80&auto=format&fit=crop for optimised loading.
// Each key also carries a `fallbackGradient` and `emoji` used when the
// network photo fails (onerror handler attached in renderLotCard).
// ---------------------------------------------------------------------------
const PRODUCT_PHOTOS = {
  papa: {
    url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80&auto=format&fit=crop',
    fallbackGradient: 'linear-gradient(135deg, #c49a6c 0%, #8a5e33 100%)',
    emoji: '🥔',
    label: 'Papa'
  },
  papa2: {
    url: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=800&q=80&auto=format&fit=crop',
    fallbackGradient: 'linear-gradient(135deg, #d2a677 0%, #9c7144 100%)',
    emoji: '🥔',
    label: 'Papa'
  },
  cebolla: {
    url: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=800&q=80&auto=format&fit=crop',
    fallbackGradient: 'linear-gradient(135deg, #c24d40 0%, #7a1c14 100%)',
    emoji: '🧅',
    label: 'Cebolla'
  },
  cebolla2: {
    url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&q=80&auto=format&fit=crop',
    fallbackGradient: 'linear-gradient(135deg, #d96557 0%, #a83226 100%)',
    emoji: '🧅',
    label: 'Cebolla'
  },
  zanahoria: {
    url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80&auto=format&fit=crop',
    fallbackGradient: 'linear-gradient(135deg, #f57c2a 0%, #c24d08 100%)',
    emoji: '🥕',
    label: 'Zanahoria'
  },
  zapallo: {
    url: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=800&q=80&auto=format&fit=crop',
    fallbackGradient: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
    emoji: '🎃',
    label: 'Zapallo'
  },
  zapallo2: {
    url: 'https://images.unsplash.com/photo-1508522236-82f2df9052f7?w=800&q=80&auto=format&fit=crop',
    fallbackGradient: 'linear-gradient(135deg, #f39c12 0%, #d35400 100%)',
    emoji: '🎃',
    label: 'Zapallo'
  },
  manzana: {
    url: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800&q=80&auto=format&fit=crop',
    fallbackGradient: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
    emoji: '🍎',
    label: 'Manzana'
  },
  naranja: {
    url: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=800&q=80&auto=format&fit=crop',
    fallbackGradient: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
    emoji: '🍊',
    label: 'Naranja'
  },
  naranja2: {
    url: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=800&q=80&auto=format&fit=crop',
    fallbackGradient: 'linear-gradient(135deg, #f39c12 0%, #c0680a 100%)',
    emoji: '🍊',
    label: 'Naranja'
  },
  mandarina: {
    url: 'https://images.unsplash.com/photo-1582354801169-eb1b26ae5711?w=800&q=80&auto=format&fit=crop',
    fallbackGradient: 'linear-gradient(135deg, #fd9644 0%, #fa8231 100%)',
    emoji: '🍊',
    label: 'Mandarina'
  },
  limon: {
    url: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=800&q=80&auto=format&fit=crop',
    fallbackGradient: 'linear-gradient(135deg, #a2db37 0%, #689c10 100%)',
    emoji: '🍋',
    label: 'Limón'
  }
};

// Backwards compat: PRODUCT_ART now points to photo URLs (used by preset picker)
const PRODUCT_ART = Object.fromEntries(
  Object.entries(PRODUCT_PHOTOS).map(([k, v]) => [k, v.url])
);

// ---------------------------------------------------------------------------
// Quick-fill presets for ultra-fast seller publishing (1-tap setup)
// ---------------------------------------------------------------------------
const QUICK_PUBLISH_PRESETS = [
  {
    key: 'papa',
    label: '🥔 Papa Holandesa',
    product: 'Papa Holandesa de Valle',
    category: 'tuberculos',
    quantity: 100,
    unit: 'kg',
    price: 3.5,
    priceModality: 'Bs/kg',
    allowPartial: true,
    minPurchase: 15,
    commercialReason: 'Salida rápida',
    commercialCondition: 'Tamaño / calibre mixto',
    imageKey: 'papa',
    description: 'Papa fresca de valle con excelente punto de cocción, calibre variado ideal para gastronomía o consumo diario.'
  },
  {
    key: 'cebolla',
    label: '🧅 Cebolla Roja en Bolsa',
    product: 'Cebolla Roja Seleccionada',
    category: 'hortalizas',
    quantity: 30,
    unit: 'bolsa',
    price: 38,
    priceModality: 'Bs/bolsa',
    allowPartial: true,
    minPurchase: 2,
    commercialReason: 'Sobreoferta',
    commercialCondition: 'Excedente de cosecha fresca',
    imageKey: 'cebolla',
    description: 'Cebolla roja bien seca y firme, cosechada recientemente. Lista para retiro en sector mayorista.'
  },
  {
    key: 'zanahoria',
    label: '🥕 Zanahoria de Campo',
    product: 'Zanahoria de Campo Dulce',
    category: 'hortalizas',
    quantity: 150,
    unit: 'kg',
    price: 2.8,
    priceModality: 'Bs/kg',
    allowPartial: true,
    minPurchase: 10,
    commercialReason: 'Segunda categoría',
    commercialCondition: 'Apariencia irregular (forma no estándar)',
    imageKey: 'zanahoria',
    description: 'Zanahorias dulces y crujientes con formas curvas. Ideales para jugos, rallados y cocina general.'
  },
  {
    key: 'naranja',
    label: '🍊 Naranja Bermejo',
    product: 'Naranja Dulce Bermejeña',
    category: 'citricos',
    quantity: 20,
    unit: 'caja',
    price: 45,
    priceModality: 'Bs/caja',
    allowPartial: true,
    minPurchase: 2,
    commercialReason: 'Salida rápida',
    commercialCondition: 'Maduración avanzada para consumo pronto',
    imageKey: 'naranja',
    description: 'Naranjas de gran dulzura y abundante jugo. Se busca salida ágil para aprovechar su frescura.'
  },
  {
    key: 'zapallo',
    label: '🎃 Zapallo Criollo',
    product: 'Zapallo Criollo Plomo',
    category: 'cucurbitaceas',
    quantity: 200,
    unit: 'kg',
    price: 2.2,
    priceModality: 'Bs/kg',
    allowPartial: true,
    minPurchase: 10,
    commercialReason: 'Baja rotación',
    commercialCondition: 'Excedente de cosecha fresca',
    imageKey: 'zapallo',
    description: 'Zapallo criollo con pulpa cremosa y rendidora. Precio conveniente por cantidad.'
  },
  {
    key: 'limon',
    label: '🍋 Limón Criollo',
    product: 'Limón Criollo Jugoso',
    category: 'citricos',
    quantity: 60,
    unit: 'kg',
    price: 4.0,
    priceModality: 'Bs/kg',
    allowPartial: true,
    minPurchase: 5,
    commercialReason: 'Salida rápida',
    commercialCondition: 'Apariencia irregular (forma no estándar)',
    imageKey: 'limon',
    description: 'Limón sutil con alto contenido de jugo, tamaño mediano. Ideal para pensiones y negocios gastronómicos.'
  }
];

// ---------------------------------------------------------------------------
// Demo Lots — fictional sellers, generic Tarija zones, real product photos
// ---------------------------------------------------------------------------
const INITIAL_DEMO_LOTS = [
  {
    id: 'lot-01',
    product: 'Papa Holandesa (Calibre Mediano-Pequeño)',
    category: 'tuberculos',
    quantity: 150,
    unit: 'kg',
    price: 3.5,
    priceModality: 'Bs/kg',
    allowPartial: true,
    minPurchase: 20,
    negotiable: true,
    quickExit: true,
    commercialReason: 'Salida rápida',
    commercialCondition: 'Tamaño / calibre mixto',
    location: 'Zona Mercado Campesino',
    locationRef: 'Av. Froilán Tejerina, tinglado verde puesto 44',
    pickupSchedule: '07:00 a 14:00 (Lunes a Sábado)',
    sellerName: 'Distribuidora San Luis',
    sellerType: 'Mayorista / Distribuidor',
    sellerPhone: '+59172981234',
    sellerRating: 4.8,
    sellerReviewsCount: 14,
    description: 'Lote de papa de segunda categoría con excelente sabor y consistencia. Calibre variado, ideal para restaurantes, pollerías o consumo familiar.',
    images: [PRODUCT_PHOTOS.papa.url, PRODUCT_PHOTOS.papa2.url],
    publishedAt: '2026-08-29T06:30:00Z',
    viewsCount: 48,
    favoritesCount: 9,
    status: 'active',
    isFeatured: true,
    coordinates: { x: 48, y: 38 }
  },
  {
    id: 'lot-02',
    product: 'Cebolla Roja de Valle (Excedente de Cosecha)',
    category: 'hortalizas',
    quantity: 40,
    unit: 'bolsa',
    price: 38,
    priceModality: 'Bs/bolsa',
    allowPartial: true,
    minPurchase: 2,
    negotiable: false,
    quickExit: true,
    commercialReason: 'Sobreoferta',
    commercialCondition: 'Excedente de cosecha fresca',
    location: 'Zona Mercado Campesino',
    locationRef: 'Sector hortalizas al por mayor, portón 2',
    pickupSchedule: '06:00 a 12:00 todos los días',
    sellerName: 'Productora Valle Verde',
    sellerType: 'Productor Agrícola',
    sellerPhone: '+59171894562',
    sellerRating: 4.9,
    sellerReviewsCount: 22,
    description: 'Llegada de camión con excedente de cosecha desde San Lorenzo. Cebolla firme, bien seca, lista para guardar o consumo inmediato.',
    images: [PRODUCT_PHOTOS.cebolla.url],
    publishedAt: '2026-08-29T07:15:00Z',
    viewsCount: 67,
    favoritesCount: 12,
    status: 'active',
    isFeatured: false,
    coordinates: { x: 52, y: 35 }
  },
  {
    id: 'lot-03',
    product: 'Zanahoria de Campo (Segunda Selección)',
    category: 'hortalizas',
    quantity: 200,
    unit: 'kg',
    price: 2.8,
    priceModality: 'Bs/kg',
    allowPartial: true,
    minPurchase: 15,
    negotiable: true,
    quickExit: false,
    commercialReason: 'Segunda categoría',
    commercialCondition: 'Apariencia irregular (forma no estándar)',
    location: 'Mercado Central',
    locationRef: 'Planta baja, pasillo 3 puesto de verduras doña Elena',
    pickupSchedule: '08:00 a 18:00',
    sellerName: 'Puesto El Campesino',
    sellerType: 'Comerciante de Mercado',
    sellerPhone: '+59173456789',
    sellerRating: 4.7,
    sellerReviewsCount: 9,
    description: 'Zanahorias dulces y frescas con formas bifurcadas o curvas que los supermercados no reciben. 100% aptas para jugos, sopas o rallado.',
    images: [PRODUCT_PHOTOS.zanahoria.url],
    publishedAt: '2026-08-28T16:20:00Z',
    viewsCount: 31,
    favoritesCount: 5,
    status: 'active',
    isFeatured: false,
    coordinates: { x: 42, y: 55 }
  },
  {
    id: 'lot-04',
    product: 'Naranja Dulce Bermejeña (Lote Completo)',
    category: 'citricos',
    quantity: 25,
    unit: 'caja',
    price: 45,
    priceModality: 'Bs/caja',
    allowPartial: true,
    minPurchase: 2,
    negotiable: true,
    quickExit: true,
    commercialReason: 'Salida rápida',
    commercialCondition: 'Maduración avanzada para consumo pronto',
    location: 'Zona La Loma',
    locationRef: 'Calle Cochabamba cerca al mirador, depósito 12',
    pickupSchedule: '09:00 a 19:00',
    sellerName: 'Distribuidora San Luis',
    sellerType: 'Mayorista / Distribuidor',
    sellerPhone: '+59172981234',
    sellerRating: 4.8,
    sellerReviewsCount: 18,
    description: 'Naranjas muy jugosas en punto óptimo de dulzura. Cáscara con detalles de sol pero pulpa de primera calidad. Se busca salida en 48 hrs.',
    images: [PRODUCT_PHOTOS.naranja.url, PRODUCT_PHOTOS.naranja2.url],
    publishedAt: '2026-08-29T05:40:00Z',
    viewsCount: 59,
    favoritesCount: 11,
    status: 'active',
    isFeatured: true,
    coordinates: { x: 35, y: 48 }
  },
  {
    id: 'lot-05',
    product: 'Zapallo Plomo Criollo Cortado y Entero',
    category: 'cucurbitaceas',
    quantity: 300,
    unit: 'kg',
    price: 2.2,
    priceModality: 'Bs/kg',
    allowPartial: true,
    minPurchase: 10,
    negotiable: true,
    quickExit: false,
    commercialReason: 'Baja rotación',
    commercialCondition: 'Excedente de cosecha fresca',
    location: 'Zona Senac',
    locationRef: 'Av. Las Américas frente a la plazuela',
    pickupSchedule: '10:00 a 17:00',
    sellerName: 'Productora Valle Verde',
    sellerType: 'Productor Agrícola',
    sellerPhone: '+59171894562',
    sellerRating: 4.9,
    sellerReviewsCount: 22,
    description: 'Zapallos criollos de gran tamaño cosechados en Paicho. Carne amarilla intensa y cremosa. Precio especial por cantidad.',
    images: [PRODUCT_PHOTOS.zapallo.url],
    publishedAt: '2026-08-28T14:10:00Z',
    viewsCount: 28,
    favoritesCount: 4,
    status: 'active',
    isFeatured: false,
    coordinates: { x: 28, y: 68 }
  },
  {
    id: 'lot-06',
    product: 'Mandarina Criolla con Piel Manchada',
    category: 'citricos',
    quantity: 30,
    unit: 'bolsa',
    price: 32,
    priceModality: 'Bs/bolsa',
    allowPartial: true,
    minPurchase: 1,
    negotiable: false,
    quickExit: true,
    commercialReason: 'Segunda categoría',
    commercialCondition: 'Apariencia irregular (forma no estándar)',
    location: 'Zona Mercado Campesino',
    locationRef: 'Sector frutas sobre la calle Ciro Trigo',
    pickupSchedule: '07:00 a 15:00',
    sellerName: 'Puesto El Campesino',
    sellerType: 'Comerciante de Mercado',
    sellerPhone: '+59173456789',
    sellerRating: 4.7,
    sellerReviewsCount: 9,
    description: 'Mandarinas aromáticas y muy dulces. La cáscara tiene marcas de viento y ramas pero la fruta interna está perfecta e hidratada.',
    images: [PRODUCT_PHOTOS.mandarina.url],
    publishedAt: '2026-08-29T08:00:00Z',
    viewsCount: 39,
    favoritesCount: 7,
    status: 'active',
    isFeatured: false,
    coordinates: { x: 55, y: 42 }
  },
  {
    id: 'lot-07',
    product: 'Manzana de Valle Roja y Rayada',
    category: 'frutas',
    quantity: 20,
    unit: 'caja',
    price: 60,
    priceModality: 'Bs/caja',
    allowPartial: true,
    minPurchase: 1,
    negotiable: true,
    quickExit: false,
    commercialReason: 'Sobreoferta',
    commercialCondition: 'Tamaño / calibre mixto',
    location: 'Centro',
    locationRef: 'Calle Sucre esquina 15 de Abril',
    pickupSchedule: '14:00 a 20:00',
    sellerName: 'Comercial La Huerta',
    sellerType: 'Mayorista / Distribuidor',
    sellerPhone: '+59176123984',
    sellerRating: 4.6,
    sellerReviewsCount: 18,
    description: 'Manzanas tarijeñas aromáticas y crujientes. Calibres mixtos en cada caja. Perfectas para consumo de mesa, repostería o licuados.',
    images: [PRODUCT_PHOTOS.manzana.url],
    publishedAt: '2026-08-27T18:00:00Z',
    viewsCount: 45,
    favoritesCount: 11,
    status: 'active',
    isFeatured: false,
    coordinates: { x: 45, y: 60 }
  },
  {
    id: 'lot-08',
    product: 'Limón Sutil Jugoso (Segunda Selección)',
    category: 'citricos',
    quantity: 80,
    unit: 'kg',
    price: 4.0,
    priceModality: 'Bs/kg',
    allowPartial: true,
    minPurchase: 5,
    negotiable: true,
    quickExit: true,
    commercialReason: 'Salida rápida',
    commercialCondition: 'Apariencia irregular (forma no estándar)',
    location: 'Zona San Jerónimo',
    locationRef: 'Av. Circunvalación esquina puente San Martín',
    pickupSchedule: '08:00 a 16:00',
    sellerName: 'Distribuidora San Luis',
    sellerType: 'Mayorista / Distribuidor',
    sellerPhone: '+59172981234',
    sellerRating: 4.8,
    sellerReviewsCount: 14,
    description: 'Limón con alto contenido de jugo, tamaño pequeño a mediano. Ideal para cevicherías, bares, pensiones o consumo familiar.',
    images: [PRODUCT_PHOTOS.limon.url],
    publishedAt: '2026-08-29T07:45:00Z',
    viewsCount: 38,
    favoritesCount: 6,
    status: 'active',
    isFeatured: true,
    coordinates: { x: 62, y: 72 }
  },
  {
    id: 'lot-09',
    product: 'Papa Deseret Colorada (Segunda Cosecha)',
    category: 'tuberculos',
    quantity: 80,
    unit: 'bolsa',
    price: 42,
    priceModality: 'Bs/bolsa',
    allowPartial: true,
    minPurchase: 3,
    negotiable: false,
    quickExit: false,
    commercialReason: 'Baja rotación',
    commercialCondition: 'Presentación comercial no clasificada',
    location: 'Zona Mercado Campesino',
    locationRef: 'Calle Comercio frente a la parada de trufis',
    pickupSchedule: '06:30 a 13:30',
    sellerName: 'Productora Valle Verde',
    sellerType: 'Productor Agrícola',
    sellerPhone: '+59171894562',
    sellerRating: 4.9,
    sellerReviewsCount: 22,
    description: 'Papa colorada de textura harinosa y excelente cocción para guisos y sopas. Directo de chacra sin lavado previo para mayor conservación.',
    images: [PRODUCT_PHOTOS.papa2.url],
    publishedAt: '2026-08-27T11:00:00Z',
    viewsCount: 50,
    favoritesCount: 8,
    status: 'active',
    isFeatured: false,
    coordinates: { x: 50, y: 32 }
  },
  {
    id: 'lot-10',
    product: 'Cebolla Blanca Dulce (Remate de Lote)',
    category: 'hortalizas',
    quantity: 15,
    unit: 'bolsa',
    price: 35,
    priceModality: 'Bs/bolsa',
    allowPartial: false,
    minPurchase: 1,
    negotiable: true,
    quickExit: true,
    commercialReason: 'Salida rápida',
    commercialCondition: 'Maduración avanzada para consumo pronto',
    location: 'Zona Tabladita',
    locationRef: 'Av. Los Molles a media cuadra de la posta',
    pickupSchedule: '08:00 a 12:00',
    sellerName: 'Puesto El Campesino',
    sellerType: 'Comerciante de Mercado',
    sellerPhone: '+59173456789',
    sellerRating: 4.7,
    sellerReviewsCount: 9,
    description: 'Últimas 15 bolsas de cebolla blanca dulce. Oportunidad para pequeños distribuidores o negocios de comida rápida.',
    images: [PRODUCT_PHOTOS.cebolla2.url],
    publishedAt: '2026-08-29T04:15:00Z',
    viewsCount: 62,
    favoritesCount: 10,
    status: 'active',
    isFeatured: false,
    coordinates: { x: 22, y: 50 }
  },
  {
    id: 'lot-11',
    product: 'Naranja Criolla para Jugo (Camión Completo)',
    category: 'citricos',
    quantity: 500,
    unit: 'kg',
    price: 1.8,
    priceModality: 'Bs/kg',
    allowPartial: true,
    minPurchase: 50,
    negotiable: true,
    quickExit: true,
    commercialReason: 'Sobreoferta',
    commercialCondition: 'Excedente de cosecha fresca',
    location: 'Zona El Tejar',
    locationRef: 'Av. Integración cerca del parque temático',
    pickupSchedule: '07:00 a 17:00',
    sellerName: 'Distribuidora San Luis',
    sellerType: 'Mayorista / Distribuidor',
    sellerPhone: '+59172981234',
    sellerRating: 4.8,
    sellerReviewsCount: 14,
    description: 'Camionada directa con naranjas jugosas de temporada. Descuento adicional si se adquiere por encima de 100 kg.',
    images: [PRODUCT_PHOTOS.naranja2.url],
    publishedAt: '2026-08-28T09:00:00Z',
    viewsCount: 78,
    favoritesCount: 14,
    status: 'active',
    isFeatured: false,
    coordinates: { x: 58, y: 62 }
  },
  {
    id: 'lot-12',
    product: 'Zapallo Tipo Anco Dulce (Segunda Categoría)',
    category: 'cucurbitaceas',
    quantity: 120,
    unit: 'kg',
    price: 3.2,
    priceModality: 'Bs/kg',
    allowPartial: true,
    minPurchase: 10,
    negotiable: false,
    quickExit: false,
    commercialReason: 'Segunda categoría',
    commercialCondition: 'Tamaño / calibre mixto',
    location: 'Zona Mercado Campesino',
    locationRef: 'Galpón C, puesto 19',
    pickupSchedule: '08:30 a 14:30',
    sellerName: 'Comercial La Huerta',
    sellerType: 'Mayorista / Distribuidor',
    sellerPhone: '+59176123984',
    sellerRating: 4.6,
    sellerReviewsCount: 18,
    description: 'Zapallos anco con pulpa compacta y excelente dulzor. Formas ligeramente curvas pero calidad culinaria intacta.',
    images: [PRODUCT_PHOTOS.zapallo2.url],
    publishedAt: '2026-08-26T15:30:00Z',
    viewsCount: 22,
    favoritesCount: 3,
    status: 'active',
    isFeatured: false,
    coordinates: { x: 49, y: 40 }
  }
];

const DEFAULT_PROFILE = {
  id: 'user-demo-01',
  name: 'Carlos Mendoza',
  businessName: 'Distribuidora San Luis',
  activeRole: 'buyer',
  sellerType: 'Mayorista / Distribuidor',
  buyerType: 'Pequeño negocio gastronómico',
  phone: '+59172981234',
  zone: 'Zona Mercado Campesino',
  locationRef: 'Av. Froilán Tejerina, tinglado verde puesto 44',
  habitualSchedule: '07:00 a 14:00 (Lunes a Sábado)',
  avatar: '👨‍🌾',
  interests: ['Papa', 'Cebolla', 'Naranja', 'Limón'],
  preferredZone: 'Zona Mercado Campesino'
};

const DEFAULT_LAB_SETTINGS = {
  showCommercialCondition: true,
  showSimulatedMap: true,
  showInterestSuggestions: true,
  showMonetizationToggles: true
};

const PRODUCT_INTEREST_OPTIONS = [
  'Papa',
  'Cebolla',
  'Zanahoria',
  'Zapallo',
  'Manzana',
  'Naranja',
  'Mandarina',
  'Limón'
];
