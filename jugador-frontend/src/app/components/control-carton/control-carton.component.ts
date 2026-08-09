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


jugadasDisponibles:number[] = [

  1,
  2,
  3,
  4,
  5,
  6

];



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


  console.log(
    "======================================"
  );


  console.log(
    "CONTROL CARTÓN INICIADO"
  );


  console.log(
    "======================================"
  );



  this.cargarCartonesJugador();


}



// =========================================================
// DESTROY
// =========================================================


ngOnDestroy():void {



  console.log(
    "Destruyendo componente..."
  );



  this.jugadorSignalrService
  .desconectar()

  .catch(error=>{


    console.error(
      "Error desconectando SignalR",
      error
    );


  });



}



// =========================================================
// CARGAR CARTONES DEL JUGADOR
// =========================================================


private cargarCartonesJugador():void {


  const datos =

    sessionStorage.getItem(
      "cartones_jugador"
    );



  if(!datos){


    console.error(
      "❌ No existen cartones"
    );


    return;

  }



  try {


    this.cartonesJugador =

      JSON.parse(datos);



    if(

      !this.cartonesJugador ||

      this.cartonesJugador.length === 0

    ){


      console.error(
        "❌ Lista vacía de cartones"
      );


      return;

    }



    console.log(
      "Cartones jugador:",
      this.cartonesJugador
    );



    // CARGA INICIAL JUGADA 1


    this.cargarJugada(
      1
    );



    // CONECTAR SIGNALR


    this.conectarSignalR();



  }

  catch(error){


    console.error(
      "Error leyendo cartones",
      error
    );


  }


}


// =========================================================
// CARGAR CARTÓN DE UNA JUGADA
// =========================================================


private cargarJugada(

  numeroJugada:number

):void {



  const cartonEncontrado =

    this.cartonesJugador.find(

      c =>

      Number(c.numeroJugada)

      ===

      Number(numeroJugada)

    );



  if(!cartonEncontrado){


    console.error(

      "❌ No existe cartón para jugada",

      numeroJugada

    );


    return;

  }



  console.log(
    "Cargando cartón:",
    cartonEncontrado
  );



  this.numeroJugada =

    numeroJugada;



  this.numeroCarton =

    Number(
      cartonEncontrado.id
    );



  // limpiar estado anterior


  this.numerosSorteadosHistoricos = [];


  this.bolasSorteadas = [];



  // construir nuevo cartón


  this.construirCarton(

    cartonEncontrado

  );



  // traer histórico de esa jugada


  this.cargarNumerosSorteados();



}
// =========================================================
// CONECTAR SIGNALR
// =========================================================

private conectarSignalR():void {


  console.log(
    "Intentando conectar SignalR..."
  );



  this.jugadorSignalrService
  .conectar()

  .then(()=>{


    console.log(
      "🟢 SignalR conectado"
    );



    this.jugadorSignalrService
    .escucharNumeroSorteado(

      (
        numero:number,
        numeroJugada:number

      )=>{


        this.ngZone.run(()=>{



          const numeroRecibido =
            Number(numero);



          const jugadaRecibida =
            Number(numeroJugada);



          if(

            isNaN(numeroRecibido)

            ||

            numeroRecibido < 1

            ||

            numeroRecibido > 90

          ){

            return;

          }



          /*
          =================================================
          IMPORTANTE

          SOLO MARCAR LA JUGADA ACTIVA
          =================================================
          */


          if(

            jugadaRecibida !==

            this.numeroJugada

          ){

            console.log(

              "Número de otra jugada:",

              jugadaRecibida

            );


            return;

          }



          this.agregarBolilla(

            numeroRecibido

          );



        });



      }


    );



  })


  .catch(error=>{


    console.error(

      "❌ Error SignalR",

      error

    );


  });



}



// =========================================================
// CARGAR HISTÓRICO DE JUGADA
// =========================================================


private cargarNumerosSorteados():void {



  if(

    this.numeroJugada <= 0

  ){

    return;

  }



  this.jugadorService

  .obtenerNumerosSorteadosPorJugada(

    this.numeroJugada

  )

  .subscribe({



    next:(response:any)=>{



      let numeros:any[] = [];



      if(

        Array.isArray(response)

      ){

        numeros=response;

      }

      else if(

        Array.isArray(response?.data)

      ){

        numeros=response.data;

      }

      else if(

        Array.isArray(response?.data?.numeros)

      ){

        numeros=response.data.numeros;

      }



      numeros.forEach(

        n=>{



          const numero =

          Number(

            n?.numero ??

            n?.Numero ??

            n

          );



          if(

            numero >=1

            &&

            numero <=90

          ){


            this.agregarBolilla(

              numero

            );


          }



        }


      );



    },


    error:(err)=>{


      console.error(

        "Error histórico",

        err

      );


    }



  });



}



// =========================================================
// CONSTRUIR CARTÓN 3 x 9
// =========================================================


