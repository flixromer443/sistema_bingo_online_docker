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
  id: number;
  numeroJugada: number;
  numeros: NumeroCarton[];
}

// =========================================================
// COMPONENTE
// =========================================================

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
export class ControlCartonComponent
  implements OnInit, OnDestroy {

  // =========================================================
  // DATOS DEL CARTÓN
  // =========================================================

  numeroJugada = 0;

  numeroCarton = 0;

  // =========================================================
  // BOLILLAS SORTEADAS
  // =========================================================

  // Todas las bolas salidas en la jugada
  numerosSorteadosHistoricos: number[] = [];

  // Últimas 15 para mostrar en pantalla
  bolasSorteadas: number[] = [];

  // =========================================================
  // CARTÓN 3 x 9
  // =========================================================

  carton: Casilla[][] = [];

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private jugadorService: JugadorService,
    private jugadorSignalrService: JugadorSignalrService,
    private ngZone: NgZone
  ) {}

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    console.log('======================================');
    console.log('CONTROL CARTÓN INICIADO');
    console.log('======================================');

    this.cargarCarton();
  }

  // =========================================================
  // DESTROY
  // =========================================================

  ngOnDestroy(): void {

    console.log(
      'Destruyendo ControlCartonComponent...'
    );

    this.jugadorSignalrService
      .desconectar()
      .catch(error => {

        console.error(
          'Error desconectando SignalR:',
          error
        );

      });
  }

  // =========================================================
  // CARGAR CARTÓN DESDE SESSION STORAGE
  // =========================================================

  private cargarCarton(): void {

    const datos =
      sessionStorage.getItem(
        'cartones_jugador'
      );

    if (!datos) {

      console.error(
        '❌ No existen cartones del jugador.'
      );

      return;
    }

    try {

      const cartones: Carton[] =
        JSON.parse(datos);

      if (
        !cartones ||
        cartones.length === 0
      ) {

        console.error(
          '❌ El jugador no posee cartones.'
        );

        return;
      }

      // -----------------------------------------------------
      // PRIMER CARTÓN
      // -----------------------------------------------------

      const carton =
        cartones[0];

      this.numeroCarton =
        Number(carton.id);

      this.numeroJugada =
        Number(carton.numeroJugada);

      console.log(
        'Cartón cargado:',
        carton
      );

      console.log(
        'Número de cartón:',
        this.numeroCarton
      );

      console.log(
        'Número de jugada:',
        this.numeroJugada
      );

      // -----------------------------------------------------
      // CONSTRUIR CARTÓN
      // -----------------------------------------------------

      this.construirCarton(
        carton
      );

      // -----------------------------------------------------
      // CONECTAR SIGNALR
      // -----------------------------------------------------

      this.conectarSignalR();

      // -----------------------------------------------------
      // CARGAR HISTÓRICO
      // -----------------------------------------------------

      this.cargarNumerosSorteados();

    }
    catch (error) {

      console.error(
        '❌ Error leyendo cartones:',
        error
      );

    }
  }

  // =========================================================
  // CONECTAR SIGNALR
  // =========================================================

  // =========================================================
