import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (!this.socket) {
      this.socket = io('http://localhost:3000');
      
      this.socket.on('connect', () => {
        console.log('🔌 Connecté au serveur WebSocket');
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 Déconnecté du serveur WebSocket');
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Écouter les événements de produits
  onProductCreated(callback) {
    this.connect();
    this.socket.on('product_created', callback);
  }

  onProductUpdated(callback) {
    this.connect();
    this.socket.on('product_updated', callback);
  }

  onProductDeleted(callback) {
    this.connect();
    this.socket.on('product_deleted', callback);
  }

  // Supprimer les écouteurs
  removeListener(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

// Instance singleton
const webSocketService = new WebSocketService();
export default webSocketService;
