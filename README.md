# Ymmo — Groupe Immobilier

> Projet UF B2 INFRA & DEV — Ynov Campus  
> Solution web complète pour la gestion de l'achat et la vente de biens immobiliers

---

## Présentation

**Ymmo** est une plateforme web centralisée pour un groupe immobilier implanté en France, avec un siège à Aix-en-Provence et un réseau de 12 agences réparties sur le territoire national.

La solution permet :
- Aux **clients** de consulter et rechercher des biens immobiliers (vente & location)
- Aux **agents** de publier et gérer leurs biens via un espace dédié
- Aux **administrateurs** de piloter l'ensemble de la plateforme (utilisateurs, agences, biens)

---

## Stack technique

| Couche | Technologie |
|--------|------------|
| Back-end | Node.js + Express.js |
| Base de données | MariaDB 10.4 (via XAMPP) |
| Authentification | JWT (jsonwebtoken) + bcrypt |
| Front-end | HTML5 / CSS3 / JavaScript Vanilla |
| ORM/Driver | mysql2 |
| Environnement | dotenv |
| CORS | cors |

---

## Structure du projet

```
INFRA-DEV/
├── Back/                     ← Branche BackSite
│   └── dev/
│       ├── server.js         ← Serveur Express (API REST)
│       ├── package.json
│       ├── .env              ← Variables d'environnement (non versionné)
│       └── db/
│           └── db.sql        ← Schéma de base de données
│
└── Front/                    ← Branche FrontSite
    └── files/
        ├── index.html        ← Accueil
        ├── catalogue.html    ← Catalogue des biens
        ├── bien.html         ← Fiche détaillée d'un bien
        ├── agences.html      ← Liste des agences
        ├── login.html        ← Connexion
        ├── register.html     ← Inscription
        ├── dashboard.html    ← Espace agent
        ├── admin.html        ← Interface d'administration
        ├── style.css         ← Design system complet
        ├── api.js            ← Client API (appels vers localhost:3000)
        ├── components.js     ← Composants réutilisables
        ├── index.js          ← Script page d'accueil
        ├── catalogue.js      ← Script catalogue + filtres
        └── dashboard.js      ← Script dashboard agent
```

---

## Base de données

### Schéma

```sql
agencies        → id, name, city, address, phone, email
users           → id, agency_id, first_name, last_name, email, password_hash, role, created_at
properties      → id, agency_id, title, description, city, property_type, transaction_type,
                  price, surface_area, rooms, bedrooms, status, created_at
contact_requests → id, property_id, full_name, email, phone, message, created_at
transactions    → id, property_id, agent_id, final_price, sold_at
```

### Rôles utilisateurs

| Rôle | Droits |
|------|--------|
| `agent` | Publier et gérer ses propres biens |
| `admin` | Accès complet : utilisateurs, agences, tous les biens |

### Types de biens

| Valeur | Label |
|--------|-------|
| `house` | Maison |
| `apartment` | Appartement |
| `office` | Bureau |

### Statuts de biens

| Valeur | Label |
|--------|-------|
| `available` | Disponible |
| `pending` | En cours |
| `sold` | Vendu |
| `rented` | Loué |

---

## Installation et lancement

### Prérequis

- [Node.js](https://nodejs.org/) v18+
- [XAMPP](https://www.apachefriends.org/) (Apache + MariaDB)
- Git Bash (ou terminal compatible)

---

### 1 — Cloner le projet

```bash
git clone https://github.com/votre-user/INFRA-DEV.git
cd INFRA-DEV
```

---

### 2 — Base de données

Démarrer XAMPP (Apache + MySQL), puis importer le schéma depuis Git Bash :

```bash
/c/xampp/mysql/bin/mysql -u root -p < Back/dev/db/db.sql
```

Ou depuis phpMyAdmin (`http://localhost/phpmyadmin`) → onglet **SQL** → coller le contenu de `db.sql`.

---

### 3 — Configurer le back-end

Créer le fichier `.env` dans `Back/dev/` :

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=projet_infra
JWT_SECRET=une_phrase_secrete_tres_longue_et_aleatoire
```

---

### 4 — Démarrer le back-end

**Terminal 1** (branche BackSite) :

```bash
git checkout BackSite
cd Back/dev
npm install
node server.js
```

Résultat attendu :
```
Serveur démarré sur http://localhost:3000
Connecté avec succès à la base de données MySQL !
```

---

### 5 — Démarrer le front-end

**Terminal 2** (branche FrontSite) :

```bash
git checkout FrontSite
cd Front/files
npx serve .
```

Le front est accessible sur l'URL affichée (ex: `http://localhost:59487`).

> !!! Les deux terminaux doivent rester ouverts simultanément.

---

## API — Routes disponibles

### Public (sans authentification)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/agencies` | Liste toutes les agences |
| `GET` | `/api/properties` | Liste les biens disponibles |
| `POST` | `/api/auth/register` | Créer un compte |
| `POST` | `/api/auth/login` | Connexion → retourne un JWT |

### Authentifié (JWT requis)

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/properties` | Ajouter un bien |
| `DELETE` | `/api/properties/:id` | Supprimer un bien (proprio ou admin) |
| `PATCH` | `/api/properties/:id/status` | Modifier le statut d'un bien |

### Admin uniquement

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/admin/stats` | KPIs globaux |
| `GET` | `/api/admin/users` | Liste tous les utilisateurs |
| `DELETE` | `/api/admin/users/:id` | Supprimer un utilisateur |
| `PATCH` | `/api/admin/users/:id/role` | Changer le rôle (admin ↔ agent) |
| `GET` | `/api/admin/properties` | Tous les biens (tous statuts) |
| `POST` | `/api/agencies` | Créer une agence |
| `DELETE` | `/api/agencies/:id` | Supprimer une agence |

### Authentification JWT

Le token est retourné par `/api/auth/login` et doit être envoyé dans le header :

```
Authorization: Bearer <token>
```

Validité : **24 heures**

---

## Pages front-end

| URL | Description | Accès |
|-----|-------------|-------|
| `/index.html` | Accueil + recherche + biens en vedette | Public |
| `/catalogue.html` | Catalogue filtrable (type, transaction) | Public |
| `/bien.html?id=X` | Fiche détaillée d'un bien | Public |
| `/agences.html` | Liste des agences du réseau | Public |
| `/login.html` | Connexion agent | Public |
| `/register.html` | Inscription agent | Public |
| `/dashboard.html` | Espace agent (mes biens, ajout) | JWT requis |
| `/admin.html` | Interface d'administration complète | Admin uniquement |

---

## Sécurité

- Mots de passe hachés avec **bcrypt** (10 rounds)
- Authentification par **JWT** (24h d'expiration)
- Middleware `verifyToken` sur toutes les routes protégées
- Middleware `verifyAdmin` sur toutes les routes admin
- Un agent ne peut supprimer que les biens de **sa propre agence**
- Un admin ne peut pas se supprimer lui-même
- CORS configuré (`cors` package)

---

## Créer le premier compte admin

Après inscription via `/register.html`, passer le compte en admin depuis phpMyAdmin :

```sql
UPDATE users SET role = 'admin' WHERE email = 'email@email.fr';
```

Ou directement depuis l'interface admin une fois connecté avec un compte admin existant.

---

## Auteurs

Projet réalisé dans le cadre de l'UF **INFRA & DEV** — Bachelor 2 Informatique  
**Ynov Campus Paris-Nanterre**

---
