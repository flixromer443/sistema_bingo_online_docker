using Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
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


builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularApp", policyBuilder =>
    {
        policyBuilder.WithOrigins(frontendAdminUrl, frontendJugadorUrl, frontendTableroUrl);
        policyBuilder.AllowAnyHeader();
        policyBuilder.AllowAnyMethod();
        policyBuilder.AllowCredentials();
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
