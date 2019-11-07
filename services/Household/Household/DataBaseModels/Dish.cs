using System;
using System.Collections.Generic;
using System.Linq;
using Household.DataBaseModels.Interfaces;

namespace Household.DataBaseModels
{
    internal class Dish : IDataBaseItem, IHaveNutritionalValue
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Image { get; set; }

        /// <summary>
        /// IN GRAMS!
        /// </summary>
        public double PortionWeight { get; set; }

        public List<Ingredient> Ingredients { get; set; }

        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }

        public double Protein => CalculatePortionValue(Ingredients.Sum(i => i.Protein));
        public double Fat => CalculatePortionValue(Ingredients.Sum(i => i.Fat));
        public double Carbohydrate => CalculatePortionValue(Ingredients.Sum(i => i.Carbohydrate));
        public double Calories => CalculatePortionValue(Ingredients.Sum(i => i.Calories));

        private double CalculatePortionValue(double totalValue)
        {
            var totalIngredientsWeight = Ingredients.Sum(i => i.Weight);
            var relativeValue = totalValue * 100 / totalIngredientsWeight;
            return relativeValue * PortionWeight / 100;
        }
    }
}
