# 🛠️ Les Bons Artisans - Test Technique

Application full-stack de gestion de produits développée pour un test technique d'alternance.

## 🚀 Fonctionnalités

### ✅ Fonctionnalités principales
- **API REST** Node.js/Express avec MongoDB Atlas
- **Application React** avec Material UI
- **CRUD complet** (Create, Read, Update, Delete)
- **WebSocket** pour les mises à jour en temps réel

### 🎨 Fonctionnalités bonus implémentées
- **Interface utilisateur avancée** :
  - Thème sombre/clair avec toggle
  - Animations et transitions fluides
  - Design responsive amélioré
  - Filtres et recherche avancée
  - Pagination intelligente
  - Loading states avec skeletons
  - Messages de feedback (Snackbar)
  - Confirmations de suppression
  - Tooltips informatifs

## 🏗️ Architecture

```
Les_bons_artisans/
├── server.js                 # Serveur Express principal
├── routes/
│   └── products.js           # Routes API pour les produits
├── frontend/
│   ├── src/
│   │   ├── App.js           # Composant principal React
│   │   ├── services/
│   │   │   ├── ProductService.js    # Service API
│   │   │   └── WebSocketService.js # Service WebSocket
│   │   └── ...
│   └── package.json
├── package.json
├── .env                      # Variables d'environnement
└── README.md
```

## 🛠️ Technologies utilisées

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **MongoDB Atlas** - Service cloud MongoDB
- **Socket.io** - WebSocket pour temps réel
- **CORS** - Gestion des requêtes cross-origin
- **dotenv** - Gestion des variables d'environnement

### Frontend
- **React** - Bibliothèque UI
- **Material UI** - Composants UI modernes
- **Axios** - Client HTTP
- **Socket.io-client** - Client WebSocket
- **Emotion** - CSS-in-JS

## 🚀 Installation et démarrage

### Prérequis
- Node.js (v14 ou supérieur)
- npm ou yarn
- Compte MongoDB Atlas

### 1. Cloner le repository
```bash
git clone https://github.com/Sadoukas/test_technique_lesbonsartisans.git
cd test_technique_lesbonsartisans
```

### 2. Configuration de la base de données
**✅ Base de données déjà configurée !** 

L'application utilise MongoDB Atlas avec les credentials suivants :
- **Cluster** : `les-bons-artisans.ml2h0he.mongodb.net`
- **Utilisateur** : `sadoukas`
- **Base de données** : `lesbonsartisans`
- **Collection** : `products`

**Les données de test sont déjà insérées** dans la base de données.

> **⚠️ Note sécurité** : Les credentials MongoDB sont visibles dans le code uniquement pour simplifier l'évaluation de ce test technique. En production, ces informations sensibles doivent être stockées dans des variables d'environnement sécurisées et ne jamais être commitées dans le repository.

### 3. Installation des dépendances
```bash
# Backend
npm install

# Frontend
cd frontend
npm install
cd ..
```

### 4. Démarrage de l'application
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

## 🌐 Accès à l'application

- **Backend API** : http://localhost:3000
- **Frontend** : http://localhost:3001
- **Documentation API** : http://localhost:3000

## 📡 Endpoints API

### Produits
- `GET /api/products` - Récupérer tous les produits
- `GET /api/products/:id` - Récupérer un produit par ID
- `POST /api/products` - Créer un nouveau produit
- `PUT /api/products/:id` - Modifier un produit
- `DELETE /api/products/:id` - Supprimer un produit

### Santé
- `GET /api/health` - Statut de l'API et de la base de données

## 👨‍💻 Développeur

**Sadoukas** - Test technique pour alternance

## 📄 Licence

Ce projet est développé dans le cadre d'un test technique.

---
