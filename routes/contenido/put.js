import express from 'express';
import { dbController } from '../backupdb.js';
import { filterRequiredFields, validateFields } from '../verifys.js';

const router = express.Router();
// Middleware para autenticación
const checkAuth = (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
        next();
    } else {
        res.status(401).json({ message: 'No autorizado: Token inválido o ausente.' });
    }
};

// Middleware para autenticación opcional
const checkAuthOptional = (req, res, next) => {
    const token = req.headers.authorization;
    if (token === '1234' || !token) {
        next();
    } else {
        res.status(401).json({ message: 'No autorizado: Token inválido.' });
    }
};
// Middleware para parsear JSON
router.use(express.json());
router.put('/usuario/:idUsuario/nsfw', checkAuth, (req, res) => {
    const { idUsuario } = req.params;
    // Asumimos que el body podría tener { nsfwEnabled: boolean } o no tener body para toggle
    console.log(`SIMULADO: PUT /usuario/${idUsuario}/nsfw - Body:`, req.body);

    // Implementación real necesitaría actualizar el campo 'nsfwUsuario' en la tabla 'usuarios'.
    // const newState = req.body.hasOwnProperty('nsfwEnabled') ? req.body.nsfwEnabled : !currentUserNsfwState; // Lógica de toggle o set
    // await dbController.update('usuarios', idUsuario, { nsfwUsuario: newState ? 1 : 0 });

    const newState = Math.random() > 0.5; // Estado aleatorio para simulación
    res.json({ success: true, nsfwEnabled: newState, message: `NSFW toggle para ${idUsuario} (simulado)` });
});
router.put('/categoria/:idCategoria', checkAuth, (req, res) => {
    const { idCategoria } = req.params;
    console.log(`SIMULADO: PUT /categoria/${idCategoria} - Body:`, req.body);
    // Implementación real necesitaría dbController.update('categorias', idCategoria, data)
    res.json({ success: true, message: `Categoría ${idCategoria} actualizada (simulada)` });
});
router.put('/rol/:idRol', checkAuth, (req, res) => {
    const { idRol } = req.params;
    console.log(`SIMULADO: PUT /rol/${idRol} - Body:`, req.body);
     // Implementación real necesitaría dbController.update('roles', idRol, data)
    res.json({ success: true, message: `Rol ${idRol} actualizado (simulado)` });
});
router.put('/catalogo/', checkAuth,async (req, res) => {
    console.log('SIMULADO: POST /catalogo - Body:', req.body);
    // Implementación real necesitaría dbController.insert('catalogos', data)
    const { idCatalogo, nombreCatalogo, tipoCatalogo, estadoCatalogo, imagenPortadaCatalogo, imagenFondoCatalogo,descripcionCatalogo, nsfwCatalogo, recomendacionCatalogo, trailerCatalogo } = req.body;
    try {
        const updateItem = await dbController.actualizarRegistro('catalogos', {
            idCatalogo,
            nombreCatalogo,
            tipoCatalogo,
            estadoCatalogo,
            imagenPortadaCatalogo,
            imagenFondoCatalogo,
            descripcionCatalogo,
            nsfwCatalogo,
            recomendacionCatalogo,
            trailerCatalogo
        },['idCatalogo']);
        res.json({ success: true, message: 'Catálogo agregado (simulado)', data: updateItem });
    } catch (error) {
        console.error('Error al actualizar catálogo:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor', details: error.message });
    }
});
router.put('/temporada/', checkAuth,async (req, res) => {
    console.log('SIMULADO: POST /temporada - Body:', req.body);
    // Implementación real necesitaría dbController.insert('catalogos', data)
    const { idTemporada, numeroTemporada, nombreTemporada, descripcionTemporada, portadaTemporada, catalogoTemporada, nsfw } = req.body;
    // ES METODO PUT SOLO VALIDA LOS CAMPOS QUE SE MODIFICAN solo es necesario catalogoTemporada porque es un id de una tabla
    const exampleFields ={
        catalogoTemporada: (value) => value > 0
    }
    const options = {
        //validators && types
        validators: {
            catalogoTemporada: (value) => value > 0
        }
    };
    const isValid = validateFields({required: exampleFields, actualObj: req.body, options});
    try {
        const updateItem = await dbController.actualizarRegistro('temporadas', {
            idTemporada,
            numeroTemporada,
            nombreTemporada,
            descripcionTemporada,
            portadaTemporada,
            catalogoTemporada,
            nsfw
        },['idTemporada']);
        res.json({ success: true, message: 'Temporada agregado isValid', data: {raw:updateItem,data: isValid} });
    } catch (error) {
        console.error('Error al actualizar temporada:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor', details: error.message });
    }
});
router.put('/capitulo', checkAuth, async (req, res) => {
    console.log('Agregando: POST /capitulo - Body:', req.body);
    const { idTemporada, numeroCapitulo, imagenCapitulo, catalogoCapitulo, meGustasCapitulo, noMeGustasCapitulo, reproduccionesCapitulo, tiempoCapitulo } = req.body;
    const exampleFields ={
        idCapitulo:	63508,
        numeroCapitulo:	1,
        imagenCapitulo: "",	
        catalogoCapitulo:	4946,
        meGustasCapitulo:	1,
        noMeGustasCapitulo:	0,
        reproduccionesCapitulo:	17,
        descripcionCapitulo:	"",
        tituloCapitulo:	"",
        pathCapitulo:	"",
        tiempoCapitulo:	20,
        temporadaCapitulo:	20
    }
    const options = {
        //validators && types
        validators: {
            catalogoCapitulo: (value) => value > 0,
            temporadaCapitulo: (value) => value > 0
        }
    };
    const isValid = validateFields({required: exampleFields, actualObj: req.body, options});
    const objtoupdate = filterRequiredFields({
        required: exampleFields,
        actualObj: req.body,
    });
    try {
        const addItem = await dbController.actualizarRegistro('capitulos', objtoupdate,['idCapitulo']);
        res.json({ success: true, message: 'Capítulo agregado isValid', data: {raw:addItem,data: isValid} });
    } catch (error) {
        console.error('Error al agregar capítulo:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor', details: error.message });    
    }
});
export default router;