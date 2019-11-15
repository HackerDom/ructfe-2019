using System.Collections.Generic;
using Household.DataBaseModels.Interfaces;

namespace Household.DataBaseModels
{
    internal class Product : DataBaseItem, IHaveNutritionalValue
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public double Protein { get; set; }
        public double Fat { get; set; }
        public double Carbohydrate { get; set; }
        public double Calories { get; set; }

        public List<Ingredient> Ingredients { get; set; }
    }
}
