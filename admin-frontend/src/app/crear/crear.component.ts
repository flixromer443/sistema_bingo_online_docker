import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ApiControllerService } from '../service/api-controller.service';
import { AdminService } from '../service/admin.service'; // <-- 1. Importamos el servicio de administración
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear',
  standalone: true,
  imports: [RouterLink, RouterOutlet, RouterLinkActive, FormsModule], // <-- 2. Eliminamos 'CrearComponent' de aquí (evita error circular)
  templateUrl: './crear.component.html',
  styleUrl: './crear.component.css'
})
export class CrearComponent {
  nombre = "";
  edad!: number;

  constructor(
    private _usuarios: ApiControllerService,
    private _adminService: AdminService // <-- 3. Inyectamos AdminService
  ){}

  crearUsuario(){

    if (this.nombre.length >= 8 && this.edad.valueOf() >= 18) {
      const listaUsuarios = {
        name: this.nombre,
        age: this.edad
      }
      this._usuarios.createUser(listaUsuarios).subscribe(
        (respuesta: any) => {
          Swal.fire({
            title: "Usuario creado",
            icon: "success",
            showConfirmButton: false,
            html: '<a class="w3-button w3-round-large w3-indigo w3-hover-blue" href="/tabla">Volver a tabla</a>'
          });
          console.log('Usuario creado ', respuesta)
        },
        (error: any) =>{
          Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error al intentar crear el usuario.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          console.log('Error ', error)
        }
      )
    }
    else{
      Swal.fire({
        title: 'Error',
        text: 'Campos no validos!',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  }

  // =========================================================
  // MÉTODO PARA REINICIAR SORTEO
  // =========================================================

  confirmarReiniciarSorteo(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esto vaciará la tabla de números sorteados y desasociará todos los tokens.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, reiniciar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ejecutarReiniciarSorteo();
      }
    });
  }

  ejecutarReiniciarSorteo(): void {
    this._adminService.reiniciarSorteo().subscribe({
      next: (respuesta: any) => {
        Swal.fire({
          title: '¡Reiniciado!',
          text: 'El sorteo se ha reiniciado correctamente.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        console.log('Sorteo reiniciado: ', respuesta);
      },
      error: (error: any) => {
        Swal.fire({
          title: 'Error',
          text: 'Ocurrió un error al intentar reiniciar el sorteo.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        console.log('Error al reiniciar: ', error);
      }
    });
  }

}