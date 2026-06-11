const express = require('express'); // framework principal pour créer le serv web
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// INITIALISATION DE L'APP
const app = express();
app.use(express.json()); // indispensable, permet au serv de comprendre les données envoyées en format JSON

const cors = require('cors');
app.use(cors({ origin: '*' })); // autorise n'importe quel site (front-end) à communiquer avec l'API

const path = require('path');
app.use(express.static(path.join(__dirname, '../files'))); // rend le dossier '../files' accessible au public

// connexion à la DB
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// test de la connexion
db.getConnection((err, connection) => {
    if (err) {
        console.error("Erreur de connexion à la BDD :", err);
    } else {
        console.log("Connecté avec succès à la base de données MySQL !");
        connection.release();
    }
});

// MIDDLEWARES (Vigiles de secu pour protéger les routes sensibles)
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Accès refusé. Token manquant." });
    try {
        // décrypte le token avec clé secrète
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // stocke les info du user décryptées dans req pour les utiliser dans les routes suivantes
        next();
    } catch (error) {
        res.status(403).json({ error: "Token invalide ou expiré." });
    }
};

// vérif si le user co possède le grade "admin"
const verifyAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Accès refusé. Droits administrateur requis." });
    }
    next();
};

// ROUTES AGENCES
// créer nouvelle agence (résa aux admins)
app.post('/api/agencies', verifyToken, verifyAdmin, (req, res) => {
    const { name, city, address, phone, email } = req.body;
    const query = 'INSERT INTO agencies (name, city, address, phone, email) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [name, city, address, phone, email], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Agence créée !", agencyId: result.insertId });
    });
});

// récup la liste des agences (Public)
app.get('/api/agencies', (req, res) => {
    db.query('SELECT * FROM agencies', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// supp une agence (résa aux admins)
app.delete('/api/agencies/:id', verifyToken, verifyAdmin, (req, res) => {
    db.query('DELETE FROM agencies WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: "Agence introuvable." });
        res.json({ message: "Agence supprimée." });
    });
});

// ROUTES AUTHENTIFICATION
// inscription d'un nouvel utilisateur
app.post('/api/auth/register', async (req, res) => {
    const { agency_id, first_name, last_name, email, password, role } = req.body;
    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ error: "Veuillez remplir tous les champs obligatoires." });
    }
    try {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const query = 'INSERT INTO users (agency_id, first_name, last_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(query, [agency_id || null, first_name, last_name, email, passwordHash, role || 'agent'], (err, result) => {
            if (err) {
                // ER_DUP_ENTRY = Erreur SQL si l'email existe déjà dans la BDD
                if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: "Cet email est déjà utilisé." });
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: "Utilisateur créé avec succès !", userId: result.insertId });
        });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors du hachage du mot de passe." });
    }
});

// connexion d'un utilisateur
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Veuillez fournir un email et un mot de passe." });
    
    // cherche l'utilisateur par son email
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ error: "Identifiants incorrects." });
        
        // compare le mdp tapé avec celui stock en base
        const user = results[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ error: "Identifiants incorrects." });
        
        // si bon mdp, génère un token JWT valide 24 heures
        const token = jwt.sign(
            { id: user.id, role: user.role, agency_id: user.agency_id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.json({
            message: "Connexion réussie !",
            token, // front-end devra stocker ce token pour futures requêtes
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role
            }
        });
    });
});

// ROUTES BIENS IMMOBILIERS (PROPERTIES)
// récup tous les biens disponibles (public)
app.get('/api/properties', (req, res) => {
    db.query('SELECT * FROM properties WHERE status = "available" ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// récup uniquement les biens du user connecté
app.get('/api/my-properties', verifyToken, (req, res) => {
    db.query(
        'SELECT * FROM properties WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.id], // utilise l'ID de l'agent qui a fait la requête
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

// add un bien (agent connecté), stocke maintenant le user_id
app.post('/api/properties', verifyToken, (req, res) => {
    const { title, description, city, property_type, transaction_type, price, surface_area, rooms, bedrooms } = req.body;
    const agency_id = req.user.agency_id;
    const user_id = req.user.id;

    if (!title || !city || !property_type || !transaction_type || !price || !surface_area) {
        return res.status(400).json({ error: "Veuillez remplir tous les champs obligatoires." });
    }

    const query = `
        INSERT INTO properties 
        (agency_id, user_id, title, description, city, property_type, transaction_type, price, surface_area, rooms, bedrooms, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')
    `;
    db.query(query, [agency_id, user_id, title, description, city, property_type, transaction_type, price, surface_area, rooms || 0, bedrooms || 0], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Bien immobilier ajouté avec succès !", propertyId: result.insertId });
    });
});

// supp un bien (admin OU propriétaire du bien)
app.delete('/api/properties/:id', verifyToken, (req, res) => {
    const propertyId = req.params.id;

    db.query('SELECT * FROM properties WHERE id = ?', [propertyId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: "Bien introuvable." });
        
        const property = results[0];
        
        // seul un admin ou le propriétaire du bien peut le supprimer
        if (req.user.role !== 'admin' && property.user_id !== req.user.id) {
            return res.status(403).json({ error: "Vous ne pouvez pas supprimer ce bien." });
        }
        db.query('DELETE FROM properties WHERE id = ?', [propertyId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Bien supprimé avec succès." });
        });
    });
});

// modifier le statut d'un bien (passer de "disponible" à "vendu")
app.patch('/api/properties/:id/status', verifyToken, (req, res) => {
    const { status } = req.body;
    const validStatuses = ['available', 'pending', 'sold', 'rented'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Statut invalide." });
    }

    db.query('SELECT * FROM properties WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: "Bien introuvable." });

        const property = results[0];

        // même vérif, seul l'admin ou le créateur du bien peut changer son statut
        if (req.user.role !== 'admin' && property.user_id !== req.user.id) {
            return res.status(403).json({ error: "Action non autorisée." });
        }

        db.query('UPDATE properties SET status = ? WHERE id = ?', [status, req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });

            // si le bien est vendu ou loué, save la transaction
            if (status === 'sold' || status === 'rented') {
                const transactionQuery = `
                    INSERT INTO transactions (property_id, agent_id, final_price, sold_at)
                    VALUES (?, ?, ?, NOW())
                `;
                db.query(transactionQuery, [property.id, req.user.id, property.price], (err) => {
                    if (err) console.error("Erreur transaction :", err.message);
                });
            }

            res.json({ message: "Statut mis à jour." });
        });
    });
});

