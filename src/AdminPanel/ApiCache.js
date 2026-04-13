// Simple API cache to prevent duplicate calls
class ApiCache {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  // Generate cache key from URL and method
  getCacheKey(url, method = 'GET', body = null) {
    const bodyStr = body ? JSON.stringify(body) : '';
    return `${method}:${url}:${bodyStr}`;
  }

  // Check if we have a recent cached result (within 30 seconds)
  getCached(url, method = 'GET', body = null) {
    const key = this.getCacheKey(url, method, body);
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < 30000) { // 30 seconds
      return cached.data;
    }
    
    return null;
  }

  // Store result in cache
  setCached(url, method = 'GET', body = null, data) {
    const key = this.getCacheKey(url, method, body);
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Clean old entries (keep only last 50)
    if (this.cache.size > 50) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      this.cache.clear();
      entries.slice(0, 50).forEach(([k, v]) => this.cache.set(k, v));
    }
  }

  // Prevent duplicate concurrent requests
  async deduplicate(url, method = 'GET', body = null, requestFn) {
    const key = this.getCacheKey(url, method, body);
    
    // Check cache first
    const cached = this.getCached(url, method, body);
    if (cached) {
      return cached;
    }
    
    // Check if same request is already pending
    if (this.pendingRequests.has(key)) {
      return await this.pendingRequests.get(key);
    }
    
    // Make new request
    const promise = requestFn().then(result => {
      this.setCached(url, method, body, result);
      this.pendingRequests.delete(key);
      return result;
    }).catch(error => {
      this.pendingRequests.delete(key);
      throw error;
    });
    
    this.pendingRequests.set(key, promise);
    return await promise;
  }

  // Clear cache for specific patterns
  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
    this.pendingRequests.clear();
  }
}

// Export singleton instance
export const apiCache = new ApiCache();