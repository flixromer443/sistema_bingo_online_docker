import {
  Component,
  OnInit,
  ElementRef,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  ActivatedRoute
} from '@angular/router';

import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { JugadorService } from '../../service/jugador.service';


@Component({
  selector: 'app-ingresar-codigo',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    CardModule,
    ProgressSpinnerModule
  ],

  templateUrl: './ingresar-codigo.component.html',
  styleUrls: ['./ingresar-codigo.component.css']
})
export class IngresarCodigoComponent implements OnInit {

  idUsuario!: number;
  accion!: number;

  codeForm!: FormGroup;

  cargando = false;

  message = '';
  errorMessage = '';

  private alertTimeout: any;

  @ViewChild('btnVerify')
  btnVerify!: ElementRef;


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private jugadorService: JugadorService,
    private route: ActivatedRoute
  ) {}


  ngOnInit(): void {

    // =====================================================
    // OBTENER PARÁMETROS DE LA URL
    // =====================================================

    this.route.queryParams.subscribe(params => {

      this.idUsuario = Number(
        params['id_usuario']
      );

      this.accion = Number(
        params['accion']
      );

    });


    // =====================================================
    // FORMULARIO DEL CÓDIGO
    // =====================================================

    this.codeForm = this.fb.group({

      d1: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]$/)
        ]
      ],

      d2: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]$/)
        ]
      ],

      d3: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]$/)
        ]
      ],

      d4: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]$/)
        ]
      ],

      d5: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]$/)
        ]
      ],

      d6: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]$/)
        ]
      ]

    });


    // =====================================================
    // VERIFICAR AUTOMÁTICAMENTE AL COMPLETAR LOS 6 DÍGITOS
    // =====================================================

    this.codeForm.valueChanges.subscribe(values => {

      const code =
        Object.values(values).join('');


      if (
        code.length === 6 &&
        this.codeForm.valid &&
        !this.cargando
      ) {

        this.verifyCode();

      }

    });

  }


  // =======================================================
  // MANEJO DE INPUTS
  // =======================================================

  onInput(
    event: Event,
    next: HTMLInputElement | HTMLButtonElement | null
  ): void {

    const input =
      event.target as HTMLInputElement;


    // Permitir únicamente números

    input.value =
      input.value.replace(/[^0-9]/g, '');


    // Pasar automáticamente al siguiente campo

    if (input.value.length === 1) {

      if (next instanceof HTMLInputElement) {

        next.focus();

      }


      if (next instanceof HTMLButtonElement) {

        setTimeout(() => {

          if (
            this.codeForm.valid &&
            !this.cargando
          ) {

            this.verifyCode();

          }

        }, 0);

      }

    }

  }


  // =======================================================
  // BACKSPACE
  // =======================================================

  onBackspace(
    event: Event,
    prev: HTMLInputElement | null
  ): void {

    const keyboardEvent =
      event as KeyboardEvent;


    const input =
      keyboardEvent.target as HTMLInputElement;


    if (
      !input.value &&
      prev
    ) {

      prev.focus();

    }

  }


  // =======================================================
  // VALIDAR CÓDIGO
  // =======================================================

  verifyCode(): void {

    if (this.codeForm.invalid || this.cargando) {

      this.showError(
        'Ingresá los 6 dígitos del código'
      );

      return;
    }

    const code =
      this.codeForm.value.d1 +
      this.codeForm.value.d2 +
      this.codeForm.value.d3 +
      this.codeForm.value.d4 +
      this.codeForm.value.d5 +
      this.codeForm.value.d6;

    this.cargando = true;

    this.jugadorService
      .validarCodigoVerificacion(code)
      .subscribe({

        next: (response: any) => {

          console.log('RESPUESTA VALIDAR CÓDIGO:', response);

          this.cargando = false;

          if (!response?.success) {

            this.showError(
              response?.message ||
              'El código ingresado no es válido.'
            );

            return;
          }

          const cartones =
            response.data?.cartones ?? [];

          console.log('CARTONES RECIBIDOS:', cartones);

          if (cartones.length === 0) {

            this.showError(
              'No se encontraron cartones.'
            );

            return;
          }

          if (cartones.length > 6) {

            this.showError(
              'La cantidad de cartones recibidos no es válida.'
            );

            return;
          }

          /*
           * Guardamos los cartones para que
           * /jugador pueda recuperarlos.
           */
          sessionStorage.setItem(
            'cartones_jugador',
            JSON.stringify(cartones)
          );

          /*
           * Guardamos también el id del jugador
           * si el backend lo devuelve.
           */
          if (response.data?.idJugador) {

            sessionStorage.setItem(
              'id_usuario',
              response.data.idJugador.toString()
            );

          }

          /*
           * Ir directamente al tablero del jugador.
           */
          this.router.navigate(['/control-carton']);

        },

        error: (err: any) => {

          console.error(
            'ERROR VALIDANDO CÓDIGO:',
            err
          );

          this.cargando = false;

          this.showError(
            err?.error?.message ||
            'No se pudo validar el código.'
          );

        }

      });

  }



  // =======================================================
  // OBTENER CARTONES DEL JUGADOR
  // =======================================================

  private obtenerCartonesJugador(): void {

    this.jugadorService
      .obtenerCartonesJugador(
        this.idUsuario
      )
      .subscribe({

        next: (response: any) => {

          this.cargando = false;


          // -----------------------------------------------
          // RESPUESTA INCORRECTA
          // -----------------------------------------------

          if (!response.success) {

            this.showError(
              response.message ||
              'No se pudieron obtener los cartones.'
            );

            return;

          }


          // -----------------------------------------------
          // OBTENER CARTONES
          // -----------------------------------------------

          const cartones =
            response.data?.cartones ?? [];


          // -----------------------------------------------
          // SIN CARTONES
          // -----------------------------------------------

          if (cartones.length === 0) {

            this.showError(
              'No tenés cartones asignados.'
            );

            return;

          }


          // -----------------------------------------------
          // MÁXIMO 6 CARTONES
          // -----------------------------------------------

          if (cartones.length > 6) {

            this.showError(
              'La cantidad de cartones asignados no es válida.'
            );

            return;

          }


          // =================================================
          // GUARDAR CARTONES
          // =================================================

          sessionStorage.setItem(
            'cartones_jugador',
            JSON.stringify(cartones)
          );


          // =================================================
          // GUARDAR ID DEL USUARIO
          // =================================================

          sessionStorage.setItem(
            'id_usuario',
            this.idUsuario.toString()
          );


          // =================================================
          // IR AL CONTROL DE CARTÓN
          // =================================================

          this.router.navigate([
            '/jugador'
          ]);

        },


        // ===================================================
        // ERROR AL OBTENER CARTONES
        // ===================================================

        error: (err: any) => {

          this.cargando = false;

          this.showError(
            err?.error?.message ||
            'No se pudieron obtener los cartones.'
          );

        }

      });

  }


  // =======================================================
  // REENVIAR CÓDIGO
  // =======================================================

  resendCode(): void {

    this.cargando = true;


    this.jugadorService
      .reenviarCodigoVerificacion(
        this.idUsuario
      )
      .subscribe({

        next: (response: any) => {

          this.cargando = false;


          if (response.success) {

            this.showMessage(
              response.message
            );

          }
          else {

            this.showError(
              response.message ||
              'No se pudo reenviar el código.'
            );

          }

        },


        // =================================================
        // ERROR AL REENVIAR
        // =================================================

        error: (err: any) => {

          this.cargando = false;

          this.showError(
            err?.error?.message ||
            'No se pudo reenviar el código.'
          );

        }

      });

  }


  // =======================================================
  // MOSTRAR MENSAJE
  // =======================================================

  private showMessage(
    message: string
  ): void {

    this.message = message;

    clearTimeout(
      this.alertTimeout
    );


    this.alertTimeout =
      setTimeout(() => {

        this.message = '';

      }, 5000);

  }


  // =======================================================
  // MOSTRAR ERROR
  // =======================================================

  private showError(
    message: string
  ): void {

    this.errorMessage = message;

    clearTimeout(
      this.alertTimeout
    );


    this.alertTimeout =
      setTimeout(() => {

        this.errorMessage = '';

      }, 5000);

  }

}
