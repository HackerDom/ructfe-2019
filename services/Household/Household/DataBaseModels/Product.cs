using Microsoft.EntityFrameworkCore.Scaffolding.Metadata;

namespace Household.DataBaseModels
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public double Protein { get; set; }
        public double Fat { get; set; }
        public double Carbohydrate { get; set; }
        public double Calories { get; set; }
    }
}