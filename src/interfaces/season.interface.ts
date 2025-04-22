import { IChapterInformation } from "@/interfaces/chapter-information.interface";

export interface ISeason {
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
  idTemporada: number;
  numeroTemporada: number;
  nombreTemporada: string;
  descripcionTemporada: string;
  portadaTemporada: string;
  catalogoTemporada: number;
  nsfw: number;
  capitulos: IChapterInformation[];
}
