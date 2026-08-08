import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Global } from './global';

import {
  ProvinciasResponse,
  DepartamentosResponse,
  LocalidadesResponse,
  CallesResponse
} from '../models/georef.interfaces';

@Injectable({
  providedIn: 'root'
})
export class GeorefService {

  public georefUrl: string = '';

  constructor(
    private http: HttpClient
  ) { 
    this.georefUrl = Global.apiGeoref;
  }

  getProvincias(): Observable<ProvinciasResponse> {
    const params = new HttpParams()
      .set('orden', 'nombre');

    return this.http.get<ProvinciasResponse>(
      `${this.georefUrl}/provincias`,
      { params }
    );
  }

  getDepartamentosPorProvincia(idProvincia: string): Observable<DepartamentosResponse> {
    const params = new HttpParams()
      .set('provincia', idProvincia)
      .set('max', '5000')
      .set('orden', 'nombre');

    return this.http.get<DepartamentosResponse>(
      `${this.georefUrl}/departamentos`,
      { params }
    );
  }

  getLocalidades(idProvincia: string, idDepartamento: string): Observable<LocalidadesResponse> {
    const params = new HttpParams()
      .set('provincia', idProvincia)
      .set('departamento', idDepartamento)
      .set('max', '5000')
      .set('orden', 'nombre');

    return this.http.get<LocalidadesResponse>(
      `${this.georefUrl}/localidades`,
      { params }
    );
  }

  buscarLocalidades(nombre: string): Observable<LocalidadesResponse> {
    const params = new HttpParams()
      .set('nombre', nombre)
      .set('max', '20');

    return this.http.get<LocalidadesResponse>(
      `${this.georefUrl}/localidades`,
      { params }
    );
  }

  getProvinciaPorNombre(nombre: string): Observable<ProvinciasResponse> {
    const params = new HttpParams()
      .set('nombre', nombre);

    return this.http.get<ProvinciasResponse>(
      `${this.georefUrl}/provincias`,
      { params }
    );
  }

  getCalles(provincia: string, departamento: string): Observable<CallesResponse> {

    const params = new HttpParams()
      .set('provincia', provincia)
      .set('departamento', departamento)
      .set('aplanar', 'true')
      .set('campos', 'estandar')
      .set('max', '5000')
      .set('inicio', '0')
      .set('exacto', 'true');

    return this.http.get<CallesResponse>(
      `${this.georefUrl}/calles`,
      { params }
    );
  }
}