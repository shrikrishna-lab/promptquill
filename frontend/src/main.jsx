import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'
import { hardenProduction } from './utils/securityHarden'
import { logger } from './utils/logger'

// SECURITY: Harden production environment BEFORE rendering app
hardenProduction()

// Initialize logging
const rootElement = document.getElementById('root');

// Only log errors - development mode logs elsewhere via logger utility
window.addEventListener('error', (event) => {

  if (event.message?.includes('Payment Button cannot be added') || 
      event.message?.includes('payment_button_id') ||
      event.message?.includes('Cannot read properties of null') ||
      event.message?.includes('tagName') ||
      event.filename?.includes('payment-button.js')) {
    event.preventDefault()
    return
  }
  logger.error('Global Error:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled Promise Rejection:', event.reason)
})

if (!rootElement) {
  logger.error('Root element not found!')
  document.body.innerHTML = '<div style="color: red; padding: 20px; font-family: monospace;">ERROR: Root element not found. Check index.html for root div.</div>'
} else {
  try {
    logger.log('Creating React root...')
    const root = createRoot(rootElement)
    logger.log('React root created')
    
    root.render(
      <StrictMode>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </StrictMode>,
    )
    logger.log('React app rendered')
  } catch (err) {
    logger.error('Failed to render app:', err)
    rootElement.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: #080808;
        color: #fff;
        font-family: monospace;
        padding: 20px;
      ">
        <div style="max-width: 600px; text-align: center;">
          <h2 style="color: #ef4444; margin-bottom: 10px;">Initialization Error</h2>
          <p>${err.message}</p>
          <pre style="background: #111; padding: 10px; overflow-x: auto; text-align: left; font-size: 12px; margin-top: 10px;">${err.stack}</pre>
        </div>
      </div>
    `
  }
}
