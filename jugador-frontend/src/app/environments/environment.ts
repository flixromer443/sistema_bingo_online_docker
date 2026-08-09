const env = (window as any).__env || {};

export const environment = {
  production: false,
  apiJugador:env.API_JUGADOR_URL,
  apiGlobal: env.API_GLOBAL_URL,
};