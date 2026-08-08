import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Users } from '../models/Users.model';
import { ApiControllerService } from '../service/api-controller.service';
import { BtnEliminarComponent } from '../btn-eliminar/btn-eliminar.component';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-tabla',
  standalone: true,
  imports: [RouterOutlet, TablaComponent, RouterLink, RouterLinkActive, BtnEliminarComponent],
  templateUrl: './tabla.component.html',
  styleUrl: './tabla.component.css'
})
export class TablaComponent implements OnInit {
  Users: Users[] = [];

  constructor(private _usuarios: ApiControllerService) { }

  ngOnInit(): void {
    this._usuarios.getUsers().subscribe((data: Users[]) => {
      this.Users = data
    })
  }

  descargarPDF() {
    this._usuarios.getUsersPdf().subscribe(
      (pdfBlob: Blob) => {
        saveAs(pdfBlob, 'Tabla.pdf');
      },
    );
  }
}
