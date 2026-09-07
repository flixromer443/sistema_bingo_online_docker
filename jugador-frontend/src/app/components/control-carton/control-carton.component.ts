import {
  Component,
  OnInit,
  OnDestroy,
  NgZone
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

import { JugadorService } from '../../service/jugador.service';
import { JugadorSignalrService } from '../../service/jugador-signalr.service';


// =========================================================
// CASILLA
// =========================================================

export interface Casilla {
  valor: number | null;
  marcado: boolean;
  esLinea?: boolean;
  esBingo?: boolean;
}


// =========================================================
// NÚMERO DEL CARTÓN
// =========================================================

export interface NumeroCarton {
  numero: number;
  nLinea: number;
}


// =========================================================
// CARTÓN
// =========================================================

export interface Carton {
  id:number;
  numeroJugada:number;
  numeros:NumeroCarton[];
}


// =========================================================
// COMPONENTE
// =========================================================

@Component({
  selector:'app-control-carton',
  standalone:true,
  imports:[
    CommonModule,
    CardModule
  ],
  templateUrl:'./control-carton.component.html',
  styleUrls:[
    './control-carton.component.css'
  ]
})
export class ControlCartonComponent
implements OnInit, OnDestroy {


// =========================================================
// DATOS ACTUALES
// =========================================================

numeroJugada:number = 0;
numeroCarton:number = 0;


// =========================================================
// JUGADAS
// =========================================================

jugadasDisponibles:number[] = [1, 2, 3, 4, 5, 6];
cartonesJugador:Carton[] = [];


// =========================================================
// BOLILLAS
// =========================================================

numerosSorteadosHistoricos:number[] = [];
bolasSorteadas:number[] = [];


// =========================================================
// CARTÓN VISUAL 3 X 9
// =========================================================

carton:Casilla[][] = [];


// =========================================================
// CONSTRUCTOR
// =========================================================

constructor(
  private jugadorService:JugadorService,
  private jugadorSignalrService:JugadorSignalrService,
  private ngZone:NgZone
){}


// =========================================================
// INIT
// =========================================================

ngOnInit():void {
  console.log("======================================");
  console.log("CONTROL CARTÓN INICIADO");
  console.log("======================================");

  this.cargarCartonesJugador();
}


// =========================================================
// DESTROY
// =========================================================

ngOnDestroy():void {
  console.log("Destruyendo componente...");
  this.jugadorSignalrService
  .desconectar()
  .catch(error=>{
    console.error("Error desconectando SignalR", error);
  });
}


// =========================================================
// CARGAR CARTONES DEL JUGADOR
// =========================================================

private cargarCartonesJugador():void {
  const datos = sessionStorage.getItem("cartones_jugador");

  if(!datos){
    console.error("❌ No existen cartones");
    return;
  }

  try {
    this.cartonesJugador = JSON.parse(datos);

    if(!this.cartonesJugador || this.cartonesJugador.length === 0){
      console.error("❌ Lista vacía de cartones");
      return;
    }

    console.log("Cartones jugador:", this.cartonesJugador);

    // CARGA INICIAL JUGADA 1
    this.cargarJugada(1);

    // CONECTAR SIGNALR
    this.conectarSignalR();

  }
  catch(error){
    console.error("Error leyendo cartones", error);
  }
}


// =========================================================
// CARGAR CARTÓN DE UNA JUGADA
// =========================================================

private cargarJugada(numeroJugada:number):void {
  const cartonEncontrado = this.cartonesJugador.find(
    c => Number(c.numeroJugada) === Number(numeroJugada)
  );

  if(!cartonEncontrado){
    console.error("❌ No existe cartón para jugada", numeroJugada);
    return;
  }

  console.log("Cargando cartón:", cartonEncontrado);

  this.numeroJugada = numeroJugada;
  this.numeroCarton = Number(cartonEncontrado.id);

  // limpiar estado anterior
  this.numerosSorteadosHistoricos = [];
  this.bolasSorteadas = [];

  // construir nuevo cartón
  this.construirCarton(cartonEncontrado);

  // traer histórico de esa jugada (Al ser asíncrono, evaluará los verdes al terminar)
  this.cargarNumerosSorteados();
}


// =========================================================
// CONECTAR SIGNALR
// =========================================================

private conectarSignalR():void {
  console.log("Intentando conectar SignalR...");

  this.jugadorSignalrService
  .conectar()
  .then(()=>{
    console.log("🟢 SignalR conectado");

    // Unirse al grupo de la jugada actual
    this.jugadorSignalrService.unirseAJugada(this.numeroJugada);

    // ESCUCHAR NÚMERO SORTEADO
    this.jugadorSignalrService.escucharNumeroSorteado(
      (numero:number, numeroJugada:number)=>{
        this.ngZone.run(()=>{
          const numeroRecibido = Number(numero);
          const jugadaRecibida = Number(numeroJugada);

          if(isNaN(numeroRecibido) || numeroRecibido < 1 || numeroRecibido > 90){
            return;
          }

          if(jugadaRecibida !== this.numeroJugada){
            return;
          }

          this.agregarBolilla(numeroRecibido);
        });
      }
    );

    // ESCUCHAR PREMIO ACTUALIZADO (LÍNEA / BINGO)
    this.jugadorSignalrService.escucharPremioActualizado((data) => {
      this.ngZone.run(() => {
        console.log("Premio ganado detectado en tiempo real:", data);
        const tipo = data.tipoPremio?.toUpperCase();
        if (tipo === 'LINEA') {
          this.marcarLineaGanadora();
        } else if (tipo === 'BINGO') {
          this.marcarBingoGanador();
        }
      });
    });
  })
  .catch(error=>{
    console.error("❌ Error SignalR", error);
  });
}


// =========================================================
// CARGAR HISTÓRICO DE JUGADA
// =========================================================

private cargarNumerosSorteados():void {
  if(this.numeroJugada <= 0){
    return;
  }

  this.jugadorService
  .obtenerNumerosSorteadosPorJugada(this.numeroJugada)
  .subscribe({
    next:(response:any)=>{
      let numeros:any[] = [];

      if(Array.isArray(response)){
        numeros = response;
      }
      else if(Array.isArray(response?.data)){
        numeros = response.data;
      }
      else if(Array.isArray(response?.data?.numeros)){
        numeros = response.data.numeros;
      }

      numeros.forEach(n=>{
        const numero = Number(n?.numero ?? n?.Numero ?? n);
        if(numero >= 1 && numero <= 90){
          this.agregarBolilla(numero);
        }
      });

      // 🔍 AQUÍ ESTÁ LA CLAVE: Una vez cargados todos los históricos, 
      // evaluamos si ya se ganó Línea o Bingo para pintarlo de verde al instante.
      this.verificarEstadoGanador();
    },
    error:(err)=>{
      console.error("Error histórico", err);
    }
  });
}


// =========================================================
// CONSTRUIR CARTÓN 3 x 9
// =========================================================

private construirCarton(carton:Carton):void {
  this.carton = Array.from({length:3}, ()=>
    Array.from({length:9}, ()=>({
      valor:null,
      marcado:false,
      esLinea:false,
      esBingo:false
    }))
  );

  if(!carton.numeros || !Array.isArray(carton.numeros)){
    console.error("Cartón sin números");
    return;
  }

  carton.numeros.forEach(numeroCarton=>{
    const numero = Number(numeroCarton.numero);
    const fila = Number(numeroCarton.nLinea) - 1;

    if(fila < 0 || fila > 2){
      return;
    }

    const columna = this.obtenerColumna(numero);

    if(columna < 0 || columna > 8){
      return;
    }

    if(this.carton[fila][columna].valor === null){
      this.carton[fila][columna] = {
        valor:numero,
        marcado:false,
        esLinea:false,
        esBingo:false
      };
    }
    else{
      const alternativa = this.buscarColumnaDisponible(numero, fila);
      if(alternativa >= 0){
        this.carton[fila][alternativa] = {
          valor:numero,
          marcado:false,
          esLinea:false,
          esBingo:false
        };
      }
    }
  });

  console.log("Cartón construido:", this.carton);
}


// =========================================================
// BUSCAR COLUMNA DISPONIBLE
// =========================================================

private buscarColumnaDisponible(numero:number, fila:number):number {
  const columna = this.obtenerColumna(numero);
  if(columna < 0){
    return -1;
  }

  for(let i=0; i<9; i++){
    if(this.carton[fila][i].valor === null){
      return i;
    }
  }
  return -1;
}


// =========================================================
// OBTENER COLUMNA DEL BINGO
// =========================================================

private obtenerColumna(numero:number):number {
  if(numero<=9) return 0;
  if(numero<=19) return 1;
  if(numero<=29) return 2;
  if(numero<=39) return 3;
  if(numero<=49) return 4;
  if(numero<=59) return 5;
  if(numero<=69) return 6;
  if(numero<=79) return 7;
  if(numero<=90) return 8;
  return -1;
}


// =========================================================
// AGREGAR BOLILLA
// =========================================================

agregarBolilla(numero:number):void {
  const numeroNormalizado = Number(numero);

  if(isNaN(numeroNormalizado) || numeroNormalizado < 1 || numeroNormalizado > 90){
    return;
  }

  if(this.numerosSorteadosHistoricos.includes(numeroNormalizado)){
    this.marcarNumeroEnCarton(numeroNormalizado);
    return;
  }

  this.numerosSorteadosHistoricos.push(numeroNormalizado);
  this.bolasSorteadas = [...this.numerosSorteadosHistoricos.slice(-15)];
  
  this.marcarNumeroEnCarton(numeroNormalizado);
}


// =========================================================
// MARCAR NÚMERO EN CARTÓN
// =========================================================

private marcarNumeroEnCarton(numero:number):void {
  this.carton.forEach(fila=>{
    fila.forEach(casilla=>{
      if(casilla.valor !== null && Number(casilla.valor) === Number(numero)){
        casilla.marcado = true;
      }
    });
  });

  // Verificación automática en vivo cada vez que cae bolilla
  this.verificarEstadoGanador();
}


// =========================================================
// 🟢 NUEVA FUNCIÓN: VERIFICAR SI HAY LÍNEA O BINGO GENERAL
// =========================================================
private verificarEstadoGanador(): void {
  // 1. Revisar si hay BINGO (Todas las casillas con valor marcadas)
  let todoMarcado = true;
  let hayCasillas = false;

  this.carton.forEach(fila => {
    fila.forEach(casilla => {
      if (casilla.valor !== null) {
        hayCasillas = true;
        if (!casilla.marcado) {
          todoMarcado = false;
        }
      }
    });
  });

  if (hayCasillas && todoMarcado) {
    this.marcarBingoGanador();
    return; // Si hay bingo, ya no hace falta evaluar línea de forma separada
  }

  // 2. Revisar si hay LÍNEA (Al menos una fila completa marcada)
  let hayAlgunaLinea = false;
  this.carton.forEach(fila => {
    const casillasConNumero = fila.filter(c => c.valor !== null);
    const filaCompleta = casillasConNumero.length > 0 && casillasConNumero.every(c => c.marcado);
    if (filaCompleta) {
      hayAlgunaLinea = true;
    }
  });

  if (hayAlgunaLinea) {
    this.marcarLineaGanadora();
  }
}


// =========================================================
// MARCAR MANUALMENTE
// =========================================================

marcar(casilla:Casilla):void {
  if(casilla.valor === null){
    return;
  }
  casilla.marcado = !casilla.marcado;
  this.verificarEstadoGanador();
}


// =========================================================
// MARCAR LÍNEA GANADORA EN VERDE
// =========================================================
private marcarLineaGanadora(): void {
  this.carton.forEach(fila => {
    const casillasConNumero = fila.filter(c => c.valor !== null);
    const filaCompletaMarcada = casillasConNumero.length > 0 && casillasConNumero.every(c => c.marcado);

    if (filaCompletaMarcada) {
      fila.forEach(casilla => {
        if (casilla.valor !== null) {
          casilla.esLinea = true;
        }
      });
    }
  });

  this.refrescarCarton();
}


// =========================================================
// MARCAR BINGO GANADOR EN VERDE
// =========================================================
private marcarBingoGanador(): void {
  this.carton.forEach(fila => {
    fila.forEach(casilla => {
      if (casilla.valor !== null) {
        casilla.esBingo = true;
        casilla.esLinea = true; // Opcional: si hay bingo, las líneas también se marcan completas
      }
    });
  });

  this.refrescarCarton();
}


// =========================================================
// AUXILIAR PARA FORZAR REFRESCO VISUAL EN ANGULAR
// =========================================================
private refrescarCarton(): void {
  this.carton = this.carton.map(
    fila =>
    fila.map(
      casilla => ({
        valor: casilla.valor,
        marcado: casilla.marcado,
        esLinea: casilla.esLinea,
        esBingo: casilla.esBingo
      })
    )
  );
}


// =========================================================
// LIMPIAR MARCAS DEL CARTÓN
// =========================================================

limpiarCarton():void {
  this.carton.forEach(fila=>{
    fila.forEach(casilla=>{
      casilla.marcado = false;
      casilla.esLinea = false;
      casilla.esBingo = false;
    });
  });
  this.refrescarCarton();
}


// =========================================================
// REINICIAR BOLILLERO
// =========================================================

reiniciarBolillero():void {
  this.bolasSorteadas = [];
  this.numerosSorteadosHistoricos = [];
  this.limpiarCarton();
}


// =========================================================
// CANTAR LÍNEA / BINGO
// =========================================================

cantarLinea():void {
  alert("¡LÍNEA!");
}

cantarBingo():void {
  alert("¡BINGO!");
}


// =========================================================
// CAMBIAR JUGADA
// =========================================================

cambiarJugada(jugada:number):void {
  const datos = sessionStorage.getItem('cartones_jugador');
  if(!datos){
    console.error("No existen cartones");
    return;
  }

  const cartones:Carton[] = JSON.parse(datos);
  const cartonJugada = cartones.find(
    c => Number(c.numeroJugada) === Number(jugada)
  );

  if(!cartonJugada){
    console.error("No existe cartón para jugada", jugada);
    return;
  }

  console.log("Cambiando a jugada:", jugada);

  // Notificar al hub que sale de la anterior y entra a la nueva
  this.jugadorSignalrService.salirDeJugada(this.numeroJugada)
    .catch(err => console.error("Error al salir del grupo anterior", err));
  
  this.jugadorSignalrService.unirseAJugada(jugada);

  this.numeroJugada = jugada;
  this.numeroCarton = cartonJugada.id;

  // limpiar marcas anteriores
  this.reiniciarBolillero();

  // construir nuevo cartón
  this.construirCarton(cartonJugada);

  // cargar bolas de esa jugada (al terminar de cargar, evaluará los colores de forma automática)
  this.cargarNumerosSorteados();
}

}