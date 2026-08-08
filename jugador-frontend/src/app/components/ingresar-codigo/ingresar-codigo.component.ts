import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  ActivatedRoute
} from '@angular/router';

import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';

import { AuthService } from '../../services/auth.service';
import { DatosCompartidosService } from '../../services/datos-compartidos.service';

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
  btnVerify!: ElementRef<HTMLButtonElement>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private datosCompartidosService: DatosCompartidosService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      this.idUsuario = Number(params['id_usuario']);
      this.accion = Number(params['accion']);
    });

    this.codeForm = this.fb.group({
      d1: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      d2: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      d3: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      d4: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      d5: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      d6: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
    });

    this.codeForm.valueChanges.subscribe(values => {

      const code = Object.values(values).join('');

      if (code.length === 6 && this.codeForm.valid && !this.cargando) {
        this.verifyCode();
      }

    });

  }

  onInput(event: Event, next: HTMLInputElement | HTMLButtonElement | null): void {

    const input = event.target as HTMLInputElement;

    input.value = input.value.replace(/[^0-9]/g, '');

    if (input.value.length === 1) {

      if (next instanceof HTMLInputElement) {
        next.focus();
      }

      if (next instanceof HTMLButtonElement) {
        setTimeout(() => {
          if (this.codeForm.valid && !this.cargando) {
            this.verifyCode();
          }
        }, 0);
      }
    }
  }

  onBackspace(event: Event, prev: HTMLInputElement | null): void {

    const keyboardEvent = event as KeyboardEvent;
    const input = keyboardEvent.target as HTMLInputElement;

    if (!input.value && prev) {
      prev.focus();
    }
  }

  verifyCode(): void {

    if (this.codeForm.invalid || this.cargando) {
      this.showError('Ingresá los 6 dígitos del código');
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

    this.authService.validarCodigoVerificacion(this.idUsuario, code).subscribe({

      next: (response: any) => {

        this.cargando = false;

        if (response.success && this.accion === 1) {

          this.showMessageAndRedirect('Su usuario ha sido activado exitosamente');

        } else if (response.success && this.accion === 2) {

          sessionStorage.setItem('tmp_token', response.data.token);
          this.router.navigate(['/cambiar-password']);

        } else {

          this.showError(response.message);

        }

      },

      error: (err: any) => {

        this.cargando = false;

        this.showError(
          err?.error?.message || 'Credenciales incorrectas'
        );

      }

    });

  }

  resendCode(): void {

    this.cargando = true;
    this.datosCompartidosService.esconderFooter.next(true);

    this.authService.reenviarCodigoVerificacion(this.idUsuario).subscribe({

      next: (response: any) => {

        this.cargando = false;

        if (response.success) {
          this.showMessage(response.message);
        } else {
          this.showError(response.message);
        }

      },

      error: (err: any) => {

        this.cargando = false;

        this.showError(
          err?.error?.message || 'Credenciales incorrectas'
        );

      }

    });

    this.datosCompartidosService.esconderFooter.next(false);

  }

  private showMessageAndRedirect(message: string): void {

    this.message = message;

    clearTimeout(this.alertTimeout);

    this.alertTimeout = setTimeout(() => {

      this.message = '';
      this.router.navigate(['/iniciar-sesion']);

    }, 5000);

  }

  private showMessage(message: string): void {

    this.message = message;

    clearTimeout(this.alertTimeout);

    this.alertTimeout = setTimeout(() => {

      this.message = '';

    }, 5000);

  }

  private showError(message: string): void {

    this.errorMessage = message;

    clearTimeout(this.alertTimeout);

    this.alertTimeout = setTimeout(() => {

      this.errorMessage = '';

    }, 5000);

  }

}