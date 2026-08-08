import { Component, OnInit } from '@angular/core';
import { ApiControllerService } from '../service/api-controller.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Users } from '../models/Users.model';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { BtnVolverComponent } from '../btn-volver/btn-volver.component';

@Component({
  selector: 'app-modificar',
  standalone: true,
  imports: [RouterLink, FormsModule, BtnVolverComponent],
  templateUrl: './modificar.component.html',
  styleUrl: './modificar.component.css'
})
export class ModificarComponent implements OnInit {
  User?: Users;
  id = 0;
  Name = "";
  Age = 0;

  constructor(
    private _usuarios: ApiControllerService,
    private _route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      this.id = params['id'];
    });
    this._usuarios.getUser(this.id).subscribe((data: Users) => {
      this.User = data;
      this.Name = this.User?.name
      this.Age = this.User?.age
    })

  }

  modificarUsuario(){
    if (this.Name.length >= 8 && this.Age.valueOf() >= 18) {
      const listaUsuarios = {
        id: this.id,
        name: this.Name,
        age: this.Age
      }
      this._usuarios.updateUser(this.id, listaUsuarios).subscribe(
        (respuesta) => {
          Swal.fire({
            title: "Usuario modificado",
            icon: "success",
            showConfirmButton: false,
            html: '<a class="w3-button w3-round-large w3-indigo w3-hover-blue" href="/tabla">Volver a tabla</a>'
          });
          console.log('Usuario modificado ', respuesta)
        },
        (error) =>{
          Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error al intentar modificar el usuario.',
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
