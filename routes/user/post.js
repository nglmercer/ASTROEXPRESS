import express from 'express';
import { dbController } from '../backupdb.js';
import { filterRequiredFields, validateFields } from '../verifys.js';
import { AuthModel } from "../usermodel/auth.js";
const authModel = new AuthModel();

const router = express.Router();
const checkAuth = (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
        next();
    } else {
        res.status(401).json({ message: 'No autorizado: Token inválido o ausente.' });
    }
};
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
    if (!ValidOBJ.isValid) {
        return res.status(400).json({ success: false, message: 'Nombre, correo y contraseña requeridos',ValidOBJ });
    }
    const result = await authModel.registrarUsuario(objtoValidate);
    if (result && result.success) {
        return res.status(201).json(result);
    }
    res.status(400).json({ success: false, message: result.message });
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
export default router;