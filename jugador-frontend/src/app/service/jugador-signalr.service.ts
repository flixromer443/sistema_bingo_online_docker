import { Injectable } from '@angular/core';

import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel
} from '@microsoft/signalr';


@Injectable({
  providedIn: 'root'
})
export class JugadorSignalrService {


  private hubConnection!: HubConnection;



  constructor() {}



  // =====================================================
  // CONECTAR SIGNALR
  // =====================================================

  conectar(): Promise<void> {


    this.hubConnection =

      new HubConnectionBuilder()

        .withUrl(
          'http://localhost:5214/bingoHub'
        )

        .withAutomaticReconnect()

        .configureLogging(
          LogLevel.Information
        )

        .build();



    // --------------------------------------------
    // EVENTOS DE CONEXIÓN
    // --------------------------------------------

    this.hubConnection.onclose(
      error => {

        console.error(
          '❌ SIGNALR DESCONECTADO',
          error
        );

      }
    );



    this.hubConnection.onreconnecting(
      error => {

        console.warn(
          '⚠️ SIGNALR RECONTECTANDO',
          error
        );

      }
    );



    this.hubConnection.onreconnected(
      id => {

        console.log(
          '🟢 SIGNALR RECONTECTADO',
          id
        );

      }
    );



    return this.hubConnection.start();

  }





  // =====================================================
  // UNIRSE A UNA JUGADA
  // =====================================================

  unirseAJugada(
    numeroJugada:number
  ): Promise<void> {


    if(!this.hubConnection){

      return Promise.reject(
        'SignalR no conectado'
      );

    }



    console.log(
      'Uniéndose a jugada:',
      numeroJugada
    );



    return this.hubConnection.invoke(

      'UnirseAJugada',

      numeroJugada

    );

  }





  // =====================================================
  // ESCUCHAR NUMERO SORTEADO
  // =====================================================

  escucharNumeroSorteado(

    callback:
    (
      numero:number,
      numeroJugada:number
    )=>void

  ):void {



    if(!this.hubConnection){


      console.error(
        '❌ SignalR no está conectado'
      );


      return;

    }



    console.log(
      '🟢 Registrando listener numerosorteado'
    );



    this.hubConnection.on(

      'numerosorteado',


      (
        numero:number,
        numeroJugada:number
      )=>{


        console.log(
          '======================================'
        );


        console.log(
          '🔥 EVENTO numerosorteado RECIBIDO'
        );


        console.log(
          'Número:',
          numero
        );


        console.log(
          'Jugada:',
          numeroJugada
        );


        console.log(
          '======================================'
        );



        callback(

          Number(numero),

          Number(numeroJugada)

        );


      }

    );



    console.log(
      '🟢 Listener numerosorteado registrado correctamente'
    );


  }





  // =====================================================
  // DESCONECTAR
  // =====================================================

  desconectar():Promise<void>{


    if(this.hubConnection){


      console.log(
        'Desconectando SignalR...'
      );


      return this.hubConnection.stop();


    }


    return Promise.resolve();


  }


}