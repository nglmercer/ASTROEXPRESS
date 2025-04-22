interface BufferRepresentation {
    type: "Buffer"; // O simplemente string si el tipo puede variar
    data: number[]; // Array de números que representan los bytes
}

// Define la interfaz para un ítem del catálogo
interface CatalogoItem {
    idCatalogo: number;
    nombreCatalogo: string;
    tipoCatalogo: number;
    estadoCatalogo: number;
    imagenPortadaCatalogo: string;
    imagenFondoCatalogo: string;
    descripcionCatalogo: string;
    nsfwCatalogo: number;
    recomendacionCatalogo: BufferRepresentation | number | boolean | null;
    trailerCatalogo: string | null; // Puede ser string (URL) o null
}
/*
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
*/