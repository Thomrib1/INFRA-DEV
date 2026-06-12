# Ymmo — Groupe Immobilier

> **Projet UF B2 INFRA & DEV** — Ynov Campus Paris-Nanterre
> Développement d'une solution web de gestion immobilière + infrastructure réseau multi-sites sécurisée

---

## Présentation du projet

**Ymmo** est un groupe immobilier fictif implanté en France avec un siège à Aix-en-Provence et un réseau de 12 agences réparties sur le territoire national.

Le projet comprend deux volets indissociables :

**Partie DEV** — Une plateforme web centralisée permettant aux clients de consulter les biens et aux agents/administrateurs de gérer les annonces, les agences et les utilisateurs.

**Partie INFRA** — Une architecture réseau d'entreprise sécurisée et scalable reliant le siège et les 12 agences via VPN/IPSec, avec Active Directory, DNS, DHCP, pare-feu et politique de droits.

---

## Stack technique

### Partie DEV

| Couche | Technologie | Détail |
|--------|------------|--------|
| Back-end | Node.js + Express.js | API REST sur le port 3000 |
| Base de données | MariaDB 10.4 (XAMPP) | Base `projet_infra`, 5 tables relationnelles |
| Authentification | JWT + bcrypt | Tokens 24h, mots de passe hachés (10 rounds) |
| Front-end | HTML5 / CSS3 / JavaScript Vanilla | Multi-pages responsive, design system custom |
| Driver SQL | mysql2 | Pool de connexions (10 max) |
| Serveur front | http-server | Fichiers statiques sur le port 8080 |
| Environnement | dotenv | Variables d'environnement `.env` |
| CORS | cors | Communication cross-origin front ↔ back |

### Partie INFRA

| Composant | Technologie |
|-----------|------------|
| Virtualisation | VMware Workstation (8 réseaux VMnet Host-only) |
| Pare-feu / Routeur | pfSense 2.7 |
| Serveurs | Windows Server 2022 |
| Annuaire | Active Directory (forêt `ymmo.local`) |
| Services réseau | DNS, DHCP (6 étendues), DHCP Relay |
| Hébergement web | Node.js + MariaDB sur SRV-WEB (`10.10.99.30`) |

---

## Structure du projet

```
INFRA-DEV/
├── dev/                        ← Back-end (API)
│   ├── server.js               ← Serveur Express (toutes les routes)
│   ├── package.json            ← Dépendances Node.js
│   ├── .env                    ← Variables d'environnement (non versionné)
│   └── db/
│       ├── db.sql              ← Schéma de la base (structure seule)
│       └── db_with_data.sql    ← Schéma + données de démonstration
│
├── files/                      ← Front-end (HTML/CSS/JS)
│   ├── index.html              ← Accueil (hero, recherche, biens vedettes, agences)
│   ├── catalogue.html          ← Catalogue filtrable (type, transaction)
│   ├── bien.html               ← Fiche détaillée d'un bien (?id=X)
│   ├── agences.html            ← Liste des 12 agences
│   ├── login.html              ← Connexion agent/admin
│   ├── register.html           ← Inscription avec sélection d'agence
│   ├── dashboard.html          ← Espace agent (mes biens + ajout)
│   ├── admin.html              ← Interface d'administration complète
│   ├── style.css               ← Design system complet (responsive)
│   ├── api.js                  ← Client API (appels vers le back)
│   ├── components.js           ← Composants réutilisables + utilitaires
│   ├── index.js                ← Script page d'accueil
│   ├── catalogue.js            ← Script catalogue + filtres
│   └── dashboard.js            ← Script dashboard agent
│
└── README.md
```

---

## Base de données

### Schéma relationnel

```
agencies ──┐
           ├──< users ──┐
           │             │
           ├──< properties ──< contact_requests
           │        │
           │        └──< transactions
           │                  ↑
           └──────────────────┘ (via agent_id)
```

### Tables

