interface CatalogoItem {
    idCatalogo: number;
    nombreCatalogo: string;
    tipoCatalogo: number;
    estadoCatalogo: number;
    imagenPortadaCatalogo: string;
    imagenFondoCatalogo: string;
    descripcionCatalogo: string;
    nsfwCatalogo: number;
    recomendacionCatalogo: number | boolean | null;
    trailerCatalogo: string | null; // Puede ser string (URL) o null
}