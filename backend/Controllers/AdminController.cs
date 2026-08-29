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
public class AdminController : ControllerBase
{
    private readonly BingoDbContext _context;
    private readonly IHubContext<BingoHub> _hub;

    public AdminController(
        BingoDbContext context,
        IHubContext<BingoHub> hub)
    {
        _context = context;
        _hub = hub;
    }


    // =========================================================
    // OBTENER TOKENS
    // =========================================================

    [HttpGet("obtener-tokens")]
    public async Task<IActionResult> ObtenerTokens()
    {
        try
        {
            var tokens = await _context.Tokens
                .Include(t => t.Jugador)
                .OrderBy(t => t.Id)
                .Select(t => new
                {
                    id = t.Id,
                    codigo = t.Codigo,

                    nombre = t.Jugador != null
                        ? t.Jugador.Nombre
                        : null,

                    apellido = t.Jugador != null
                        ? t.Jugador.Apellido
                        : null,

                    dni = t.Jugador != null
                        ? t.Jugador.Dni
                        : null
                })
                .ToListAsync();

            return Ok(new
            {
                success = true,
                data = tokens
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                success = false,
                message = "Error obteniendo los tokens.",
                error = ex.Message
            });
        }
    }


    // =========================================================
    // OBTENER JUGADORES
    // =========================================================

    [HttpGet("obtenerJugadores")]
    public async Task<IActionResult> ObtenerJugadores()
    {
        try
        {
            var jugadores = await _context.Jugadores
                .OrderBy(j => j.Apellido)
                .ThenBy(j => j.Nombre)
                .Select(j => new
                {
                    id = j.Id,
                    nombre = j.Nombre,
                    apellido = j.Apellido,
                    dni = j.Dni
                })
                .ToListAsync();

            return Ok(new
            {
                success = true,
                data = jugadores
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                success = false,
                message = "Error obteniendo los jugadores.",
                error = ex.Message
            });
        }
    }


    // =========================================================
    // CREAR JUGADOR
    // =========================================================

