using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Household.ViewModels
{
    public class DishViewModel
    {
        public string Name { get; set; }
        public double Weight { get; set; }
        public IngredientViewModel[] Ingredients { get; set; }
        public double Protein { get; set; }
        public double Fat { get; set; }
        public double Carbohydrate { get; set; }
        public double Calories { get; set; }
    }
}