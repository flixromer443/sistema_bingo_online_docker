using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Slamdunk.WebApi.Models
{
    public class Premio
    {
        public int Id { get; set; }
        public Jugada Jugada{ get; set; }
        public int? JugadorId { get; set; }
        public Jugador? Jugador { get; set; } //ganador
        public decimal Valor { get; set; }
        public Premio()
        {
        }

        public Premio(int id, Jugada jugada, Jugador? jugador, decimal valor)
        {
            Id = id;
            Jugada = jugada;
            Jugador = jugador;
            Valor = valor;
        }
    }
}
