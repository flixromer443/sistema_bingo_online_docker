using Microsoft.AspNetCore.SignalR;

namespace Slamdunk.WebApi.Hubs;

public class BingoHub : Hub
{
    // =========================================================
    // UNIR CLIENTE A UNA JUGADA
    // =========================================================

    public async Task UnirseAJugada(int numeroJugada)
    {
        if (numeroJugada <= 0)
            return;

        string grupo = $"JUGADA_{numeroJugada}";

        await Groups.AddToGroupAsync(
            Context.ConnectionId,
            grupo
        );

        Console.WriteLine(
            $"Cliente {Context.ConnectionId} unido al grupo {grupo}"
        );
    }


    // =========================================================
    // SALIR DE UNA JUGADA
    // =========================================================

    public async Task SalirDeJugada(int numeroJugada)
    {
        if (numeroJugada <= 0)
            return;

        string grupo = $"JUGADA_{numeroJugada}";

        await Groups.RemoveFromGroupAsync(
            Context.ConnectionId,
            grupo
        );

        Console.WriteLine(
            $"Cliente {Context.ConnectionId} salió del grupo {grupo}"
        );
    }


    // =========================================================
    // CONEXIÓN
    // =========================================================

    public override async Task OnConnectedAsync()
    {
        Console.WriteLine(
            $"SignalR conectado: {Context.ConnectionId}"
        );

        await base.OnConnectedAsync();
    }


    // =========================================================
    // DESCONEXIÓN
    // =========================================================

    public override async Task OnDisconnectedAsync(
        Exception? exception)
    {
        Console.WriteLine(
            $"SignalR desconectado: {Context.ConnectionId}"
        );

        if (exception != null)
        {
            Console.WriteLine(
                $"Motivo: {exception.Message}"
            );
        }

        await base.OnDisconnectedAsync(exception);
    }
}