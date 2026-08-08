export interface Carton {

    id: number;

    jugada: Jugada;

    token: Token;

    numeros: NumeroCarton[];

}

export interface Jugada {

    id: number;

    numeroJugada: number;

    premios: Premio[];

    ganadores: Ganador[];

}

export interface Premio {

    id: number;

    valor: number;

}

export interface Ganador {

    id: number;

    carton: string;

    premio: Premio;

}

export interface Token {

    id: number;

    codigo: string;

    jugador: Jugador;

}

export interface Jugador {

    id: number;

    nombre: string;

    apellido: string;

    dni: string;

    telefono: string;

    correoElectronico: string;

    alias: string;

}

export interface NumeroCarton {

    id: number;

    numero: number;

    marcado: boolean;

    nLinea: number;

}

export interface Tbl1DtsVariables {

    id: number;

    variable: string;

    valor: string;

}