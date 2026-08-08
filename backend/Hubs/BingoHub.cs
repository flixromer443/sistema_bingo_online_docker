using Microsoft.AspNetCore.SignalR;

namespace Slamdunk.WebApi.Hubs
{
    public class BingoHub : Hub
    {
        public async Task UnirseAJugada(int numeroJugada)
        {
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                $"JUGADA_{numeroJugada}"
            );
        }

        public async Task SalirDeJugada(int numeroJugada)
        {
            await Groups.RemoveFromGroupAsync(
                Context.ConnectionId,
                $"JUGADA_{numeroJugada}"
            );
        }
    }
}
