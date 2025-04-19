export interface IUser {
  idUsuario: number;
  apodoUsuario: string;
  correoUsuario: string;
  claveUsuario: string;
  rolUsuario: number;
  nsfwUsuario: number;
  fechaCreacion: string;
  apicode: string | null;
  fechaNacimiento: string | null;
  nombres: string | null;
  apellidos: string | null;
  state: string | null;
  country: number;
  phone: string | null;
  preRegistrado: number;
  creadorContenido: number;
  anticipado: number;
  fotoPerfilUsuario: string | null;
  plan: number;
  idUltimaTransaccion: string | null;
  fechaUltimaTransaccion: string | null;
}