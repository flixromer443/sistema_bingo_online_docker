import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Global } from './global';
import { Pregunta } from '../models/pregunta';
import { PerfilResponse } from '../models/game.interfaces';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  public apiGameUrl: string;
  constructor(
    private http: HttpClient
  ) { 
    this.apiGameUrl = Global.apiGame;
  }
  
  obtenerPreguntasAlAzar(): Observable<Pregunta[]> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    let params = JSON.stringify({'metodo':"obtenerPreguntasAlAzar"});
    return this.http.post<Pregunta[]>(this.apiGameUrl, params, {headers: headers});
  }

  obtenerDatosPerfil(): Observable<PerfilResponse> {
    return this.http.post<PerfilResponse>(this.apiGameUrl,{ metodo: "obtenerDatosPerfil" });
  }

  actualizarDatosPerfil(payload:any): Observable<PerfilResponse> {
    return this.http.post<PerfilResponse>(this.apiGameUrl,{metodo: 'actualizarDatosPerfil',payload});
  }

  eliminarCuenta(): Observable<PerfilResponse> {
    return this.http.post<PerfilResponse>(this.apiGameUrl,{metodo: 'eliminarCuenta'});
  }

  guardarResultados(payload:any): Observable<PerfilResponse> {
    return this.http.post<PerfilResponse>(this.apiGameUrl,{metodo: 'guardarResultados',payload});
  }

  obtenerEstadisticas(): Observable<PerfilResponse> {
    return this.http.post<PerfilResponse>(this.apiGameUrl,{metodo: 'obtenerEstadisticas'});
  }

  obtenerHistorial(): Observable<PerfilResponse> {
    return this.http.post<PerfilResponse>(this.apiGameUrl,{metodo: 'obtenerHistorial'});
  }

  obtenerRanking(): Observable<PerfilResponse> {
    return this.http.post<PerfilResponse>(this.apiGameUrl,{metodo: 'obtenerRanking'});
  }

}
