import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';

import {
    Carton,
    NumeroCarton,
    Tbl1DtsVariables
} from '../../models/tablero.interfaces';

import { TableroService } from '../../service/tablero.service';
import { GlobalService } from '../../service/global.service';


@Component({
  selector: 'app-tablero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tablero.component.html',
  styleUrls: ['./tablero.component.css']
})
export class TableroComponent implements OnDestroy {

  private timer?: Subscription;

  readonly INTERVALO = 1000;

  filas = [0,1,2,3,4,5,6,7,8];

  numerosSorteados = new Set<number>();

  numeroJugada = 1;
  ultimaJugada = 0;

  ultimoNumero = 0;

  juegoIniciado = false;
  mostrarProximaJugada = false;
  esUltimaJugada = false;

  cartones: Carton[] = [];

  lineas: Carton[] = [];
  bingos: Carton[] = [];

  hayLinea = false;
  hayBingo = false;

  msgLinea = false;
  msgBingo = false;

  constructor(
      private tableroService: TableroService,
      private globalService: GlobalService

  ) {}

  ngOnDestroy(): void {
      this.timer?.unsubscribe();
  }

  obtenerNumerosFila(fila: number): number[] {

      const inicio = fila * 10 + 1;

      return Array.from(
          { length: 10 },
          (_, i) => inicio + i
      );

  }

  toggleNumero(numero:number){

      if(this.numerosSorteados.has(numero))
          this.numerosSorteados.delete(numero);
      else
          this.numerosSorteados.add(numero);

  }

  iniciar(){

      this.juegoIniciado = true;

      this.mostrarProximaJugada = false;

      this.globalService.obtenerFlagPorVariable('ULTIMA_JUGADA')
        .subscribe({
            next: (variables: Tbl1DtsVariables[]) => {
                if (variables.length === 0)
                    return;

                this.ultimaJugada = Number(variables[0].valor);

                this.esUltimaJugada =
                    this.numeroJugada === this.ultimaJugada;
            },
            error: err => console.error(err)
        });
      this.cargarCartones();

      this.sortearNumero();

      this.timer = interval(this.INTERVALO)
          .subscribe(()=>{

              this.sortearNumero();

          });

  }

  cargarCartones(): void {

    this.tableroService
        .obtenerCartonesPorJugada(this.numeroJugada)
        .subscribe({
            next: (cartones: Carton[]) => {
                this.cartones = cartones;
            },
            error: err => console.error(err)
        });
    console.log(this.cartones);
    
  }

  private obtenerNumeroAleatorio(): number {

      let numero = 0;

      do{

          numero = Math.floor(Math.random()*90)+1;

      }while(this.numerosSorteados.has(numero));

      return numero;

  }

  sortearNumero(){

    if(this.numerosSorteados.size >= 90){
      this.detener();
      return;
    }
  
    const numero = this.obtenerNumeroAleatorio();
  
    this.tableroService
      .guardarNumeroSorteado(
        this.numeroJugada,
        numero
      )
      .subscribe({
      
        next: () => {
        
          // Recién acá confirmamos el sorteo
          this.ultimoNumero = numero;
        
          this.numerosSorteados.add(numero);
        
          this.marcarNumeroEnCartones(numero);
        
          this.verificarLinea();
        
          this.verificarBingo();
        
        },
      
        error: err => {
        
          console.error(
            'No se pudo guardar el número sorteado',
            err
          );
        
        }
      
      });
  }

  marcarNumeroEnCartones(numero: number): void {
    this.cartones.forEach((carton: Carton) => {
        carton.numeros.forEach((n: NumeroCarton) => {
            if (n.numero === numero) {

                n.marcado = true;
            }
        });
    });
  }

  reiniciar() {

    const confirmar = confirm(
      '¿Desea comenzar la siguiente jugada?'
    );

    if (!confirmar)
      return;

    this.detener();

    this.numeroJugada++;

    this.numerosSorteados.clear();

    this.ultimoNumero = 0;

    this.lineas = [];

    this.bingos = [];

    this.cartones = [];

    this.hayLinea = false;
    this.hayBingo = false;

    this.msgLinea = false;
    this.msgBingo = false;

    this.mostrarProximaJugada = false;

    this.esUltimaJugada =
      this.numeroJugada === this.ultimaJugada;

    this.cargarCartones();

    this.sortearNumero();

    this.timer = interval(this.INTERVALO)
      .subscribe(() => {

        this.sortearNumero();

      });

  }

  detener() {

    this.timer?.unsubscribe();

    this.timer = undefined;

  }

  obtenerCantidadSorteados(): number {

    return this.numerosSorteados.size;

  }

  obtenerPorcentaje(): number {

    return Math.round(
      (this.numerosSorteados.size / 90) * 100
    );

  }

  numeroFueSorteado(numero: number): boolean {

    return this.numerosSorteados.has(numero);

  }

  obtenerUltimoNumeroTexto(): string {

    if (this.ultimoNumero === 0)
      return '--';

    return this.ultimoNumero < 10
      ? `0${this.ultimoNumero}`
      : this.ultimoNumero.toString();

  }

  obtenerNumeroJugadaTexto(): string {

    if (this.esUltimaJugada)
      return 'ÚLTIMA JUGADA';

    return this.numeroJugada.toString();

  }

  reiniciarTableroVisual() {

    this.numerosSorteados.clear();

    this.ultimoNumero = 0;

  }

  private linea(carton: Carton): boolean {

    const lineas = new Map<number, number>();

    carton.numeros
        .filter(n => n.marcado)
        .forEach(n => {

            const cantidad = lineas.get(n.nLinea) ?? 0;

            lineas.set(n.nLinea, cantidad + 1);

        });

    return [...lineas.values()].some(c => c === 5);

  }

  private bingo(carton: Carton): boolean {

    return carton.numeros.every(n => n.marcado);

  }


  verificarLinea(): void {

    if (this.hayLinea)
        return;

    this.lineas = [];

    this.cartones.forEach((c: Carton) => {

        if (this.linea(c)) {

            this.lineas.push(c);

        }

    });

    this.hayLinea = this.lineas.length > 0;

    if (this.hayLinea && !this.msgLinea) {

        this.msgLinea = true;

        alert(`LÍNEA (${this.lineas.length})`);

    }

  }


  verificarBingo(): void {

    if (this.hayBingo)
        return;

    this.bingos = [];

    this.cartones.forEach((c: Carton) => {

        if (this.bingo(c)) {

            this.bingos.push(c);

        }

    });

    this.hayBingo = this.bingos.length > 0;

    if (this.hayBingo && !this.msgBingo) {

        this.msgBingo = true;

        this.detener();

        alert(`¡¡BINGO!! (${this.bingos.length})`);

        if (!this.esUltimaJugada) {

            this.mostrarProximaJugada = true;

        }

    }

  }



  finalizarJuego() {

    this.detener();

    this.juegoIniciado = false;

    this.mostrarProximaJugada = false;

    this.reiniciarTableroVisual();

    this.lineas = [];

    this.bingos = [];

    this.cartones = [];

    this.numeroJugada = 1;

    this.ultimaJugada = 0;

    this.esUltimaJugada = false;

    this.hayLinea = false;

    this.hayBingo = false;

    this.msgLinea = false;

    this.msgBingo = false;

  }
}