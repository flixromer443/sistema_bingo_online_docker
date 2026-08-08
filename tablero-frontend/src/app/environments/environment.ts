const env = (window as any).__env || {};

export const environment = {
  production: false,
  apiTablero:env.API_TABLERO_URL,
  apiGlobal: env.API_GLOBAL_URL,
};