-- ============================================
-- YMMO — Données de démonstration
-- Importer dans phpMyAdmin sur la base projet_infra
-- ============================================

USE projet_infra;

-- ─── AGENCES ───
INSERT IGNORE INTO agencies (id, name, city, address, phone, email) VALUES
(1, 'Ymmo Aix-en-Provence', 'Aix-en-Provence', '12 Cours Mirabeau', '04 42 11 22 33', 'aix@ymmo.fr'),
(2, 'Ymmo Paris 8e', 'Paris', '45 Avenue des Champs-Élysées', '01 40 11 22 33', 'paris@ymmo.fr'),
(3, 'Ymmo Lyon Presqu\'île', 'Lyon', '3 Place Bellecour', '04 72 11 22 33', 'lyon@ymmo.fr'),
(4, 'Ymmo Bordeaux', 'Bordeaux', '15 Place de la Bourse', '05 56 11 22 33', 'bordeaux@ymmo.fr'),
(5, 'Ymmo Marseille', 'Marseille', '8 La Canebière', '04 91 11 22 33', 'marseille@ymmo.fr'),
(6, 'Ymmo Nice', 'Nice', '22 Promenade des Anglais', '04 93 11 22 33', 'nice@ymmo.fr'),
(7, 'Ymmo Toulouse', 'Toulouse', '10 Place du Capitole', '05 61 11 22 33', 'toulouse@ymmo.fr'),
(8, 'Ymmo Nantes', 'Nantes', '5 Place du Commerce', '02 40 11 22 33', 'nantes@ymmo.fr'),
(9, 'Ymmo Strasbourg', 'Strasbourg', '7 Place Kléber', '03 88 11 22 33', 'strasbourg@ymmo.fr'),
(10, 'Ymmo Montpellier', 'Montpellier', '2 Place de la Comédie', '04 67 11 22 33', 'montpellier@ymmo.fr'),
(11, 'Ymmo Rennes', 'Rennes', '18 Rue Le Bastard', '02 99 11 22 33', 'rennes@ymmo.fr'),
(12, 'Ymmo Lille', 'Lille', '30 Place du Général de Gaulle', '03 20 11 22 33', 'lille@ymmo.fr');

