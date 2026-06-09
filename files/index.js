/**
 * YMMO — Page d'accueil
 */
document.addEventListener('DOMContentLoaded', async () => {
  await loadFeaturedProperties();
  await loadAgenciesPreview();
});

async function loadFeaturedProperties() {
  const grid = document.getElementById('featuredProperties');
  if (!grid) return;
  try {
    const properties = await PropertiesAPI.getAll();
    const featured = properties.slice(0, 3);
    if (featured.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--gray-400)">
        <p>Aucun bien disponible pour le moment.</p>
        <a href="catalogue.html" class="btn btn--primary" style="margin-top:16px;display:inline-flex">Voir le catalogue</a>
      </div>`;
      return;
    }
    grid.innerHTML = featured.map(renderPropertyCard).join('');
  } catch (err) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--gray-400)">
      <p>Impossible de charger les biens. Vérifiez que le serveur est démarré.</p>
    </div>`;
  }
}

async function loadAgenciesPreview() {
  const container = document.getElementById('agenciesPreview');
  if (!container) return;
  try {
    const agencies = await AgenciesAPI.getAll();
    const preview = agencies.slice(0, 4);
    if (preview.length === 0) {
      container.innerHTML = `<div style="color:var(--gray-400);font-size:0.9rem;">Aucune agence enregistrée.</div>`;
      return;
    }
    container.innerHTML = preview.map(renderAgencyCardPreview).join('');
  } catch (err) {
    container.innerHTML = `<div style="color:var(--gray-400);font-size:0.9rem;">Serveur non disponible.</div>`;
  }
}
