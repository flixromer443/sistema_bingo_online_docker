using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Slamdunk.WebApi.Models
{
    public class Ganador
    {
        public int Id { get; set; }
        public Jugada Jugada { get; set; }
        public Carton Carton { get; set; }
        public Premio Premio { get; set; }
        public Ganador()
        {
        }

        public Ganador(int id, Jugada jugada, Carton carton, Premio premio)
        {
            Id = id;
            Jugada = jugada;
            Carton = carton;
            Premio = premio;
        }
    }
}
