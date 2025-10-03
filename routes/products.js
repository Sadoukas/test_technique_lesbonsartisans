const express = require('express');
const router = express.Router();

// Middleware pour récupérer la base de données
router.use((req, res, next) => {
  req.db = req.app.locals.db;
  if (!req.db) {
    return res.status(500).json({
      success: false,
      error: 'Base de données non disponible'
    });
  }
  next();
});

// GET /api/products - Récupérer tous les produits
router.get('/', async (req, res) => {
  try {
    const products = await req.db.collection('products').find({}).toArray();
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des produits',
      message: error.message
    });
  }
});

// GET /api/products/:id - Récupérer un produit par ID
router.get('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = await req.db.collection('products').findOne({ _id: productId });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produit non trouvé',
        id: productId
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du produit',
      message: error.message
    });
  }
});

// POST /api/products - Créer un nouveau produit
router.post('/', async (req, res) => {
  try {
    const { name, type, price, rating, warranty_years, available } = req.body;
    
    // Validation des données
    if (!name || !type || price === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Données manquantes',
        required: ['name', 'type', 'price']
      });
    }
    
    // Générer un nouvel ID
    const lastProduct = await req.db.collection('products').findOne({}, { sort: { _id: -1 } });
    const newId = lastProduct ? lastProduct._id + 1 : 1;
    
    const newProduct = {
      _id: newId,
      name,
      type,
      price: parseFloat(price),
      rating: rating || 0,
      warranty_years: warranty_years || 1,
      available: available !== undefined ? available : true
    };
    
    const result = await req.db.collection('products').insertOne(newProduct);
    
    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès',
      data: newProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du produit',
      message: error.message
    });
  }
});

// PUT /api/products/:id - Modifier un produit
router.put('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const updateData = req.body;
    
    // Supprimer l'ID des données à mettre à jour
    delete updateData._id;
    
    const result = await req.db.collection('products').updateOne(
      { _id: productId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Produit non trouvé',
        id: productId
      });
    }
    
    // Récupérer le produit mis à jour
    const updatedProduct = await req.db.collection('products').findOne({ _id: productId });
    
    res.json({
      success: true,
      message: 'Produit modifié avec succès',
      data: updatedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la modification du produit',
      message: error.message
    });
  }
});

// DELETE /api/products/:id - Supprimer un produit
router.delete('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    const result = await req.db.collection('products').deleteOne({ _id: productId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Produit non trouvé',
        id: productId
      });
    }
    
    res.json({
      success: true,
      message: 'Produit supprimé avec succès',
      id: productId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du produit',
      message: error.message
    });
  }
});

module.exports = router;
