/* global use, db */
// MongoDB Playground - Les Bons Artisans
// Configuration de la base de données pour le test technique

// Sélectionner la base de données
use('lesbonsartisans');

// Insérer les produits de téléphones dans la collection 'products'
db.getCollection('products').insertMany([
  { "_id": 1, "name": "AC1 Phone1", "type": "phone", "price": 200.05, "rating": 3.8, "warranty_years": 1, "available": true },
  { "_id": 2, "name": "AC2 Phone2", "type": "phone", "price": 147.21, "rating": 1, "warranty_years": 3, "available": false },
  { "_id": 3, "name": "AC3 Phone3", "type": "phone", "price": 150, "rating": 2, "warranty_years": 1, "available": true },
  { "_id": 4, "name": "AC4 Phone4", "type": "phone", "price": 50.20, "rating": 3, "warranty_years": 2, "available": true }
]);

// Vérifier que les produits ont été insérés
const allProducts = db.getCollection('products').find({}).toArray();
console.log(`${allProducts.length} produits insérés dans la base de données`);

// Afficher tous les produits disponibles
const availableProducts = db.getCollection('products').find({ "available": true }).toArray();
console.log(`${availableProducts.length} produits disponibles`);

// Afficher les produits par prix (du plus cher au moins cher)
const productsByPrice = db.getCollection('products').find({}).sort({ "price": -1 }).toArray();
console.log('Produits triés par prix (décroissant):');
productsByPrice.forEach(product => {
  console.log(`${product.name}: ${product.price}€`);
});
