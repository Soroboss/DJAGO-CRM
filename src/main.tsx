import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    // Show a prompt to user to refresh
    if (confirm('Une nouvelle version est disponible. Voulez-vous recharger ?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log("L'application est prête à fonctionner hors ligne")
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
