namespace Household.ViewModels
{
    public class DishViewCook : DishView
    {
        public string Recipe { get; set; }
        public IngredientView[] Ingredients { get; set; }
    }
}
