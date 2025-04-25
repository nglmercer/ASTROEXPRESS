# AstroExpress

Este proyecto combina Astro y Express para crear una aplicación web que puede ser utilizada localmente y potencialmente compilada con Electron en el futuro.

## Características

- **Astro**: Framework de frontend con renderizado en el servidor
- **Express**: Servidor backend para APIs y lógica de servidor
- **Integración completa**: Ambas tecnologías funcionan juntas sin problemas

## Requisitos

- Node.js (versión 16 o superior)
- npm

## Instalación

```bash
# Instalar dependencias
npm install
```

## Comandos disponibles

```bash
# Desarrollo (solo Astro)
npm run dev

# Construir el proyecto
npm run build

# Iniciar el servidor Express con Astro integrado
npm run start

# Construir y luego iniciar el servidor (recomendado)
npm run serve
```

## Estructura del proyecto

- `/src`: Código fuente de Astro
  - `/components`: Componentes de Astro
  - `/layouts`: Layouts de Astro
  - `/pages`: Páginas de Astro
- `/public`: Archivos estáticos
- `server.js`: Servidor Express que integra con Astro

## Cómo funciona

El proyecto utiliza Express como servidor principal, que sirve tanto el contenido estático generado por Astro como las APIs personalizadas. Astro está configurado en modo SSR (Server-Side Rendering) utilizando el adaptador de Node.js.

## APIs de ejemplo

- `GET /api/hello`: Devuelve un mensaje simple en formato JSON

## Preparación para Electron

Este proyecto está diseñado para ser compatible con Electron en el futuro. La integración de Express facilita la comunicación entre el frontend y el backend cuando se empaquete como aplicación de escritorio.

## Personalización

Puedes añadir más rutas de API en el archivo `server.js` y más páginas en el directorio `/src/pages`.

```javascript
// Ejemplo de cómo añadir una nueva ruta API en server.js
app.get('/api/datos', (req, res) => {
  res.json({ datos: 'Información personalizada' });
});
```
### Uso de la API 

```javascript
import express from "express";
import mockApiRouter from "./routes/mockApi.js"; // Importar el enrutador simulado
import cors from "cors";

const PORT = 8081;
const app = express();
app.use(cors({
    origin: '*'
}));
app.use(express.json()); // Middleware para parsear JSON
app.use("/mock-api", mockApiRouter); // Montar el enrutador simulado en /mock-api




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

# Password Recovery and Management System

## Current Implementation Status

### Implemented Features
- Password recovery request via email
- Token generation for recovery links
- Verification code generation and validation
- Basic user authentication
- Email notification system
- Security measures for user enumeration prevention

### Pending Implementation: Password Change

The `verifycodePassword` method needs to be completed with the following steps:

```javascript
async verifycodePassword({path, code, password}) {
  // Current implementation validates the code
  // Need to implement:
  1. Update user password in database
  2. Invalidate recovery token
  3. Notify user of successful password change
  4. Clear any existing sessions
}
```

## Required Implementations

### 1. Password Change After Validation
```javascript
// Example implementation structure
async changePasswordAfterValidation(userId, newPassword) {
  1. Hash new password
  2. Update user record
  3. Invalidate existing sessions
  4. Send confirmation email
}
```

### 2. Recovery Token Management
```javascript
async invalidateRecoveryToken(tokenId) {
  1. Mark token as used
  2. Update status in recuperacion_contrasena
  3. Log the action for security audit
}
```

## Suggested Improvements

### Security Enhancements
1. Password Requirements
   - Minimum length validation
   - Complexity requirements
   - Previous password history check
   - Common password check

2. Rate Limiting
   - Implement attempts counter
   - Temporary lockout after failed attempts
   - IP-based rate limiting

3. Session Management
   - Force logout on all devices after password change
   - JWT token invalidation mechanism
   - Session tracking and management

### Feature Additions

1. Multi-Factor Authentication (MFA)
   - SMS verification option
   - Authenticator app integration
   - Backup codes generation

2. Account Recovery Options
   - Alternative email recovery
   - Security questions
   - Trusted contacts recovery

3. Audit and Monitoring
   - Password change history
   - Login attempt logging
   - Suspicious activity detection
   - Geographic location tracking

### API Endpoints to Add

```javascript
POST /api/auth/change-password
POST /api/auth/validate-password
POST /api/auth/logout-all-devices
GET /api/auth/active-sessions
POST /api/auth/enable-mfa
```

## Database Schema Updates

### User Table Additions
```sql
ALTER TABLE usuarios ADD COLUMN
  password_changed_at TIMESTAMP,
  password_history JSON,
  mfa_enabled BOOLEAN,
  security_questions JSON,
  last_login TIMESTAMP
```

### New Tables Needed
```sql
CREATE TABLE session_management
CREATE TABLE password_history
CREATE TABLE security_audit_log
CREATE TABLE mfa_settings
```

## Integration Requirements

1. Email Service
   - Password change confirmation
   - Suspicious activity alerts
   - Security recommendations

2. Security Services
   - Password strength validator
   - Breach detection service
   - GeoIP service

3. Monitoring
   - Failed attempts monitoring
   - Success rate tracking
   - Recovery process analytics

## Best Practices

1. Password Security
   - Use strong hashing algorithms (bcrypt/Argon2)
   - Implement pepper in addition to salt
   - Regular security audits

2. Error Handling
   - Graceful error recovery
   - User-friendly error messages
   - Detailed logging for debugging

3. Performance
   - Caching strategies
   - Database query optimization
   - Asynchronous processing

## Testing Requirements

1. Unit Tests
   - Password validation
   - Token verification
   - Rate limiting logic

2. Integration Tests
   - Complete recovery flow
   - Multi-device logout
   - Email delivery

3. Security Tests
   - Penetration testing
   - Brute force prevention
   - Token security

## Documentation Needs

1. API Documentation
   - Endpoint specifications
   - Request/Response formats
   - Error codes

2. User Documentation
   - Password requirements
   - Recovery process
   - Security recommendations

3. Developer Documentation
   - Implementation guidelines
   - Security considerations
   - Integration steps