    [HttpPost("crearJugador")]
    public async Task<IActionResult> CrearJugador(
        [FromBody] CrearJugadorRequest request)
    {
        try
        {
            // -------------------------------------------------
            // VALIDACIONES
            // -------------------------------------------------

            if (string.IsNullOrWhiteSpace(request.Nombre))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "El nombre es obligatorio."
                });
            }

            if (string.IsNullOrWhiteSpace(request.Apellido))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "El apellido es obligatorio."
                });
            }

            if (string.IsNullOrWhiteSpace(request.Dni))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "El DNI es obligatorio."
                });
            }


            // -------------------------------------------------
            // VERIFICAR DNI
            // -------------------------------------------------

            var jugadorExistente = await _context.Jugadores
                .FirstOrDefaultAsync(j => j.Dni == request.Dni);

            if (jugadorExistente != null)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Ya existe un jugador con ese DNI."
                });
            }


            // -------------------------------------------------
            // CREAR JUGADOR
            // -------------------------------------------------

            var jugador = new Jugador
            {
                Nombre = request.Nombre.Trim(),
                Apellido = request.Apellido.Trim(),
                Dni = request.Dni.Trim(),

                Telefono = null,
                CorreoElectronico = null,
                Alias = null
            };


            _context.Jugadores.Add(jugador);

            await _context.SaveChangesAsync();


            // -------------------------------------------------
            // RESPUESTA
            // -------------------------------------------------

            return Ok(new
            {
                success = true,
                message = "Jugador creado correctamente.",
                data = new
                {
                    id = jugador.Id,
                    nombre = jugador.Nombre,
                    apellido = jugador.Apellido,
                    dni = jugador.Dni
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                success = false,
                message = "Error creando el jugador.",
                error = ex.Message
            });
        }
    }


    // =========================================================
    // ASOCIAR TOKENS A JUGADOR
    // =========================================================

    [HttpPost("asociarTokensJugador")]
    public async Task<IActionResult> AsociarTokensJugador(
        [FromBody] AsociarTokensJugadorRequest request)
    {
        try
        {
            // -------------------------------------------------
            // VALIDAR JUGADOR
            // -------------------------------------------------

            var jugador = await _context.Jugadores
                .FirstOrDefaultAsync(j => j.Id == request.JugadorId);

            if (jugador == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "El jugador no existe."
                });
            }


            // -------------------------------------------------
            // VALIDAR TOKENS
            // -------------------------------------------------

            if (request.Tokens == null ||
                request.Tokens.Count == 0)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "No se seleccionaron tokens."
                });
            }


            // -------------------------------------------------
            // OBTENER TOKENS
            // -------------------------------------------------

            var tokens = await _context.Tokens
                .Where(t => request.Tokens.Contains(t.Id))
                .ToListAsync();


            // -------------------------------------------------
            // VERIFICAR QUE EXISTAN TODOS
            // -------------------------------------------------

            var tokensEncontrados =
                tokens.Select(t => t.Id).ToHashSet();

            var tokensNoEncontrados =
                request.Tokens
                    .Where(id => !tokensEncontrados.Contains(id))
                    .ToList();

            if (tokensNoEncontrados.Count > 0)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Uno o más tokens no existen.",
                    tokensNoEncontrados
                });
            }


            // -------------------------------------------------
            // VERIFICAR TOKENS YA ASIGNADOS
            // -------------------------------------------------

            var tokensYaAsignados = tokens
                .Where(t => t.Jugador != null &&
                            t.Jugador.Id != jugador.Id)
                .Select(t => t.Id)
                .ToList();

            if (tokensYaAsignados.Count > 0)
            {
                return BadRequest(new
                {
                    success = false,
                    message =
                        "Uno o más tokens ya están asignados a otro jugador.",
                    tokensYaAsignados
                });
            }


            // -------------------------------------------------
            // ASIGNAR TOKENS
            // -------------------------------------------------

            foreach (var token in tokens)
            {
                token.Jugador = jugador;
            }


            await _context.SaveChangesAsync();


            // -------------------------------------------------
            // RESPUESTA
            // -------------------------------------------------

            return Ok(new
            {
                success = true,
                message = "Tokens asociados correctamente.",
                data = new
                {
                    jugadorId = jugador.Id,
                    tokens = tokens.Select(t => t.Id).ToList()
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                success = false,
                message = "Error asociando los tokens.",
                error = ex.Message
            });
        }
    }

    // =========================================================
    // DESASIGNAR TOKENS DE JUGADOR
    // =========================================================

    [HttpPost("desasignarTokensJugador")]
    public async Task<IActionResult> DesasignarTokensJugador(
    [FromBody] DesasignarTokensJugadorRequest request)
    {
        try
        {
            // -------------------------------------------------
            // VALIDAR TOKENS
            // -------------------------------------------------

            if (request.Tokens == null ||
                request.Tokens.Count == 0)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "No se seleccionaron tokens."
                });
            }


            // -------------------------------------------------
            // OBTENER TOKENS
            // -------------------------------------------------

            var tokens = await _context.Tokens
                .Where(t => request.Tokens.Contains(t.Id))
                .ToListAsync();


            // -------------------------------------------------
            // VERIFICAR QUE EXISTAN TODOS
            // -------------------------------------------------

            var tokensEncontrados = tokens
                .Select(t => t.Id)
                .ToHashSet();

            var tokensNoEncontrados = request.Tokens
                .Where(id => !tokensEncontrados.Contains(id))
                .ToList();

            if (tokensNoEncontrados.Count > 0)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Uno o más tokens no existen.",
                    tokensNoEncontrados
                });
            }


            // -------------------------------------------------
            // DESASIGNAR
            // -------------------------------------------------

            foreach (var token in tokens)
            {
                token.JugadorId = null;
                token.Jugador = null;
            }


            // -------------------------------------------------
            // GUARDAR
            // -------------------------------------------------

            var cambios = await _context.SaveChangesAsync();


            Console.WriteLine(
                $"Tokens desasignados: {tokens.Count}"
            );

            Console.WriteLine(
                $"Cambios guardados: {cambios}"
            );


            return Ok(new
            {
                success = true,
                message = "Tokens desasignados correctamente.",
                data = new
                {
                    tokens = tokens.Select(t => t.Id).ToList(),
                    cambiosGuardados = cambios
                }
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                $"ERROR DESASIGNANDO TOKENS: {ex}"
            );

            return StatusCode(500, new
            {
                success = false,
                message = "Error desasignando los tokens.",
                error = ex.Message
            });
        }
    }
}


// =============================================================
// REQUEST CREAR JUGADOR
// =============================================================

public class CrearJugadorRequest
{
    public string Nombre { get; set; } = string.Empty;

    public string Apellido { get; set; } = string.Empty;

    public string Dni { get; set; } = string.Empty;
}


// =============================================================
// REQUEST ASOCIAR TOKENS
// =============================================================

public class AsociarTokensJugadorRequest
{
    public int JugadorId { get; set; }

    public List<int> Tokens { get; set; } = new();
}

// =============================================================
// REQUEST DESASIGNAR TOKENS
// =============================================================

public class DesasignarTokensJugadorRequest
{
    public List<int> Tokens { get; set; } = new();
}