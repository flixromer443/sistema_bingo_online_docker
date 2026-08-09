import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Global } from './global';

@Injectable({
  providedIn: 'root'
})
export class JugadorService {

  private apiJugador = Global.apiJugador;

  constructor(
    private http: HttpClient
  ) {}

  // =========================================================
  // VALIDAR CÓDIGO
  // =========================================================

  validarCodigoVerificacion(codigo: string): Observable<any> {

    return this.http.post<any>(
      this.apiJugador + 'validar-codigo',
      {
        codigo: codigo
      }
    );

  }

  // =========================================================
  // OBTENER CARTONES DEL JUGADOR
  // =========================================================

  obtenerCartonesJugador(
    idUsuario: number
  ): Observable<any> {

    return this.http.get<any>(
      this.apiJugador + idUsuario
    );

  }

  // =========================================================
  // REENVIAR CÓDIGO
  // =========================================================

  reenviarCodigoVerificacion(
    idUsuario: number
  ): Observable<any> {

    return this.http.post<any>(
      this.apiJugador + 'reenviar-codigo',
      {
        idUsuario: idUsuario
      }
    );

  }

  // =========================================================
  // OBTENER NÚMEROS SORTEADOS POR JUGADA
  // =========================================================

  obtenerNumerosSorteadosPorJugada(
    numeroJugada: number
  ): Observable<any> {

    return this.http.get<any>(
      this.apiJugador +
      'obtenerNumerosSorteadosPorJugada/' +
      numeroJugada
    );

  }

}