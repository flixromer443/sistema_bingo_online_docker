using System;

namespace Slamdunk.WebApi.Models
{
    public class Premio
    {
        public int Id { get; set; }
        public int JugadaId { get; set; }
        public Jugada Jugada { get; set; } = null!;
        public int? JugadorId { get; set; }
        public Jugador? Jugador { get; set; }
        public string Tipo { get; set; } = string.Empty;
        public decimal Valor { get; set; }
        public Premio()
        {
        }

        public Premio(int id, int jugadaId, Jugador? jugador, string tipo, decimal valor)
        {
            Id = id;
            JugadaId = jugadaId;
            Jugador = jugador;
            Tipo = tipo;
            Valor = valor;
        }
    }
}