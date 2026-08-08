# Imagen base
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar Angular CLI
RUN npm install -g @angular/cli

# Instalar dependencias
#RUN npm install

# Copiar el resto del proyecto
#COPY . .

# Exponer puerto
#EXPOSE 4200

# Ejecutar Angular
#CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200"]



# ===========================
# Build Angular
# ===========================
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# ===========================
# Nginx
# ===========================
FROM nginx:alpine

RUN apk add --no-cache gettext

COPY --from=build /app/dist/slamdunk-fe/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY src/assets/env.template.js /usr/share/nginx/html/assets/env.template.js

CMD ["/bin/sh","-c","envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js && exec nginx -g 'daemon off;'"]