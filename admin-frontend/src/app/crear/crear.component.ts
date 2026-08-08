import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ApiControllerService } from '../service/api-controller.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear',
  standalone: true,
  imports: [RouterLink, RouterOutlet, RouterLinkActive, CrearComponent, FormsModule],
  templateUrl: './crear.component.html',
  styleUrl: './crear.component.css'
})
export class CrearComponent {
  nombre = "";
  edad!: number;

  constructor(private _usuarios: ApiControllerService){}

  crearUsuario(){

    if (this.nombre.length >= 8 && this.edad.valueOf() >= 18) {
      const listaUsuarios = {
        name: this.nombre,
        age: this.edad
      }
      this._usuarios.createUser(listaUsuarios).subscribe(
        (respuesta) => {
          Swal.fire({
            title: "Usuario creado",
            icon: "success",
            showConfirmButton: false,
            html: '<a class="w3-button w3-round-large w3-indigo w3-hover-blue" href="/tabla">Volver a tabla</a>'
          });
          console.log('Usuario creado ', respuesta)
        },
        (error) =>{
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

}
