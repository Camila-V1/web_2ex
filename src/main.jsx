import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Workaround global: Suprimir errores 403 falsos
window.addEventListener('unhandledrejection', (event) => {
  // Detectar error 403 falso (httpStatus 200 pero code 403)
  if (event.reason && 
      event.reason.code === 403 && 
      event.reason.httpStatus === 200 &&
      event.reason.httpError === false) {
    console.warn('⚠️ [WORKAROUND] Error 403 falso suprimido. Backend respondió 200 OK.');
    console.warn('⚠️ [WORKAROUND] Esto es causado por una extensión del navegador o código minificado.');
    // Prevenir que se muestre como "Uncaught"
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
