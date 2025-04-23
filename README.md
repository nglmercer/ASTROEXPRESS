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