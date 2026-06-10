# YMMO — Front-End

## Structure des fichiers

```
ymmo-front/
├── index.html          ← Accueil (hero, biens en vedette, agences, contact)
├── catalogue.html      ← Catalogue avec filtres (transaction / type)
├── bien.html           ← Fiche détaillée d'un bien (?id=X)
├── agences.html        ← Liste de toutes les agences
├── login.html          ← Connexion agent (POST /api/auth/login)
├── register.html       ← Inscription agent (POST /api/auth/register)
├── dashboard.html      ← Espace agent (biens + ajout, JWT protégé)
├── css/
│   └── style.css       ← Design system complet
└── js/
    ├── api.js          ← Client API (appels vers localhost:3000)
    ├── components.js   ← Composants réutilisables + utils
    ├── index.js        ← Script page d'accueil
    ├── catalogue.js    ← Script catalogue + filtres
    └── dashboard.js    ← Script dashboard agent
```

## Prérequis

### 1. Démarrer le back-end

```bash
cd dev/
cp .env.example .env    # remplir DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET
node server.js
# → http://localhost:3000
```

### 2. Activer CORS dans server.js

Ajouter **après** `const app = express();` et **avant** toutes les routes :

```js
// CORS — autoriser le front HTML
const cors = require('cors');
app.use(cors({ origin: '*' }));
```

Puis installer le package :
```bash
npm install cors
```

> ⚠️ En production, remplacer `'*'` par l'URL exacte du front (ex: `'https://ymmo.fr'`)

### 3. Ouvrir le front

Ouvrir `index.html` directement dans le navigateur, **ou** servir avec :

```bash
npx serve ymmo-front/
# → http://localhost:3001
```

---

## Mapping API ↔ Front

| Page | Route back | Auth |
|------|-----------|------|
| index.html | GET /api/properties | Non |
| index.html | GET /api/agencies | Non |
| catalogue.html | GET /api/properties | Non |
| agences.html | GET /api/agencies | Non |
| bien.html | GET /api/properties (filter by id côté client) | Non |
| login.html | POST /api/auth/login | Non |
| register.html | POST /api/auth/register | Non |
| register.html | GET /api/agencies | Non |
| dashboard.html | GET /api/properties | Non |
| dashboard.html | POST /api/properties | **JWT** |

---

## Token JWT

Le token est stocké dans `localStorage` sous la clé `ymmo_token`.  
L'objet user est stocké sous `ymmo_user`.  
Il est automatiquement injecté en header `Authorization: Bearer <token>` pour les routes protégées.

---

## Routes contact

La table `contact_requests` est créée en BDD mais le back ne possède pas encore d'endpoint `POST /api/contact_requests`.  
Le formulaire de contact (index.html et bien.html) affiche une confirmation côté client en attendant.  
Pour connecter : ajouter dans `server.js` :

```js
app.post('/api/contact_requests', (req, res) => {
  const { property_id, full_name, email, phone, message } = req.body;
  const q = 'INSERT INTO contact_requests (property_id, full_name, email, phone, message) VALUES (?, ?, ?, ?, ?)';
  db.query(q, [property_id, full_name, email, phone, message], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Demande enregistrée.' });
  });
});
```
