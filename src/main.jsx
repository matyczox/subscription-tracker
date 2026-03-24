import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { SubscriptionProvider } from './context/SubscriptionContext.jsx'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SubscriptionProvider>
        <App />
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: '#1a1f33',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }} />
      </SubscriptionProvider>
    </BrowserRouter>
  </StrictMode>,
)
