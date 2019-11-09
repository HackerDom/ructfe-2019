using System;
using Household.DataBaseModels.Interfaces;

namespace Household.DataBaseModels
{
    internal class DishInMenu : IDataBaseItem
    {
        public int DishId { get; set; }
        public Dish Dish { get; set; }

        public int MenuId { get; set; }
        public Menu Menu { get; set; }

        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
    }
}
