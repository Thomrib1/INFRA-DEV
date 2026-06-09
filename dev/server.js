const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json()); // permet au serveur de comprendre le format JSON

const cors = require('cors');
app.use(cors({ origin: '*' }));

// connexion à la base de données
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

// --- PETITE ROUTE DE TEST ---
// permet de créer rapidement une première agence fictive (ex: Aix-en-Provence) pour pouvoir y lier tes utilisateurs
app.post('/api/agencies', (req, res) => {
    const { name, city, address, phone, email } = req.body;
    const query = 'INSERT INTO agencies (name, city, address, phone, email) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [name, city, address, phone, email], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Agence créée !", agencyId: result.insertId });
    });
});

// MES ROUTES API (Ex : pour récup les agences)
app.get('/api/agencies', (req, res) => {
    db.query('SELECT * FROM agencies', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// --- ROUTE 1 : INSCRIPTION D'UN UTILISATEUR (REGISTER) ---
app.post('/api/auth/register', async (req, res) => {
    const { agency_id, first_name, last_name, email, password, role } = req.body;

    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ error: "Veuillez remplir tous les champs obligatoires." });
    }

    try {
        // hachage du mot de passe (sécurité)
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // insertion dans la base de données
        const query = 'INSERT INTO users (agency_id, first_name, last_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(query, [agency_id || null, first_name, last_name, email, passwordHash, role || 'agent'], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: "Cet email est déjà utilisé." });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: "Utilisateur créé avec succès !", userId: result.insertId });
        });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors du hachage du mot de passe." });
    }
});

// --- ROUTE 2 : CONNEXION (LOGIN) ---
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Veuillez fournir un email et un mot de passe." });
    }

    // rechercher l'utilisateur par son email
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ error: "Identifiants incorrects." });

        const user = results[0];

        // vérifier si le mot de passe correspond au hash stocké
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ error: "Identifiants incorrects." });

        // création du token JWT (valable 24h)
        const token = jwt.sign(
            { id: user.id, role: user.role, agency_id: user.agency_id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // renvoyer les infos de l'utilisateur et le token
        res.json({
            message: "Connexion réussie !",
            token,
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

// MIDDLEWARE DE SÉCURITÉ (VÉRIFICATION JWT)
const verifyToken = (req, res, next) => {
    // récup le token dans l'en tête de la requête
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // format: "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ error: "Accès refusé. Token manquant." });
    }

    try {
        // Vérifier et décoder le token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // stocke les infos de l'utilisateur (id, role, agency_id)
        next(); //passe à la suite (la route API)
    } catch (error) {
        res.status(403).json({ error: "Token invalide ou expiré." });
    }
};

// ROUTES POUR LES BIENS IMMOBILIERS (PROPERTIES)

// AJOUTER UN BIEN (Sécurisé : Connexion requise)
app.post('/api/properties', verifyToken, (req, res) => {
    const { title, description, city, property_type, transaction_type, price, surface_area, rooms, bedrooms } = req.body;
    
    // L'id de l'agence est automatiquement récupéré depuis le token de l'agent connecté
    const agency_id = req.user.agency_id; 

    if (!title || !city || !property_type || !transaction_type || !price || !surface_area) {
        return res.status(400).json({ error: "Veuillez remplir tous les champs obligatoires." });
    }

    const query = `
        INSERT INTO properties 
        (agency_id, title, description, city, property_type, transaction_type, price, surface_area, rooms, bedrooms, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')
    `;

    db.query(query, [agency_id, title, description, city, property_type, transaction_type, price, surface_area, rooms || 0, bedrooms || 0], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Bien immobilier ajouté avec succès !", propertyId: result.insertId });
    });
});

// RÉCUPÉRER TOUS LES BIENS DISPONIBLES (Public)
app.get('/api/properties', (req, res) => {
    db.query('SELECT * FROM properties WHERE status = "available" ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// start du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});