import express from "express";
import apiRouter from "./routes/api.js"; // Importar el enrutador de la API
import mockApiRouter from "./routes/mockApi.js"; // Importar el enrutador simulado
import cors from "cors";
import { handler as ssrHandler } from "./dist/server/entry.mjs";

const PORT = 8081;
const app = express();
app.use(cors({
    origin: '*'
}));
app.use(express.json()); // Middleware para parsear JSON
app.use(express.static("dist/client/"));
app.use("/api", apiRouter); // Montar el enrutador de la API en /api
app.use("/mock-api", mockApiRouter); // Montar el enrutador simulado en /mock-api
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
function getPageTitle(path) {
  switch (path) {
    case "/":
      return "Inicio";
    case "/about":
      return "Sobre nosotros";
    case "/contact":
      return "Contacto";
    default:
      return "Astro Express";
  }
}

function getAlterTitle(path) {
  switch (path) {
    case "/":
      return "Inicio";
  }
  return "Astro Express";
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
