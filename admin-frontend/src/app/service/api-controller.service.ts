import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Users } from '../models/Users.model';
import { Global } from './global';


@Injectable({
  providedIn: 'root'
})
export class ApiControllerService {
  private apiGetList = Global.apiAuth;
  private apiGetUser = Global.apiAuth; //es la misma ruta para eliminar, modificar y buscar
  
  //private apiGetList = 'http://localhost:5214/api/Users';
  //private apiGetUser = 'http://localhost:5214/api/Users/'; //es la misma ruta para eliminar, modificar y buscar
  private apiGetUserPdf = 'http://localhost:5214/api/Users/pdfHtml/';

  //API de imagenes
  private apiImages = 'http://localhost:5214/api/Images/UploadLocal';

  constructor(private http: HttpClient) { }

  getUsers(): Observable<Users[]> {
    return this.http.get<Users[]>(this.apiGetList);
  }

  getUser(id: number): Observable<Users> {
    return this.http.get<Users>(this.apiGetUser + id); //IMPORTANTE NO usar [] con corchetes por que el controlador espera un arreglo y no objeto individual
  }

  removeUser(id: number): Observable<Users> {
    return this.http.delete<Users>(this.apiGetUser + id);
  }

  createUser(listaUsuarios: any): Observable<Users> {
    return this.http.post<Users>(this.apiGetList, listaUsuarios);
  }

  updateUser(id: number, listaUsuarios: any): Observable<Users> {
    return this.http.put<Users>(this.apiGetUser + id, listaUsuarios)
  }

  getUsersPdf(): Observable<Blob> {
    return this.http.get(this.apiGetUserPdf, { responseType: 'blob' });
  }

  getUserPdf(id: number): Observable<Blob> {
    return this.http.get(this.apiGetUserPdf + id, { responseType: 'blob' });
  }

  getImagen(nombre: string): Observable<Blob> {
    return this.http.get(this.apiImages + nombre, { responseType: 'blob' });
  }

  postImagen(nombre: string, archivo: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('FileName', nombre);
    formData.append('File', archivo, archivo.name);

    return this.http.post<any>(this.apiImages, formData);
  }
}
