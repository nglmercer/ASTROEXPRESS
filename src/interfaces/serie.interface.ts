export interface ISerie {
  idCatalogo: number;
  nombreCatalogo: string;
  tipoCatalogo: number;
  estadoCatalogo: number;
  imagenPortadaCatalogo: string;
  imagenFondoCatalogo: string;
  descripcionCatalogo: string;
  nsfwCatalogo: number;
  recomendacionCatalogo: number;
  trailerCatalogo: string;
  temporadas: {
    idTemporada: number;
    numeroTemporada: number;
    nombreTemporada: string;
    descripcionTemporada: string;
    portadaTemporada: string;
    catalogoTemporada: number;
    nsfw: number;
  }[];
  categorias: {
    idCategoria: number;
    nombreCategoria: string;
  }[];
}
