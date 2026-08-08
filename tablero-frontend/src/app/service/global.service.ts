import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Carton, Tbl1DtsVariables } from '../models/tablero.interfaces';
import { Global } from './global';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  private apiGlobal= Global.apiGlobal;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene una variable del sistema.
   * Ejemplo: ULTIMA_JUGADA
   */
  obtenerFlagPorVariable(variable: string): Observable<Tbl1DtsVariables[]> {
    return this.http.get<Tbl1DtsVariables[]>(
      this.apiGlobal + 'obtenerFlagPorVariable/' + variable
    );
  }

}