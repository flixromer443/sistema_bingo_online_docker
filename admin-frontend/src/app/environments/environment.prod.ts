const env = (window as any).__env || {};

export const environment = {
  production: true,
  apiAdmin:env.API_ADMIN_URL,
  apiGlobal: env.API_GLOBAL_URL,
};