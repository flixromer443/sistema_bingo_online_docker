import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Global } from './global';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiAdmin = Global.apiAdmin;

  constructor(
    private http: HttpClient
  ) {}


  // =========================================================
  // OBTENER TOKENS
  // =========================================================

  obtenerTokens(): Observable<any> {

    return this.http.get<any>(
      this.apiAdmin + 'obtener-tokens'
    );

  }


  // =========================================================
  // OBTENER JUGADORES
  // =========================================================

  obtenerJugadores(): Observable<any> {

    return this.http.get<any>(
      this.apiAdmin + 'obtenerJugadores'
    );

  }


  // =========================================================
  // CREAR JUGADOR
  // =========================================================

  crearJugador(
    nombre: string,
    apellido: string,
    dni: string
  ): Observable<any> {

    return this.http.post<any>(
      this.apiAdmin + 'crearJugador',
      {
        nombre: nombre,
        apellido: apellido,
        dni: dni
      }
    );

  }


  // =========================================================
  // ELIMINAR JUGADOR
  // =========================================================

  eliminarJugador(
    jugadorId: number
  ): Observable<any> {

    return this.http.delete<any>(
      this.apiAdmin + 'eliminarJugador/' + jugadorId
    );

  }


  // =========================================================
  // ASOCIAR TOKENS A JUGADOR
  // =========================================================

  asociarTokensJugador(
    jugadorId: number,
    tokens: number[]
  ): Observable<any> {

    return this.http.post<any>(
      this.apiAdmin + 'asociarTokensJugador',
      {
        jugadorId: jugadorId,
        tokens: tokens
      }
    );

  }


  // =========================================================
  // DESASIGNAR TOKENS DE JUGADOR
  // =========================================================

  desasignarTokensJugador(
    tokens: number[]
  ): Observable<any> {

    return this.http.post<any>(
      this.apiAdmin + 'desasignarTokensJugador',
      {
        tokens: tokens
      }
    );

  }

}
