import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { initKeycloak } from './keycloak.ts'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root was not found')
}

const root = createRoot(rootElement)

initKeycloak()
  .then(() => {
    root.render(
      <StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StrictMode>,
    )
  })
  .catch((error: unknown) => {
    console.error('Keycloak initialization failed', error)
    root.render(
      <div style={{ padding: '1rem', color: '#b91c1c', fontFamily: 'sans-serif' }}>
        Unable to initialize authentication. Check Keycloak env configuration.
      </div>,
    )
  })
