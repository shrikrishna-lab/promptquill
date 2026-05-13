/**
 * Request Queue System - Handles overload when all providers are busy
 * Maintains priority queue: PRO users first, FIFO within tier
 */

import { v4 as uuidv4 } from 'uuid';

// ═══════════════════════════════════════════════════════════════════════════
// QUEUE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const QUEUE_CONFIG = {
  MAX_SIZE: 50,
  TIMEOUT: 5 * 60 * 1000, // 5 minutes
  PROCESS_INTERVAL: 30 * 1000, // Process every 30 seconds
  AVERAGE_PROCESSING_TIME: 5 * 1000, // Estimate 5 seconds per request
};

// ═══════════════════════════════════════════════════════════════════════════
// QUEUE ITEM CLASS
// ═══════════════════════════════════════════════════════════════════════════

class QueueItem {
  constructor(userId, userTier, prompt, systemPrompt, resolve, reject) {
    this.id = uuidv4();
    this.userId = userId;
    this.userTier = userTier;
    this.prompt = prompt;
    this.systemPrompt = systemPrompt;
    this.resolve = resolve;
    this.reject = reject;
    this.createdAt = Date.now();
    this.attempts = 0;
    this.maxAttempts = 3;
  }

  get isPro() {
    return this.userTier === 'pro';
  }

  get ageSeconds() {
    return (Date.now() - this.createdAt) / 1000;
  }

  get isExpired() {
    return this.ageSeconds > (QUEUE_CONFIG.TIMEOUT / 1000);
  }

