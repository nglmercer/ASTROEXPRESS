// ../config/pages.js (o como se llamen tus archivos)

export const pagesConfigA = {
  // Mapeo de Font Awesome a Material Symbols:
  // fas fa-home          -> home
  // fas fa-user          -> user
  // fas fa-catalog         -> book
  // fas fa-categories     -> categories
  // fas fa-server        -> server
  // fas fa-queue        -> queue_music
  0: { name: "Home", slot: "", icon: "home" },
  1: { name: "Usuarios", slot: "usuarios", icon: "person" }, //  lado a "Usuarios" para mayor claridad
  2: { name: "Catalogos", slot: "contenido/catalogos", icon: "search" }, // Cambiado a "Catalogos" para mayor claridad
  3: { name: "categorias", slot: "contenido/categorias", icon: "Category"}, //lado a "categorias" para mayor claridad
  4: { name: "Servidores", slot: "servidores", icon: "Cloud" }, // Cambiado a "Servidores" para mayor claridad
  5: { name: "cola", slot: "Cola", icon: "queue_music" }, // Cambiado a "cola" para mayor claridad
};

export const pagesConfigB = {
  // Mapeo de Font Awesome a Material Symbols:
  // fas fa-info-circle   -> info
  // fas fa-play-circle   -> play_circle
  0: { name: "infoPlayer", slot: "page-info", icon: "info" },
  1: { name: "videoPlayer", slot: "page-video", icon: "play_circle" },
};