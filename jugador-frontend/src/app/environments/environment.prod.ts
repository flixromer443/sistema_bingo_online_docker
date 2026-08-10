const env = (window as any).__env || {};

export const environment = {
  production: true,
  apiJugador:env.API_JUGADOR_URL,
  apiGlobal: env.API_GLOBAL_URL,
  bingoHubUrl: env.BINGO_HUB_URL,
};