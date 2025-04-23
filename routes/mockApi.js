import express from 'express';
import getRouter from './contenido/get.js';
import postRouter from './contenido/post.js';
import putRouter from './contenido/put.js';
import deleteRouter from './contenido/delete.js';

const router = express.Router();

// Combinar todos los routers
router.use(getRouter);
router.use(postRouter);
router.use(putRouter);
router.use(deleteRouter);

export default router;