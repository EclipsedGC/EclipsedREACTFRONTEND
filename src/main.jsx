import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store.js'
import './index.css'
import App from './App.jsx'

try {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element not found')
  }

  createRoot(rootElement).render(
    <Provider store={store}>
      <App />
    </Provider>,
  )
  console.log('App rendered successfully')
} catch (error) {
  console.error('Error rendering app:', error)
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: Arial;">
      <h1>Error Loading App</h1>
      <p>${error.message}</p>
      <p>Check the console for more details.</p>
    </div>
  `
}
