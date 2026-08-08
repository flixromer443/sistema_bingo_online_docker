using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Slamdunk.WebApi.Models
{
    public class Tbl1DtsVariables
    {
        public int Id { get; set; }
        public string Variable { get; set; }
        public string Valor { get; set; }

        public Tbl1DtsVariables()
        {
        }

        public Tbl1DtsVariables(int id, string variable, string valor)
        {
            Id = id;
            Variable = variable;
            Valor = valor;
        }
    }
}
