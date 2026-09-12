import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Carton, Tbl1DtsVariables } from '../models/tablero.interfaces';
import { Global } from './global';

@Injectable({
  providedIn: 'root'
})
export class TableroService {

  private apiTablero = Global.apiTablero;
  private apiGlobal = Global.apiGlobal;


  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los cartones de una jugada.
   */
  obtenerCartonesPorJugada(numeroJugada: number): Observable<Carton[]> {
    return this.http.get<Carton[]>(
      this.apiTablero + 'obtenerCartonesPorJugada/' + numeroJugada
    );
  }

  /** 
   * Guarda un número sorteado en una jugada. 
   */ 
  guardarNumeroSorteado(numeroJugada: number, numero: number): Observable<any> {
     return this.http.post(this.apiTablero + 'guardarNumeroSorteado', null, 
      { params: { numeroJugada: numeroJugada, numero: numero } });
  }

  /**
   * Obtiene los premios configurados para una jugada.
   */
  obtenerPremiosPorJugada(numeroJugada: number): Observable<any[]> {
    return this.http.get<any[]>(
      this.apiGlobal + 'obtenerPremiosPorJugada/' + numeroJugada
    );
  }

  /**
   * Actualiza el premio asociado al jugador ganador (Línea o Bingo).
   */
  actualizarGanadorPremio(premioId: number, jugadorId: number): Observable<any> {
    return this.http.put(
      `${this.apiTablero}actualizarGanadorPremio`, 
      {}, 
      { params: { premioId: premioId, jugadorId: jugadorId } }
    );
  }

  /**
   * Notifica línea o bingo mediante el backend enviando el número de jugada, el tipo de premio y el ID del cartón.
   */
  notificarPremio(numeroJugada: number, tipoPremio: string, cartonId: number): Observable<any> {
    return this.http.post(
      `${this.apiTablero}notificarPremio`,
      null,
      { params: { numeroJugada: numeroJugada, tipoPremio: tipoPremio, cartonId: cartonId } }
    );
  }

}