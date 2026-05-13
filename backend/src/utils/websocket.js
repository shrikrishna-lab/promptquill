/**
 * WebSocket Manager - Real-time analytics streaming
 * Manages WebSocket connections and broadcasts provider updates to connected clients
 */

import { WebSocket, WebSocketServer } from 'ws';

class WebSocketManager {
  constructor() {
    this.wss = null;
    this.clients = new Set();
    this.providerLogger = null;
  }

  /**
   * Initialize WebSocket server
   * @param {http.Server} server - Express HTTP server
   * @param {ProviderLogger} logger - Provider logger instance
   */
  initialize(server, logger) {
    this.providerLogger = logger;
    
    // Create WebSocket server attached to HTTP server
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws) => {
      console.log('🔌 WebSocket client connected');
      this.clients.add(ws);

      // Send initial data to new client
      this.sendInitialData(ws);

      // Handle incoming messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        console.log('🔌 WebSocket client disconnected');
        this.clients.delete(ws);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });

    console.log('✅ WebSocket server initialized');
  }

  /**
   * Send initial analytics data to newly connected client
   */
  sendInitialData(ws) {
    if (!this.providerLogger) return;

    const metrics = this.providerLogger.getMetrics();
    
    ws.send(JSON.stringify({
      type: 'initial',
      timestamp: new Date().toISOString(),
      data: {
        metrics,
        trends: this.formatTrends(),
        errorAnalysis: this.formatErrorAnalysis(),
        timeline: this.formatTimeline(),
        comparison: this.formatComparison()
      }
    }));
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(ws, message) {
    const { type, payload } = message;

    switch (type) {
      case 'subscribe':
        // Client subscribed to updates
        ws.subscribed = true;
        break;
      case 'unsubscribe':
        ws.subscribed = false;
        break;
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        break;
      default:
        console.log('Unknown message type:', type);
    }
  }

  /**
   * Broadcast provider event to all connected clients
   */
  broadcastProviderEvent(event) {
    const message = JSON.stringify({
      type: 'provider_event',
      timestamp: new Date().toISOString(),
      event: event
    });

    this.broadcast(message);
  }

  /**
   * Broadcast updated metrics to all connected clients
   */
  broadcastMetricsUpdate() {
    if (!this.providerLogger) return;

    const metrics = this.providerLogger.getMetrics();
    
    const message = JSON.stringify({
      type: 'metrics_update',
      timestamp: new Date().toISOString(),
      data: {
        summary: metrics.summary,
        byProvider: metrics.byProvider,
        trends: this.formatTrends(),
        errorAnalysis: this.formatErrorAnalysis(),
        timeline: this.formatTimeline(),
        comparison: this.formatComparison()
      }
    });

    this.broadcast(message);
  }

  /**
   * Format trends data for WebSocket
   */
  formatTrends() {
    if (!this.providerLogger) return [];

    const metrics = this.providerLogger.getMetrics();
    const hourlyData = metrics.hourly || [];

    return hourlyData.map(h => ({
      hour: h.hour || 'N/A',
      requests: h.requests || 0,
      successes: h.successes || 0,
      errors: h.errors || 0,
      successRate: h.requests > 0 ? Math.round((h.successes / h.requests) * 100) : 0
    }));
  }

  /**
   * Format error analysis for WebSocket
   */
  formatErrorAnalysis() {
    if (!this.providerLogger) return {};

    const events = this.providerLogger.getEvents({ type: 'error', limit: 500 });
    const errorsByProvider = {};

    events.forEach(event => {
      const providerId = event.providerId || 'unknown';
      if (!errorsByProvider[providerId]) {
        errorsByProvider[providerId] = {
          total: 0,
          byCodes: {}
        };
      }
      errorsByProvider[providerId].total++;

      const code = event.errorCode || 'UNKNOWN_ERROR';
      if (!errorsByProvider[providerId].byCodes[code]) {
        errorsByProvider[providerId].byCodes[code] = 0;
      }
      errorsByProvider[providerId].byCodes[code]++;
    });

    return errorsByProvider;
  }

  /**
   * Format performance timeline for WebSocket
   */
  formatTimeline() {
    if (!this.providerLogger) return [];

    const metrics = this.providerLogger.getMetrics();
    const hourlyData = metrics.hourly || [];

    return hourlyData.map(h => {
      const topProvider = Object.entries(h.providers || {})
        .sort((a, b) => (b[1]?.requests || 0) - (a[1]?.requests || 0))[0];
      
      return {
        hour: h.hour || 'N/A',
        requests: h.requests || 0,
        successes: h.successes || 0,
        errors: h.errors || 0,
        successRate: h.requests > 0 ? Math.round((h.successes / h.requests) * 100) : 0,
        providerCount: Object.keys(h.providers || {}).length,
        topProvider: topProvider ? topProvider[0] : 'none'
      };
    });
  }

  /**
   * Format provider comparison for WebSocket
   */
  formatComparison() {
    if (!this.providerLogger) return [];

    const metrics = this.providerLogger.getMetrics();
    const byProvider = metrics.byProvider || {};

    return Object.entries(byProvider).map(([providerId, stats]) => {
      const successRate = stats.successRate || 0;
      const totalReqs = stats.totalRequests || 0;
      const uptime = totalReqs > 0 ? 100 : 0;
      const reliabilityScore = (successRate * 0.7) + (uptime * 0.3);
      
      return {
        providerName: providerId,
        totalRequests: totalReqs,
        successRate: Math.round(successRate * 100) / 100,
        avgResponseTime: Math.round(stats.averageResponseTime || 0),
        errors: stats.errors || 0,
        reliabilityScore: Math.round(reliabilityScore * 100) / 100
      };
    }).sort((a, b) => b.reliabilityScore - a.reliabilityScore);
  }

  /**
   * Broadcast support ticket event
   */
  broadcastSupportTicketEvent(event) {
    const message = JSON.stringify({
      type: 'support_ticket_event',
      timestamp: new Date().toISOString(),
      event: event
    });

    this.broadcast(message);
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(message) {
    if (!this.wss) return;

    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  /**
   * Get connected clients count
   */
  getClientCount() {
    return this.clients.size;
  }

  /**
   * Close all connections
   */
  close() {
    if (this.wss) {
      this.wss.close();
    }
  }
}

export const wsManager = new WebSocketManager();
