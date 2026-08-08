const env = (window as any).__env || {};

export const environment = {
  production: true,
  apiTablero:env.API_TABLERO_URL,
  apiGlobal: env.API_GLOBAL_URL,
};