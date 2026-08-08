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
        public decimal Valor { get; set; }
        public Premio()
        {
        }

        public Premio(int id, Jugada jugada, decimal valor)
        {
            Id = id;
            Jugada = jugada;
            Valor = valor;
        }
    }
}
