using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Slamdunk.WebApi.Models
{
    public class NumeroSorteado
    {
        public int Id { get; set; }
        public int Numero { get; set; }
        [JsonIgnore]
        public Jugada Jugada { get; set; }
        public NumeroSorteado()
        {
        }
        public NumeroSorteado(int id, Jugada jugada, int numero)
        {
            Id = id;
            Jugada = jugada;
            Numero = numero;
        }
    }
}
