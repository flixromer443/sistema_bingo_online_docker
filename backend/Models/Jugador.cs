using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Slamdunk.WebApi.Models
{
    public class Jugador
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Dni   { get; set; }
        public string? Telefono { get; set; }//opcional
        public string? CorreoElectronico { get; set; }//opcional
        public string? Alias { get; set; } //opcional
        public List<Token>? Tokens { get; set; }

        public Jugador()
        {
            Tokens = new List<Token>();
        }

        public Jugador(int id, string nombre, string apellido, string dni, string telefono, string correoElectronico, string alias, List<Token> tokens)
        {
            Id = id;
            Nombre = nombre;
            Apellido = apellido;
            Dni = dni;
            Telefono = telefono;
            CorreoElectronico = correoElectronico;
            Alias = alias;
            Tokens = tokens;
        }
    }
}
