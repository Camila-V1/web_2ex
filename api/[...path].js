/**
 * Vercel Serverless Function - API Proxy
 * 
 * Este archivo actúa como proxy entre el frontend HTTPS y el backend HTTP.
 * Redirige todas las peticiones /api/* a http://98.92.49.243/api/*
 * 
 * Ubicación: /api/[...path].js
 * Ruta de acceso: https://tu-app.vercel.app/api/*
 */

const BACKEND_URL = 'http://98.92.49.243/api';

export default async function handler(req, res) {
  // Obtener el path completo después de /api/
  const { path } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : path || '';
  
  // Construir URL completa del backend
  const backendUrl = `${BACKEND_URL}/${apiPath}`;
  
  console.log(`[PROXY] ${req.method} ${backendUrl}`);
  
  // Configurar headers CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, ' +
    'Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  
  // Manejar OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    // Preparar headers para el backend
    const headers = {
      'Content-Type': req.headers['content-type'] || 'application/json',
    };
    
    // Pasar token de autorización si existe
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }
    
    // Configurar opciones del fetch
    const fetchOptions = {
      method: req.method,
      headers: headers,
    };
    
    // Agregar body para POST, PUT, PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }
    
    // Hacer la petición al backend
    const response = await fetch(backendUrl, fetchOptions);
    
    // Obtener la respuesta
    const data = await response.text();
    
    // Intentar parsear como JSON
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch {
      // Si no es JSON, devolver como texto
      res.status(response.status).send(data);
      return;
    }
    
    // Devolver respuesta JSON
    res.status(response.status).json(jsonData);
    
  } catch (error) {
    console.error('[PROXY ERROR]', error);
    res.status(500).json({ 
      error: 'Proxy error', 
      message: error.message 
    });
  }
}
