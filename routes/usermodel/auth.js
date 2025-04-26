import notificationService, { NOTIFICATION_METHODS } from './notificationService.js'; // Ajusta la ruta
import { dbController } from '../backupdb.js';
import authService  from "./jwt.js";
import crypto from "crypto";

// Código corto para validación manual (6 caracteres alfanum.)
function genCode(length = 6, type = "number") {
  let allowedChars;

  if (type === "number") {
    allowedChars = "0123456789";
  } else { // Default or "alphanumeric"
    // Use uppercase letters and numbers, matching the original output style
    allowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  }

  let code = "";
  const allowedCharsLength = allowedChars.length;

  // Generate random bytes and map them to characters from the allowed set
  // This ensures the code has the exact requested length and uses only allowed characters.
  while (code.length < length) {
    // Generate bytes needed for the remaining characters
    const bytes = crypto.randomBytes(length - code.length);

    for (let i = 0; i < bytes.length; i++) {
      // Map the byte value to an index within the allowed characters string
      const charIndex = bytes[i] % allowedCharsLength;
      code += allowedChars[charIndex];

      // Stop adding characters once the desired length is reached
      if (code.length === length) {
        break;
      }
    }
  }

  return code;
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
/*
recoverpassword model
*/
const recoverpasswordmodel = {
  id: "number",
  usuario: "number",
  ruta: "string | null",
  codigo: "number",
  estado: "number",
  fecha_creacion: "string | null",
  fecha_vencimiento: "string | null",
}
const templatepasswordcode =  {
  "path": "string",
  "codigo": "number",
  "nuevaContrasena":"string"
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
function verifycode(obj, { code }) {
    if (!obj || typeof obj.codigo === 'undefined' || !obj.fecha_vencimiento) {
        return { success: false, message: "Invalid object or missing properties." };
    }

    const providedCode = parseInt(code, 10);
    if (isNaN(providedCode) || obj.codigo !== providedCode) {
        return { success: false, message: "Code mismatch or invalid input code.",code,codew:obj.codigo };
    }

    const timetonumber = Number(obj.fecha_vencimiento);
    const isvalidTime = isValidTime(timetonumber)
    if (!isvalidTime) {
        return { success: false, message: "Code has expired or invalid expiration date.", isvalidTime };
    }

    return { success: true, message: "Verification successful." };
}
function getTimestamp(expirationMinutes = 15) {
  const createdAt = Date.now();
  const expiresAt = createdAt + (expirationMinutes * 60 * 1000);
  return {
    createdAt: createdAt,    // Timestamp en milisegundos
    expiresAt: expiresAt     // Timestamp en milisegundos
  };
}
function isValidTime(expirationTime) {
  const currentTime = Date.now();
  let expirationTimestampValue;

  if (typeof expirationTime === 'number') {
    // If the input is already a number, assume it's a timestamp in milliseconds
    expirationTimestampValue = expirationTime;
  } else if (typeof expirationTime === 'string') {
    // If the input is a string, try parsing it as a date
    const parsedDate = new Date(expirationTime);
    // getTime() returns NaN if the date string is invalid
    expirationTimestampValue = parsedDate.getTime();
  } else {
    // If the input is neither a number nor a string, it's invalid input
    expirationTimestampValue = NaN;
  }

  // Check if the obtained timestamp is a valid number AND if the current time is before the expiration time
  // If expirationTimestampValue is NaN, the first part of the condition is false, returning false (invalid/expired)
  return !isNaN(expirationTimestampValue) && currentTime < expirationTimestampValue;
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
  async actualizarRegistro({userId, newPassword}) {
    try {
      // Hash the new password
      const hashedPassword = await authService.generatePasswordHash(newPassword);
      
      // Update user's password in database
      const updateResult = await dbController.actualizarRegistro(
        'usuarios',
        { idUsuario: userId,claveUsuario: hashedPassword },
        ["idUsuario"]
      );
      
      if (!updateResult || updateResult.success === false) {
        return { success: false, message: "Error al actualizar la contraseña" };
      }
      
      return {
        success: true,
        message: "Contraseña actualizada correctamente",
        requireRelogin: true
      };
      
    } catch (error) {
      console.error("Error durante la actualización de contraseña:", error);
      return {
        success: false,
        message: "Error al procesar el cambio de contraseña",
        error: error.message
      };
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
  async recuperarpassword({ correoUsuario, email }) {
    // Use email as the primary identifier, allowing either parameter name
    const userEmail = correoUsuario || email;

    if (!userEmail) {
        // Should ideally be handled by input validation before reaching here, but defensive check
        return { success: false, message: "Email address is required." };
    }

    // Check if user exists by email
    const results = await this.existeUsuario({ correoUsuario: userEmail });
    if (!results || results.length === 0) {
      console.log(`Password recovery requested for non-existent user: ${userEmail}`); // Log for debugging
      // Always return a generic success message for security (prevents user enumeration)
      return { success: true, message: "If a user with that email exists, a recovery link has been sent." };
    }

    const user = Array.isArray(results) ? results[0] : results;
    const userId = user.idUsuario; // Use the actual user ID from the database
    const userName = user.apodoUsuario; // Use the user's nickname for personalization

    // Generate unique token and code for this recovery attempt
    // Assuming genToken() and genCode() are defined elsewhere and generate unique values
    const recoverToken = genToken();
    const recoverCode = genCode();

    // Construct the path for the reset link on the frontend
    const path = `/reset-password/${recoverToken}`;

    // Set timestamps
    const { createdAt, expiresAt } = getTimestamp();

    // Create the recovery entry object to be saved in the database
    const resetEntry = {
      id: typeof uuid === 'function' ? uuid() : Date.now(), // Prefer uuid() for unique ID
      userId: userId,
      userName: userName,
      code: recoverCode,
      token: recoverToken,
      path: path,
      status: 'pending', // Initial status of the recovery request
      createdAt: createdAt,
      expiresAt: expiresAt,
      usuario: userId, // Para el campo 'usuario' de tipo number
      ruta: path, // Para el campo 'ruta' de tipo string | null
      codigo: parseInt(recoverCode), // Para el campo 'codigo' de tipo number
      estado: 1, // Para el campo 'estado' de tipo number (1 para pendiente)
      fecha_creacion: createdAt, // Para el campo 'fecha_creacion' de tipo string | null
      fecha_vencimiento: expiresAt, // Para el campo 'fecha_vencimiento' de tipo string | null
    };

    try {
        const entryToSave = createObjectFromTemplate(recoverpasswordmodel, resetEntry);
        // Assuming dbController.guardarRegistro saves the record and returns a result indicating success
        // Replace 'password_resets' with the actual table name if different
        const saveResult = await dbController.guardarRegistro('recuperacion_contrasena', entryToSave,["id"]);

        // Check if saving was successful (adjust check based on dbController return value)
        if (!saveResult || saveResult.success === false) {
             console.error("Failed to save password reset entry for user:", userId, saveResult);
             // If saving fails, the recovery process cannot proceed as the token/code won't be valid.
             // Return a failure message that doesn't reveal user existence.
             return { success: false, message: "An error occurred. Please try again later." };
        }

        // Send the recovery email to the user
        // Pass necessary details to the email service for template rendering
        const emailResult = await notificationService.sendRecoveryCode(
          {
            method: NOTIFICATION_METHODS.EMAIL,
            to: userEmail,
            userName: userName, // User's name for email personalization
            recoveryLink: `${path}`, // Construct the full URL to the reset page ${process.env.FRONTEND_URL}
            recoveryCode: recoverCode, // The code (if needed in the email body)
            expiresAt: expiresAt, // Expiry date/time
            // Add any other data required by the email template (e.g., site name)
          }
        );

        // Check if email sending was successful (adjust based on notificationService return)
        if (!emailResult || emailResult.success === false) {
             console.error("Failed to send recovery email for user:", userId, emailResult);
             // If email sending fails, the user didn't receive the link/code.
             // Return a failure message that doesn't reveal user existence.
             // Consider logging the saved entry ID for potential manual retry or debugging.
             return { success: false, message: "An error occurred. Please try again later." };
        }

        // If saving and sending were successful, return a generic success message
        return { success: true, message: "If a user with that email exists, a recovery link has been sent." };

    } catch (error) {
        // Catch any unexpected errors during the process (e.g., database connection issues, service errors)
        console.error("Unexpected error during password recovery process for email:", userEmail, error);
        return { success: false, message: "An unexpected error occurred. Please try again later." };
    }
  }
  async verifycodePassword({path,code,password, codigo, contrasena}){
    const pathlink = path;
    const codenumber = code || codigo;
    const passwordstring = password || contrasena;

    const results  = await dbController.queryWithFilters('recuperacion_contrasena', {ruta: pathlink});
    if (!results || results.lenght === 0) return {success:false, message:"no existe"}
    const resultobj = Array.isArray(results) ? results[0] : results

    const isValid = verifycode(resultobj, {code:codenumber})
    if (!isValid?.success) return isValid;
    const changePasswordresult = await     this.actualizarRegistro({
      userId: resultobj.usuario,
      newPassword: passwordstring,
    })
    return {
      ...isValid,
      resultobj,
      changePasswordresult
    }
  }
}