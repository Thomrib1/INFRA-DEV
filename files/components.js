/**
 * YMMO — Composants réutilisables
 */

// ─── FORMATAGE ───
function formatPrice(price, transactionType) {
  const n = parseFloat(price);
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0
  }).format(n);
  return transactionType === 'rent' ? `${formatted} /mois` : formatted;
}

function formatType(type) {
  const map = { house: 'Maison', apartment: 'Appartement', office: 'Bureau' };
  return map[type] || type;
}

function formatTransaction(t) {
  return t === 'sale' ? 'Vente' : 'Location';
}

function formatStatus(s) {
  const map = {
    available: { label: 'Disponible', cls: 'status--available' },
    pending: { label: 'En cours', cls: 'status--pending' },
    sold: { label: 'Vendu', cls: 'status--sold' },
    rented: { label: 'Loué', cls: 'status--rented' },
  };
  return map[s] || { label: s, cls: '' };
}

// ─── SVG ICONS ───
const Icons = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>`,
  building: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="1"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>`,
  office: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 3v18M3 9h6M3 15h6"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  area: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`,
  rooms: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 4v16M22 4v16M2 12h20M2 4h20"/></svg>`,
  bed: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 4v16M22 4v16M2 14h20M6 14V9a2 2 0 012-2h8a2 2 0 012 2v5"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.5 11.5a19.79 19.79 0 01-3-8.59A2 2 0 013.68 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`,
};

// ─── PROPERTY CARD ───
function renderPropertyCard(p) {
  const typeIcon = p.property_type === 'house' ? Icons.home : (p.property_type === 'apartment' ? Icons.building : Icons.office);
  const badgeCls = p.transaction_type === 'sale' ? 'badge--sale' : 'badge--rent';
  const st = formatStatus(p.status);
  return `
    <div class="property-card" onclick="viewProperty(${p.id})">
      <div class="property-card__image">
        <div class="property-card__image-icon">${typeIcon}</div>
        <span class="property-card__badge ${badgeCls}">${formatTransaction(p.transaction_type)}</span>
        <div class="property-card__price-overlay">
          <span>${formatPrice(p.price, p.transaction_type)}</span>
        </div>
      </div>
      <div class="property-card__body">
        <div class="property-card__type">${formatType(p.property_type)}</div>
        <div class="property-card__title">${p.title}</div>
        <div class="property-card__city">${Icons.pin} ${p.city}</div>
        <div class="property-card__price">${formatPrice(p.price, p.transaction_type)}</div>
        <div class="property-card__meta">
          <div class="property-card__meta-item">${Icons.area} ${p.surface_area} m²</div>
          ${p.rooms > 0 ? `<div class="property-card__meta-item">${Icons.rooms} ${p.rooms} pièces</div>` : ''}
          ${p.bedrooms > 0 ? `<div class="property-card__meta-item">${Icons.bed} ${p.bedrooms} ch.</div>` : ''}
        </div>
      </div>
    </div>
  `;
}

// ─── AGENCY CARD (preview) ───
function renderAgencyCardPreview(a) {
  const initial = a.name ? a.name.charAt(0).toUpperCase() : '?';
  return `
    <div class="agency-card">
      <div class="agency-card__initial">${initial}</div>
      <div class="agency-card__name">${a.name}</div>
      <div class="agency-card__city">${Icons.pin} ${a.city}</div>
    </div>
  `;
}

// ─── AGENCY CARD (full) ───
function renderAgencyCardFull(a) {
  const initial = a.name ? a.name.charAt(0).toUpperCase() : '?';
  return `
    <div class="agency-full-card">
      <div class="agency-full-card__header">
        <div class="agency-full-card__initial">${initial}</div>
        <div>
          <div class="agency-full-card__name">${a.name}</div>
          <div class="agency-full-card__city">${a.city}</div>
        </div>
      </div>
      <div class="agency-full-card__body">
        <div class="agency-full-card__info">
          ${a.address ? `<div class="agency-info-row">${Icons.pin} <span>${a.address}</span></div>` : ''}
          ${a.phone ? `<div class="agency-info-row">${Icons.phone} <span>${a.phone}</span></div>` : ''}
          ${a.email ? `<div class="agency-info-row">${Icons.mail} <span>${a.email}</span></div>` : ''}
        </div>
      </div>
    </div>
  `;
}

// ─── HEADER DYNAMIQUE ───
function initHeader() {
  // Scroll effect
  window.addEventListener('scroll', () => {
    document.getElementById('header')?.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Burger menu
  const burger = document.getElementById('burger');
  const navMobile = document.getElementById('navMobile');
  burger?.addEventListener('click', () => {
    navMobile?.classList.toggle('open');
  });

  // Auth state
  const loginBtn = document.getElementById('loginBtn');
  const dashboardBtn = document.getElementById('dashboardBtn');
  if (Auth.isLoggedIn()) {
    loginBtn?.classList.add('hidden');
    dashboardBtn?.classList.remove('hidden');
  }
}

// ─── COUNTER ANIMATION ───
function animateCounters() {
  const counters = document.querySelectorAll('.stat__number[data-target]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1200;
      const start = performance.now();
      const animate = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(ease * target).toLocaleString('fr-FR');
        if (t < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}

// ─── NAVIGATION VERS FICHE BIEN ───
function viewProperty(id) {
  window.location.href = `bien.html?id=${id}`;
}

// ─── RECHERCHE ───
function doSearch() {
  const city = document.getElementById('searchCity')?.value || '';
  const type = document.getElementById('searchType')?.value || '';
  const transaction = document.getElementById('searchTransaction')?.value || '';
  const params = new URLSearchParams();
  if (city) params.set('city', city);
  if (type) params.set('type', type);
  if (transaction) params.set('transaction', transaction);
  window.location.href = `catalogue.html?${params.toString()}`;
}

// ─── CONTACT FORM (sans endpoint dédié, affiche confirmation) ───
function submitContact() {
  const name = document.getElementById('cName')?.value?.trim();
  const email = document.getElementById('cEmail')?.value?.trim();
  const phone = document.getElementById('cPhone')?.value?.trim();
  const message = document.getElementById('cMessage')?.value?.trim();
  const notice = document.getElementById('contactNotice');

  if (!name || !email || !message) {
    if (notice) { notice.textContent = 'Veuillez remplir les champs obligatoires.'; notice.className = 'form-notice form-notice--error'; }
    return;
  }
  // En prod : POST /api/contact ou table contact_requests via propriété
  if (notice) {
    notice.textContent = '✓ Message envoyé ! Notre équipe vous répondra dans les 24h.';
    notice.className = 'form-notice form-notice--success';
  }
  ['cName','cEmail','cPhone','cMessage'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

// Init global
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  animateCounters();
});
