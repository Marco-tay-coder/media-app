import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Appliquer le thème automatiquement au démarrage
const savedTheme = localStorage.getItem('theme')

if (savedTheme) {
  // Utiliser le thème sauvegardé
  document.documentElement.setAttribute('data-theme', savedTheme)
} else {
  // Détecter la préférence système
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)