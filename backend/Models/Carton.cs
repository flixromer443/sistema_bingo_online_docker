using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Slamdunk.WebApi.Models
{
    public class Carton
    {
        public int Id { get; set; }
        public Jugada? Jugada { get; set; }
        public Token? Token { get; set; }
        public List<NumeroCarton> Numeros { get; set; }
        public Carton()
        {
        }

        public Carton(int id, Jugada jugada, Token token, List<NumeroCarton> numeros)
        {
            Id = id;
            Jugada = jugada;
            Token = token;
            Numeros = numeros;
        }
    }
}
