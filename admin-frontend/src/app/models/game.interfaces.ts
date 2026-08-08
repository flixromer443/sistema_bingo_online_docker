export interface PerfilResponse {
  success: boolean;
  code: number;
  message: string;
  data: UsuarioPerfil;
}

export interface UsuarioPerfil {
  username: string;
  datos_personales: DatosPersonales;
}

export interface DatosPersonales {
  nombre: string;
  apellido: string;
  sexo: string;
  documento: Documento;
  domicilio: Domicilio;
  contacto: Contacto;
}

export interface Documento {
  numero: string;
  tipo: string;
}

export interface Domicilio {
  calle: string;
  numero: string;
  localidad: string;
  departamento: string;
  provincia: string;
}

export interface Contacto {
  telefono: string;
  correo_electronico: string;
}