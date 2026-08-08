import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ApiControllerService } from '../service/api-controller.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-subir-foto',
  standalone: true,
  imports: [],
  templateUrl: './subir-foto.component.html',
  styleUrl: './subir-foto.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubirFotoComponent implements OnChanges {
  @Input() Name: string = ''; // Definir nombreArchivo como un Input
  imagenUrl = "";
  timestamp: number = 0;

  constructor(
    private _usuarios: ApiControllerService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.imagenUrl = "http://localhost:5214/api/Images/" + this.Name;
  }

  subirImagen(event: Event): void {
    const fileInput = document.getElementById('archivoInput') as HTMLInputElement;
    const archivo: File = (fileInput.files as FileList)[0];

    if (archivo) {
        this.imagenUrl = "http://localhost:5214/api/Images/" + this.Name;
        this._usuarios.postImagen(this.Name, archivo).subscribe(
        response => {
          console.log('Archivo subido con éxito:', response);
          Swal.fire({
            title: '¡Éxito!',
            text: '¡La imagen se ha subido exitosamente!',
            icon: 'success',
            confirmButtonText: 'OK'
          });

        },
        error => {
          console.error('Error al subir el archivo:', error);
          Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error al subir la imagen.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      );
    }
  }
}
