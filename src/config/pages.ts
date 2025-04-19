// ../config/pages.js (o como se llamen tus archivos)

export const pagesConfigA = {
  // Mapeo de Font Awesome a Material Symbols:
  // fas fa-home          -> home
  // fas fa-search        -> search
  // fas fa-star          -> star  (o grade si prefieres estrella rellena sólida)
  // fas fa-volume-down   -> volume_down
  // fas fa-heart         -> favorite (corazón relleno) o favorite_border (contorno)
  // fas fa-cog           -> settings
  0: { name: "Home", slot: "", icon: "home" },
  1: { name: "Chat", slot: "chat", icon: "tooltip_2" },
  2: { name: "Actions", slot: "Actions", icon: "settings" },
  3: { name: "Volume", slot: "voice", icon: "volume_down" }, // Nombre cambiado a "Volume" para claridad
  4: { name: "Favorites", slot: "page-4", icon: "favorite" },
  5: { name: "Settings", slot: "page-5", icon: "settings" },
};

export const pagesConfigB = {
  // Mapeo de Font Awesome a Material Symbols:
  // fas fa-info-circle   -> info
  // fas fa-play-circle   -> play_circle
  0: { name: "infoPlayer", slot: "page-info", icon: "info" },
  1: { name: "videoPlayer", slot: "page-video", icon: "play_circle" },
};