private construirCarton(

  carton:Carton

):void {



  this.carton =

  Array.from(

    {

      length:3

    },


    ()=>


    Array.from(

      {

        length:9

      },


      ()=>({


        valor:null,


        marcado:false


      })


    )


  );




  if(

    !carton.numeros

    ||

    !Array.isArray(carton.numeros)

  ){

    console.error(

      "Cartón sin números"

    );


    return;

  }





  carton.numeros.forEach(

    numeroCarton=>{



      const numero =

      Number(

        numeroCarton.numero

      );



      const fila =

      Number(

        numeroCarton.nLinea

      )

      -1;



      if(

        fila <0

        ||

        fila>2

      ){

        return;

      }



      const columna =

      this.obtenerColumna(

        numero

      );



      if(

        columna <0

        ||

        columna>8

      ){

        return;

      }





      if(

        this.carton[fila][columna].valor

        ===

        null

      ){



        this.carton[fila][columna]={


          valor:numero,


          marcado:false



        };



      }

      else{



        const alternativa =

        this.buscarColumnaDisponible(

          numero,

          fila

        );



        if(

          alternativa>=0

        ){



          this.carton[fila][alternativa]={


            valor:numero,


            marcado:false


          };



        }



      }



    }


  );



  console.log(

    "Cartón construido:",

    this.carton

  );



}



// =========================================================
// BUSCAR COLUMNA DISPONIBLE
// =========================================================


private buscarColumnaDisponible(

  numero:number,

  fila:number

):number {



  const columna =

  this.obtenerColumna(

    numero

  );



  if(

    columna <0

  ){

    return -1;

  }



  for(

    let i=0;

    i<9;

    i++

  ){


    if(

      this.carton[fila][i].valor

      ===

      null

    ){

      return i;

    }


  }



  return -1;


}



// =========================================================
// OBTENER COLUMNA DEL BINGO
// =========================================================


private obtenerColumna(

 numero:number

):number {



  if(numero<=9)
    return 0;


  if(numero<=19)
    return 1;


  if(numero<=29)
    return 2;


  if(numero<=39)
    return 3;


  if(numero<=49)
    return 4;


  if(numero<=59)
    return 5;


  if(numero<=69)
    return 6;


  if(numero<=79)
    return 7;


  if(numero<=90)
    return 8;



  return -1;


}

// =========================================================
// AGREGAR BOLILLA
// =========================================================

agregarBolilla(
  numero:number
):void {


  const numeroNormalizado =
    Number(numero);



  if(

    isNaN(numeroNormalizado)

    ||

    numeroNormalizado < 1

    ||

    numeroNormalizado > 90

  ){

    return;

  }





  // EVITAR DUPLICADOS


  if(

    this.numerosSorteadosHistoricos
    .includes(numeroNormalizado)

  ){


    this.marcarNumeroEnCarton(

      numeroNormalizado

    );


    return;

  }





  // GUARDAR HISTÓRICO COMPLETO


  this.numerosSorteadosHistoricos.push(

    numeroNormalizado

  );





  // MOSTRAR ÚLTIMAS 15


  this.bolasSorteadas =

  [

    ...this.numerosSorteadosHistoricos
    .slice(-15)

  ];





  // MARCAR CARTÓN


  this.marcarNumeroEnCarton(

    numeroNormalizado

  );



}



// =========================================================
// MARCAR NÚMERO EN CARTÓN
// =========================================================

private marcarNumeroEnCarton(

  numero:number

):void {



  this.carton.forEach(

    fila=>{


      fila.forEach(

        casilla=>{


          if(

            casilla.valor !== null

            &&

            Number(casilla.valor)

            ===

            Number(numero)

          ){



            casilla.marcado = true;



          }



        }


      );


    }


  );



  // refrescar referencia Angular


  this.carton =

  this.carton.map(

    fila=>

    fila.map(

      casilla=>({


        valor:

        casilla.valor,


        marcado:

        casilla.marcado



      })


    )


  );



}





// =========================================================
// MARCAR MANUALMENTE
// =========================================================


marcar(

  casilla:Casilla

):void {



  if(

    casilla.valor === null

  ){

    return;

  }



  casilla.marcado =

    !casilla.marcado;





  this.carton =

  this.carton.map(

    fila=>

    fila.map(

      c=>({


        valor:c.valor,


        marcado:c.marcado



      })


    )


  );



}



// =========================================================
// LIMPIAR MARCAS DEL CARTÓN
// =========================================================


limpiarCarton():void {



  this.carton.forEach(

    fila=>{


      fila.forEach(

        casilla=>{


          casilla.marcado = false;



        }


      );


    }


  );



  this.carton =

  this.carton.map(

    fila=>

    fila.map(

      casilla=>({


        valor:

        casilla.valor,


        marcado:

        casilla.marcado



      })


    )


  );



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
// CANTAR LÍNEA
// =========================================================


cantarLinea():void {


  alert(

    "¡LÍNEA!"

  );


}





// =========================================================
// CANTAR BINGO
// =========================================================


cantarBingo():void {


  alert(

    "¡BINGO!"

  );


}

cambiarJugada(jugada:number):void {


  const datos =
    sessionStorage.getItem(
      'cartones_jugador'
    );


  if(!datos){

    console.error(
      "No existen cartones"
    );

    return;

  }



  const cartones:Carton[] =
    JSON.parse(datos);



  const cartonJugada =
    cartones.find(
      c =>
      Number(c.numeroJugada) === Number(jugada)
    );



  if(!cartonJugada){

    console.error(
      "No existe cartón para jugada",
      jugada
    );

    return;

  }



  console.log(
    "Cambiando a jugada:",
    jugada
  );



  this.numeroJugada =
    jugada;


  this.numeroCarton =
    cartonJugada.id;



  // limpiar marcas anteriores

  this.reiniciarBolillero();



  // construir nuevo cartón

  this.construirCarton(
    cartonJugada
  );



  // cargar bolas de esa jugada

  this.cargarNumerosSorteados();



}


}