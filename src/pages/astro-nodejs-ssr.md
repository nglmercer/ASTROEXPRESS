# Integración de Astro con Node.js/Express (SSR)

Este documento explica cómo Astro se integra con un servidor Node.js/Express para habilitar el Renderizado del Lado del Servidor (SSR).

## El `ssrHandler`

Cuando construyes tu proyecto Astro con el adaptador `@astrojs/node`, Astro genera un punto de entrada específico para el servidor. En este proyecto, este punto de entrada se encuentra en `dist/server/entry.mjs`.

Dentro de este archivo, Astro exporta una función llamada `handler`. En nuestro archivo `server.js`, la importamos y la renombramos como `ssrHandler` para mayor claridad:

```javascript
import { handler as ssrHandler } from './dist/server/entry.mjs';
```

## Uso en `server.js`

El archivo `server.js` configura un servidor Express básico. Después de definir las rutas de la API (bajo `/api`) y servir los archivos estáticos del cliente (desde `dist/client/`), utilizamos el `ssrHandler` como un middleware de Express.

```javascript
// El manejador SSR de Astro debe ir DESPUÉS de las rutas de la API
app.use((req, res, next) => {
  // Opcionalmente, puedes pasar datos al handler a través del objeto 'locals'.
  // Estos datos estarán disponibles en tus componentes Astro (`Astro.locals`).
  const pageTitle = getPageTitle(req.path);
  const locals = {
    title: pageTitle,
    getAlterTitle: getAlterTitle(req.path),
    // Puedes añadir más datos aquí según sea necesario para esta petición
    // Ejemplo: pasar ID de usuario si existe sesión
    // userId: req.session?.userId 
  };

  // Se invoca al handler de Astro, pasando la petición, respuesta,
  // la función 'next' y el objeto 'locals' específico para esta petición.
  ssrHandler(req, res, next, locals);
});
function getAlterTitle(path) {
  switch (path) {
    case '/':
      return 'Inicio';  
  }
  return 'Astro Express';
}
```

**El objeto `locals`:**

El cuarto argumento pasado a `ssrHandler` es un objeto opcional comúnmente llamado `locals`. Este objeto es un mecanismo para **pasar datos desde tu middleware de Express directamente a tus componentes Astro** durante el proceso de renderizado en el servidor.

*   **¿Cómo se usa?** Dentro de cualquier componente `.astro` que se renderice para esa petición específica, puedes acceder a estos datos a través del objeto global `Astro.locals`. Por ejemplo, en el código anterior, podrías acceder al título en un componente Astro con `Astro.locals.title`.
*   **¿Se puede usar múltiples veces `locals`?** La *variable* `locals` se define dentro del middleware de Express para *cada petición* que maneja. Esto significa que para cada nueva solicitud, puedes construir un objeto `locals` diferente con datos relevantes para *esa* solicitud en particular. No se trata de reutilizar el mismo objeto `locals` entre diferentes peticiones, sino de usar el *mecanismo* de `locals` para pasar datos específicos de la petición actual cada vez que se invoca el handler. Los datos en `Astro.locals` son, por lo tanto, específicos del contexto de la petición que se está procesando.

**¿Qué hace `ssrHandler`?**

La función principal del `ssrHandler` es integrar el motor de renderizado de Astro con el servidor Express. No se usa para *más cosas* en el sentido de tener funcionalidades adicionales ocultas; su propósito es específico para el SSR con Astro. Específicamente:

1.  **Intercepta Peticiones:** Captura las solicitudes HTTP entrantes que no fueron manejadas previamente (por ejemplo, por rutas de API o middleware de archivos estáticos).
2.  **Enrutamiento de Astro:** Utiliza el sistema de enrutamiento basado en archivos de Astro para encontrar la página (`.astro`) o endpoint (`.js`, `.ts`) que corresponde a la URL solicitada.
3.  **Renderizado SSR:** Ejecuta el código de la página o endpoint de Astro en el servidor. Durante este proceso, puede acceder a los datos pasados a través del objeto `locals` (ver sección anterior).
4.  **Envío de Respuesta:** Genera la respuesta HTML (para páginas) o los datos (para endpoints) y la envía de vuelta al cliente a través del objeto `res` de Express.

Esencialmente, actúa como el puente que permite a Express delegar el manejo de ciertas rutas a Astro para el renderizado del lado del servidor.

**Importante:** El middleware que usa `ssrHandler` debe colocarse *después* de cualquier otra ruta (como las de la API) que quieras que Express maneje directamente. De lo contrario, Astro intentará manejar esas rutas como si fueran páginas.

## Flujo de una Petición

1.  El navegador solicita una URL (ej. `/about`).
2.  Express recibe la petición.
3.  Verifica si coincide con `/api/*`. No coincide.
4.  Verifica si es un archivo estático en `dist/client/`. No coincide.
5.  La petición llega al middleware `ssrHandler`.
6.  `ssrHandler` busca una página de Astro que coincida con `/about` (ej. `src/pages/about.astro`).
7.  Astro renderiza `about.astro` en el servidor.
8.  `ssrHandler` envía el HTML resultante al navegador.

Esta configuración permite tener una aplicación híbrida donde algunas rutas son manejadas por una API de Express y otras son páginas renderizadas por Astro en el servidor.