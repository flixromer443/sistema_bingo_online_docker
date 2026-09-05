import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'; // <-- Asegurate de importar Router si lo usas
import { ApiControllerService } from '../service/api-controller.service';
import { AdminService } from '../service/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-carga-datos-sorteo',
  standalone: true,
  imports: [RouterLink, RouterOutlet, RouterLinkActive, FormsModule],
  templateUrl: './carga-datos-sorteo.component.html',
  styleUrl: './carga-datos-sorteo.component.css'
})
export class CargaDatosSorteoComponent {
  nombre = "";
  edad!: number;

  // 6 elementos fijos, cada uno con su Línea y Bingo
  listaJugadas = [
    { numero: 1, premioLinea: '', ganadorLinea: '', premioBingo: '', ganadorBingo: '' },
    { numero: 2, premioLinea: '', ganadorLinea: '', premioBingo: '', ganadorBingo: '' },
    { numero: 3, premioLinea: '', ganadorLinea: '', premioBingo: '', ganadorBingo: '' },
    { numero: 4, premioLinea: '', ganadorLinea: '', premioBingo: '', ganadorBingo: '' },
    { numero: 5, premioLinea: '', ganadorLinea: '', premioBingo: '', ganadorBingo: '' },
    { numero: 6, premioLinea: '', ganadorLinea: '', premioBingo: '', ganadorBingo: '' }
  ];

  constructor(
    private _usuarios: ApiControllerService,
    private _adminService: AdminService,
    private router: Router // <-- Inyectamos Router por si querés navegar a los resultados
  ){}

  // MÉTODO NUEVO REQUERIDO POR EL BOTÓN
  verResultados(): void {
    // Aquí puedes redirigir a tu vista de resultados o mostrar algo
    this.router.navigate(['/tabla']); // Cambia '/tabla' por la ruta de tu pantalla de resultados si es diferente
  }

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

  descargarCuponera(): void {
    // Lógica para descargar la cuponera (ej: llamada a servicio o descarga de archivo)
    console.log('Descargando cuponera...');
  }

  descargarPlanillaControl(): void {
    // Lógica para descargar la planilla de control
    console.log('Descargando planilla de control...');
  }
}