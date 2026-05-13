/**
 * WebSocket Client - Real-time analytics connection
 * Handles WebSocket connection and event listeners
 */

class WebSocketClient {
  constructor() {
    this.ws = null;
    this.url = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.isConnecting = false;
  }

  /**
   * Connect to WebSocket server
   */
  connect(url = null) {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.isConnecting = true;
        
        // Use provided URL or construct from window location
        const wsUrl = url || this.constructUrl();
        this.url = wsUrl;

        console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          // Send subscription message
          this.subscribe();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('❌ WebSocket disconnected');
          this.isConnecting = false;
          this.attemptReconnect();
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Construct WebSocket URL from current location
   */
  constructUrl() {
    // Use VITE_BACKEND_URL env var → convert http(s) to ws(s) protocol
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const wsUrl = backendUrl
      .replace('https://', 'wss://')
      .replace('http://', 'ws://');
    return `${wsUrl}/ws`;
  }

  /**
   * Subscribe to analytics updates
   */
  subscribe() {
    this.send({
      type: 'subscribe',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send message to WebSocket server
   */
  send(message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, queuing message:', message);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(message) {
    const { type, data, event } = message;

    // Emit event to all listeners
    if (this.listeners.has(type)) {
      const callbacks = this.listeners.get(type);
      callbacks.forEach(callback => {
        try {
          callback(data || event);
        } catch (error) {
          console.error(`Error in ${type} listener:`, error);
        }
      });
    }

    // Also emit to generic 'message' listeners
    if (type !== 'message') {
      if (this.listeners.has('message')) {
        const callbacks = this.listeners.get('message');
        callbacks.forEach(callback => {
          try {
            callback(message);
          } catch (error) {
            console.error('Error in message listener:', error);
          }
        });
      }
    }
  }

  /**
   * Add event listener
   */
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Remove event listener
   */
  off(eventType, callback) {
    if (!this.listeners.has(eventType)) return;
    
    const callbacks = this.listeners.get(eventType);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Attempt to reconnect
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    
    console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnect attempt failed:', error);
      });
    }, delay);
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Ping server to test connection
   */
  ping() {
    this.send({ type: 'ping' });
  }
}

// Export singleton instance
export const wsClient = new WebSocketClient();
