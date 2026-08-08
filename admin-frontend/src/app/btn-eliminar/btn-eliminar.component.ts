import { Component, Input } from '@angular/core';
import Swal from 'sweetalert2';
import { ApiControllerService } from '../service/api-controller.service';
import { ActivatedRoute } from '@angular/router';
import { Users } from '../models/Users.model';

@Component({
  selector: 'app-btn-eliminar',
  standalone: true,
  imports: [],
  templateUrl: './btn-eliminar.component.html',
  styleUrl: './btn-eliminar.component.css'
})

export class BtnEliminarComponent {
  User?: Users;
  @Input() id: number = 0;

  constructor(
    private _usuarios: ApiControllerService,
    private _route: ActivatedRoute
  ) { }

  borrarUsuario(id: number) {
    Swal.fire({
      // Se solicita confirmación
      title: '¿Estás seguro?',
      text: '¡No podrás deshacer esta acción!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Se consume el API de eliminación utilizando el id proporcionado
        this._usuarios.removeUser(id).subscribe(
          (data: Users) => {
            Swal.fire({
              title: 'Eliminado',
              text: 'El usuario ha sido eliminado.',
              icon: 'success',
              showConfirmButton: false,
              html: '<a class="w3-button w3-round-large w3-indigo w3-hover-blue" href="/tabla">Volver a tabla</a>'
            });
          },
          (error) => {
            console.error('Error al eliminar usuario:', error);
            Swal.fire({
              title: 'Error',
              text: 'Ocurrió un error al intentar eliminar el usuario.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        );
      }
    });
  }
}
