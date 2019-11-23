using Household.DataBaseModels.Interfaces;

namespace Household.DataBaseModels
{
    internal class DishInOrder : DataBaseItem
    {
        public int DishId { get; set; }
        public Dish Dish { get; set; }

        public int OrderId { get; set; }
        public Order Order { get; set; }
    }
}
