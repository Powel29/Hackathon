import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.jsx'
import { AppProviderStack } from './providers/AppProviderStack.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProviderStack>
      <App />
    </AppProviderStack>
  </StrictMode>,
)
