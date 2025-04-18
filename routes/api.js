import express from 'express';

const router = express.Router();

// Ruta de ejemplo GET
router.get('/hello', (req, res) => {
  res.json({ message: 'Hola desde la API!' });
});

// Ruta de ejemplo POST
router.post('/data', (req, res) => {
  // Aquí podrías procesar datos enviados en el cuerpo de la solicitud (req.body)
  // Asegúrate de tener el middleware express.json() en server.js si esperas JSON
  console.log('Datos recibidos:', req.body);
  res.json({ received: true, data: req.body });
});

export default router;