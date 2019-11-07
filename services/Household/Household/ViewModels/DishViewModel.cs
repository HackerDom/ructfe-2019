namespace Household.ViewModels
{
    public class DishViewModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Image { get; set; }
        public double PortionWeight { get; set; }
        public IngredientViewModel[] Ingredients { get; set; }
        public double PortionProtein { get; set; }
        public double PortionFat { get; set; }
        public double PortionCarbohydrate { get; set; }
        public double PortionCalories { get; set; }
    }
}
