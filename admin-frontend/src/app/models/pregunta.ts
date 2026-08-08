export interface Respuesta {
  id: string;
  respuesta: string;
  id_estado_respuesta: string;
}

export interface Pregunta {
  id: string;
  id_tematica: string;
  uri_imagen: string | null;
  pregunta: string;
  respuestas: Respuesta[];
}