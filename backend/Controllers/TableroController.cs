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
    public async Task<ActionResult<List<Carton>>> obtenerCartonesPorJugada(int numeroJugada)
    {
        return await _context.Cartones.Include(c => c.Numeros)
                                      .Where(c => c.Jugada != null &&
                                             c.Jugada.NumeroJugada == numeroJugada)
                                      .ToListAsync();
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
    public async Task<ActionResult> GuardarNumeroSorteado(int numeroJugada, int numero)
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



}