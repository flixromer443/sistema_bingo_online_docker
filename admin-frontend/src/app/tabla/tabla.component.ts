import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  AdminService
} from '../service/admin.service';


// =========================================================
// INTERFAZ TOKEN
// =========================================================

export interface TokenJugador {

  id: number;

  codigo: string;

  nombre: string | null;

  apellido: string | null;

  dni: string | null;

  // Jugador actualmente asociado
  jugadorId: number | null;

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

  TokensFiltrados: TokenJugador[] = [];

  private todosLosTokens: TokenJugador[] = [];


  // =========================================================
  // BUSCADOR
  // =========================================================

  busquedaToken: string = '';


  // =========================================================
  // FILTRO ESTADO
  //
  // todos
  // asignados
  // sin-asignar
  // =========================================================

  filtroEstado: string = 'todos';


  // =========================================================
  // JUGADORES
  // =========================================================

  Jugadores: Jugador[] = [];


  // =========================================================
  // JUGADOR SELECCIONADO
  //
  // null = ninguno
  // 0    = SIN ASIGNAR
  // > 0  = jugador
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
  // =========================================================

  tokensSeleccionados: Set<number> =
    new Set<number>();


  // =========================================================
  // ESTADOS
  // =========================================================

  cargando = false;

  error = '';

  mensajeJugador = '';

  errorJugador = '';

  guardandoJugador = false;

  asignandoTokens = false;

  desasignandoTokens = false;


  // =========================================================
  // ELIMINAR JUGADOR
  // =========================================================

  eliminandoJugador = false;

  mensajeEliminarJugador = '';

  errorEliminarJugador = '';


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

            this.TokensFiltrados = [];

            this.todosLosTokens = [];

            this.error =
              response?.message ||
              'No se pudieron obtener los tokens.';

