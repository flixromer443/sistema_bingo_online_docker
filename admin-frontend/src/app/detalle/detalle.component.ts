import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Users } from '../models/Users.model';
import { ApiControllerService } from '../service/api-controller.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2'
import { BtnEliminarComponent } from '../btn-eliminar/btn-eliminar.component';
import { BtnVolverComponent } from '../btn-volver/btn-volver.component';
import { saveAs } from 'file-saver';
import { SubirFotoComponent } from '../subir-foto/subir-foto.component';

@Component({
  selector: 'app-detalle',
  standalone: true,
  imports: [RouterLink, CommonModule, BtnEliminarComponent, BtnVolverComponent, SubirFotoComponent],
  templateUrl: './detalle.component.html',
  styleUrl: './detalle.component.css'
})
export class DetalleComponent implements OnInit {
  User?: Users;
  id = 0;
  Name = "";
  Age = 0;
  imagenUrl = "";


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
      this.imagenUrl = "http://localhost:5214/api/Images/" + this.Name;
    })
  }

  descargarPDF() {
    this._usuarios.getUserPdf(this.id).subscribe(
      (pdfBlob: Blob) => {
        saveAs(pdfBlob, this.Name + '-detalle.pdf');
      },
    );
  }

}
