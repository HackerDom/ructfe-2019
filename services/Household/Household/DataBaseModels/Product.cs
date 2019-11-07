using System;
using System.Collections.Generic;
using Household.DataBaseModels.Interfaces;

namespace Household.DataBaseModels
{
    internal class Product : IDataBaseItem, IHaveNutritionalValue
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public double Protein { get; set; }
        public double Fat { get; set; }
        public double Carbohydrate { get; set; }
        public double Calories { get; set; }

        public List<Ingredient> Ingredients { get; set; }

        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
    }
}
