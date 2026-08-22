# Use the official .NET SDK image as the base image
#FROM mcr.microsoft.com/dotnet/sdk:8.0

#WORKDIR /app

# Create a new .NET Web API project
#RUN dotnet new webapi -n sistema_bingo_online

# Change to the newly created project directory
#WORKDIR /app/sistema_bingo_online


# Install required packages (compatible with .NET 8)
#RUN dotnet add package Microsoft.EntityFrameworkCore.Design --version 8.0.10
#RUN dotnet add package Microsoft.EntityFrameworkCore.Tools --version 8.0.10
#RUN dotnet add package Microsoft.EntityFrameworkCore --version 8.0.10
#RUN dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 8.0.10
#RUN dotnet add package Swashbuckle.AspNetCore --version 6.6.2
#RUN dotnet add package Microsoft.AspNetCore.SignalR
#RUN dotnet add package itext7.pdfhtml
#RUN dotnet add package itext7.bouncy-castle-adapter

#RUN dotnet tool install --global dotnet-ef
#ENV PATH="$PATH:/root/.dotnet/tools"

# Restore packages
#RUN dotnet restore

# Build the application
#RUN dotnet build

# Expose the application port
#EXPOSE 5214

# Start the application
#ENTRYPOINT ["dotnet", "run", "--urls", "http://0.0.0.0:5214"]





# 1. Usar la imagen del SDK para compilar
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar el archivo .csproj y restaurar dependencias
COPY ["sistema_bingo_online.csproj", "./"]
RUN dotnet restore

# Copiar todo el resto del código fuente
COPY . .
RUN dotnet publish -c Release -o /app/publish

# 2. Usar la imagen runtime para ejecutar la aplicación (más ligera y segura)
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

# Exponer el puerto que usa Render
EXPOSE 5214

# Iniciar la aplicación
ENTRYPOINT ["dotnet", "sistema_bingo_online.dll", "--urls", "http://0.0.0.0:5214"]