// notificationService.js
import nodemailer from 'nodemailer';
//import twilio from 'twilio';
import dotenv from 'dotenv'; // Importa dotenv para cargar variables de entorno

// Carga las variables de entorno desde el archivo .env si existe
// Es importante llamar a config() al principio
dotenv.config();

// Constantes para los métodos de notificación
export const NOTIFICATION_METHODS = {
  EMAIL: 'email',
  SMS: 'sms',
};

class NotificationService {
  constructor() {
    // --- Validar Variables de Entorno Esenciales ---
    this._validateEnvVars();

    // --- Configuración de Email (Nodemailer) ---
    // Valores predeterminados optimizados para Gmail con Contraseña de Aplicación
    const emailPort = parseInt(process.env.EMAIL_PORT || '587', 10); // Puerto 587 usa STARTTLS (secure: false)
    const emailSecure = process.env.EMAIL_SECURE === 'true' || emailPort === 465; // Puerto 465 usa SSL directo (secure: true)

    this.emailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com', // Host de Gmail
      port: emailPort,
      secure: emailSecure, // true para 465, false para otros (como 587)
      auth: {
        user: process.env.EMAIL_USER, // Tu dirección de Gmail: test1234@gmail.com
        pass: process.env.EMAIL_PASS, // Tu Contraseña de Aplicación: jbwd yfqm thmf wmzk
      },
      // Opcional: Añadir configuración de TLS si es necesario (a veces para servidores específicos)
      // tls: {
      //   ciphers:'SSLv3' // Ejemplo, ajustar según necesidad
      //   rejectUnauthorized: false // ¡NO USAR EN PRODUCCIÓN! Solo para debug local con certificados autofirmados
      // }
    };

    this.emailTransporter = nodemailer.createTransport(this.emailConfig);
    // Usar el email de autenticación como remitente por defecto si no se especifica EMAIL_FROM
    this.emailFromAddress = process.env.EMAIL_FROM || this.emailConfig.auth.user;

    // --- Configuración de SMS (Twilio) ---
    this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    // Solo inicializar Twilio si las credenciales están presentes
/*     if (this.twilioAccountSid && this.twilioAuthToken && this.twilioPhoneNumber) {
       try {
         this.twilioClient = twilio(this.twilioAccountSid, this.twilioAuthToken);
       } catch (error) {
         console.error('Error initializing Twilio client:', error.message);
         // Puedes decidir si lanzar el error o simplemente desactivar la funcionalidad SMS
         this.twilioClient = null;
       }
    } else {
      console.warn('Twilio configuration missing. SMS functionality will be disabled.');
      this.twilioClient = null;
    } */
  }

  /**
   * Valida que las variables de entorno requeridas estén definidas.
   * Lanza un error si falta alguna variable esencial.
   * @private
   */
  _validateEnvVars() {
    const requiredEmailVars = ['EMAIL_USER', 'EMAIL_PASS'];
    const requiredSmsVars = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'];

    // Validar email si el host/port no son los de un servicio dummy
    const isDummyEmailConfig = (process.env.EMAIL_HOST === 'smtp.example.com');
    if (!isDummyEmailConfig) {
        const missingEmailVars = requiredEmailVars.filter(varName => !process.env[varName]);
        if (missingEmailVars.length > 0) {
            console.warn(`Missing required email environment variables: ${missingEmailVars.join(', ')}. Email functionality might be limited.`);
            // Podrías lanzar un error si el email es crítico:
            // throw new Error(`Missing required email environment variables: ${missingEmailVars.join(', ')}`);
        }
    }


    // Validar SMS si no son los valores dummy
    const isDummySmsConfig = (process.env.TWILIO_ACCOUNT_SID === 'your_account_sid');
     if (!isDummySmsConfig) {
        const missingSmsVars = requiredSmsVars.filter(varName => !process.env[varName]);
        if (missingSmsVars.length > 0) {
            console.warn(`Missing required Twilio environment variables: ${missingSmsVars.join(', ')}. SMS functionality might be disabled.`);
             // Podrías lanzar un error si el SMS es crítico:
            // throw new Error(`Missing required Twilio environment variables: ${missingSmsVars.join(', ')}`);
        }
     }

  }

  /**
   * Envía una notificación por correo electrónico.
   * @param {string} to - Dirección de correo del destinatario.
   * @param {string} subject - Asunto del correo.
   * @param {string} text - Contenido en texto plano.
   * @param {string} [html=null] - Contenido en HTML (opcional).
   * @returns {Promise<{success: boolean, messageId?: string, error?: string}>} - Resultado de la operación.
   */
  async sendEmail(to, subject, text, html = null) {
    if (!this.emailTransporter) {
        console.error('Email transporter not initialized. Cannot send email.');
        return { success: false, error: 'Email service not configured correctly.' };
    }

    const mailOptions = {
      from: this.emailFromAddress, // Usa la dirección configurada
      to,
      subject,
      text,
      ...(html && { html }), // Añade html solo si no es null
    };

    try {
      const info = await this.emailTransporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`Error sending email to ${to}:`, error);
      // Proporciona un mensaje de error más genérico al cliente si es necesario por seguridad
      return { success: false, error: `Failed to send email: ${error.message}` };
    }
  }

  /**
   * Envía una notificación por SMS usando Twilio.
   * @param {string} to - Número de teléfono del destinatario (formato E.164, ej: +1234567890).
   * @param {string} message - Contenido del mensaje SMS.
   * @returns {Promise<{success: boolean, sid?: string, error?: string}>} - Resultado de la operación.
   */