-- ─── UTILISATEURS ───
-- Mot de passe pour tous : Ymmo2025!
-- Hash bcrypt généré pour "Ymmo2025!"
INSERT IGNORE INTO users (id, agency_id, first_name, last_name, email, password_hash, role) VALUES
(1, 1, 'Thomas', 'Dupont', 'thomas.dupont@ymmo.fr', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
(2, 1, 'Sophie', 'Martin', 'sophie.martin@ymmo.fr', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'agent'),
(3, 2, 'Lucas', 'Bernard', 'lucas.bernard@ymmo.fr', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'agent'),
(4, 3, 'Emma', 'Petit', 'emma.petit@ymmo.fr', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'agent'),
(5, 4, 'Hugo', 'Leroy', 'hugo.leroy@ymmo.fr', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'agent');

-- ─── BIENS IMMOBILIERS ───
INSERT IGNORE INTO properties (agency_id, title, description, city, property_type, transaction_type, price, surface_area, rooms, bedrooms, status) VALUES

-- Aix-en-Provence (agence 1)
(1, 'Villa provençale avec piscine', 'Superbe villa de caractère au cœur de la Provence. Grand jardin arboré, piscine chauffée, vue dégagée sur la campagne. Cuisine équipée ouverte sur terrasse.', 'Aix-en-Provence', 'house', 'sale', 850000, 220.00, 7, 4, 'available'),
(1, 'Appartement T3 centre historique', 'Bel appartement rénové au cœur du vieil Aix. Parquet ancien, moulures, hauteur sous plafond 3m. Proche Cours Mirabeau.', 'Aix-en-Provence', 'apartment', 'sale', 320000, 72.00, 3, 2, 'available'),
(1, 'Studio meublé étudiant', 'Studio entièrement meublé et équipé, idéal étudiant. Proche université et transports. Charges incluses.', 'Aix-en-Provence', 'apartment', 'rent', 650, 24.00, 1, 0, 'available'),

-- Paris (agence 2)
(2, 'Appartement Haussmannien 75008', 'Somptueux appartement de type haussmannien au 3e étage avec ascenseur. Parquet point de Hongrie, cheminées en marbre, double vitrage. Vue sur l\'avenue.', 'Paris', 'apartment', 'sale', 1250000, 145.00, 5, 3, 'available'),
(2, 'Studio Paris 11e', 'Studio lumineux au 4e étage sans ascenseur. Idéal investissement locatif. Métro à 200m.', 'Paris', 'apartment', 'rent', 1100, 22.00, 1, 0, 'available'),
(2, 'Bureaux open space Champs-Élysées', 'Plateaux de bureaux modernes en plein cœur du Triangle d\'Or. Accès sécurisé, salles de réunion, parking souterrain disponible.', 'Paris', 'office', 'rent', 8500, 180.00, 0, 0, 'available'),

-- Lyon (agence 3)
(3, 'Maison avec jardin Caluire', 'Belle maison familiale dans quartier résidentiel calme. Grand jardin de 600m², garage double, cave. Écoles à proximité.', 'Lyon', 'house', 'sale', 520000, 168.00, 6, 4, 'available'),
(3, 'T2 vue Saône Vieux-Lyon', 'Appartement avec vue imprenable sur la Saône. Rénovation complète 2023, cuisine ouverte, balcon. Secteur Vieux-Lyon classé UNESCO.', 'Lyon', 'apartment', 'sale', 245000, 48.00, 2, 1, 'available'),
(3, 'Local commercial Presqu\'île', 'Local commercial en rez-de-chaussée, vitrine sur rue passante. Idéal commerce de proximité ou restauration. Bail commercial 3/6/9.', 'Lyon', 'office', 'rent', 2200, 65.00, 0, 0, 'available'),

-- Bordeaux (agence 4)
(4, 'Chartreuse bordelaise', 'Authentique chartreuse bordelaise du XVIIIe siècle entièrement rénovée. Vignes en limite de propriété, cave à vin, pool house.', 'Bordeaux', 'house', 'sale', 1100000, 280.00, 8, 5, 'available'),
(4, 'T3 Quartier Saint-Pierre', 'Appartement dans l\'hypercentre bordelais, pierre de taille apparente, poutres. Très bon état général, DPE C.', 'Bordeaux', 'apartment', 'sale', 380000, 78.00, 3, 2, 'available'),
(4, 'T1 meublé étudiant Victoire', 'Studio meublé proche place de la Victoire et universités. Tout équipé, fibre incluse.', 'Bordeaux', 'apartment', 'rent', 720, 28.00, 1, 0, 'available'),

-- Marseille (agence 5)
(5, 'Villa bord de mer Les Goudes', 'Villa d\'architecte avec accès direct à la mer dans le plus beau calanque de Marseille. Terrasses multiples, jacuzzi, garage.', 'Marseille', 'house', 'sale', 1650000, 195.00, 6, 4, 'available'),
(5, 'Appartement vue mer 7e', 'Appartement lumineux avec vue panoramique sur la Méditerranée. Terrasse 20m², parking, cave. Résidence sécurisée.', 'Marseille', 'apartment', 'sale', 420000, 89.00, 4, 2, 'available'),
(5, 'T2 Cours Julien', 'Appartement dans le quartier branché du Cours Julien. Rénové avec goût, parquet, cuisine ouverte.', 'Marseille', 'apartment', 'rent', 850, 45.00, 2, 1, 'available'),

-- Nice (agence 6)
(6, 'Villa collines vue mer', 'Magnifique villa contemporaine dans les collines niçoises. Vue mer et Monaco, piscine à débordement, jardin méditerranéen paysager.', 'Nice', 'house', 'sale', 2200000, 310.00, 8, 5, 'available'),
(6, 'Appartement Promenade des Anglais', 'Appartement avec vue directe sur la Promenade et la mer. Prestations haut de gamme, double séjour, 2 terrasses.', 'Nice', 'apartment', 'sale', 890000, 112.00, 4, 2, 'available'),

-- Toulouse (agence 7)
(7, 'Maison avec jardin Colomiers', 'Maison récente (2018) dans résidence sécurisée. Jardin privatif 400m², garage, cellier. Proche Airbus.', 'Toulouse', 'house', 'sale', 380000, 125.00, 5, 3, 'available'),
(7, 'T3 Saint-Cyprien', 'Appartement dans le quartier Saint-Cyprien en pleine mutation. Vue canal du Midi, rénové 2022.', 'Toulouse', 'apartment', 'rent', 950, 67.00, 3, 2, 'available'),

-- Nantes (agence 8)
(8, 'Maison de ville centre Nantes', 'Belle maison de ville nantaise sur 3 niveaux. Jardin de 200m², garage, cave voûtée. À deux pas de la place Graslin.', 'Nantes', 'house', 'sale', 490000, 155.00, 6, 4, 'available'),
(8, 'Bureaux Île de Nantes', 'Bureaux modernes dans le quartier en plein essor de l\'Île de Nantes. Open space et bureaux fermés, terrasse accessible.', 'Nantes', 'office', 'rent', 3200, 120.00, 0, 0, 'available'),

-- Strasbourg (agence 9)
(9, 'Maison alsacienne Krutenau', 'Authentique maison alsacienne à colombages entièrement restaurée. Jardin avec accès canal, garage, cave.', 'Strasbourg', 'house', 'sale', 620000, 180.00, 7, 4, 'available'),
(9, 'T2 Orangerie', 'Appartement dans le quartier chic de l\'Orangerie. Vue sur le parc, parquet, double vitrage.', 'Strasbourg', 'apartment', 'sale', 198000, 52.00, 2, 1, 'available'),

-- Montpellier (agence 10)
(10, 'Villa contemporaine Montpellier', 'Villa d\'architecte récente (2020). Piscine chauffée, domotique, panneaux solaires. Quartier Port Marianne.', 'Montpellier', 'house', 'sale', 750000, 198.00, 6, 4, 'available'),
(10, 'T3 Antigone', 'Appartement dans le quartier Antigone, architecture Ricardo Bofill. Grande terrasse, parking, cave.', 'Montpellier', 'apartment', 'rent', 1050, 74.00, 3, 2, 'available'),

-- Rennes (agence 11)
(11, 'Maison bretonne Saint-Grégoire', 'Charmante maison bretonne avec pierres apparentes. Jardin de 800m², double garage, grande cuisine familiale.', 'Rennes', 'house', 'sale', 420000, 148.00, 6, 4, 'available'),

-- Lille (agence 12)
(12, 'Maison de maître Vieux-Lille', 'Splendide maison de maître dans le Vieux-Lille. Façade en briques flamandes, jardin sur cour, cave voûtée.', 'Lille', 'house', 'sale', 680000, 240.00, 8, 5, 'available'),
(12, 'T2 Euralille', 'Appartement moderne dans le quartier d\'affaires Euralille. Proche TGV Paris 1h, tout confort.', 'Lille', 'apartment', 'rent', 780, 44.00, 2, 1, 'available');

