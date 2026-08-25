using Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Models;
using Slamdunk.WebApi.Hubs;
using Slamdunk.WebApi.Models;

namespace Slamdunk.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JugadorController : ControllerBase
{
    private readonly BingoDbContext _context;
    private readonly IHubContext<BingoHub> _hub;

    public JugadorController(
        BingoDbContext context,
        IHubContext<BingoHub> hub)
    {
        _context = context;
        _hub = hub;
    }


    // =========================================================
    // VALIDAR CÓDIGO
    // =========================================================

    [HttpPost("validar-codigo")]
    public async Task<IActionResult> ValidarCodigo(
        [FromBody] ValidarCodigoRequest request)
    {
        // -----------------------------------------------------
        // Validar código
        // -----------------------------------------------------

        if (string.IsNullOrWhiteSpace(request.Codigo))
        {
            return BadRequest(new
            {
                success = false,
                message = "El código es obligatorio."
            });
        }


        // -----------------------------------------------------
        // CÓDIGO DE PRUEBA
        // -----------------------------------------------------

        /*if (request.Codigo != "111111")
        {
            return BadRequest(new
            {
                success = false,
                message = "El código ingresado no es válido."
            });
        }*/


        // -----------------------------------------------------
        // OBTENER 6 CARTONES ALEATORIOS
        // -----------------------------------------------------

        var cartones = await _context.Cartones
            .Include(c => c.Jugada)
            .Include(c => c.Numeros)
            //.OrderBy(c => Guid.NewGuid())
            //.Take(6)

            .Where(c => c.Token.Codigo == request.Codigo)
            .Select(c => new
            {
                id = c.Id,

                numeroJugada = c.Jugada != null
                    ? c.Jugada.NumeroJugada
                    : 0,

                numeros = c.Numeros
                    .Select(n => new
                    {
                        numero = n.Numero,
                        nLinea = n.NLinea
                    })
                    .ToList()
            })
            .ToListAsync();


        // -----------------------------------------------------
        // VALIDAR CARTONES
        // -----------------------------------------------------

        if (cartones.Count == 0)
        {
            return NotFound(new
            {
                success = false,
                message = "No hay cartones disponibles."
            });
        }


        // -----------------------------------------------------
        // RESPUESTA
        // -----------------------------------------------------

        return Ok(new
        {
            success = true,

            message = "Código verificado correctamente.",

            data = new
            {
                cartones
            }
        });
    }


    // =========================================================
    // OBTENER NÚMEROS SORTEADOS DE UNA JUGADA
    // =========================================================

    [HttpGet("obtenerNumerosSorteadosPorJugada/{numeroJugada}")]
    public async Task<IActionResult>ObtenerNumerosSorteadosPorJugada(int numeroJugada)
    {
        var numeros = await _context.NumerosSorteados

            .Include(n => n.Jugada)

            .Where(n =>
                n.Jugada != null &&
                n.Jugada.NumeroJugada == numeroJugada)

            .OrderBy(n => n.Id)

            .Select(n => new
            {
                numero = n.Numero
            })

            .ToListAsync();

        return Ok(numeros);
    }


    // =========================================================
    // REENVIAR CÓDIGO
    // =========================================================

    [HttpPost("reenviar-codigo")]
    public async Task<IActionResult> ReenviarCodigo(
        [FromBody] ReenviarCodigoRequest request)
    {
        if (request.IdUsuario <= 0)
        {
            return BadRequest(new
            {
                success = false,
                message = "El usuario no es válido."
            });
        }


        var jugador = await _context.Jugadores
            .Include(j => j.Tokens)
            .FirstOrDefaultAsync(j =>
                j.Id == request.IdUsuario);


        if (jugador == null)
        {
            return NotFound(new
            {
                success = false,
                message = "El jugador no existe."
            });
        }


        var token = jugador.Tokens?
            .FirstOrDefault();


        if (token == null)
        {
            return NotFound(new
            {
                success = false,
                message =
                    "No existe un código de verificación para este jugador."
            });
        }


        // =====================================================
        // FUTURO:
        // Generar nuevo código y enviarlo.
        // =====================================================

        return Ok(new
        {
            success = true,
            message = "Código reenviado correctamente."
        });
    }


   
}


// =============================================================
// REQUESTS
// =============================================================

public class ValidarCodigoRequest
{
    public string Codigo { get; set; } = string.Empty;
}


public class ReenviarCodigoRequest
{
    public int IdUsuario { get; set; }
}