/*   async sendSMS(to, message) {
    if (!this.twilioClient) {
      console.error('Twilio client not initialized. Cannot send SMS.');
      return { success: false, error: 'SMS service not configured or failed to initialize.' };
    }
    if (!this.twilioPhoneNumber) {
        console.error('Twilio phone number not configured. Cannot send SMS.');
        return { success: false, error: 'Twilio source phone number is not set.' };
    }


    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.twilioPhoneNumber, // Tu número de Twilio
        to, // Número del destinatario
      });
      console.log(`SMS sent successfully to ${to}. SID: ${result.sid}`);
      return { success: true, sid: result.sid };
    } catch (error) {
      console.error(`Error sending SMS to ${to}:`, error);
      // Proporciona un mensaje de error más genérico al cliente si es necesario
      return { success: false, error: `Failed to send SMS: ${error.message}` };
    }
  } */

  /**
   * Envía una notificación con un código de recuperación de contraseña.
   * @param {NOTIFICATION_METHODS.EMAIL | NOTIFICATION_METHODS.SMS} method - Método de notificación ('email' o 'sms').
   * @param {string} to - Dirección de correo o número de teléfono del destinatario.
   * @param {string} code - Código de recuperación.
   * @param {string} username - Nombre o nombre de usuario del destinatario.
   * @param {number} [expiryMinutes=15] - Tiempo de expiración del código en minutos.
   * @returns {Promise<{success: boolean, error?: string, messageId?: string, sid?: string}>} - Resultado de la operación.
   */
  async sendRecoveryCode({
    method,
    to,
    code,
    token,
    username,
    path,
    expiryMinutes = 15
  }) {
    const expiryText = `Este código expirará en ${expiryMinutes} minutos.`;
    const ignoreText = 'Si no solicitaste este código, por favor ignora este mensaje.';
  
    switch (method) {
      case NOTIFICATION_METHODS.EMAIL:
        const subject = 'Código de Recuperación de Contraseña';
  
        const text = `Hola ${username},
  
  Tu código de recuperación es: ${code}
  
  Este código expirará en ${expiryMinutes} minutos.
  
  Si no solicitaste este código, ignora este mensaje.`;
  
        const html = `
          <div style="font-family: sans-serif; line-height: 1.6;">
            <h2>Recuperación de Contraseña</h2>
            <p>Hola ${username},</p>
            <p>Tu código de recuperación de contraseña es: <strong style="font-size: 1.2em;">${code}</strong></p>
            <p><a href="https://tu-app.com${path}" style="display: inline-block; padding: 10px 20px; background: #4a90e2; color: #fff; text-decoration: none; border-radius: 5px;">Restablecer contraseña</a></p>
            <p><em>${expiryText}</em></p>
            <hr>
            <p><small>${ignoreText}</small></p>
          </div>
        `;
  
        return this.sendEmail(to, subject, text, html);
  
      case NOTIFICATION_METHODS.SMS:
        const message = `Tu código de recuperación es: ${code}. Expira en ${expiryMinutes} min.`;
        return this.sendSMS(to, message);
  
      default:
        console.error(`Invalid notification method requested: ${method}`);
        return { success: false, error: 'Método de notificación inválido' };
    }
  }
  
}

// Exporta una instancia única (Singleton pattern)
const notificationService = new NotificationService();
export default notificationService;