// ROUTE CONTACT REQUESTS (formulaire de contact)
// save une demande de contact d'un client potentiel (public)
app.post('/api/contact_requests', (req, res) => {
    const { property_id, full_name, email, phone, message } = req.body;

    if (!full_name || !email || !message) {
        return res.status(400).json({ error: "Veuillez remplir tous les champs obligatoires." });
    }

    const query = 'INSERT INTO contact_requests (property_id, full_name, email, phone, message) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [property_id, full_name, email, phone, message], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Demande enregistrée avec succès !" });
    });
});

// ROUTES ADMIN (tableau de bord et gestion)
// récup toutes les stats pour le dashboard de l'admin
app.get('/api/admin/stats', verifyToken, verifyAdmin, (req, res) => {
    const stats = {};

    db.query('SELECT COUNT(*) as total FROM users', (err, r) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.total_users = r[0].total;
        db.query('SELECT COUNT(*) as total FROM users WHERE role = "admin"', (err, r) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.total_admins = r[0].total;
            db.query('SELECT COUNT(*) as total FROM agencies', (err, r) => {
                if (err) return res.status(500).json({ error: err.message });
                stats.total_agencies = r[0].total;
                db.query('SELECT COUNT(*) as total FROM properties', (err, r) => {
                    if (err) return res.status(500).json({ error: err.message });
                    stats.total_properties = r[0].total;
                    db.query('SELECT COUNT(*) as total FROM properties WHERE status = "available"', (err, r) => {
                        if (err) return res.status(500).json({ error: err.message });
                        stats.available_properties = r[0].total;
                        db.query('SELECT COUNT(*) as total FROM properties WHERE status = "sold"', (err, r) => {
                            if (err) return res.status(500).json({ error: err.message });
                            stats.sold_properties = r[0].total;
                            db.query('SELECT COALESCE(SUM(price), 0) as total FROM properties WHERE status = "available"', (err, r) => {
                                if (err) return res.status(500).json({ error: err.message });
                                stats.total_valuation = r[0].total;
                                res.json(stats); // renvoie l'objet global contenant toutes les stats
                            });
                        });
                    });
                });
            });
        });
    });
});

// lister tous les utilisateurs et leurs infos (Admin)
app.get('/api/admin/users', verifyToken, verifyAdmin, (req, res) => {
    const query = `
        SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.created_at,
               a.name as agency_name, a.city as agency_city
        FROM users u
        LEFT JOIN agencies a ON u.agency_id = a.id
        ORDER BY u.created_at DESC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// supp un user (Admin)
app.delete('/api/admin/users/:id', verifyToken, verifyAdmin, (req, res) => {
    // sécu de base : on empêche l'admin de supp son propre compte par erreur
    if (parseInt(req.params.id) === req.user.id) {
        return res.status(400).json({ error: "Vous ne pouvez pas supprimer votre propre compte." });
    }

    db.query('DELETE FROM users WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: "Utilisateur introuvable." });
        res.json({ message: "Utilisateur supprimé." });
    });
});

// modif le rôle d'un user (Admin)
app.patch('/api/admin/users/:id/role', verifyToken, verifyAdmin, (req, res) => {
    const { role } = req.body;
    if (!['admin', 'agent'].includes(role)) return res.status(400).json({ error: "Rôle invalide." });
    if (parseInt(req.params.id) === req.user.id) return res.status(400).json({ error: "Vous ne pouvez pas modifier votre propre rôle." });
    db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: "Utilisateur introuvable." });
        res.json({ message: "Rôle mis à jour." });
    });
});

// Lister tous les biens, peu importe le statut (Admin)
app.get('/api/admin/properties', verifyToken, verifyAdmin, (req, res) => {
    const query = `
        SELECT p.*, a.name as agency_name, a.city as agency_city
        FROM properties p
        LEFT JOIN agencies a ON p.agency_id = a.id
        ORDER BY p.created_at DESC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// START SERVEUR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});