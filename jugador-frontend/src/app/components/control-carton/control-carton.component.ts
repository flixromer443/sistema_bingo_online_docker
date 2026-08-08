import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

export interface Casilla {
  valor: number | null;
  marcado: boolean;
}

@Component({
  selector: 'app-control-carton',
  standalone: true,
  imports: [
    CommonModule,
    CardModule
  ],
  templateUrl: './control-carton.component.html',
  styleUrls: ['./control-carton.component.css']
})
export class ControlCartonComponent {

  numeroJugada = 6;
  numeroCarton = 1258;

  // Bolillas sorteadas (la última es la más reciente)
  bolasSorteadas: number[] = [
    7,
    15,
    28,
    43,
    66,
    81
  ];

  // Cartón (3 filas x 9 columnas = 15 números)
  carton: Casilla[][] = [

    [
      { valor: 4, marcado: false },
      { valor: null, marcado: false },
      { valor: 23, marcado: false },
      { valor: null, marcado: false },
      { valor: 41, marcado: false },
      { valor: 58, marcado: false },
      { valor: null, marcado: false },
      { valor: 79, marcado: false },
      { valor: null, marcado: false }
    ],

    [
      { valor: null, marcado: false },
      { valor: 12, marcado: false },
      { valor: null, marcado: false },
      { valor: 34, marcado: false },
      { valor: null, marcado: false },
      { valor: 56, marcado: false },
      { valor: 67, marcado: false },
      { valor: null, marcado: false },
      { valor: 88, marcado: false }
    ],

    [
      { valor: 8, marcado: false },
      { valor: null, marcado: false },
      { valor: 27, marcado: false },
      { valor: 39, marcado: false },
      { valor: null, marcado: false },
      { valor: null, marcado: false },
      { valor: 63, marcado: false },
      { valor: 74, marcado: false },
      { valor: null, marcado: false }
    ]

  ];

  marcar(casilla: Casilla): void {

    if (casilla.valor === null) {
      return;
    }

    casilla.marcado = !casilla.marcado;

  }

  agregarBolilla(numero: number): void {

    if (numero < 1 || numero > 90) {
      return;
    }

    if (this.bolasSorteadas.includes(numero)) {
      return;
    }

    this.bolasSorteadas.push(numero);

    // Mantener visibles solo las últimas 15 bolillas
    if (this.bolasSorteadas.length > 15) {
      this.bolasSorteadas.shift();
    }

    // Marcar automáticamente el número si está en el cartón
    this.carton.forEach(fila => {
      fila.forEach(casilla => {
        if (casilla.valor === numero) {
          casilla.marcado = true;
        }
      });
    });

  }

  limpiarCarton(): void {

    this.carton.forEach(fila => {
      fila.forEach(casilla => {
        casilla.marcado = false;
      });
    });

  }

  reiniciarBolillero(): void {

    this.bolasSorteadas = [];

    this.limpiarCarton();

  }

  cantarLinea(): void {

    alert('¡Línea!');

  }

  cantarBingo(): void {

    alert('¡Bingo!');

  }

}