            return;

          }


          // =================================================
          // GUARDAR TODOS LOS TOKENS
          // =================================================

          this.todosLosTokens =
            (response.data ?? []).map(
              (token: any) => ({

                id: Number(token.id),

                codigo: token.codigo,

                nombre: token.nombre ?? null,

                apellido: token.apellido ?? null,

                dni: token.dni ?? null,

                jugadorId:
                  token.jugadorId !== undefined &&
                  token.jugadorId !== null
                    ? Number(token.jugadorId)
                    : null

              })
            );


          console.log(
            'TODOS LOS TOKENS:',
            this.todosLosTokens
          );


          // =================================================
          // MOSTRAR TODOS
          // =================================================

          this.mostrarTodosLosTokens();

        },


        error: (err: any) => {

          console.error(
            'ERROR OBTENIENDO TOKENS:',
            err
          );


          this.cargando = false;

          this.Tokens = [];

          this.TokensFiltrados = [];

          this.todosLosTokens = [];

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


    // =======================================================
    // VALIDACIONES
    // =======================================================

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


    // =======================================================
    // CREAR
    // =======================================================

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


          // =================================================
          // LIMPIAR FORMULARIO
          // =================================================

          this.nuevoJugador = {

            nombre: '',

            apellido: '',

            dni: ''

          };


          // =================================================
          // RECARGAR JUGADORES
          // =================================================

          this.obtenerJugadores();


          // =================================================
          // SELECCIONAR AUTOMÁTICAMENTE
          // =================================================

          if (response.data?.id) {

            this.jugadorSeleccionadoId =
              Number(response.data.id);

            this.tokensSeleccionados.clear();

            this.busquedaToken = '';

            this.filtroEstado = 'todos';

            this.mostrarTodosLosTokens();

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


    // =======================================================
    // LIMPIAR SELECCIÓN
    // =======================================================

    this.tokensSeleccionados.clear();

    this.mensajeJugador = '';

    this.errorJugador = '';

    this.mensajeEliminarJugador = '';

    this.errorEliminarJugador = '';

    this.busquedaToken = '';

    this.filtroEstado = 'todos';


    // =======================================================
    // MOSTRAR TOKENS
    // =======================================================

    this.mostrarTodosLosTokens();

  }


  // =========================================================
  // MOSTRAR TODOS LOS TOKENS
  // =========================================================

  private mostrarTodosLosTokens(): void {

    // =======================================================
    // SIN JUGADOR
    // =======================================================

    if (
      this.jugadorSeleccionadoId === null
    ) {

      this.Tokens = [];

      this.TokensFiltrados = [];

      return;

    }


    // =======================================================
    // COPIAR TODOS
    // =======================================================

    this.Tokens = [
      ...this.todosLosTokens
    ];


    // =======================================================
    // APLICAR FILTROS
    // =======================================================

    this.filtrarTokens();


    console.log(
      'TOKENS MOSTRADOS:',
      this.TokensFiltrados
    );

  }


  // =========================================================
  // FILTRAR TOKENS
  //
  // FILTROS:
  //
  // 1. TEXTO
  // 2. ESTADO
  // =========================================================

  filtrarTokens(): void {

    const texto =
      (this.busquedaToken ?? '')
        .trim()
        .toLowerCase();


    this.TokensFiltrados =
      this.Tokens.filter(token => {


        // ===================================================
        // FILTRO TEXTO
        // ===================================================

        const id =
          String(
            token.id ?? ''
          ).toLowerCase();


        const codigo =
          String(
            token.codigo ?? ''
          ).toLowerCase();


        const coincideTexto =
          !texto ||
          id.includes(texto) ||
          codigo.includes(texto);


        if (!coincideTexto) {

          return false;

        }


        // ===================================================
        // DETERMINAR ESTADO
        // ===================================================

        const estaAsignado =
          token.jugadorId !== null &&
          token.jugadorId !== undefined &&
          token.jugadorId !== 0;


        // ===================================================
        // FILTRO ASIGNADOS
        // ===================================================

        if (
          this.filtroEstado === 'asignados'
        ) {

          return estaAsignado;

        }


        // ===================================================
        // FILTRO SIN ASIGNAR
        // ===================================================

        if (
          this.filtroEstado === 'sin-asignar'
        ) {

          return !estaAsignado;

        }


        // ===================================================
        // TODOS
        // ===================================================

        return true;

      });


    console.log(
      'BUSQUEDA:',
      texto
    );

    console.log(
      'FILTRO ESTADO:',
      this.filtroEstado
    );

    console.log(
      'TOKENS FILTRADOS:',
      this.TokensFiltrados
    );

  }


  // =========================================================
  // CAMBIAR FILTRO DE ESTADO
  // =========================================================

  cambiarFiltroEstado(): void {

    console.log(
      'FILTRO DE ESTADO:',
      this.filtroEstado
    );


    // Limpiar selección anterior
    this.tokensSeleccionados.clear();


    // Aplicar filtros
    this.filtrarTokens();

  }


  // =========================================================
  // LIMPIAR BÚSQUEDA
  // =========================================================

  limpiarBusquedaToken(): void {

    this.busquedaToken = '';

    this.filtrarTokens();

  }


  // =========================================================
  // SELECCIONAR TOKEN
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
      Array.from(
        this.tokensSeleccionados
      )
    );

  }


  // =========================================================
  // TOKEN SELECCIONADO
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


    // =======================================================
    // DESELECCIONAR
    // =======================================================

    if (!seleccionado) {

      this.TokensFiltrados.forEach(
        token => {

          this.tokensSeleccionados.delete(
            token.id
          );

        }
      );

      return;

    }


    // =======================================================
    // SELECCIONAR
    // =======================================================

    this.TokensFiltrados.forEach(
      token => {

        this.tokensSeleccionados.add(
          token.id
        );

      }
    );


    console.log(
      'TOKENS VISIBLES SELECCIONADOS:',
      Array.from(
        this.tokensSeleccionados
      )
    );

  }


  // =========================================================
  // TODOS LOS VISIBLES SELECCIONADOS
  // =========================================================

  todosTokensFiltradosSeleccionados(): boolean {

    if (
      this.TokensFiltrados.length === 0
    ) {

      return false;

    }


    return this.TokensFiltrados.every(
      token =>
        this.tokensSeleccionados.has(
          token.id
        )
    );

  }


  // =========================================================
  // SELECCIÓN PARCIAL
  // =========================================================

  haySeleccionParcial(): boolean {

    const seleccionadosVisibles =
      this.TokensFiltrados.filter(
        token =>
          this.tokensSeleccionados.has(
            token.id
          )
      ).length;


    return (
      seleccionadosVisibles > 0 &&
      seleccionadosVisibles <
        this.TokensFiltrados.length
    );

  }


  // =========================================================
  // ASIGNAR TOKENS
  // =========================================================

  asignarTokens(): void {

    this.mensajeJugador = '';

    this.errorJugador = '';


    // =======================================================
    // VALIDAR JUGADOR
    // =======================================================

    if (
      this.jugadorSeleccionadoId === null
    ) {

      this.errorJugador =
        'Seleccioná un jugador.';

      return;

    }


    // =======================================================
    // NO ASIGNAR A SIN ASIGNAR
    // =======================================================

    if (
      this.jugadorSeleccionadoId === 0
    ) {

      this.errorJugador =
        'Para desasignar tokens utilizá el botón "Desasignar tokens".';

      return;

    }


    // =======================================================
    // VALIDAR TOKENS
    // =======================================================

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


    // =======================================================
    // BACKEND
    // =======================================================

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


          // =================================================
          // LIMPIAR SELECCIÓN
          // =================================================

          this.tokensSeleccionados.clear();


          // =================================================
          // RECARGAR TOKENS
          // =================================================

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


  // =========================================================
  // DESASIGNAR TOKENS
  // =========================================================

  desasignarTokens(): void {

    this.mensajeJugador = '';

    this.errorJugador = '';


    // =======================================================
    // VALIDAR MODO
    // =======================================================

    if (
      this.jugadorSeleccionadoId !== 0
    ) {

      this.errorJugador =
        'Seleccioná "SIN ASIGNAR" para desasignar tokens.';

      return;

    }


    // =======================================================
    // VALIDAR TOKENS
    // =======================================================

    if (
      this.tokensSeleccionados.size === 0
    ) {

      this.errorJugador =
        'Seleccioná al menos un token para desasignar.';

      return;

    }


    this.desasignandoTokens = true;


    const tokens =
      Array.from(
        this.tokensSeleccionados
      );


    console.log(
      'DESASIGNANDO TOKENS:',
      tokens
    );


    // =======================================================
    // BACKEND
    // =======================================================

    this.adminService
      .desasignarTokensJugador(
        tokens
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'RESPUESTA DESASIGNAR TOKENS:',
            response
          );


          this.desasignandoTokens = false;


          if (!response?.success) {

            this.errorJugador =
              response?.message ||
              'No se pudieron desasignar los tokens.';

            return;

          }


          this.mensajeJugador =
            response?.message ||
            'Tokens desasignados correctamente.';


          // =================================================
          // LIMPIAR
          // =================================================

          this.tokensSeleccionados.clear();


          // =================================================
          // RECARGAR
          // =================================================

          this.obtenerTokens();

        },


        error: (err: any) => {

          console.error(
            'ERROR DESASIGNANDO TOKENS:',
            err
          );


          this.desasignandoTokens = false;


          this.errorJugador =
            err?.error?.message ||
            'No se pudieron desasignar los tokens.';

        }

      });

  }


  // =========================================================
  // ELIMINAR JUGADOR
  // =========================================================

  eliminarJugador(): void {

    this.mensajeEliminarJugador = '';

    this.errorEliminarJugador = '';


    // =======================================================
    // VALIDAR
    // =======================================================

    if (
      this.jugadorSeleccionadoId === null ||
      this.jugadorSeleccionadoId === 0
    ) {

      this.errorEliminarJugador =
        'Seleccioná un jugador válido para eliminar.';

      return;

    }


    const jugador =
      this.Jugadores.find(
        j =>
          j.id ===
          this.jugadorSeleccionadoId
      );


    if (!jugador) {

      this.errorEliminarJugador =
        'No se encontró el jugador seleccionado.';

      return;

    }


    // =======================================================
    // CONFIRMACIÓN
    // =======================================================

    const confirmar =
      confirm(
        `¿Estás seguro de eliminar al jugador ${jugador.nombre} ${jugador.apellido}?\n\n` +
        `Los tokens asociados serán desasignados.`
      );


    if (!confirmar) {

      return;

    }


    this.eliminandoJugador = true;


    console.log(
      'ELIMINANDO JUGADOR:',
      jugador.id
    );


    // =======================================================
    // BACKEND
    // =======================================================

    this.adminService
      .eliminarJugador(
        jugador.id
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'RESPUESTA ELIMINAR JUGADOR:',
            response
          );


          this.eliminandoJugador = false;


          if (!response?.success) {

            this.errorEliminarJugador =
              response?.message ||
              'No se pudo eliminar el jugador.';

            return;

          }


          this.mensajeEliminarJugador =
            response?.message ||
            'Jugador eliminado correctamente.';


          // =================================================
          // LIMPIAR SELECCIÓN
          // =================================================

          this.jugadorSeleccionadoId = null;

          this.tokensSeleccionados.clear();

          this.busquedaToken = '';

          this.filtroEstado = 'todos';

          this.Tokens = [];

          this.TokensFiltrados = [];


          // =================================================
          // RECARGAR
          // =================================================

          this.obtenerJugadores();

          this.obtenerTokens();

        },


        error: (err: any) => {

          console.error(
            'ERROR ELIMINANDO JUGADOR:',
            err
          );


          this.eliminandoJugador = false;


          this.errorEliminarJugador =
            err?.error?.message ||
            'No se pudo eliminar el jugador.';

        }

      });

  }

}
