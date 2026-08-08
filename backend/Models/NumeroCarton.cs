using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Slamdunk.WebApi.Models
{
    public class NumeroCarton
    {
        public int Id { get; set; }
        public int Numero { get; set; }
        public bool Marcado { get; set; } 
        public int NLinea { get; set; }
        [JsonIgnore]
        public Carton Carton { get; set; }  
        public NumeroCarton()
        {
        }

        public NumeroCarton(int id, int numero, bool marcado, int nLinea)
        {
            Id = id;
            Numero = numero;
            Marcado = marcado;
            NLinea = nLinea;
        }
    }
}
