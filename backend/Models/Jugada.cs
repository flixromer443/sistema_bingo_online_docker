using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Slamdunk.WebApi.Models
{
    public class Jugada
    {
        public int Id { get; set; }
        public int NumeroJugada { get; set; }
        public List<Carton> Cartones { get; set; }
        public List<Premio> Premios { get; set; }
        public List<Ganador>? Ganadores { get; set; }

        public Jugada()
        {
        }

        public Jugada(int id, int numeroJugada, List<Carton> cartones, List<Premio> premios, List<Ganador>? ganadores)
        {
            Id = id;
            NumeroJugada = numeroJugada;
            Cartones = cartones;
            Premios = premios;
            Ganadores = ganadores;
        }
    }
}
