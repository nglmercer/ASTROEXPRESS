import notificationService, { NOTIFICATION_METHODS } from './notificationService.js'; // Ajusta la ruta

// Ejemplo de uso
async function requestPasswordReset(userEmail, userName) {
  const recoveryCode = Math.random().toString(36).substring(2, 8).toUpperCase(); // Genera un código simple

  console.log(`Enviando código de recuperación a ${userEmail}`);
  const result = await notificationService.sendRecoveryCode(
    NOTIFICATION_METHODS.EMAIL,
    userEmail,
    recoveryCode,
    userName
  );

  if (result.success) {
    console.log('Correo de recuperación enviado con éxito.');
    // Guarda el código y su expiración en la base de datos para verificarlo después
  } else {
    console.error('Error al enviar el correo de recuperación:', result.error);
  }
}

async function sendWelcomeSMS(userPhone, userName) {
    console.log(`Enviando SMS de bienvenida a ${userPhone}`);
    const result = await notificationService.sendSMS(
        userPhone, // Asegúrate que esté en formato E.164 (+1...)
        `¡Hola ${userName}! Bienvenido a nuestra aplicación.`
    );

    if (result.success) {
        console.log('SMS de bienvenida enviado con éxito.');
    } else {
        console.error('Error al enviar SMS de bienvenida:', result.error);
    }
}

// --- Llamadas de ejemplo ---
requestPasswordReset('nglmercer92@gmail.com', 'memelser');
// sendWelcomeSMS('+15551234567', 'Juan Perez');