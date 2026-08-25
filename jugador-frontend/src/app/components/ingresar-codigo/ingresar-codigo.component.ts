import {
  Component,
  OnInit
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

  styleUrls: [
    './ingresar-codigo.component.css'
  ]
})
export class IngresarCodigoComponent implements OnInit {


  // =====================================================
  // VARIABLES
  // =====================================================

  idUsuario!: number;

  accion!: number;

  codeForm!: FormGroup;

  cargando = false;

  message = '';

  errorMessage = '';

  private alertTimeout: any;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private jugadorService: JugadorService,
    private route: ActivatedRoute
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {


    // ===================================================
    // OBTENER PARÁMETROS DE LA URL
    // ===================================================

    this.route.queryParams.subscribe(params => {

      this.idUsuario =
        Number(params['id_usuario']);

      this.accion =
        Number(params['accion']);

    });


    // ===================================================
    // FORMULARIO
    // ===================================================

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


    // ===================================================
    // VERIFICAR AUTOMÁTICAMENTE AL COMPLETAR LOS 6
    // ===================================================

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


  // =====================================================
  // MANEJO DE INPUT
  // =====================================================

  onInput(
    event: Event,
    next: HTMLInputElement | HTMLButtonElement
  ): void {


    const input =
      event.target as HTMLInputElement;


    // ===================================================
    // OBTENER SOLAMENTE NÚMEROS
    // ===================================================

    let value =
      input.value.replace(/[^0-9]/g, '');


    // ===================================================
    // LIMITAR A UN SOLO DÍGITO
    // ===================================================

    value =
      value.substring(0, 1);


    // ===================================================
    // ACTUALIZAR INPUT
    // ===================================================

    input.value = value;


    // ===================================================
    // ACTUALIZAR FORMCONTROL
    // ===================================================

    const controlName =
      input.getAttribute('formControlName');


    if (controlName) {

      this.codeForm
        .get(controlName)
        ?.setValue(
          value,
          {
            emitEvent: true
          }
        );

    }


    // ===================================================
    // SI NO HAY NÚMERO, NO AVANZAR
    // ===================================================

    if (!value) {

      return;

    }


    // ===================================================
    // SI ES INPUT, PASAR AL SIGUIENTE
    // ===================================================

    if (
      next instanceof HTMLInputElement
    ) {

      setTimeout(() => {

        next.focus();

        next.select();

      }, 0);

      return;

    }


    // ===================================================
    // SI ES EL BOTÓN
    // ===================================================

    if (
      next instanceof HTMLButtonElement
    ) {

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


  // =====================================================
  // BACKSPACE
  // =====================================================

  onBackspace(
    event: Event,
    prev: HTMLInputElement
  ): void {


    const keyboardEvent =
      event as KeyboardEvent;


    const input =
      keyboardEvent.target as HTMLInputElement;


    // ===================================================
    // SI EL CAMPO ESTÁ VACÍO
    // VOLVER AL ANTERIOR
    // ===================================================

    if (
      !input.value &&
      prev
    ) {

      setTimeout(() => {

        prev.focus();

        prev.select();

      }, 0);

    }

  }


  // =====================================================
  // VALIDAR CÓDIGO
  // =====================================================

  verifyCode(): void {


    // ===================================================
    // VALIDACIÓN
    // ===================================================

    if (
      this.codeForm.invalid ||
      this.cargando
    ) {

      this.showError(
        'Ingresá los 6 dígitos del código'
      );

      return;

    }


    // ===================================================
    // ARMAR CÓDIGO
    // ===================================================

    const code =
      this.codeForm.value.d1 +
      this.codeForm.value.d2 +
      this.codeForm.value.d3 +
      this.codeForm.value.d4 +
      this.codeForm.value.d5 +
      this.codeForm.value.d6;


    console.log(
      'CÓDIGO INGRESADO:',
      code
    );


    // ===================================================
    // MOSTRAR SPINNER
    // ===================================================

    this.cargando = true;


    // ===================================================
    // VALIDAR EN BACKEND
    // ===================================================

    this.jugadorService
      .validarCodigoVerificacion(code)
      .subscribe({

        // =================================================
        // RESPUESTA CORRECTA
        // =================================================

        next: (response: any) => {


          console.log(
            'RESPUESTA VALIDAR CÓDIGO:',
            response
          );


          this.cargando = false;


          // ===============================================
          // CÓDIGO INVÁLIDO
          // ===============================================

          if (
            !response?.success
          ) {

            this.showError(
              response?.message ||
              'El código ingresado no es válido.'
            );

            return;

          }


          // ===============================================
          // OBTENER CARTONES
          // ===============================================

          const cartones =
            response.data?.cartones ?? [];


          console.log(
            'CARTONES RECIBIDOS:',
            cartones
          );


          // ===============================================
          // SIN CARTONES
          // ===============================================

          if (
            cartones.length === 0
          ) {

            this.showError(
              'No se encontraron cartones.'
            );

            return;

          }


          // ===============================================
          // MÁXIMO 6 CARTONES
          // ===============================================

          if (
            cartones.length > 6
          ) {

            this.showError(
              'La cantidad de cartones recibidos no es válida.'
            );

            return;

          }


          // ===============================================
          // GUARDAR CARTONES
          // ===============================================

          sessionStorage.setItem(
            'cartones_jugador',
            JSON.stringify(cartones)
          );


          // ===============================================
          // GUARDAR ID JUGADOR
          // ===============================================

          if (
            response.data?.idJugador
          ) {

            sessionStorage.setItem(
              'id_usuario',
              response.data.idJugador.toString()
            );

          }


          // ===============================================
          // IR AL TABLERO
          // ===============================================

          this.router.navigate([
            '/control-carton'
          ]);

        },


        // =================================================
        // ERROR
        // =================================================

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


  // =====================================================
  // OBTENER CARTONES DEL JUGADOR
  // =====================================================

  private obtenerCartonesJugador(): void {


    this.jugadorService
      .obtenerCartonesJugador(
        this.idUsuario
      )
      .subscribe({

        // =================================================
        // RESPUESTA
        // =================================================

        next: (response: any) => {


          this.cargando = false;


          // ===============================================
          // RESPUESTA INCORRECTA
          // ===============================================

          if (
            !response.success
          ) {

            this.showError(
              response.message ||
              'No se pudieron obtener los cartones.'
            );

            return;

          }


          // ===============================================
          // OBTENER CARTONES
          // ===============================================

          const cartones =
            response.data?.cartones ?? [];


          // ===============================================
          // SIN CARTONES
          // ===============================================

          if (
            cartones.length === 0
          ) {

            this.showError(
              'No tenés cartones asignados.'
            );

            return;

          }


          // ===============================================
          // MÁXIMO 6 CARTONES
          // ===============================================

          if (
            cartones.length > 6
          ) {

            this.showError(
              'La cantidad de cartones asignados no es válida.'
            );

            return;

          }


          // ===============================================
          // GUARDAR CARTONES
          // ===============================================

          sessionStorage.setItem(
            'cartones_jugador',
            JSON.stringify(cartones)
          );


          // ===============================================
          // GUARDAR ID USUARIO
          // ===============================================

          sessionStorage.setItem(
            'id_usuario',
            this.idUsuario.toString()
          );


          // ===============================================
          // IR AL JUGADOR
          // ===============================================

          this.router.navigate([
            '/jugador'
          ]);

        },


        // =================================================
        // ERROR
        // =================================================

        error: (err: any) => {


          this.cargando = false;


          this.showError(
            err?.error?.message ||
            'No se pudieron obtener los cartones.'
          );

        }

      });

  }


  // =====================================================
  // REENVIAR CÓDIGO
  // =====================================================

  resendCode(): void {


    this.cargando = true;


    this.jugadorService
      .reenviarCodigoVerificacion(
        this.idUsuario
      )
      .subscribe({

        // =================================================
        // RESPUESTA
        // =================================================

        next: (response: any) => {


          this.cargando = false;


          if (
            response.success
          ) {

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
        // ERROR
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


  // =====================================================
  // MOSTRAR MENSAJE
  // =====================================================

  private showMessage(
    message: string
  ): void {


    this.message =
      message;


    clearTimeout(
      this.alertTimeout
    );


    this.alertTimeout =
      setTimeout(() => {

        this.message = '';

      }, 5000);

  }


  // =====================================================
  // MOSTRAR ERROR
  // =====================================================

  private showError(
    message: string
  ): void {


    this.errorMessage =
      message;


    clearTimeout(
      this.alertTimeout
    );


    this.alertTimeout =
      setTimeout(() => {

        this.errorMessage = '';

      }, 5000);

  }

}