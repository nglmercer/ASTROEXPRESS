import { dbController } from '../backupdb.js';
import authService  from "./jwt.js";

export class AuthModel {
  constructor() {}

  async iniciarSesion({ correoUsuario,claveUsuario}) {
    const results = await dbController.queryWithFilters('usuarios', { correoUsuario });
    if (!results || results.length === 0) {
      return null;
    }
    const user = results[0];
    const getToken = await authService.authenticateUser(user, claveUsuario);
    return getToken;
  }
  async registrarUsuario({ apodoUsuario, correoUsuario, claveUsuario }) {
    // primero validamos el usuario, correoUsuario y claveUsuario
    const results = await dbController.queryWithFilters('usuarios', { correoUsuario });
    if (results && results.length > 0) {
      return { success: false, message: "El usuario ya existe" };
    }
    // si no existe, lo creamos
    const newUser = { apodoUsuario, correoUsuario, claveUsuario };
    const hashedPassword = await authService.createUserToken(newUser);
    console.log("hashedPassword", hashedPassword);
    return { success: true, message: "Usuario creado" };
    // test
  }
}