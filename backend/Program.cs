using Data;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Slamdunk.WebApi.Hubs;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurar Servicios y Dependencias PRIMERO
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

var configuration = builder.Configuration;

var frontendAdminUrl = configuration["FRONTEND_ADMIN_URL"];
var frontendJugadorUrl = configuration["FRONTEND_JUGADOR_URL"];
//var frontendTableroUrl = configuration["FRONTEND_TABLERO_URL"];
var frontendTableroUrl = "https://sistema-bingo-online-docker-3.onrender.com";

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// Configuración de CORS (¡Antes de builder.Build()!)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularApp", policyBuilder =>
    {
        policyBuilder.WithOrigins(
            frontendAdminUrl ?? "",
            frontendJugadorUrl ?? "",
            frontendTableroUrl ?? ""
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

// Configuración de Base de Datos
builder.Services.AddDbContext<BingoDbContext>(options =>
    options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

// 2. Construir la aplicación UNA SOLA VEZ
var app = builder.Build();

// 3. Registrar Logs de inicio
var logger = app.Logger;
logger.LogInformation("======================================");
logger.LogInformation("INICIANDO BACKEND BINGO");
logger.LogInformation("======================================");
logger.LogInformation("Environment: {Environment}", app.Environment.EnvironmentName);
logger.LogInformation("FRONTEND_ADMIN_URL: {FrontendAdminUrl}", frontendAdminUrl);
logger.LogInformation("FRONTEND_JUGADOR_URL: {FrontendJugadorUrl}", frontendJugadorUrl);
logger.LogInformation("FRONTEND_TABLERO_URL: {FrontendTableroUrl}", frontendTableroUrl);
logger.LogInformation("DefaultConnection configurada: {TieneConnectionString}", !string.IsNullOrWhiteSpace(configuration.GetConnectionString("DefaultConnection")));
logger.LogInformation("======================================");

// 4. Configurar el Pipeline HTTP (¡El orden de los Use... importa muchísimo!)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORS DEBE IR ANTES de MapControllers y MapHub
app.UseCors("AngularApp");

app.MapControllers();
app.MapHub<BingoHub>("/bingoHub");

app.Run();