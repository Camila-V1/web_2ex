import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Workaround TRIPLE: Suprimir errores 403 falsos de todas las formas posibles
const suppressFake403 = (reason) => {
  if (!reason || typeof reason !== 'object') return false;
  
  return (
    reason.code === 403 && 
    reason.httpStatus === 200 &&
    reason.httpError === false &&
    reason.name === 'i' // Nombre del error minificado
  );
};

// Handler 1: Promesas no manejadas
window.addEventListener('unhandledrejection', (event) => {
  if (suppressFake403(event.reason)) {
    console.warn('⚠️ [MAIN.JSX] Error 403 falso suprimido - Backend OK (200)');
    event.preventDefault();
  }
});

// Handler 2: Errores globales
window.addEventListener('error', (event) => {
  if (event.error && suppressFake403(event.error)) {
    console.warn('⚠️ [MAIN.JSX] Error 403 falso suprimido en error event');
    event.preventDefault();
  }
});

// Handler 3: Override Promise.prototype.catch temporalmente
const originalCatch = Promise.prototype.catch;
Promise.prototype.catch = function(onRejected) {
  return originalCatch.call(this, function(error) {
    if (suppressFake403(error)) {
      console.warn('⚠️ [MAIN.JSX] Error 403 falso suprimido en Promise.catch');
      return; // No propagar el error
    }
    if (onRejected) return onRejected(error);
    throw error;
  });
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
