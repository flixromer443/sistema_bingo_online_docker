import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ApiControllerService } from '../../service/api-controller.service';
import { AdminService } from '../../service/admin.service';
import { Global } from '../../service/global';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-carga-datos-sorteo',
  standalone: true,
  imports: [RouterLink, RouterOutlet, RouterLinkActive, FormsModule],
  templateUrl: './carga-datos-sorteo.component.html',
  styleUrl: './carga-datos-sorteo.component.css'
})
export class CargaDatosSorteoComponent implements OnInit {
  nombre = "";
  edad!: number;

  listaJugadas = [
    { numero: 1, premioLinea: '', ganadorLinea: '', premioBingo: '', ganadorBingo: '' },
    { numero: 2, premioLinea: '', ganadorLinea: '', premioBingo: '', ganadorBingo: '' },
    { numero: 3, premioLinea: '', ganadorLinea: '', premioBingo: '', ganadorBingo: '' },
    { numero: 4, premioLinea: '', ganadorLinea: '', premioBingo: '', ganadorBingo: '' },
    { numero: 5, premioLinea: '', ganadorLinea: '', premioBingo: '', ganadorBingo: '' },
    { numero: 6, premioLinea: '', ganadorLinea: '', premioBingo: '', ganadorBingo: '' }
  ];

  private uriPlanillaControl = Global.uriPlanillaControl;
  private uriCuponera = Global.uriCuponera;

  constructor(
    private _usuarios: ApiControllerService,
    private _adminService: AdminService,
    private router: Router
  ){}

  // Se ejecuta automáticamente al cargar el componente
  ngOnInit(): void {
    this.cargarPremiosExistentes();
  }

  verResultados(): void {
    this.router.navigate(['/tabla']);
  }

  /**
   * Carga los premios almacenados previamente desde la BD al iniciar la vista
   */
  cargarPremiosExistentes(): void {
    this._adminService.obtenerPremios().subscribe({
      next: (respuesta: any) => {
        // Asegúrate de adaptarlo si tu API devuelve la lista directamente o dentro de una propiedad (ej. respuesta.data)
        const premiosGuardados = respuesta.data || respuesta;

        if (Array.isArray(premiosGuardados)) {
          premiosGuardados.forEach(premio => {
            // Buscamos la jugada correspondiente en el array local
            const jugadaEncontrada = this.listaJugadas.find(j => j.numero === premio.jugadaId);
            
            if (jugadaEncontrada) {
              if (premio.tipo === 'LINEA') {
                jugadaEncontrada.premioLinea = premio.valor;
              } else if (premio.tipo === 'BINGO') {
                jugadaEncontrada.premioBingo = premio.valor;
              }
            }
          });
        }
      },
      error: (error: any) => {
        console.error('No se pudieron cargar los premios previos:', error);
      }
    });
  }

  // GUARDAR PREMIOS ADAPTADO AL ENDPOINT
  guardarPremiosJugadas(): void {
    // 1. Construir la lista plana de premios requerida por el backend
    const premiosArray: any[] = [];

    for (const jugada of this.listaJugadas) {
      // Validar si completó la Línea
      if (jugada.premioLinea !== undefined && jugada.premioLinea !== null && jugada.premioLinea.toString().trim() !== '') {
        premiosArray.push({
          jugadaId: jugada.numero,
          tipo: "LINEA",
          valor: Number(jugada.premioLinea) || 0
        });
      }

      // Validar si completó el Bingo
      if (jugada.premioBingo !== undefined && jugada.premioBingo !== null && jugada.premioBingo.toString().trim() !== '') {
        premiosArray.push({
          jugadaId: jugada.numero,
          tipo: "BINGO",
          valor: Number(jugada.premioBingo) || 0
        });
      }
    }

    if (premiosArray.length === 0) {
      Swal.fire({
        title: 'Atención',
        text: 'Por favor, ingresá al menos un valor de premio antes de guardar.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    // 2. Enviar la petición al backend respetando el DTO
    this._adminService.guardarPremios(premiosArray).subscribe({
      next: (respuesta: any) => {
        Swal.fire({
          title: '¡Guardado!',
          text: 'Los premios se guardaron correctamente.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        console.log('Premios guardados:', respuesta);
      },
      error: (error: any) => {
        Swal.fire({
          title: 'Error',
          text: error.error?.message || 'No se pudieron guardar los premios.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        console.error('Error al guardar premios:', error);
      }
    });
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
      },
      error: (error: any) => {
        Swal.fire({
          title: 'Error',
          text: 'Ocurrió un error al intentar reiniciar el sorteo.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  descargarCuponera(): void {
    window.open(this.uriCuponera, '_blank');
  }

  descargarPlanillaControl(): void {
    window.open(this.uriPlanillaControl, '_blank');
  }
}