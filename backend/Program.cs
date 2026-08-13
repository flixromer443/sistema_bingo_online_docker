using Data;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Slamdunk.WebApi.Hubs;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

// Add CORS policy to allow requests from your Angular app
var configuration = builder.Configuration;

var frontendAdminUrl = builder.Configuration["FRONTEND_ADMIN_URL"];
var frontendJugadorUrl = builder.Configuration["FRONTEND_JUGADOR_URL"];
var frontendTableroUrl = builder.Configuration["FRONTEND_TABLERO_URL"];


builder.Logging.ClearProviders();
builder.Logging.AddConsole();

var app = builder.Build();

var logger = app.Logger;

logger.LogInformation("======================================");
logger.LogInformation("INICIANDO BACKEND BINGO");
logger.LogInformation("======================================");

logger.LogInformation(
    "Environment: {Environment}",
    app.Environment.EnvironmentName
);

logger.LogInformation(
    "FRONTEND_ADMIN_URL: {FrontendAdminUrl}",
    frontendAdminUrl
);

logger.LogInformation(
    "FRONTEND_JUGADOR_URL: {FrontendJugadorUrl}",
    frontendJugadorUrl
);

logger.LogInformation(
    "FRONTEND_TABLERO_URL: {FrontendTableroUrl}",
    frontendTableroUrl
);

logger.LogInformation(
    "DefaultConnection configurada: {TieneConnectionString}",
    !string.IsNullOrWhiteSpace(
        configuration.GetConnectionString("DefaultConnection")
    )
);

logger.LogInformation("======================================");

builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularApp", policyBuilder =>
    {
        policyBuilder.AllowAnyOrigin()
                     .AllowAnyMethod()
                     .AllowAnyHeader();
        /*policyBuilder.WithOrigins(frontendAdminUrl, frontendJugadorUrl, frontendTableroUrl);
        policyBuilder.AllowAnyHeader();
        policyBuilder.AllowAnyMethod();
        policyBuilder.AllowCredentials();*/
    });
});


builder.Services.AddDbContext<BingoDbContext>(options =>
    options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.MapControllers();

app.UseCors("AngularApp");
app.MapHub<BingoHub>("/bingoHub");
app.Run();
