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
                .OrderBy(t => t.Id)
                .Select(t => new
                {
                    id = t.Id,

                    codigo = t.Codigo,

                    // IMPORTANTE:
                    // Devolvemos el ID del jugador
                    jugadorId = t.JugadorId,

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

            if (request == null)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "La información del jugador es obligatoria."
                });
            }


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
            // NORMALIZAR DATOS
            // -------------------------------------------------

            var nombre =
                request.Nombre.Trim();

            var apellido =
                request.Apellido.Trim();

            var dni =
                request.Dni.Trim();


            // -------------------------------------------------
            // VERIFICAR DNI
            // -------------------------------------------------

            var jugadorExistente =
                await _context.Jugadores
                    .FirstOrDefaultAsync(
                        j => j.Dni == dni
                    );


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
                Nombre = nombre,

                Apellido = apellido,

                Dni = dni,

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
    // ELIMINAR JUGADOR
    // =========================================================

    [HttpDelete("eliminarJugador/{jugadorId:int}")]
    public async Task<IActionResult> EliminarJugador(
        int jugadorId)
    {
        using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            // -------------------------------------------------
            // VALIDAR ID
            // -------------------------------------------------

            if (jugadorId <= 0)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "El ID del jugador no es válido."
                });
            }


            // -------------------------------------------------
            // BUSCAR JUGADOR
            // -------------------------------------------------

            var jugador =
                await _context.Jugadores
                    .FirstOrDefaultAsync(
                        j => j.Id == jugadorId
                    );


            if (jugador == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "El jugador no existe."
                });
            }


            // -------------------------------------------------
            // OBTENER TOKENS DEL JUGADOR
            // -------------------------------------------------

            var tokensJugador =
                await _context.Tokens
                    .Where(t => t.JugadorId == jugadorId)
                    .ToListAsync();


            // -------------------------------------------------
            // DESASIGNAR TOKENS
            // -------------------------------------------------

            foreach (var token in tokensJugador)
            {
                token.JugadorId = null;

                token.Jugador = null;
            }


            // -------------------------------------------------
            // ELIMINAR JUGADOR
            // -------------------------------------------------

            _context.Jugadores.Remove(jugador);


            // -------------------------------------------------
            // GUARDAR CAMBIOS
            // -------------------------------------------------

            var cambios =
                await _context.SaveChangesAsync();


            // -------------------------------------------------
            // CONFIRMAR TRANSACCIÓN
            // -------------------------------------------------

            await transaction.CommitAsync();


            Console.WriteLine(
                $"Jugador eliminado: {jugador.Id} - " +
                $"{jugador.Nombre} {jugador.Apellido}"
            );

            Console.WriteLine(
                $"Tokens desasignados: {tokensJugador.Count}"
            );

            Console.WriteLine(
                $"Cambios guardados: {cambios}"
            );


            // -------------------------------------------------
            // RESPUESTA
            // -------------------------------------------------

            return Ok(new
            {
                success = true,

                message =
                    "Jugador eliminado correctamente.",

                data = new
                {
                    jugadorId = jugadorId,

                    nombre = jugador.Nombre,

                    apellido = jugador.Apellido,

                    tokensDesasignados =
                        tokensJugador
                            .Select(t => t.Id)
                            .ToList(),

                    cantidadTokensDesasignados =
                        tokensJugador.Count,

                    cambiosGuardados =
                        cambios
                }
            });
        }
        catch (Exception ex)
        {
            // -------------------------------------------------
            // ROLLBACK
            // -------------------------------------------------

            await transaction.RollbackAsync();


            Console.WriteLine(
                $"ERROR ELIMINANDO JUGADOR: {ex}"
            );


            return StatusCode(500, new
            {
                success = false,

                message =
                    "Error eliminando el jugador.",

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
            // VALIDAR REQUEST
            // -------------------------------------------------

            if (request == null)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "La información es obligatoria."
                });
            }


            // -------------------------------------------------
            // VALIDAR JUGADOR
            // -------------------------------------------------

            var jugador =
                await _context.Jugadores
                    .FirstOrDefaultAsync(
                        j => j.Id == request.JugadorId
                    );


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

            if (
                request.Tokens == null ||
                request.Tokens.Count == 0
            )
            {
                return BadRequest(new
                {
                    success = false,
                    message = "No se seleccionaron tokens."
                });
            }


            // -------------------------------------------------
            // ELIMINAR IDs DUPLICADOS
            // -------------------------------------------------

            var idsTokens =
                request.Tokens
                    .Distinct()
                    .ToList();


            // -------------------------------------------------
            // OBTENER TOKENS
            // -------------------------------------------------

            var tokens =
                await _context.Tokens
                    .Where(
                        t => idsTokens.Contains(t.Id)
                    )
                    .ToListAsync();


            // -------------------------------------------------
            // VERIFICAR EXISTENCIA
            // -------------------------------------------------

            var tokensEncontrados =
                tokens
                    .Select(t => t.Id)
                    .ToHashSet();


            var tokensNoEncontrados =
                idsTokens
                    .Where(
                        id =>
                            !tokensEncontrados.Contains(id)
                    )
                    .ToList();


            if (tokensNoEncontrados.Count > 0)
            {
                return BadRequest(new
                {
                    success = false,

                    message =
                        "Uno o más tokens no existen.",

                    tokensNoEncontrados
                });
            }


            // -------------------------------------------------
            // VERIFICAR TOKENS YA ASIGNADOS
            // -------------------------------------------------

            var tokensYaAsignados =
                tokens
                    .Where(
                        t =>
                            t.JugadorId.HasValue &&
                            t.JugadorId.Value != jugador.Id
                    )
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
                token.JugadorId =
                    jugador.Id;
            }


            // -------------------------------------------------
            // GUARDAR
            // -------------------------------------------------

            await _context.SaveChangesAsync();


            // -------------------------------------------------
            // RESPUESTA
            // -------------------------------------------------

            return Ok(new
            {
                success = true,

                message =
                    "Tokens asociados correctamente.",

                data = new
                {
                    jugadorId =
                        jugador.Id,

                    tokens =
                        tokens
                            .Select(t => t.Id)
                            .ToList()
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                success = false,

                message =
                    "Error asociando los tokens.",

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

            if (
                request == null ||
                request.Tokens == null ||
                request.Tokens.Count == 0
            )
            {
                return BadRequest(new
                {
                    success = false,
                    message = "No se seleccionaron tokens."
                });
            }


            // -------------------------------------------------
            // ELIMINAR DUPLICADOS
            // -------------------------------------------------

            var idsTokens =
                request.Tokens
                    .Distinct()
                    .ToList();


            // -------------------------------------------------
            // OBTENER TOKENS
            // -------------------------------------------------

            var tokens =
                await _context.Tokens
                    .Where(
                        t => idsTokens.Contains(t.Id)
                    )
                    .ToListAsync();


            // -------------------------------------------------
            // VERIFICAR EXISTENCIA
            // -------------------------------------------------

            var tokensEncontrados =
                tokens
                    .Select(t => t.Id)
                    .ToHashSet();


            var tokensNoEncontrados =
                idsTokens
                    .Where(
                        id =>
                            !tokensEncontrados.Contains(id)
                    )
                    .ToList();


            if (tokensNoEncontrados.Count > 0)
            {
                return BadRequest(new
                {
                    success = false,

                    message =
                        "Uno o más tokens no existen.",

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

            var cambios =
                await _context.SaveChangesAsync();


            Console.WriteLine(
                $"Tokens desasignados: {tokens.Count}"
            );

            Console.WriteLine(
                $"Cambios guardados: {cambios}"
            );


            // -------------------------------------------------
            // RESPUESTA
            // -------------------------------------------------

            return Ok(new
            {
                success = true,

                message =
                    "Tokens desasignados correctamente.",

                data = new
                {
                    tokens =
                        tokens
                            .Select(t => t.Id)
                            .ToList(),

                    cambiosGuardados =
                        cambios
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

                message =
                    "Error desasignando los tokens.",

                error = ex.Message
            });
        }
    }

    // =========================================================
    // REINICIAR SORTEO
    // =========================================================

    [HttpPost("reiniciar-sorteo")]
    public async Task<IActionResult> ReiniciarSorteo()
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // -------------------------------------------------
            // 1. VACIAR LA TABLA USANDO ENTITY FRAMEWORK (Sin SQL crudo)
            // -------------------------------------------------
            var todosLosSorteados = await _context.NumerosSorteados.ToListAsync();
            _context.NumerosSorteados.RemoveRange(todosLosSorteados);

            // -------------------------------------------------
            // 2. DESASOCIAR TODOS LOS TOKENS
            // -------------------------------------------------
            var tokensAsignados = await _context.Tokens
                .Where(t => t.JugadorId != null)
                .ToListAsync();

            foreach (var token in tokensAsignados)
            {
                token.JugadorId = null;
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new
            {
                success = true,
                message = "Sorteo reiniciado correctamente.",
                tokensDesasociados = tokensAsignados.Count
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new
            {
                success = false,
                message = "Error al reiniciar el sorteo.",
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
