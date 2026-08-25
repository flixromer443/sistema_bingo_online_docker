import {
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminService } from '../service/admin.service';


// =========================================================
// INTERFAZ TOKEN
// =========================================================

export interface TokenJugador {

  id: number;

  codigo: string;

  nombre: string | null;

  apellido: string | null;

  dni: string | null;

}


// =========================================================
// INTERFAZ JUGADOR
// =========================================================

export interface Jugador {

  id: number;

  nombre: string;

  apellido: string;

  dni: string;

}


// =========================================================
// COMPONENT
// =========================================================

@Component({

  selector: 'app-tabla',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './tabla.component.html',

  styleUrl: './tabla.component.css'

})


export class TablaComponent implements OnInit {


  // =========================================================
  // TOKENS
  // =========================================================

  Tokens: TokenJugador[] = [];


  // =========================================================
  // JUGADORES
  // =========================================================

  Jugadores: Jugador[] = [];


  // =========================================================
  // JUGADOR SELECCIONADO
  // =========================================================

  jugadorSeleccionadoId: number | null = null;


  // =========================================================
  // NUEVO JUGADOR
  // =========================================================

  nuevoJugador = {

    nombre: '',

    apellido: '',

    dni: ''

  };


  // =========================================================
  // TOKENS SELECCIONADOS
  // IMPORTANTE:
  // Se utiliza Set porque el HTML utiliza .has() y .size
  // =========================================================

  tokensSeleccionados: Set<number> = new Set<number>();


  // =========================================================
  // ESTADOS
  // =========================================================

  cargando = false;

  error = '';

  mensajeJugador = '';

  errorJugador = '';

  guardandoJugador = false;

