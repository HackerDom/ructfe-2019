using System.Collections.Generic;
using Household.DataBaseModels.Interfaces;

namespace Household.DataBaseModels
{
    internal class Order : DataBaseItem
    {
        public int Id { get; set; }
        public int MenuId { get; set; }
        public Menu Menu { get; set; }
        public List<DishInOrder> DishesInOrder { get; set; }
    }
}
