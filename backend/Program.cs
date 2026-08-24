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
var frontendTableroUrl = configuration["FRONTEND_TABLERO_URL"];

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

// Configuración inteligente de la Base de Datos (Soporta formato local y URLs de Render)
var connectionString = configuration.GetConnectionString("DefaultConnection");

if (!string.IsNullOrEmpty(connectionString) && (connectionString.StartsWith("postgres://") || connectionString.StartsWith("postgresql://")))
{
    var databaseUri = new Uri(connectionString);
    var userInfo = databaseUri.UserInfo.Split(':');

    // SOLUCIÓN: Si .NET devuelve -1 porque no reconoce el protocolo, le asignamos 5432
    var dbPort = databaseUri.Port == -1 ? 5432 : databaseUri.Port;

    connectionString = $"Host={databaseUri.Host};Port={dbPort};Database={databaseUri.LocalPath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};SSL Mode=Prefer;Trust Server Certificate=true";
}


// Configuración de Base de Datos
builder.Services.AddDbContext<BingoDbContext>(options =>
    options.UseNpgsql(connectionString));

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
logger.LogInformation("Connection string configurada correctamente");
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

// =======================================================================
// NUEVO: EJECUTAR MIGRACIONES AUTOMÁTICAS EN LA BASE DE DATOS DE RENDER
// =======================================================================
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<BingoDbContext>();

        logger.LogInformation("Verificando si existen migraciones pendientes...");
        if (context.Database.GetPendingMigrations().Any())
        {
            logger.LogInformation("Aplicando migraciones en la base de datos de Render...");
            context.Database.Migrate();
            logger.LogInformation("¡Migraciones aplicadas con éxito!");
        }
        else
        {
            logger.LogInformation("La base de datos ya está actualizada. No se requieren cambios.");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "ERROR FATAL: No se pudieron aplicar las migraciones al iniciar.");
    }
}
// =======================================================================

app.Run();
