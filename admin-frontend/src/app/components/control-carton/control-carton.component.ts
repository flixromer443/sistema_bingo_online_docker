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

  numeroCarton = 1258;

  carton: Casilla[][] = [

    [
      { valor: 4, marcado: false },
      { valor: null, marcado: false },
      { valor: 23, marcado: false },
      { valor: 31, marcado: false },
      { valor: null, marcado: false },
      { valor: 58, marcado: false },
      { valor: 61, marcado: false },
      { valor: null, marcado: false },
      { valor: 88, marcado: false }
    ],

    [
      { valor: null, marcado: false },
      { valor: 14, marcado: false },
      { valor: 28, marcado: false },
      { valor: null, marcado: false },
      { valor: 47, marcado: false },
      { valor: 54, marcado: false },
      { valor: null, marcado: false },
      { valor: 74, marcado: false },
      { valor: 89, marcado: false }
    ],

    [
      { valor: 8, marcado: false },
      { valor: 17, marcado: false },
      { valor: null, marcado: false },
      { valor: 38, marcado: false },
      { valor: 43, marcado: false },
      { valor: null, marcado: false },
      { valor: 69, marcado: false },
      { valor: 79, marcado: false },
      { valor: null, marcado: false }
    ]

  ];

  marcar(casilla: Casilla): void {

    if (casilla.valor === null) {
      return;
    }

    casilla.marcado = !casilla.marcado;
  }

  cantarLinea(): void {

    alert('¡Línea!');

  }

  cantarBingo(): void {

    alert('¡Bingo!');

  }

}