/**
 * YMMO — Dashboard Agent
 */

// Auth guard
if (!Auth.isLoggedIn()) {
  window.location.href = 'login.html';
}

const user = Auth.getUser();
let allProperties = [];

document.addEventListener('DOMContentLoaded', () => {
  initUserInfo();
  loadProperties();
});

function initUserInfo() {
  if (!user) return;
  const name = `${user.first_name} ${user.last_name}`;
  const initial = user.first_name ? user.first_name.charAt(0).toUpperCase() : '?';

  document.getElementById('headerUserName').textContent = name;
  document.getElementById('sidebarName').textContent = name;
  document.getElementById('sidebarRole').textContent = user.role === 'admin' ? 'Administrateur' : 'Agent';
  document.getElementById('sidebarAvatar').textContent = initial;

   // Afficher le lien admin uniquement si admin
  if (user.role === 'admin') {
    document.getElementById('adminLink').style.display = 'flex';
  }
}

async function loadProperties() {
  try {
    allProperties = await PropertiesAPI.getAll();
    renderPropertiesTable(allProperties);
    updateKPIs(allProperties);
  } catch (err) {
    document.getElementById('propertiesTableBody').innerHTML =
      `<tr><td colspan="8" style="text-align:center;color:var(--error);padding:32px">${err.message}</td></tr>`;
  }
}

function renderPropertiesTable(properties) {
  const tbody = document.getElementById('propertiesTableBody');
  if (properties.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--gray-400);padding:32px">
      Aucun bien disponible. <a href="#" onclick="showSection('add')" style="color:var(--navy);font-weight:600">Ajouter le premier</a>
    </td></tr>`;
    return;
  }
  tbody.innerHTML = properties.map(p => {
    const st = formatStatus(p.status);
    return `
      <tr>
        <td><strong style="color:var(--navy)">${p.title}</strong></td>
        <td>${p.city}</td>
        <td>${formatType(p.property_type)}</td>
        <td>${formatTransaction(p.transaction_type)}</td>
        <td style="font-weight:600">${formatPrice(p.price, p.transaction_type)}</td>
        <td>${p.surface_area} m²</td>
        <td><span class="status ${st.cls}">${st.label}</span></td>
        <td>
          <a href="bien.html?id=${p.id}" class="btn btn--ghost btn--sm">Voir</a>
        </td>
      </tr>
    `;
  }).join('');
}

function updateKPIs(properties) {
  document.getElementById('kpiTotal').textContent = properties.length;
  document.getElementById('kpiAvailable').textContent = properties.filter(p => p.status === 'available').length;
  document.getElementById('kpiSale').textContent = properties.filter(p => p.transaction_type === 'sale').length;
  document.getElementById('kpiRent').textContent = properties.filter(p => p.transaction_type === 'rent').length;
}

function showSection(name) {
  document.getElementById('section-properties').style.display = name === 'properties' ? 'block' : 'none';
  document.getElementById('section-add').style.display = name === 'add' ? 'block' : 'none';

  // Sidebar active
  document.querySelectorAll('.sidebar__link').forEach(l => l.classList.remove('active'));
  if (name === 'properties') document.querySelectorAll('.sidebar__link')[0].classList.add('active');
  if (name === 'add') document.querySelectorAll('.sidebar__link')[1].classList.add('active');
  return false;
}

async function handleAddProperty() {
  const errEl = document.getElementById('addError');
  const succEl = document.getElementById('addSuccess');
  const btn = document.getElementById('addSubmit');

  errEl.classList.remove('show');
  succEl.classList.remove('show');

  const payload = {
    title: document.getElementById('fTitle').value.trim(),
    description: document.getElementById('fDesc').value.trim(),
    city: document.getElementById('fCity').value.trim(),
    property_type: document.getElementById('fType').value,
    transaction_type: document.getElementById('fTransaction').value,
    price: parseFloat(document.getElementById('fPrice').value),
    surface_area: parseFloat(document.getElementById('fSurface').value),
    rooms: parseInt(document.getElementById('fRooms').value) || 0,
    bedrooms: parseInt(document.getElementById('fBedrooms').value) || 0,
  };

  const required = ['title', 'city', 'property_type', 'transaction_type'];
  const missing = required.filter(k => !payload[k]);
  if (missing.length || isNaN(payload.price) || isNaN(payload.surface_area)) {
    errEl.textContent = 'Veuillez remplir tous les champs obligatoires (*).';
    errEl.classList.add('show');
    return;
  }

  btn.textContent = 'Publication…';
  btn.disabled = true;

  try {
    await PropertiesAPI.create(payload);
    succEl.textContent = '✓ Bien publié avec succès !';
    succEl.classList.add('show');
    // Reset
    ['fTitle','fDesc','fCity','fType','fTransaction','fPrice','fSurface','fRooms','fBedrooms'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    // Recharger la liste
    await loadProperties();
    setTimeout(() => showSection('properties'), 1200);
  } catch (err) {
    errEl.textContent = err.message || 'Erreur lors de la publication.';
    errEl.classList.add('show');
  } finally {
    btn.textContent = 'Publier le bien';
    btn.disabled = false;
  }
}

function logout() {
  Auth.clearSession();
  window.location.href = 'login.html';
}
