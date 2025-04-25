import notificationService, { NOTIFICATION_METHODS } from './notificationService.js'; // Ajusta la ruta
import { dbController } from '../backupdb.js';
import authService  from "./jwt.js";
import crypto from "crypto";

// Código corto para validación manual (6 caracteres alfanum.)
function genCode(length = 6) {
  return crypto
    .randomBytes(length)
    .toString("base64") // base64 → +, / caracteres
    .replace(/[^a-zA-Z0-9]/g, "") // limpio a solo alfanum
    .substring(0, length)
    .toUpperCase();
}

// Token largo para incluir en la URL
function genToken() {
  return crypto.randomBytes(32).toString("hex"); // 64 caracteres hex
}

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
    const notExistMessage = { success: false, message: "Usuario no existe o contraseña incorrecta" }
    if (!results || results.length === 0) {
      return notExistMessage;
    }
    const user = Array.isArray(results) ? results[0] : results;
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
    newUser.rolUsuario = 1;
    // rellenamos los campos faltantes
    const Parseduser = createObjectFromTemplate(Usermodel, newUser);
    const result = await dbController.guardarRegistro('usuarios', Parseduser,["idUsuario"]);
    const token = await authService.authenticateUser(result, claveUsuario);
    delete result.claveUsuario;
    return {
        success: true,
        message: "Usuario registrado correctamente",
        data: result,
        token: typeof token === 'object' ? token.token : token
    }
  }
  async existeUsuario({ correoUsuario }) {
    const results = await dbController.queryWithFilters('usuarios', { correoUsuario });
    return results;
  }
  obtenerUsuario(string) {
    const hashedPassword = authService.generatePasswordHash(string);
    return hashedPassword;
  }
  async recuperarpassword({correoUsuario, email}){
    const EMAIL = correoUsuario || email
    const existeuser = await this.existeUsuario({correoUsuario:EMAIL})
    if (!existeuser || existeuser.length === 0){
      return { success: false}
    }
    const existuserobj = Array.isArray(existeuser) ? existeuser[0] : existeuser;
    const recovertoken =genToken()
    const recoverCode = genCode()
    const username = existuserobj?.apodoUsuario || correoUsuario;
    const resetEntry = {
      id:         existuserobj?.idUsuario || Date.now(),     // o usa uuid()
      userId:     username,
      userName: username,
      username,
      code:      recoverCode,
      token:      recovertoken,
      path:       `/reset-password/${recovertoken}`,
      status:     'pending',
      createdAt:  new Date().toISOString(),
      expiresAt:  new Date(Date.now() + 15*60*1000).toISOString() // +15m
    };
    const result = await notificationService.sendRecoveryCode(
      {
        ...resetEntry,
        method:NOTIFICATION_METHODS.EMAIL,
        to: EMAIL,
      }
    );
    // save restEntry {}
    return {
      existuserobj,
      resetEntry,
      result
    }
  }
}