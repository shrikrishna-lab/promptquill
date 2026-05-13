/**
 * Production Security Hardening
 * This blocks all console manipulation and prevents tampering
 * Only runs in production builds
 */

export const hardenProduction = () => {
  if (import.meta.env.PROD) {
    // 1. Disable React DevTools in production
    if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
      for (let [key] of Object.entries(
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__
      )) {
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] = null
      }
      delete window.__REACT_DEVTOOLS_GLOBAL_HOOK__
    }

    // 2. Override console methods to show nothing
    const noop = () => {}
    const methods = [
      'log', 'debug', 'info', 'warn', 'error',
      'group', 'groupEnd', 'groupCollapsed',
      'dir', 'dirxml', 'trace', 'assert',
      'profile', 'profileEnd', 'count', 'time',
      'timeEnd', 'timeStamp', 'table'
    ]
    methods.forEach(method => {
      try {
        console[method] = noop
      } catch (e) {
        // In strict mode, some properties are non-writable
      }
    })

    // 3. Prevent localStorage plan manipulation
    const originalSetItem = localStorage.setItem.bind(localStorage)
    localStorage.setItem = function(key, value) {
      const blockedKeys = [
        'pq_plan', 'user_plan', 'isPro',
        'pq_credits', 'user_credits', 'plan',
        'pro_status', 'subscription', 'tier'
      ]
      if (blockedKeys.some(k =>
        key.toLowerCase().includes(k.toLowerCase())
      )) {
        // Silently fail — don't alert hacker
        return
      }
      return originalSetItem(key, value)
    }

    // 4. Prevent sessionStorage manipulation
    const originalSessionSetItem = sessionStorage.setItem.bind(sessionStorage)
    sessionStorage.setItem = function(key, value) {
      const blockedKeys = [
        'pq_plan', 'user_plan', 'isPro',
        'pq_credits', 'user_credits', 'plan',
        'pro_status', 'subscription', 'tier'
      ]
      if (blockedKeys.some(k =>
        key.toLowerCase().includes(k.toLowerCase())
      )) {
        return
      }
      return originalSessionSetItem(key, value)
    }

    // 5. Detect and monitor window manipulation
    const originalDefineProperty = Object.defineProperty.bind(Object)
    Object.defineProperty = function(obj, prop, descriptor) {
      // Block attempts to define security-related properties
      const blockedProps = ['isPro', 'plan', 'credits', 'token']
      if (obj === window && blockedProps.includes(prop)) {
        // Silently fail
        return obj
      }
      return originalDefineProperty(obj, prop, descriptor)
    }

    // 6. Block access to React internals
    if (window.React) {
      Object.freeze(window.React)
    }

    // 7. Monitor for common exploit patterns
    const monitorExploits = () => {
      const exploitPatterns = [
        /localStorage.*plan/i,
        /sessionStorage.*plan/i,
        /window.*isPro/i,
        /user.*plan.*=.*pro/i
      ]

      // Check current window properties
      const suspiciousProps = []
      for (let key in window) {
        if (
          key.toLowerCase().includes('plan') ||
          key.toLowerCase().includes('pro') ||
          key.toLowerCase().includes('credit')
        ) {
          suspiciousProps.push(key)
          // Remove suspicious properties
          try {
            delete window[key]
          } catch (e) {
            // Property may be non-deletable
          }
        }
      }
    }

    // Run exploit monitoring
    monitorExploits()

    // Re-run periodically to catch injected code
    setInterval(monitorExploits, 30000)
  }
}
