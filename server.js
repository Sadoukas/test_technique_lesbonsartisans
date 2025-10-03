const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connexion MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sadoukas:z65w1HkZRLVXTeeB@les-bons-artisans.ml2h0he.mongodb.net/';
const DB_NAME = 'lesbonsartisans';

let db;

// Connexion à la base de données
async function connectToDatabase() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('✅ Connecté à MongoDB Atlas');
  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB:', error);
    process.exit(1);
  }
}

// Routes de base
app.get('/', (req, res) => {
  res.json({
    message: 'API Les Bons Artisans - Test Technique',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      health: '/api/health'
    }
  });
});

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: db ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Routes des produits (à implémenter)
app.use('/api/products', require('./routes/products'));

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: err.message
  });
});

// Route 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl
  });
});

// Démarrage du serveur
async function startServer() {
  await connectToDatabase();
  
  // Passer la base de données aux routes
  app.locals.db = db;
  
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📱 API disponible sur: http://localhost:${PORT}`);
    console.log(`🔗 Documentation: http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);

module.exports = app;
