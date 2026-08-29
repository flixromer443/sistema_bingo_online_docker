using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Slamdunk.WebApi.Models
{
    public class Token
    {
        public int Id { get; set; }
        public string Codigo { get; set; }
        public int? JugadorId { get; set; }
        public Jugador? Jugador { get; set; }
        public List<Carton> Cartones { get; set; }

        public Token()
        {
        }

        public Token(int id, string codigo, Jugador jugador, List<Carton> cartones)
        {
            Id = id;
            Codigo = codigo;
            Jugador = jugador;
            Cartones = cartones;
        }
    }
}
