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
public class JugadorController : ControllerBase
{
    private readonly UserContext _context;
    private readonly IHubContext<BingoHub> _hub;

    public JugadorController(UserContext context, IHubContext<BingoHub> hub)
    {
        _context = context;
        _hub = hub;
    }


    [HttpGet("obtenerCartonesPorCodigo/{codigo}")]
    public async Task<ActionResult<List<Carton>>> obtenerCartonesPorCodigoVerficacion(string codigo)
    {
        Token token = await _context.Tokens.Include(t => t.Cartones)
                                           .Where(t => t.Codigo != null &&
                                                       t.Codigo == codigo)
                                           .FirstAsync();
        return token.Cartones;

    }

    [HttpGet("obtenerNumerosSorteadosPorJugada/{numeroJugada}")]
    public async Task<ActionResult<List<NumeroSorteado>>> obtenerNumerosSorteadosPorJugada(int numeroJugada)
    {
        return await _context.NumerosSorteados
            .Where(n => n.Jugada.NumeroJugada == numeroJugada)
            .ToListAsync();
    }
}