| Table | Description | Colonnes principales |
|-------|-------------|---------------------|
| `agencies` | Les 12 agences du réseau | id, name, city, address, phone, email |
| `users` | Comptes admin et agents | id, agency_id (FK), first_name, last_name, email, password_hash, role |
| `properties` | Biens immobiliers | id, agency_id (FK), user_id (FK), title, description, city, property_type, transaction_type, price, surface_area, rooms, bedrooms, status |
| `contact_requests` | Demandes clients sur un bien | id, property_id (FK), full_name, email, phone, message |
| `transactions` | Historique des ventes/locations | id, property_id (FK), agent_id (FK), final_price, sold_at |

### Contraintes

| Contrainte | Détail |
|-----------|--------|
| `role` | ENUM : `admin`, `agent` |
| `property_type` | ENUM : `house`, `apartment`, `office` |
| `transaction_type` | ENUM : `sale`, `rent` |
| `status` | ENUM : `available`, `pending`, `sold`, `rented` |
| Clés étrangères | ON DELETE CASCADE (agence → biens), ON DELETE SET NULL (user → biens) |
| Email unique | Contrainte UNIQUE sur `users.email` et `agencies.email` |

---

## 🔌 API REST — Routes

### Public (sans authentification)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/agencies` | Liste toutes les agences |
| `GET` | `/api/properties` | Liste les biens disponibles |
| `POST` | `/api/auth/register` | Créer un compte (agent par défaut) |
| `POST` | `/api/auth/login` | Connexion → retourne un JWT |

### Authentifié (JWT requis)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/my-properties` | Biens publiés par l'utilisateur connecté |
| `POST` | `/api/properties` | Publier un bien (lié au user_id et agency_id) |
| `DELETE` | `/api/properties/:id` | Supprimer un bien (propriétaire ou admin) |
| `PATCH` | `/api/properties/:id/status` | Changer le statut (+ auto-transaction si sold/rented) |
| `POST` | `/api/contact_requests` | Envoyer une demande de contact sur un bien |

