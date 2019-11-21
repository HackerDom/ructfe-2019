﻿using System.Collections.Generic;
using System.Linq;
using Household.DataBaseModels.Interfaces;

namespace Household.DataBaseModels
{
    internal class Dish : DataBaseItem, IHaveNutritionalValue
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Image { get; set; }

        public double PortionWeight { get; set; }

        public List<Ingredient> Ingredients { get; set; }
        public List<DishInMenu> Menus { get; set; }

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