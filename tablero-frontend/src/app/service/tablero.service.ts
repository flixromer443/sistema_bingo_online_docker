import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Carton, Tbl1DtsVariables } from '../models/tablero.interfaces';
import { Global } from './global';

@Injectable({
  providedIn: 'root'
})
export class TableroService {

  //private apiTablero = Global.apiTablero;
  private apiTablero = "http://localhost:5214/api/ControlCarton/";

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
   * Obtiene una variable del sistema.
   * Ejemplo: ULTIMA_JUGADA
   */
  obtenerFlagPorVariable(variable: string): Observable<Tbl1DtsVariables[]> {
    return this.http.get<Tbl1DtsVariables[]>(
      this.apiTablero + 'obtenerFlagPorVariable/' + variable
    );
  }

}