  asignandoTokens = false;


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private adminService: AdminService
  ) {}


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.obtenerTokens();

    this.obtenerJugadores();

  }


  // =========================================================
  // OBTENER TOKENS
  // =========================================================

  obtenerTokens(): void {

    this.cargando = true;

    this.error = '';


    this.adminService
      .obtenerTokens()
      .subscribe({

        next: (response: any) => {

          console.log(
            'RESPUESTA TOKENS:',
            response
          );


          this.cargando = false;


          if (!response?.success) {

            this.Tokens = [];

            this.error =
              response?.message ||
              'No se pudieron obtener los tokens.';

            return;

          }


          this.Tokens =
            response.data ?? [];


          console.log(
            'TOKENS:',
            this.Tokens
          );

        },


        error: (err: any) => {

          console.error(
            'ERROR OBTENIENDO TOKENS:',
            err
          );


          this.cargando = false;

          this.Tokens = [];


          this.error =
            err?.error?.message ||
            'No se pudieron obtener los tokens.';

        }

      });

  }


  // =========================================================
  // OBTENER JUGADORES
  // =========================================================

  obtenerJugadores(): void {

    this.adminService
      .obtenerJugadores()
      .subscribe({

        next: (response: any) => {

          console.log(
            'RESPUESTA JUGADORES:',
            response
          );


          if (!response?.success) {

            this.Jugadores = [];

            return;

          }


          this.Jugadores =
            response.data ?? [];


          console.log(
            'JUGADORES:',
            this.Jugadores
          );

        },


        error: (err: any) => {

          console.error(
            'ERROR OBTENIENDO JUGADORES:',
            err
          );

          this.Jugadores = [];

        }

      });

  }


  // =========================================================
  // CREAR JUGADOR
  // =========================================================

  crearJugador(): void {

    this.mensajeJugador = '';

    this.errorJugador = '';


    const nombre =
      this.nuevoJugador.nombre.trim();


    const apellido =
      this.nuevoJugador.apellido.trim();


    const dni =
      this.nuevoJugador.dni.trim();


    // -------------------------------------------------------
    // VALIDACIONES
    // -------------------------------------------------------

    if (!nombre) {

      this.errorJugador =
        'Ingresá el nombre del jugador.';

      return;

    }


    if (!apellido) {

      this.errorJugador =
        'Ingresá el apellido del jugador.';

      return;

    }


    if (!dni) {

      this.errorJugador =
        'Ingresá el DNI del jugador.';

      return;

    }


    this.guardandoJugador = true;


    // -------------------------------------------------------
    // CREAR JUGADOR
    // -------------------------------------------------------

    this.adminService
      .crearJugador(
        nombre,
        apellido,
        dni
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'RESPUESTA CREAR JUGADOR:',
            response
          );


          this.guardandoJugador = false;


          if (!response?.success) {

            this.errorJugador =
              response?.message ||
              'No se pudo crear el jugador.';

            return;

          }


          this.mensajeJugador =
            response?.message ||
            'Jugador creado correctamente.';


          // -------------------------------------------------
          // LIMPIAR FORMULARIO
          // -------------------------------------------------

          this.nuevoJugador = {

            nombre: '',

            apellido: '',

            dni: ''

          };


          // -------------------------------------------------
          // RECARGAR JUGADORES
          // -------------------------------------------------

          this.obtenerJugadores();


          // -------------------------------------------------
          // SELECCIONAR AUTOMÁTICAMENTE
          // -------------------------------------------------

          if (response.data?.id) {

            this.jugadorSeleccionadoId =
              Number(response.data.id);

          }

        },


        error: (err: any) => {

          console.error(
            'ERROR CREANDO JUGADOR:',
            err
          );


          this.guardandoJugador = false;


          this.errorJugador =
            err?.error?.message ||
            'No se pudo crear el jugador.';

        }

      });

  }


  // =========================================================
  // SELECCIONAR JUGADOR
  // =========================================================

  seleccionarJugador(): void {

    console.log(
      'JUGADOR SELECCIONADO:',
      this.jugadorSeleccionadoId
    );


    // -------------------------------------------------------
    // LIMPIAR TOKENS SELECCIONADOS
    // -------------------------------------------------------

    this.tokensSeleccionados.clear();


    if (this.jugadorSeleccionadoId === null) {

      return;

    }


    console.log(
      'ID DEL JUGADOR:',
      this.jugadorSeleccionadoId
    );

  }


  // =========================================================
  // SELECCIONAR / DESELECCIONAR TOKEN
  // =========================================================
  //
  // El HTML manda:
  //
  // (change)="seleccionarToken(token.id, $event)"
  //
  // Por eso recibimos Event y obtenemos checked.
  //
  // =========================================================

  seleccionarToken(
    tokenId: number,
    event: Event
  ): void {

    const checkbox =
      event.target as HTMLInputElement;


    const seleccionado =
      checkbox.checked;


    if (seleccionado) {

      this.tokensSeleccionados.add(
        tokenId
      );

    }

    else {

      this.tokensSeleccionados.delete(
        tokenId
      );

    }


    console.log(
      'TOKENS SELECCIONADOS:',
      Array.from(this.tokensSeleccionados)
    );

  }


  // =========================================================
  // VERIFICAR TOKEN SELECCIONADO
  // =========================================================

  tokenSeleccionado(
    tokenId: number
  ): boolean {

    return this.tokensSeleccionados.has(
      tokenId
    );

  }


  // =========================================================
  // SELECCIONAR TODOS
  // =========================================================

  seleccionarTodos(
    seleccionado: boolean
  ): void {

    if (!seleccionado) {

      this.tokensSeleccionados.clear();

      return;

    }


    this.Tokens.forEach(
      token => {

        this.tokensSeleccionados.add(
          token.id
        );

      }
    );


    console.log(
      'TODOS LOS TOKENS SELECCIONADOS:',
      Array.from(this.tokensSeleccionados)
    );

  }


  // =========================================================
  // ASIGNAR TOKENS
  // =========================================================

  asignarTokens(): void {

    this.mensajeJugador = '';

    this.errorJugador = '';


    // -------------------------------------------------------
    // VALIDAR JUGADOR
    // -------------------------------------------------------

    if (
      this.jugadorSeleccionadoId === null
    ) {

      this.errorJugador =
        'Seleccioná un jugador.';

      return;

    }


    // -------------------------------------------------------
    // VALIDAR TOKENS
    // -------------------------------------------------------

    if (
      this.tokensSeleccionados.size === 0
    ) {

      this.errorJugador =
        'Seleccioná al menos un token.';

      return;

    }


    this.asignandoTokens = true;


    const tokens =
      Array.from(
        this.tokensSeleccionados
      );


    console.log(
      'ASIGNANDO TOKENS:',
      {
        jugadorId:
          this.jugadorSeleccionadoId,

        tokens:
          tokens
      }
    );


    // -------------------------------------------------------
    // LLAMAR BACKEND
    // -------------------------------------------------------

    this.adminService
      .asociarTokensJugador(

        this.jugadorSeleccionadoId,

        tokens

      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'RESPUESTA ASOCIAR TOKENS:',
            response
          );


          this.asignandoTokens = false;


          if (!response?.success) {

            this.errorJugador =
              response?.message ||
              'No se pudieron asociar los tokens.';

            return;

          }


          this.mensajeJugador =
            response?.message ||
            'Tokens asociados correctamente.';


          // -------------------------------------------------
          // LIMPIAR SELECCIÓN
          // -------------------------------------------------

          this.tokensSeleccionados.clear();


          // -------------------------------------------------
          // RECARGAR TOKENS
          // -------------------------------------------------

          this.obtenerTokens();

        },


        error: (err: any) => {

          console.error(
            'ERROR ASOCIANDO TOKENS:',
            err
          );


          this.asignandoTokens = false;


          this.errorJugador =
            err?.error?.message ||
            'No se pudieron asociar los tokens.';

        }

      });

  }

}