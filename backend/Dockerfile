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





# Use the official .NET SDK image as the base image
FROM mcr.microsoft.com/dotnet/sdk:8.0

WORKDIR /app

# 1. Copiar todo el código fuente de tu repositorio al contenedor
COPY . .

# 2. Instalar los paquetes necesarios (exactamente igual que tu original)
RUN dotnet add package Microsoft.EntityFrameworkCore.Design --version 8.0.10
RUN dotnet add package Microsoft.EntityFrameworkCore.Tools --version 8.0.10
RUN dotnet add package Microsoft.EntityFrameworkCore --version 8.0.10
RUN dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 8.0.10
RUN dotnet add package Swashbuckle.AspNetCore --version 6.6.2
RUN dotnet add package Microsoft.AspNetCore.SignalR
RUN dotnet add package itext7.pdfhtml
RUN dotnet add package itext7.bouncy-castle-adapter

RUN dotnet tool install --global dotnet-ef
ENV PATH="$PATH:/root/.dotnet/tools"

# Restaurar y construir tu proyecto real
RUN dotnet restore
RUN dotnet build

# Exponer el aplicación puerto
EXPOSE 5214

# Iniciar tu aplicación usando tu archivo binario real
ENTRYPOINT ["dotnet", "run", "--urls", "http://0.0.0.0:5214"]