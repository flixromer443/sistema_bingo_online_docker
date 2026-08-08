import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Global } from './global';
import { LoginResponse, LoginRequest, CodigoVerificacionRequest } from '../models/auth.interfaces';
import  jwtDecode  from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public apiAuthUrl: string;
  constructor(
    private http: HttpClient
  ) { 
    this.apiAuthUrl = Global.apiAuth;
  }

  iniciarSesion(username: string, contrasenia: string): Observable<LoginResponse> {
    const body: LoginRequest = {
      metodo: "iniciarSesion",
      credenciales: { username, contrasenia}
    };
    return this.http.post<LoginResponse>(this.apiAuthUrl, body);
  }
  
  registrarNuevoUsuario(data: any): Observable<any> {
    return this.http.post<any>(this.apiAuthUrl, data);
  }

  validarCodigoVerificacion(id_usuario: number, codigo: number): Observable<LoginResponse> {
    const body: CodigoVerificacionRequest = {
      metodo: "validarCodigoVerificacion",
      payload: {id_usuario, codigo}
    };
    return this.http.post<LoginResponse>(this.apiAuthUrl, body);
  }

  reenviarCodigoVerificacion(id_usuario: number): Observable<LoginResponse> {
    const body = {
      metodo: "reenviarCodigoVerificacion",
      id_usuario: id_usuario
    };
    return this.http.post<LoginResponse>(this.apiAuthUrl, body);
  }

  solicitarCambioDeContrasenia(correo_electronico: string): Observable<LoginResponse> {
    const body = {
      metodo: "solicitarCambioDeContrasenia",
      correo_electronico: correo_electronico
    };
    return this.http.post<LoginResponse>(this.apiAuthUrl, body);
  }

  actualizarConstrasenia(id_usuario: number, contrasenia: string): Observable<any> {
    const body = {
      metodo: "actualizarConstrasenia",
      payload: {
        id_usuario,
        contrasenia
      }
    };

    return this.http.post<any>(this.apiAuthUrl, body);
  }

  

  isLoggedInAsJugador(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);

      const exp = decoded.exp;
      const now = Math.floor(Date.now() / 1000);

      if (exp <= now) return false;

      return decoded.rol === 1;
    } catch (e) {
      return false;
    }
  }

  isLoggedInAsAdministrador(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);

      const exp = decoded.exp;
      const now = Math.floor(Date.now() / 1000);

      if (exp <= now) return false;

      return decoded.rol === 2; 
    } catch (e) {
      return false;
    }
  }

  isLoggedInAsSuperUsuario(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);

      const exp = decoded.exp;
      const now = Math.floor(Date.now() / 1000);

      if (exp <= now) return false;

      return decoded.rol === 3; 
    } catch (e) {
      return false;
    }
  }



  getToken(): string | null {
    return sessionStorage.getItem('token');
  }
  logout() {
    sessionStorage.clear();
  }

  getUsuario() {
    return JSON.parse(sessionStorage.getItem('usuario') || 'null');
  }

}
