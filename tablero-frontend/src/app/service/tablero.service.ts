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
  //private apiTablero = "http://localhost:5214/api/Tablero/";

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los cartones de una jugada.
   */
  obtenerCartonesPorJugada(numeroJugada: number): Observable<Carton[]> {
    return this.http.get<Carton[]>(
      this.apiTablero + 'obtenerCartonesPorJugada/' + numeroJugada
    );
  }

}