import express from 'express';
import { dbController } from '../backupdb.js';
/* import { AudiosModel } from '../models/AudiosModel.js';
import { ResolucionesModel } from '../models/ResolucionesModel.js';
import { SubtitulosModel } from '../models/SubtitulosModel.js'; */
import { filterRequiredFields, validateFields } from '../verifys.js';
import { AuthModel } from "../usermodel/auth.js";

/* const audiosModel = new AudiosModel();
const resolucionesModel = new ResolucionesModel();
const subtitulosModel = new SubtitulosModel(); */
const authModel = new AuthModel();

const router = express.Router();

// Middleware para parsear JSON
router.use(express.json());
const DEFAULT_PAGE_SIZE = 20;

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

// Rutas POST existentes
router.post('/catalogo', checkAuth, async (req, res) => {
    console.log('agregando: POST /catalogo - Body:', req.body);
    // Implementación real necesitaría dbController.insert('catalogos', data)
    const { idCatalogo, nombreCatalogo, tipoCatalogo, estadoCatalogo, imagenPortadaCatalogo, imagenFondoCatalogo,descripcionCatalogo, nsfwCatalogo, recomendacionCatalogo, trailerCatalogo } = req.body;
    try {
        const addItem = await dbController.guardarRegistro('catalogos', {
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
        res.json({ success: true, message: 'Catálogo agregado (simulado)', data: addItem });
    } catch (error) {
        console.error('Error al agregar catálogo:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor', details: error.message });
    }
});

// POST /catalogo/:id (Requiere Auth) - Simula actualizar (el controlador actual no tiene UPDATE)
router.post('/catalogo/:id', checkAuth, (req, res) => {
    const { id } = req.params;
    console.log(`SIMULADO: POST /catalogo/${id} - Body:`, req.body);
     // Implementación real necesitaría dbController.update('catalogos', id, data)
    res.json({ success: true, message: `Catálogo ${id} actualizado (simulado)` });
});

router.post('/catalogos/pagina/:pagina', checkAuth, async (req, res) => {
    const pagina = parseInt(req.params.pagina, 10);
    if (isNaN(pagina) || pagina < 1) {
        return res.status(400).json({ message: 'Número de página inválido' });
    }

    const limit = DEFAULT_PAGE_SIZE;
    const offset = (pagina - 1) * limit;

    try {
        const data = await dbController.getRecords('catalogos', limit, offset);
        const totalCount = await dbController.getRowCount('catalogos');
        const totalPaginas = Math.ceil(totalCount / limit);

        res.json({
            data: data,
            totalPaginas: totalPaginas
        });
    } catch (error) {
        console.error('Error al obtener catálogos paginados:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// POST /catalogos/pagina/:pagina/exists (Requiere Auth) - Verificar si una página de catálogos existe
router.post('/catalogos/pagina/:pagina/exists', checkAuth, async (req, res) => {
    const pagina = parseInt(req.params.pagina, 10);
    if (isNaN(pagina) || pagina < 1) {
         // Consideramos que una página inválida no existe en el contexto esperado
         return res.json({ exists: false });
    }

    const limit = DEFAULT_PAGE_SIZE;

    try {
        const totalCount = await dbController.getRowCount('catalogos');
        const totalPaginas = Math.ceil(totalCount / limit);

        // Una página existe si el número de página es menor o igual al total de páginas calculadas
        res.json({ exists: pagina <= totalPaginas });
    } catch (error) {
        console.error('Error al verificar existencia de página de catálogos:', error);
        // En caso de error, asumimos que no se puede confirmar la existencia
        res.status(500).json({ message: 'Error interno del servidor al verificar existencia' });
    }
});
// Nuevas rutas POST desde mockApi.js
router.post('/catalogos/buscar', checkAuth, async (req, res) => {
    const { categoriasCatalogo, estadosCatalogo, tiposCatalogo, nombreCatalogo } = req.body;
    const results = await dbController.searchAcrossAllColumns('catalogos', nombreCatalogo);
    res.json(results);
});

router.post('/temporada', checkAuth, async (req, res) => {
    console.log('Agregando: POST /temporada - Body:', req.body);
    const { idTemporada, numeroTemporada, nombreTemporada, descripcionTemporada, portadaTemporada, catalogoTemporada, nsfw } = req.body;
       const exampleFields ={
           idTemporada: 0,// autoassigned
           numeroTemporada: 0,
           nombreTemporada: '',
           descripcionTemporada: '',
           portadaTemporada: '',
           catalogoTemporada: 1,// nunca deberia ser 0 ya que es un id de una tabla
           nsfw: false,// number // boolean
        }
      const options = {
        //validators && types
        validators: {
            catalogoTemporada: (value) => value > 0
        }
      };
      const isValid = validateFields({required: exampleFields, actualObj: req.body, options});
      try {
          const addItem = await dbController.guardarRegistro('temporadas', {
              idTemporada,
              numeroTemporada,
              nombreTemporada,
              descripcionTemporada,
              portadaTemporada,
              catalogoTemporada,
              nsfw
          },['idTemporada']);
          res.json({ success: true, message: 'Temporada agregada isValid', data: {raw:addItem,data: isValid} });
      } catch (error) {
          console.error('Error al agregar temporada:', error);
          res.status(500).json({ success: false, message: 'Error interno del servidor', details: error.message });
      }
})

router.post('/capitulo', checkAuth, async (req, res) => {
    console.log('Agregando: POST /capitulo - Body:', req.body);
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
            catalogoCapitulo: (value) => value > 0
        }
    };
    const isValid = validateFields({required: exampleFields, actualObj: req.body, options});
    const objtosave = filterRequiredFields({
        required: exampleFields,
        actualObj: req.body,
    });
    try {
        const addItem = await dbController.guardarRegistro('capitulos', objtosave,['idCapitulo']);
        res.json({ success: true, message: 'Capítulo agregado isValid', data: {raw:addItem,data: isValid} });
    } catch (error) {
        console.error('Error al agregar capítulo:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor', details: error.message });    
    }
});

router.post('/usuario/:idUsuario/catalogo/:catalogo/favorito', checkAuth, async (req, res) => {
    const { idUsuario, catalogo } = req.params;
     console.log(`SIMULADO: POST /usuario/${idUsuario}/catalogo/${catalogo}/favorito - Body:`, req.body);
     // Implementación real necesitaría buscar si existe, y luego:
     // if (existe) dbController.delete('favoritos', { usuarioFavorito: idUsuario, catalogoFavorito: catalogo });
     // else dbController.insert('favoritos', { usuarioFavorito: idUsuario, catalogoFavorito: catalogo });
    res.json({ success: true, message: `Toggle favorito para Catálogo ${catalogo} de ${idUsuario} (simulado)` });
});


router.post('/usuario/:userId/notificacion', checkAuth, (req, res) => {
    const { userId } = req.params;
    const { subscription } = req.body;
    if (subscription) {
        res.json({ success: true, message: `Suscripción de notificación integrada para ${userId} (simulado)` });
    } else {
        res.status(400).json({ success: false, message: 'Objeto de suscripción requerido' });
    }
});

router.post('/categoria', checkAuth, (req, res) => {
    res.json({ success: true, message: 'Categoría agregada (simulada)', id: Date.now() });
});
// registro y login  NO NECESITAN el middleware checkAuth
router.post('/usuario/registro',async (req, res) => {
    const userOBJ = {
        apodoUsuario: "string",
        claveUsuario: "string",
        correoUsuario: "string"
    }
    const objtoValidate = filterRequiredFields({
        required: userOBJ,
        actualObj: req.body,
    });
    const options = {
        //validators && types
        validators: {
            apodoUsuario: (value) => typeof value === 'string' && value.length > 0,
            claveUsuario: (value) => typeof value === 'string' && value.length > 0,
            correoUsuario: (value) => typeof value === 'string' && value.length > 0
        }
    }
    const ValidOBJ = validateFields({required: userOBJ, actualObj: req.body, options});
    console.log('Registrando:', objtoValidate);
    if (!ValidOBJ.isValid) {
        return res.status(400).json({ success: false, message: 'Nombre, correo y contraseña requeridos',ValidOBJ });
    }
    const result = await authModel.registrarUsuario(objtoValidate);
    res.status(201).json(result);
});

router.post('/usuario/sesion', async (req, res) => {
    const userOBJ = {
        correoUsuario: "string",
        claveUsuario: "string"
    }
    const objtoValidate = filterRequiredFields({
        required: userOBJ,
        actualObj: req.body,
    });
    const options = {
        //validators && types
        validators: {
            correoUsuario: (value) => typeof value ==='string' && value.length > 0,
            claveUsuario: (value) => typeof value ==='string' && value.length > 0
        }
    }
    const ValidOBJ = validateFields({required: userOBJ, actualObj: req.body, options});
    if (!ValidOBJ.isValid) {
        return res.status(400).json({ success: false, message: 'Nombre y contraseña requeridos',ValidOBJ });
    }
    const result = await authModel.iniciarSesion(objtoValidate);
    if (!result.success) {
        return res.status(400).json({ success: false, message: result.message });
    } else {
        return res.status(201).json(result);
    }

});
export default router;