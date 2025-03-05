# Usar una imagen base de Node.js
FROM node:20.18
# Establecer el directorio de trabajo en el contenedor
WORKDIR /app
# Copiar package.json y package-lock.json (si existe) al contenedor
COPY package*.json ./
# Instalar las dependencias del proyecto
RUN npm install
# Copiar todos los archivos del proyecto al contenedor
COPY . .
# Ejecutar el script start:dev al iniciar el contenedor
ENTRYPOINT ["./startup.sh"]