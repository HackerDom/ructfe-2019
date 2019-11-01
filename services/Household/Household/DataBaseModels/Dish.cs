using System;
using Household.DataBaseModels;

namespace Household.Models
{
    public class Dish : IDataBaseItem
    {
        public string Name { get; set; }
        public double Weight { get; set; }
        public Ingredient[] Ingredients { get; set; }
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
    }
}