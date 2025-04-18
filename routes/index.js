/**
 * Archivo principal de rutas
 * Configura y exporta todas las rutas de la API
 */
/* const express = require('express');
const router = express.Router();
const { 
  initializeRouter, 
  getDb
} = require('./baseRouter');

// Importar las rutas específicas
const animeRoutes = require('./animeRoutes');
const temporadasRoutes = require('./temporadasRoutes');
const capitulosRoutes = require('./capitulosRoutes'); */
import express from 'express';
import animeRoutes from './animeRoutes.js';
import temporadasRoutes from './temporadasRoutes.js';
import capitulosRoutes from './capitulosRoutes.js';
import { initializeRouter, getDb } from './baseRouter.js';

const router = express.Router();
// Inicializar la conexión a la base de datos una sola vez
initializeRouter().then(() => {
    const db = getDb();
    
    // Pasar la conexión a los routers
    animeRoutes.setupRoutes(router, db);
    temporadasRoutes.setupRoutes(router, db);
    capitulosRoutes.setupRoutes(router, db);
    
    console.log('Rutas API inicializadas correctamente');
});

/* module.exports = router; */
export default router;