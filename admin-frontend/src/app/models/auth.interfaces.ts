export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

// ===== LOGIN REQUEST =====

export interface LoginRequest {
  metodo: string;
  credenciales: Credenciales;
}

export interface Credenciales {
  username: string;
  contrasenia: string;
}

// ===== LOGIN RESPONSE =====

export interface LoginData {
  usuario: Usuario;
  token: string;
}

export interface Usuario {
  id: number;
  id_rol: number;
  id_estado: number;
}

export type LoginResponse = ApiResponse<LoginData>;

// ===== CODIGO ACTIVACION =====



export interface CodigoVerificacionRequest {
  metodo: string;
  payload: CodigoVerificacionPayload;
}

export interface CodigoVerificacionPayload {
  id_usuario: number;
  codigo: number;
}

export interface Casilla {
  valor: number | null;
  marcado: boolean;
}