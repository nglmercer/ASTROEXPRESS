import express from 'express';
import { dbController } from './backupdb.js';
import { AudiosModel } from './AudiosModel.js';
import { ResolucionesModel } from './ResolucionesModel.js';
import { SubtitulosModel } from './SubtitulosModel.js';

const router = express.Router();
const audiosModel = new AudiosModel();
const resolucionesModel = new ResolucionesModel();
const subtitulosModel = new SubtitulosModel();

router.get('/res/recursos/:idCapitulo', async (req, res) => {
    const { idCapitulo } = req.params;
    
    try {
        const audios = await audiosModel.getAllByIdCapitulo(idCapitulo, true);
        const resoluciones = await resolucionesModel.getAllByIdCapitulo(idCapitulo, true);
        const subtitulos = await subtitulosModel.getAllByIdCapitulo(idCapitulo, true);
        
        res.json({
            audios,
            resoluciones,
            subtitulos
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;