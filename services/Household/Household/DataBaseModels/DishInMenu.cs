using Household.DataBaseModels.Interfaces;

namespace Household.DataBaseModels
{
    internal class DishInMenu : DataBaseItem
    {
        public int DishId { get; set; }
        public Dish Dish { get; set; }

        public int MenuId { get; set; }
        public Menu Menu { get; set; }
    }
}