### Admin uniquement

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/admin/stats` | KPIs globaux (users, agences, biens, valeur catalogue) |
| `GET` | `/api/admin/users` | Tous les utilisateurs avec leur agence |
| `DELETE` | `/api/admin/users/:id` | Supprimer un utilisateur (pas soi-même) |
| `PATCH` | `/api/admin/users/:id/role` | Basculer admin ↔ agent |
| `GET` | `/api/admin/properties` | Tous les biens (tous statuts) |
| `POST` | `/api/agencies` | Créer une agence |
| `DELETE` | `/api/agencies/:id` | Supprimer une agence |

### Authentification JWT

Le token est retourné par `POST /api/auth/login` et doit être envoyé dans le header :
```
Authorization: Bearer <token>
```
Validité : 24 heures. Payload : `{ id, role, agency_id }`.

---

## Pages front-end

| URL | Description | Accès |
|-----|-------------|-------|
| `/index.html` | Accueil — hero animé, barre de recherche, biens vedettes, services, agences, contact | Public |
| `/catalogue.html` | Catalogue filtrable par type et transaction | Public |
| `/bien.html?id=X` | Fiche détaillée + formulaire de demande de contact | Public |
| `/agences.html` | Liste des agences du réseau Ymmo | Public |
| `/login.html` | Page de connexion (split screen) | Public |
| `/register.html` | Inscription avec sélection d'agence | Public |
| `/dashboard.html` | Espace agent — mes biens, KPIs, ajout de bien | JWT requis |
| `/admin.html` | Administration — utilisateurs, agences, tous les biens, stats | Admin uniquement |

### Logique métier front-end

- Chaque agent ne voit que **ses propres biens** dans "Mes biens" (filtrage par `user_id`)
- Tous les biens restent visibles dans le catalogue public
- Le propriétaire d'un bien ne peut **pas** s'envoyer une demande de contact à lui-même
- Le lien "Administration" n'apparaît dans la sidebar que pour les comptes `admin`
- Le passage d'un bien en statut `sold` ou `rented` crée automatiquement une **transaction** en base

---

## Sécurité

| Mesure | Implémentation |
|--------|---------------|
| Hachage des mots de passe | bcrypt, 10 salt rounds |
| Authentification | JWT signé (secret `.env`), expiration 24h |
| Middleware `verifyToken` | Toutes les routes protégées |
| Middleware `verifyAdmin` | Routes `/api/admin/*` et gestion agences |
| Vérification propriétaire | Un agent ne peut supprimer/modifier que ses propres biens (`user_id`) |
| Protection auto-suppression | Un admin ne peut pas supprimer son propre compte |
| CORS | Package `cors` configuré |
| URL API dynamique | `window.location.hostname` — compatible multi-réseau |

---

## Installation et lancement

### Prérequis

- **Node.js** v18+
- **XAMPP** (Apache + MariaDB)
- **Git Bash** (ou terminal compatible)

### 1 — Cloner le projet

```bash
git clone https://github.com/votre-user/INFRA-DEV.git
cd INFRA-DEV
```

### 2 — Créer et remplir la base de données

Démarrer XAMPP → Apache et MySQL doivent être **verts**.

Ouvrir `http://localhost/phpmyadmin` → onglet **Importer** → choisir :
- `dev/db/db.sql` pour le schéma seul (tables vides)
- `dev/db/db_with_data.sql` pour le schéma + 12 agences, 5 utilisateurs, 28 biens de démo

### 3 — Configurer le back-end

Créer le fichier `dev/.env` :

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=projet_infra
JWT_SECRET=une_phrase_secrete_tres_longue_et_aleatoire
```

### 4 — Installer les dépendances

```bash
cd dev
npm install
```

### 5 — Lancer le projet (2 terminaux)

**Terminal 1 — Back-end :**
```bash
cd dev
node server.js
```

R�sultat attendu :
```
Serveur démarré sur http://localhost:3000
Connecté avec succès à la base de données MySQL !
```

**Terminal 2 — Front-end :**
```bash
npm install -g http-server
http-server files -p 8080
```

> Utiliser **`http-server`** et non `npx serve` — ce dernier supprime les paramètres d'URL (`?id=`) nécessaires aux fiches de biens.

### 6 — Accéder au site

- **En local** : `http://localhost:8080`
- **Depuis un autre appareil** sur le même réseau : `http://VOTRE_IP:8080`

Trouver votre IP locale :
```bash
ipconfig
```
→ Chercher l'**adresse IPv4** de la carte Wi-Fi.

### 7 — Créer le premier compte admin

Après inscription via `/register.html`, passer le compte en admin via phpMyAdmin :

```sql
UPDATE users SET role = 'admin' WHERE email = 'votre@email.fr';
```

---

## Architecture réseau (partie INFRA)

### Topologie

```
                    ┌─────────────────────────────────┐
                    │     SIÈGE — AIX-EN-PROVENCE      │
                    │                                   │
                    │  pfSense (routeur / pare-feu)     │
                    │   ├── Direction     10.10.10.0/24 │
                    │   ├── Commercial    10.10.20.0/24 │
                    │   ├── Com & Mktg    10.10.30.0/24 │
                    │   ├── Admin-RH      10.10.40.0/24 │
                    │   ├── IT            10.10.50.0/24 │
                    │   └── Serveurs      10.10.99.0/24 │
                    │       ├── SRV-YMMO (AD/DNS/DHCP)  │
                    │       └── SRV-WEB  (App/MySQL)    │
                    └────────────┬──────────────────────┘
                                 │ VPN / WAN
                    ┌────────────┴──────────────────────┐
                    │     AGENCE DISTANTE                │
                    │     Réseau 10.10.60.0/24           │
                    │     Postes commerciaux             │
                    └───────────────────────────────────┘
```

### Serveurs

| Serveur | IP | Rôle |
|---------|-----|------|
| SRV-YMMO | 10.10.99.10 | Active Directory, DNS, DHCP, Serveur de fichiers |
| SRV-WEB | 10.10.99.30 | Application Ymmo (Node.js port 3000, Front port 8080), MySQL |

### Matrice des droits (dossiers partagés)

| Pôle \ Dossier | Direction | Commercial | Com & Mktg | Admin-RH | IT |
|-----------------|-----------|------------|------------|----------|-----|
| Direction | RW | R | R | R | R |
| Commercial | — | RW | R | — | — |
| Com & Marketing | — | R | RW | — | — |
| Admin-RH | — | R | R | RW | — |
| IT & Support | — | R | R | — | RW |
| Agence (commercial) | — | RW | — | — | — |

*RW = Lecture/Écriture, R = Lecture seule, — = Accès refusé*

---

## Problèmes rencontrés et solutions

| Problème | Cause | Solution |
|----------|-------|---------|
| `Failed to fetch` | Front et back sur le même port | Séparation : API port 3000, front port 8080 |
| `APIIPA sur l'agence` | Poste agence n'obtient pas d'IP | DHCP Relay configuré sur pfSense |
| `maximumFractionDigits` | Prix null/undefined dans le formatage | Vérification `isNaN()` dans `formatPrice()` |
| `Access denied for user` | Multiples instances de `node server.js` | `taskkill /F /IM node.exe` puis relancer |
| `Bien non trouvé` | `npx serve` supprime les `?id=` des URLs | Migration vers `http-server` |
| Règles pare-feu trop strictes | Accès web bloqué depuis l'agence | Règle pfSense OPT6 → SRV-WEB (ports 3000 + 8080) |
| Tous les biens dans "Mes biens" | Pas de filtre par utilisateur | Ajout colonne `user_id` + route `/api/my-properties` |
| `agency_id cannot be null` | Compte créé sans agence associée | Liaison user ↔ agence obligatoire via `UPDATE users` |

---

## Données de démonstration

Le fichier `db_with_data.sql` inclut :

- **12 agences** — Aix-en-Provence, Paris, Lyon, Bordeaux, Marseille, Nice, Toulouse, Nantes, Strasbourg, Montpellier, Rennes, Lille
- **5 utilisateurs** — 1 admin + 4 agents répartis sur les agences
- **28 biens immobiliers** — maisons, appartements, bureaux en vente et location sur tout le territoire

Le fichier `db_with_data_safe.sql` utilise `INSERT IGNORE` pour ne pas écraser les données existantes.

---

## Déploiement sur SRV-WEB (partie INFRA)

Pour déployer sur la VM SRV-WEB de l'infrastructure :

1. Copier le projet complet sur `C:\INFRA-DEV\`
2. Installer Node.js sur la VM
3. Installer XAMPP et importer la base
4. Créer le `.env` dans `C:\INFRA-DEV\dev\`
5. `cd C:\INFRA-DEV\dev && npm install && node server.js`
6. `http-server C:\INFRA-DEV\files -p 8080`
7. Autoriser les ports 3000 et 8080 dans le pare-feu Windows
8. Ajouter les règles pfSense sur OPT6 vers SRV-WEB

L'API est dynamique (`window.location.hostname`) : aucune modification de code nécessaire côté front.

---

## Auteurs

Projet réalisé dans le cadre de l'UF **INFRA & DEV** — Bachelor 2 Informatique
**Ynov Campus Paris-Nanterre** — 2025/2026

| Étudiant | Responsabilité |
|----------|---------------|
| Thomas Ribeiro | Réseau & sécurité (pfSense, VLANs, NAT, pare-feu) |
| Thomas Ribeiro, Adrien Yapoudjian | Serveurs & annuaire (Windows Server, AD, DNS, NTFS, GPO) |
| Ugo Coste, Adrien Yapoudjian | Application & intégration (Node.js, front-end, MySQL, merge INFRA × DEV) |

---
