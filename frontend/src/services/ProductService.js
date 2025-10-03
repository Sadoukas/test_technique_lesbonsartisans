import axios from 'axios';

// Configuration de base pour axios
const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erreur API:', error);
    return Promise.reject(error);
  }
);

export class ProductService {
  /**
   * Récupérer tous les produits
   */
  static async getAllProducts() {
    try {
      const response = await api.get('/products');
      return response.data.data; // Retourne directement le tableau de produits
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      throw error;
    }
  }

  /**
   * Récupérer un produit par ID
   */
  static async getProductById(id) {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du produit ${id}:`, error);
      throw error;
    }
  }

  /**
   * Créer un nouveau produit
   */
  static async createProduct(productData) {
    try {
      const response = await api.post('/products', productData);
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error);
      throw error;
    }
  }

  /**
   * Modifier un produit existant
   */
  static async updateProduct(id, productData) {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la modification du produit ${id}:`, error);
      throw error;
    }
  }

  /**
   * Supprimer un produit
   */
  static async deleteProduct(id) {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du produit ${id}:`, error);
      throw error;
    }
  }

  /**
   * Vérifier la santé de l'API
   */
  static async checkHealth() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la vérification de la santé de l\'API:', error);
      throw error;
    }
  }
}
