using Data;
using Microsoft.AspNetCore.Mvc;
using Models;
using Microsoft.EntityFrameworkCore;
using iTextSharp.text;
using iTextSharp.text.pdf;
using System.IO;
using iText.Html2pdf;
using System.Text;

namespace Slamdunk.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly BingoDbContext _context;

    public UsersController(BingoDbContext context)
    {
        _context = context;
    }

    // Listar Usuario
    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        return await _context.Users.ToListAsync();
    }

    // Generar un Usuario
    [HttpPost]
    public async Task<IActionResult> AddUser(User Usuario)
    {
        _context.Users.Add(Usuario);
        await _context.SaveChangesAsync();

        return Ok(Usuario);
    }

    //Buscar la Usuario
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUsuario(int id)
    {
        var Usuario = await _context.Users.FindAsync(id);

        return Ok(Usuario);
    }

    // Pasar parametros del usuario por URL
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUsuario(User Usuario)
    {
        try
        {
            // Buscar al Usuario por su ID
            var usuarioExistente = await _context.Users.FindAsync(Usuario.Id);

            //validar que exista el usuario
            if (usuarioExistente == null)
            {
                return NotFound("Error");
            }

            // Actualizar los campos del usuario existente con los valores proporcionados
            usuarioExistente.Name = Usuario.Name;
            usuarioExistente.Age = Usuario.Age;

            // Guardar los cambios en la base de datos
            await _context.SaveChangesAsync();

            return Ok(); // Operación exitosa
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al actualizar la invitación: {ex.Message}");
        }
    }

    // Eliminar un usuario
    [HttpDelete("{id}")]
    public async Task<IActionResult> BorrarUsuario(int id)
    {
        try
        {
            // Buscar al Usuario por su ID
            var usuarioExistente = await _context.Users.FindAsync(id);

            if (usuarioExistente == null)
            {
                return NotFound(); // Usuario no encontrado
            }

            // Eliminar al usuario de la base de datos
            _context.Users.Remove(usuarioExistente);
            await _context.SaveChangesAsync();

            return Ok(); // Operación de eliminación exitosa
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al eliminar el usuario: {ex.Message}");
        }
    }

    // Listar Usuario pdf
    [HttpGet("pdf")]
    public async Task<ActionResult> GetPdf()
    {
        var Usuarios = await _context.Users.ToListAsync();
        string fileName = $"ListOfUsers.pdf";
        string directoryPath = Path.Combine(Directory.GetCurrentDirectory(), "archivos-pdf");
        string filePath = Path.Combine(directoryPath, fileName);

        // Crear la carpeta si no existe
        Directory.CreateDirectory(directoryPath);

        // Crear el contenido del PDF y guardarlo en disco
        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            Document doc = new Document();
            PdfWriter.GetInstance(doc, fileStream);
            doc.Open();
            doc.Add(new Paragraph("Detalle del Usuario"));
            foreach (var usuario in Usuarios)
            {
                doc.Add(new Paragraph($"Id Usuario: {usuario.Id}"));
                doc.Add(new Paragraph($"Nombre: {usuario.Name}, Edad: {usuario.Age}")); // Suponiendo que la clase User tiene propiedades Nombre y Edad
                doc.Add(new Paragraph($" "));
            }
            doc.Close();
        }

        // Devolver el archivo PDF como resultado
        return PhysicalFile(filePath, "application/pdf", fileName);
    }

    //Usuario pdf
    [HttpGet("pdf" + "{id}")]
    public async Task<ActionResult> GetPdf(int id)
    {
        var Usuario = await _context.Users.FindAsync(id);
        string fileName = $"Detalle-{Usuario.Name}.pdf";
        string directoryPath = Path.Combine(Directory.GetCurrentDirectory(), "archivos-pdf");
        string filePath = Path.Combine(directoryPath, fileName);

        // Crear la carpeta si no existe
        Directory.CreateDirectory(directoryPath);

        // Crear el contenido del PDF y guardarlo en disco
        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            Document doc = new Document();
            PdfWriter.GetInstance(doc, fileStream);
            doc.Open();
            doc.Add(new Paragraph("Detalle del Usuario"));
            doc.Add(new Paragraph($"Nombre: {Usuario.Name}"));
            doc.Add(new Paragraph($"Edad: {Usuario.Age}"));
            doc.Add(new Paragraph($"ID: {Usuario.Id}"));
            doc.Close();
        }

        // Devolver el archivo PDF como resultado
        return PhysicalFile(filePath, "application/pdf", fileName);
    }

    //PDF HTML
    [HttpGet("pdfHtml")]
    public async Task<ActionResult> GetPdfHtml()
    {
        //definimos el origen de la plantilla, la salida y los datos
        string origen = Path.Combine(Directory.GetCurrentDirectory(), "archivos-pdf/plantillas/plantillaTabla.html");
        string salida = Path.Combine(Directory.GetCurrentDirectory(), "archivos-pdf");
        var Usuarios = await _context.Users.ToListAsync();

        var pdfDest = Path.Combine(salida, "Tabla.pdf");

        // Leer el contenido HTML de la plantilla
        string htmlContent = await System.IO.File.ReadAllTextAsync(Path.Combine(origen));

        // Generar la tabla de usuarios en HTML
        StringBuilder usuariosTableHtml = new StringBuilder();
        foreach (var usuario in Usuarios)
        {
            usuariosTableHtml.AppendLine("<tr>");
            usuariosTableHtml.AppendLine($"<td>{usuario.Id}</td>");
            usuariosTableHtml.AppendLine($"<td>{usuario.Name}</td>");
            usuariosTableHtml.AppendLine($"<td>{usuario.Age}</td>");
            usuariosTableHtml.AppendLine("</tr>");
        }

        // Reemplazar el marcador de posición con el nombre del usuario
        htmlContent = htmlContent.Replace("{{usuarios_table}}", usuariosTableHtml.ToString());
        htmlContent = htmlContent.Replace("{{fecha}}", ($"{DateTime.Now.ToString("dd-MM-yyyy")}"));

        byte[] htmlBytes = Encoding.UTF8.GetBytes(htmlContent);

        // Crear un MemoryStream a partir de los bytes del HTML modificado
        using (MemoryStream htmlMemoryStream = new MemoryStream(htmlBytes))
        {
            // Convertir HTML a PDF
            using (FileStream pdfStream = new FileStream(pdfDest, FileMode.Create))
            {
                // Usar el MemoryStream para convertir el HTML modificado a PDF
                HtmlConverter.ConvertToPdf(htmlMemoryStream, pdfStream);
            }
        }
        // Retornar el archivo PDF generado
        byte[] pdfBytes = System.IO.File.ReadAllBytes(pdfDest);
        return File(pdfBytes, "application/pdf", $"{DateTime.Now.ToString("dd-MM")}-Tabla-usuarios.pdf");
    }

    //PDF HTML POR ID
    [HttpGet("pdfHtml/{id}")]
    public async Task<ActionResult> GetPdfHtml(int id)
    {
        var usuario = await _context.Users.FindAsync(id);

        if (usuario == null)
        {
            return NotFound(); // Si no se encuentra el usuario con el ID proporcionado
        }

        string fileName = $"Detalle-{usuario.Name}.pdf";
        string origen = Path.Combine(Directory.GetCurrentDirectory(), "archivos-pdf/plantillas/plantillaTabla.html");
        string salida = Path.Combine(Directory.GetCurrentDirectory(), "archivos-pdf");
        var pdfDest = Path.Combine(salida, fileName); // Usar el nombre de archivo generado para este usuario

        // Leer el contenido HTML de la plantilla
        string htmlContent = await System.IO.File.ReadAllTextAsync(Path.Combine(origen));

        // Generar la tabla de usuarios en HTML solo para este usuario
        StringBuilder usuarioTableHtml = new StringBuilder();
        usuarioTableHtml.AppendLine("<tr>");
        usuarioTableHtml.AppendLine($"<td>{usuario.Id}</td>");
        usuarioTableHtml.AppendLine($"<td>{usuario.Name}</td>");
        usuarioTableHtml.AppendLine($"<td>{usuario.Age}</td>");
        usuarioTableHtml.AppendLine("</tr>");

        // Reemplazar el marcador de posición con la tabla de usuario
        htmlContent = htmlContent.Replace("{{usuarios_table}}", usuarioTableHtml.ToString());
        htmlContent = htmlContent.Replace("{{fecha}}", DateTime.Now.ToString("dd-MM-yyyy"));

        byte[] htmlBytes = Encoding.UTF8.GetBytes(htmlContent);

        // Crear un MemoryStream a partir de los bytes del HTML modificado
        using (MemoryStream htmlMemoryStream = new MemoryStream(htmlBytes))
        {
            // Convertir HTML a PDF
            using (FileStream pdfStream = new FileStream(pdfDest, FileMode.Create))
            {
                // Usar el MemoryStream para convertir el HTML modificado a PDF
                HtmlConverter.ConvertToPdf(htmlMemoryStream, pdfStream);
            }
        }

        // Devolver el archivo PDF generado como resultado
        byte[] pdfBytes = System.IO.File.ReadAllBytes(pdfDest);
        return File(pdfBytes, "application/pdf", fileName);
    }

    //ejemplo pdf
    [HttpGet("PdfEjemplo")]
    public async Task<ActionResult> GetPdfEjemplo()
    {
        // Variables para definir el destino del PDF
        string fileName = "EJEMPLO.pdf";
        string directoryPath = Path.Combine(Directory.GetCurrentDirectory(), "archivos-pdf");
        string filePath = Path.Combine(directoryPath, fileName);

        // Crear la carpeta si no existe
        Directory.CreateDirectory(directoryPath);

        // Crear el contenido del PDF y guardarlo en disco
        Document doc = new Document();
        PdfWriter.GetInstance(doc, new FileStream(filePath, FileMode.Create));
        doc.Open();
        doc.Add(new Paragraph("Linea de prueba para el PDF"));
        doc.Close();

        // Devolver el archivo PDF como resultado
        return PhysicalFile(filePath, "application/pdf", fileName);
    }
}