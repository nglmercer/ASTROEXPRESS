interface Audio {
  id: number;
  nombre: string;
  lenguaje: string;
  estado: number;
  idCapitulo: number;
  ruta: string;
}

interface Resolucion {
  id: number;
  anchoDeBanda: string;
  promedioAnchoDeBanda: string;
  estado: number;
  idCapitulo: number;
  resolucion: string;
  ruta: string;
}

interface Subtitulo {
  id: number;
  nombre: string;
  lenguaje: string;
  lenguaje2: string;
  estado: number;
  idCapitulo: number;
  ruta: string;
  versiona: number;
  autoSeleccionado: number | boolean;
  forzado: number | boolean;
  porDefecto: number | boolean;
}



export interface RecursosResponse {
  audios: Audio[];
  resoluciones: Resolucion[];
  subtitulos: Subtitulo[];
}
