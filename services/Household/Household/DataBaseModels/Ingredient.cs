using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Household.DataBaseModels
{
    public class Ingredient
    {
        public Product Product { get; set; }

        public double Weight { get; set; }
    }
}