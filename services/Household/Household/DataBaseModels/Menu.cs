using System;
using System.Collections.Generic;
using Household.DataBaseModels.Interfaces;

namespace Household.DataBaseModels
{
    internal class Menu : DataBaseItem
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public List<DishInMenu> DishesInMenu { get; set; }
    }
}
