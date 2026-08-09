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
public class GlobalController : ControllerBase
{
    private readonly BingoDbContext _context;
    private readonly IHubContext<BingoHub> _hub;

    public GlobalController(BingoDbContext context, IHubContext<BingoHub> hub)
    {
        _context = context;
        _hub = hub;
    }

    [HttpGet("obtenerFlagPorVariable/{variable}")]
    public async Task<ActionResult<List<Tbl1DtsVariables>>> obtenerFlagPorVariable(string variable)
    {
        return await _context.Tbl1DtsVariables.Where(c => c.Variable == variable).ToListAsync();
    }
}