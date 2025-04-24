import { dbController } from '../backupdb.js';
import authService  from "./jwt.js";
/*export interface IUser {
  idUsuario: number;
  apodoUsuario: string;
  correoUsuario: string;
  claveUsuario: string;
  rolUsuario: number;
  nsfwUsuario: number;
  fechaCreacion: string;
  apicode: string | null;
  fechaNacimiento: string | null;
  nombres: string | null;
  apellidos: string | null;
  state: string | null;
  country: number;
  phone: string | null;
  preRegistrado: number;
  creadorContenido: number;
  anticipado: number;
  fotoPerfilUsuario: string | null;
  plan: number;
  idUltimaTransaccion: string | null;
  fechaUltimaTransaccion: string | null;
}*/
const Usermodel ={
  idUsuario: "number",
  apodoUsuario: "string",
  correoUsuario: "string",
  claveUsuario: "string",
  rolUsuario: "number",
  nsfwUsuario: "number",
  fechaCreacion: "string",
  apicode: "string | null",
  fechaNacimiento: "string | null",
  nombres: "string | null",
  apellidos: "string | null",
  state: "string | null",
  country: "number",
  phone: "string | null",
  preRegistrado: "number",
  creadorContenido: "number",
  anticipado: "number",
  fotoPerfilUsuario: "string | null",
  plan: "number",
  idUltimaTransaccion: "string | null",
  fechaUltimaTransaccion: "string | null",
}
function getDefaultValue(expectedType) {
  switch (expectedType) {
      case "string":
          return "";
      case "number":
          return 0;
      case "string | null":
      case "number | null":
          return null;
      default:
          console.warn(`Unknown type "${expectedType}" in template. Returning null.`);
          return null;
  }
}
function createObjectFromTemplate(template, source) {
  const result = {};

  for (const key in template) {
    if (Object.hasOwnProperty.call(template, key)) { // Good practice to check hasOwnProperty
      const expectedType = template[key];
      const sourceValue = source[key];

      // Check for null or undefined in the source
      if (sourceValue === null || sourceValue === undefined) {
        result[key] = getDefaultValue(expectedType);
      } else {
        // If value exists and is not null/undefined, use it
        result[key] = sourceValue;
      }
    }
  }

  return result;
}
export class AuthModel {
  constructor() {}

  async iniciarSesion({ correoUsuario,claveUsuario}) {
    const results = await dbController.queryWithFilters('usuarios', { correoUsuario });
    if (!results || results.length === 0) {
      return { success: false, message: "Usuario no existe o contraseña incorrecta" };
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
    const hashedPassword = await authService.generatePasswordHash(claveUsuario);
    newUser.claveUsuario = hashedPassword;
    newUser.fechaCreacion = new Date().toISOString();
    // rellenamos los campos faltantes
    const user = createObjectFromTemplate(Usermodel, newUser);
    return user;
  }
  async existeUsuario({ correoUsuario }) {
    const results = await dbController.queryWithFilters('usuarios', { correoUsuario });
    return results;
  }
  obtenerUsuario(string) {
    const hashedPassword = authService.generatePasswordHash(string);
    return hashedPassword;
  }
}