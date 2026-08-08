const env = (window as any).__env || {};

export const environment = {
  production: false,
  apiUsers:env.API_USERS_URL,
  apiGame: env.API_GAME_URL,
  apiAuth: env.API_AUTH_URL,
  apiAdmin: env.API_ADMIN_URL,
  apiGeoref: env.API_GEOREF_URL
};