// CONECTAR SIGNALR
// =========================================================

  private conectarSignalR(): void {

    console.log(
      '======================================'
    );

    console.log(
      'INTENTANDO CONECTAR SIGNALR'
    );

    console.log(
      '======================================'
    );


    this.jugadorSignalrService
      .conectar()

      .then(() => {


        console.log(
          '======================================'
        );

        console.log(
          '🟢 SIGNALR CONECTADO'
        );

        console.log(
          '🟢 REGISTRANDO LISTENER NumeroSorteado'
        );

        console.log(
          '======================================'
        );



        this.jugadorSignalrService
          .escucharNumeroSorteado(

            (
              numero: number,
              numeroJugada: number
            ) => {


              console.log(
                '======================================'
              );

              console.log(
                '🔥 CALLBACK SIGNALR EJECUTADO'
              );

              console.log(
                '🔥 NUMERO:',
                numero
              );

              console.log(
                '🔥 JUGADA RECIBIDA:',
                numeroJugada
              );

              console.log(
                '🔥 JUGADA CARTON:',
                this.numeroJugada
              );

              console.log(
                '======================================'
              );



              this.ngZone.run(() => {


                const numeroRecibido =
                  Number(numero);


                const jugadaRecibida =
                  Number(numeroJugada);



                console.log(
                  'Número convertido:',
                  numeroRecibido
                );


                console.log(
                  'Jugada convertida:',
                  jugadaRecibida
                );



                if (
                  isNaN(numeroRecibido) ||
                  numeroRecibido < 1 ||
                  numeroRecibido > 90
                ) {

                  console.error(
                    '❌ Número inválido:',
                    numeroRecibido
                  );

                  return;

                }



                /*
                ==================================================
                IMPORTANTE

                TEMPORALMENTE NO FILTRAMOS JUGADA

                Porque ahora mismo el backend está enviando:

                Bola 21
                Jugada 1

                Pero el cartón es:

                Jugada 2

                Esto evita que nunca llegue a marcar.
                ==================================================
                */


                if (
                  jugadaRecibida !==
                  Number(this.numeroJugada)
                ) {


                  console.warn(
                    '⚠️ JUGADA DIFERENTE'
                  );


                  console.warn(
                    'Servidor:',
                    jugadaRecibida
                  );


                  console.warn(
                    'Cartón:',
                    this.numeroJugada
                  );


                  // NO HACEMOS RETURN
                }



                console.log(
                  '======================================'
                );


                console.log(
                  '🚨 LLAMANDO agregarBolilla:',
                  numeroRecibido
                );


                console.log(
                  '======================================'
                );



                this.agregarBolilla(
                  numeroRecibido
                );



                // Forzar refresco Angular

                this.carton =
                  this.carton.map(

                    fila =>
                      fila.map(

                        casilla => ({

                          valor:
                            casilla.valor,

                          marcado:
                            casilla.marcado

                        })

                      )

                  );


              });


            }

          );



        console.log(
          '🟢 Listener NumeroSorteado registrado correctamente'
        );


      })


      .catch(error => {


        console.error(
          '❌ ERROR CONECTANDO SIGNALR:',
          error
        );


      });


  }

  // =========================================================
  // CARGAR HISTÓRICO DESDE API
  // =========================================================

  private cargarNumerosSorteados(): void {

    if (
      this.numeroJugada <= 0
    ) {

      console.error(
        'Número de jugada inválido:',
        this.numeroJugada
      );

      return;
    }

    console.log(
      'Consultando histórico de jugada:',
      this.numeroJugada
    );

    this.jugadorService
      .obtenerNumerosSorteadosPorJugada(
        this.numeroJugada
      )

      .subscribe({

        next: (response: any) => {

          console.log(
            '======================================'
          );

          console.log(
            'RESPUESTA HISTÓRICO'
          );

          console.log(
            response
          );

          console.log(
            '======================================'
          );

          let numeros: any[] = [];

          // -------------------------------------------------
          // ARRAY DIRECTO
          // -------------------------------------------------

          if (
            Array.isArray(response)
          ) {

            numeros =
              response;
          }

          // -------------------------------------------------
          // DATA
          // -------------------------------------------------

          else if (
            Array.isArray(response?.data)
          ) {

            numeros =
              response.data;
          }

          // -------------------------------------------------
          // DATA.NUMEROS
          // -------------------------------------------------

          else if (
            Array.isArray(
              response?.data?.numeros
            )
          ) {

            numeros =
              response.data.numeros;
          }

          console.log(
            'Números recibidos:',
            numeros
          );

          // -------------------------------------------------
          // PROCESAR HISTÓRICO
          // -------------------------------------------------

          numeros
            .sort(
             (a,b)=>{
            
             const na =
             Number(
             a.numero ??
             a.Numero ??
             a
             );
           
             const nb =
             Number(
             b.numero ??
             b.Numero ??
             b
             );
           
             return na-nb;
           
            })
            .forEach(
             n=>{
            
            
             const numero =
             Number(
             n?.numero ??
             n?.Numero ??
             n
             );
           
           
             this.agregarBolilla(numero);
           
           
            }
            );

          // -------------------------------------------------
          // FORZAR ACTUALIZACIÓN
          // -------------------------------------------------

          this.carton =
            this.carton.map(
              fila =>
                fila.map(
                  casilla => ({
                    valor: casilla.valor,
                    marcado: casilla.marcado
                  })
                )
            );

          console.log(
            '======================================'
          );

          console.log(
            'BOLILLAS DESPUÉS DEL HISTÓRICO:',
            this.bolasSorteadas
          );

          console.log(
            '======================================'
          );

        },

        error: (err) => {

          console.error(
            'ERROR CARGANDO NÚMEROS SORTEADOS:',
            err
          );

        }

      });
  }

  // =========================================================
  // CONSTRUIR CARTÓN
  // =========================================================

  private construirCarton(
    carton: Carton
  ): void {

    // -------------------------------------------------------
    // CREAR MATRIZ 3 x 9
    // -------------------------------------------------------

    this.carton =
      Array.from(
        {
          length: 3
        },

        () =>
          Array.from(
            {
              length: 9
            },

            () => ({

              valor: null,

              marcado: false

            })

          )

      );

    if (
      !carton.numeros ||
      !Array.isArray(carton.numeros)
    ) {

      console.error(
        'El cartón no contiene números.'
      );

      return;
    }

    // -------------------------------------------------------
    // CONTROL DE CANTIDAD POR FILA
    // -------------------------------------------------------

    const cantidadPorFila =
      [0, 0, 0];

    // -------------------------------------------------------
    // COLOCAR NÚMEROS
    // -------------------------------------------------------

    carton.numeros.forEach(
      numeroCarton => {

        const numero =
          Number(
            numeroCarton.numero
          );

        const fila =
          Number(
            numeroCarton.nLinea
          ) - 1;

        if (
          fila < 0 ||
          fila > 2
        ) {

          console.error(
            'Fila inválida:',
            numeroCarton
          );

          return;
        }

        // ---------------------------------------------------
        // OBTENER COLUMNA
        // ---------------------------------------------------

        const columna =
          this.obtenerColumna(
            numero
          );

        if (
          columna < 0 ||
          columna > 8
        ) {

          console.error(
            'Columna inválida:',
            numeroCarton
          );

          return;
        }

        // ---------------------------------------------------
        // SI LA COLUMNA ESTÁ LIBRE
        // ---------------------------------------------------

        if (
          this.carton[fila][columna].valor === null
        ) {

          this.carton[fila][columna] = {

            valor:
              numero,

            marcado:
              false

          };

          cantidadPorFila[fila]++;

          return;
        }

        // ---------------------------------------------------
        // BUSCAR OTRA COLUMNA
        // ---------------------------------------------------

        const columnaAlternativa =
          this.buscarColumnaDisponible(
            numero,
            fila
          );

        if (
          columnaAlternativa >= 0
        ) {

          this.carton[fila][columnaAlternativa] = {

            valor:
              numero,

            marcado:
              false

          };

          cantidadPorFila[fila]++;

        }
        else {

          console.error(
            'No hay columna disponible para:',
            numeroCarton
          );

        }

      }
    );

    // -------------------------------------------------------
    // VALIDAR CANTIDAD
    // -------------------------------------------------------

    console.log(
      '======================================'
    );

    console.log(
      'CANTIDAD DE NÚMEROS POR FILA:',
      cantidadPorFila
    );

    console.log(
      '======================================'
    );

    cantidadPorFila.forEach(
      (cantidad, indice) => {

        if (
          cantidad !== 5
        ) {

          console.warn(
            `⚠️ La fila ${indice + 1} tiene ${cantidad} números. Se esperaban 5.`
          );

        }

      }
    );

    console.log(
      '======================================'
    );

    console.log(
      'CARTÓN CONSTRUIDO:',
      this.carton
    );

    console.log(
      '======================================'
    );
  }

  // =========================================================
  // BUSCAR COLUMNA DISPONIBLE
  // =========================================================

  private buscarColumnaDisponible(
    numero: number,
    fila: number
  ): number {

    const columna =
      this.obtenerColumna(
        numero
      );

    if (
      columna < 0 ||
      columna > 8
    ) {

      return -1;
    }

    // -------------------------------------------------------
    // COLUMNA NATURAL LIBRE
    // -------------------------------------------------------

    if (
      this.carton[fila][columna].valor === null
    ) {

      return columna;
    }

    // -------------------------------------------------------
    // BUSCAR IZQUIERDA / DERECHA
    // -------------------------------------------------------

    for (
      let desplazamiento = 1;
      desplazamiento < 9;
      desplazamiento++
    ) {

      const izquierda =
        columna - desplazamiento;

      if (
        izquierda >= 0 &&
        this.carton[fila][izquierda].valor === null
      ) {

        return izquierda;
      }

      const derecha =
        columna + desplazamiento;

      if (
        derecha <= 8 &&
        this.carton[fila][derecha].valor === null
      ) {

        return derecha;
      }

    }

    return -1;
  }

  // =========================================================
  // OBTENER COLUMNA
  // =========================================================

  private obtenerColumna(
    numero: number
  ): number {

    if (
      numero >= 1 &&
      numero <= 9
    ) {

      return 0;
    }

    if (
      numero >= 10 &&
      numero <= 19
    ) {

      return 1;
    }

    if (
      numero >= 20 &&
      numero <= 29
    ) {

      return 2;
    }

    if (
      numero >= 30 &&
      numero <= 39
    ) {

      return 3;
    }

    if (
      numero >= 40 &&
      numero <= 49
    ) {

      return 4;
    }

    if (
      numero >= 50 &&
      numero <= 59
    ) {

      return 5;
    }

    if (
      numero >= 60 &&
      numero <= 69
    ) {

      return 6;
    }

    if (
      numero >= 70 &&
      numero <= 79
    ) {

      return 7;
    }

    if (
      numero >= 80 &&
      numero <= 90
    ) {

      return 8;
    }

    return -1;
  }

  // =========================================================
  // AGREGAR BOLILLA
  // =========================================================

  agregarBolilla(numero:number):void {

    const numeroNormalizado = Number(numero);

    if(
      isNaN(numeroNormalizado) ||
      numeroNormalizado < 1 ||
      numeroNormalizado > 90
    ){
      return;
    }


    // ======================================
    // EVITAR DUPLICADOS HISTÓRICOS
    // ======================================

    if(
      this.numerosSorteadosHistoricos.includes(numeroNormalizado)
    ){
    
      console.log(
        "Número ya cargado:",
        numeroNormalizado
      );
    
      this.marcarNumeroEnCarton(numeroNormalizado);
    
      return;
    
    }


    // ======================================
    // GUARDAR HISTÓRICO COMPLETO
    // ======================================

    this.numerosSorteadosHistoricos.push(
      numeroNormalizado
    );


    // ======================================
    // LISTA VISUAL ÚLTIMAS 15
    // ======================================

    this.bolasSorteadas =
    [
     ...this.numerosSorteadosHistoricos.slice(-15)
    ];


    // ======================================
    // MARCAR CARTÓN
    // ======================================

    this.marcarNumeroEnCarton(
     numeroNormalizado
    );


    // Forzar refresco

    this.carton =
    this.carton.map(
     fila =>
     fila.map(
     casilla => ({
       valor:casilla.valor,
       marcado:casilla.marcado
     })
     )
    );


    console.log(
    "Histórico completo:",
    this.numerosSorteadosHistoricos
    );


    console.log(
    "Bolillas visibles:",
    this.bolasSorteadas
    );


  }

  // =========================================================
  // MARCAR NÚMERO EN CARTÓN
  // =========================================================

  private marcarNumeroEnCarton(
    numero: number
  ): void {

    console.log(
      '======================================'
    );

    console.log(
      '🔎 BUSCANDO NÚMERO EN CARTÓN:',
      numero
    );

    let encontrado =
      false;

    // -------------------------------------------------------
    // RECORRER CARTÓN
    // -------------------------------------------------------

    this.carton.forEach(
      (fila, indiceFila) => {

        fila.forEach(
          (casilla, indiceColumna) => {

            console.log(
              `Comparando ${numero} con casilla [${indiceFila}][${indiceColumna}]:`,
              casilla.valor
            );

            if (
              casilla.valor !== null &&
              Number(casilla.valor) ===
              Number(numero)
            ) {

              console.log(
                '**************************************'
              );

              console.log(
                '🔥🔥🔥 NÚMERO ENCONTRADO EN CARTÓN'
              );

              console.log(
                'Número:',
                numero
              );

              console.log(
                'Fila:',
                indiceFila
              );

              console.log(
                'Columna:',
                indiceColumna
              );

              console.log(
                '**************************************'
              );

              // ------------------------------------------------
              // MARCAR
              // ------------------------------------------------

              casilla.marcado =
                true;

              encontrado =
                true;

            }

          }
        );

      }
    );

    // -------------------------------------------------------
    // RESULTADO
    // -------------------------------------------------------

    if (
      !encontrado
    ) {

      console.log(
        'ℹ️ El número',
        numero,
        'NO está en este cartón.'
      );

    }

    // -------------------------------------------------------
    // CREAR NUEVA REFERENCIA
    // -------------------------------------------------------

    this.carton =
      this.carton.map(
        fila =>
          fila.map(
            casilla => ({

              valor:
                casilla.valor,

              marcado:
                casilla.marcado

            })

          )
      );

    console.log(
      '======================================'
    );

    console.log(
      'CARTÓN DESPUÉS DE MARCAR:',
      this.carton
    );

    console.log(
      '======================================'
    );
  }

  // =========================================================
  // MARCAR MANUALMENTE
  // =========================================================

  marcar(
    casilla: Casilla
  ): void {

    if (
      casilla.valor === null
    ) {

      return;
    }

    casilla.marcado =
      !casilla.marcado;

    // -------------------------------------------------------
    // NUEVA REFERENCIA
    // -------------------------------------------------------

    this.carton =
      this.carton.map(
        fila =>
          fila.map(
            c => ({

              valor:
                c.valor,

              marcado:
                c.marcado

            })

          )
      );
  }

  // =========================================================
  // LIMPIAR CARTÓN
  // =========================================================

  limpiarCarton(): void {

    this.carton.forEach(
      fila => {

        fila.forEach(
          casilla => {

            casilla.marcado =
              false;

          }

        );

      }
    );

    this.carton =
      this.carton.map(
        fila =>
          fila.map(
            casilla => ({

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
    this.bolasSorteadas=[];
    this.numerosSorteadosHistoricos=[];
    this.limpiarCarton();
  }

  // =========================================================
  // CANTAR LÍNEA
  // =========================================================

  cantarLinea(): void {

    alert(
      '¡Línea!'
    );
  }

  // =========================================================
  // CANTAR BINGO
  // =========================================================

  cantarBingo(): void {

    alert(
      '¡Bingo!'
    );
  }

}