  get position() {
    // Calculated dynamically based on queue state
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// REQUEST QUEUE CLASS
// ═══════════════════════════════════════════════════════════════════════════

class RequestQueue {
  constructor() {
    this.proQueue = [];
    this.freeQueue = [];
    this.processing = false;
    this.successCount = 0;
    this.failureCount = 0;
    this.stats = {
      totalQueued: 0,
      totalProcessed: 0,
      totalExpired: 0,
      createdAt: Date.now()
    };

    // Start processing queue
    this.processInterval = setInterval(() => this.processQueue(), QUEUE_CONFIG.PROCESS_INTERVAL);
  }

  /**
   * Add request to queue
   */
  enqueue(userId, userTier, prompt, systemPrompt) {
    return new Promise((resolve, reject) => {
      // Check if queue is full
      if (this.length() >= QUEUE_CONFIG.MAX_SIZE) {
        return reject(new Error('QUEUE_FULL'));
      }

      const item = new QueueItem(userId, userTier, prompt, systemPrompt, resolve, reject);

      if (userTier === 'pro') {
        this.proQueue.push(item);
      } else {
        this.freeQueue.push(item);
      }

      this.stats.totalQueued++;

      // Return queue status immediately
      resolve({
        queued: true,
        jobId: item.id,
        position: this.getPosition(item.id),
        estimatedWait: this.estimateWait(),
        tier: userTier,
        queueSize: this.length()
      });
    });
  }

  /**
   * Get position in queue
   */
  getPosition(jobId) {
    let position = 0;

    for (let item of this.proQueue) {
      if (item.id === jobId) return position + 1;
      position++;
    }

    for (let item of this.freeQueue) {
      if (item.id === jobId) return position + 1;
      position++;
    }

    return -1; // Not found
  }

  /**
   * Estimate wait time in seconds
   */
  estimateWait() {
    const avgProcessTime = QUEUE_CONFIG.AVERAGE_PROCESSING_TIME / 1000;
    const totalInQueue = this.length();
    return Math.ceil(totalInQueue * avgProcessTime);
  }

  /**
   * Process queue items
   */
  async processQueue() {
    if (this.processing) return;
    this.processing = true;

    try {
      // Process PRO queue first
      while (this.proQueue.length > 0) {
        const item = this.proQueue[0];

        if (item.isExpired) {
          this.proQueue.shift();
          item.reject(new Error('QUEUE_TIMEOUT'));
          this.stats.totalExpired++;
          continue;
        }

        // Item will be processed by caller (generationController)
        break;
      }

      // Process FREE queue
      while (this.freeQueue.length > 0) {
        const item = this.freeQueue[0];

        if (item.isExpired) {
          this.freeQueue.shift();
          item.reject(new Error('QUEUE_TIMEOUT'));
          this.stats.totalExpired++;
          continue;
        }

        // Item will be processed by caller (generationController)
        break;
      }
    } catch (error) {
      console.error('❌ Queue processing error:', error);
    } finally {
      this.processing = false;
    }
  }

  /**
   * Get next item to process (respects priority)
   */
  dequeue() {
    // Clean expired items first
    this.proQueue = this.proQueue.filter(item => {
      if (item.isExpired) {
        item.reject(new Error('QUEUE_TIMEOUT'));
        this.stats.totalExpired++;
        return false;
      }
      return true;
    });

    this.freeQueue = this.freeQueue.filter(item => {
      if (item.isExpired) {
        item.reject(new Error('QUEUE_TIMEOUT'));
        this.stats.totalExpired++;
        return false;
      }
      return true;
    });

    // PRO queue has priority
    if (this.proQueue.length > 0) {
      this.stats.totalProcessed++;
      return this.proQueue.shift();
    }

    // Then FREE queue
    if (this.freeQueue.length > 0) {
      this.stats.totalProcessed++;
      return this.freeQueue.shift();
    }

    return null;
  }

  /**
   * Mark item as failed (will retry or reject)
   */
  markFailed(item) {
    item.attempts++;

    if (item.attempts >= item.maxAttempts) {
      // Give up
      item.reject(new Error('QUEUE_PROCESSING_FAILED'));
      this.stats.totalExpired++;
    } else {
      // Re-queue at end
      if (item.isPro) {
        this.proQueue.push(item);
      } else {
        this.freeQueue.push(item);
      }
    }
  }

  /**
   * Get queue length
   */
  length() {
    return this.proQueue.length + this.freeQueue.length;
  }

  /**
   * Get queue status
   */
  getStatus() {
    const uptime = (Date.now() - this.stats.createdAt) / 1000;
    const uptimeMinutes = Math.round(uptime / 60);

    return {
      length: this.length(),
      proCount: this.proQueue.length,
      freeCount: this.freeQueue.length,
      maxSize: QUEUE_CONFIG.MAX_SIZE,
      percentFull: Math.round((this.length() / QUEUE_CONFIG.MAX_SIZE) * 100),
      estimatedWait: this.estimateWait(),
      totalQueued: this.stats.totalQueued,
      totalProcessed: this.stats.totalProcessed,
      totalExpired: this.stats.totalExpired,
      uptime: `${uptimeMinutes}min`,
      averageWait: this.stats.totalProcessed > 0
        ? Math.round((this.stats.totalQueued - this.stats.totalProcessed) * (QUEUE_CONFIG.AVERAGE_PROCESSING_TIME / 1000))
        : 0
    };
  }

  /**
   * Get next N items to process
   */
  peekNext(count = 5) {
    const items = [];
    
    for (let i = 0; i < Math.min(count, this.proQueue.length); i++) {
      items.push({
        tier: 'pro',
        position: items.length + 1,
        userId: this.proQueue[i].userId,
        age: Math.round(this.proQueue[i].ageSeconds)
      });
    }

    for (let i = 0; i < Math.min(count - items.length, this.freeQueue.length); i++) {
      items.push({
        tier: 'free',
        position: items.length + 1,
        userId: this.freeQueue[i].userId,
        age: Math.round(this.freeQueue[i].ageSeconds)
      });
    }

    return items;
  }

  /**
   * Clear queue (for testing/emergency)
   */
  clear() {
    this.proQueue.forEach(item => item.reject(new Error('QUEUE_CLEARED')));
    this.freeQueue.forEach(item => item.reject(new Error('QUEUE_CLEARED')));
    this.proQueue = [];
    this.freeQueue = [];
    console.log('🧹 Queue cleared');
  }

  /**
   * Stop queue processing
   */
  stop() {
    clearInterval(this.processInterval);
    this.clear();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════

const queueInstance = new RequestQueue();

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  queueInstance as queue,
  RequestQueue,
  QueueItem,
  QUEUE_CONFIG
};
