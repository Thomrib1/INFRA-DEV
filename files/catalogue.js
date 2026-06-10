/**
 * YMMO — Page Catalogue
 */
let allProperties = [];
let activeFilters = { transaction: '', type: '' };

document.addEventListener('DOMContentLoaded', async () => {
  // Lire params URL (depuis search bar homepage)
  const params = new URLSearchParams(window.location.search);
  if (params.get('city')) activeFilters.city = params.get('city');
  if (params.get('type')) activeFilters.type = params.get('type');
  if (params.get('transaction')) activeFilters.transaction = params.get('transaction');

  // Mettre à jour les chips actives selon les params
  syncChipsFromFilters();

  await loadProperties();
  initFilterChips();
});

async function loadProperties() {
  try {
    allProperties = await PropertiesAPI.getAll();
    renderFiltered();
  } catch (err) {
    document.getElementById('catalogueGrid').innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--gray-400)">
        <p style="font-size:1.05rem;margin-bottom:8px;">Serveur non disponible</p>
        <p style="font-size:0.85rem;">Assurez-vous que le back-end est démarré sur localhost:3000</p>
      </div>`;
  }
}

function renderFiltered() {
  const grid = document.getElementById('catalogueGrid');
  const count = document.getElementById('filtersCount');

  let filtered = allProperties;
  if (activeFilters.transaction) {
    filtered = filtered.filter(p => p.transaction_type === activeFilters.transaction);
  }
  if (activeFilters.type) {
    filtered = filtered.filter(p => p.property_type === activeFilters.type);
  }
  if (activeFilters.city) {
    const q = activeFilters.city.toLowerCase();
    filtered = filtered.filter(p => p.city.toLowerCase().includes(q));
  }

  if (count) count.textContent = `${filtered.length} bien${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--gray-400)">
      <p style="font-size:1.05rem;margin-bottom:12px;">Aucun bien ne correspond à votre recherche.</p>
      <button class="btn btn--primary" onclick="resetFilters()">Réinitialiser les filtres</button>
    </div>`;
    return;
  }
  grid.innerHTML = filtered.map(renderPropertyCard).join('');
}

function initFilterChips() {
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const filter = chip.dataset.filter;
      const val = chip.dataset.val;
      // Toggle actif dans le groupe
      document.querySelectorAll(`.filter-chip[data-filter="${filter}"]`).forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilters[filter] = val;
      renderFiltered();
    });
  });
}

function syncChipsFromFilters() {
  if (activeFilters.transaction) {
    document.querySelectorAll('[data-filter="transaction"]').forEach(c => c.classList.remove('active'));
    const chip = document.querySelector(`[data-filter="transaction"][data-val="${activeFilters.transaction}"]`);
    if (chip) chip.classList.add('active');
  }
  if (activeFilters.type) {
    document.querySelectorAll('[data-filter="type"]').forEach(c => c.classList.remove('active'));
    const chip = document.querySelector(`[data-filter="type"][data-val="${activeFilters.type}"]`);
    if (chip) chip.classList.add('active');
  }
}

function resetFilters() {
  activeFilters = { transaction: '', type: '' };
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.filter-chip[data-val=""]').forEach(c => c.classList.add('active'));
  renderFiltered();
}
