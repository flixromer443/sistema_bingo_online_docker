using Data;
using iText.Commons.Actions.Contexts;
using iText.Html2pdf;
using iTextSharp.text;
using iTextSharp.text.pdf;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Models;
using Slamdunk.WebApi.Hubs;
using Slamdunk.WebApi.Models;
using System.IO;
using System.Text;

namespace Slamdunk.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TableroController : ControllerBase
{
    private readonly BingoDbContext _context;
    private readonly IHubContext<BingoHub> _hub;

    public TableroController(BingoDbContext context, IHubContext<BingoHub> hub)
    {
        _context = context;
        _hub = hub;
    }

    [HttpGet("obtenerCartonesPorJugada/{numeroJugada}")]
    public async Task<IActionResult> ObtenerCartonesPorJugada(int numeroJugada)
    {
        var cartones = await _context.Cartones
            .Where(c =>
                c.Jugada != null &&
                c.Jugada.NumeroJugada == numeroJugada &&
                c.Token != null &&
                c.Token.Jugador != null
            )
            .Select(c => new
            {
                id = c.Id,
                numeroJugada = c.Jugada!.NumeroJugada,
                nombre = c.Token!.Jugador!.Nombre,       // <--- Agregado para el nombre
                apellido = c.Token!.Jugador!.Apellido,   // <--- Agregado para el apellido
                jugadorId = c.Token!.Jugador!.Id,        // <--- Agregado para asociar el premio
                numeros = c.Numeros
                    .Select(n => new
                    {
                        numero = n.Numero,
                        nLinea = n.NLinea
                    })
                    .ToList()
            })
            .ToListAsync();

        return Ok(cartones);
    }

    // --- NUEVO ENDPOINT PARA ASOCIAR EL PREMIO AL JUGADOR ---
    [HttpPut("actualizarGanadorPremio")]
    public async Task<IActionResult> ActualizarGanadorPremio([FromQuery] int premioId, [FromQuery] int jugadorId)
    {
        var premio = await _context.Premios.FindAsync(premioId);
        if (premio == null)
        {
            return NotFound("El premio no existe.");
        }

        var jugador = await _context.Jugadores.FindAsync(jugadorId);
        if (jugador == null)
        {
            return NotFound("El jugador no existe.");
        }

        // Asignamos la relación (según tu modelo Jugador <-> Premio)
        premio.JugadorId = jugadorId; // Asegúrate de tener la propiedad JugadorId o la entidad Jugador en tu modelo Premio

        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Premio actualizado con éxito" });
    }

    [HttpGet("obtenerFlagPorVariable/{variable}")]
    public async Task<ActionResult<List<Tbl1DtsVariables>>> obtenerFlagPorVariable(string variable)
    {
        return await _context.Tbl1DtsVariables.Where(c => c.Variable == variable).ToListAsync();
    }


    [HttpGet("obtenerNumerosSorteadosPorJugada/{numeroJugada}")]
    public async Task<ActionResult<List<NumeroSorteado>>> obtenerNumerosSorteadosPorJugada(int numeroJugada)
    {
        return await _context.NumerosSorteados.Where(n => n.Jugada.NumeroJugada == numeroJugada).ToListAsync();
    }


    [HttpPost("guardarNumeroSorteado")]
    public async Task<ActionResult> GuardarNumeroSorteado([FromQuery] int numeroJugada, [FromQuery] int numero)
    {
        var jugada = await _context.Jugadas
            .FirstOrDefaultAsync(
                j => j.NumeroJugada == numeroJugada
            );

        if (jugada == null)
        {
            return NotFound("La jugada no existe.");
        }

        var yaExiste = await _context.NumerosSorteados
            .AnyAsync(n =>
                n.Jugada.Id == jugada.Id &&
                n.Numero == numero
            );

        if (yaExiste)
        {
            return BadRequest(
                "El número ya fue sorteado en esta jugada."
            );
        }

        var numeroSorteado = new NumeroSorteado
        {
            Numero = numero,
            Jugada = jugada
        };

        _context.NumerosSorteados.Add(numeroSorteado);

        await _context.SaveChangesAsync();

        await _hub.Clients
            .Group($"JUGADA_{numeroJugada}")
            .SendAsync(
                "NuevaBolilla",
                numero
            );
        await _hub.Clients
            .All
            .SendAsync(
                "numerosorteado",
                numero,
                numeroJugada
            );

        return Ok(numeroSorteado);
    }

    // --- NUEVO ENDPOINT PARA NOTIFICAR LÍNEA O BINGO POR SIGNALR ---
    [HttpPost("notificarPremio")]
    public async Task<IActionResult> NotificarPremio([FromQuery] int numeroJugada, [FromQuery] string tipoPremio, [FromQuery] int cartonId)
    {
        var jugada = await _context.Jugadas.FirstOrDefaultAsync(j => j.NumeroJugada == numeroJugada);
        if (jugada == null)
        {
            return NotFound("La jugada no existe.");
        }

        // Envía el evento al grupo incluyendo el cartonId específico
        await _hub.Clients
            .Group($"JUGADA_{numeroJugada}")
            .SendAsync("PremioActualizado", new
            {
                tipoPremio = tipoPremio,
                numeroJugada = numeroJugada,
                cartonId = cartonId // <-- Enviamos el ID del cartón
            });

        return Ok(new { mensaje = $"Notificación de {tipoPremio} para el cartón {cartonId} enviada correctamente." });
    }
}