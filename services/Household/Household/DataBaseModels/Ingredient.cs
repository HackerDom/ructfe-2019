using Household.DataBaseModels.Interfaces;

namespace Household.DataBaseModels
{
    internal class Ingredient : DataBaseItem, IHaveNutritionalValue
    {
        public double Weight { get; set; }

        public int ProductId { get; set; }
        public Product Product { get; set; }

        public int DishId { get; set; }
        public Dish Dish { get; set; }

        public double Fat => Product.Fat * Weight / 100;
        public double Protein => Product.Protein * Weight / 100;
        public double Carbohydrate => Product.Carbohydrate * Weight / 100;
        public double Calories => Product.Calories * Weight / 100;
    }
}
