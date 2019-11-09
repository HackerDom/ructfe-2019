using System;
using System.Collections.Generic;
using Household.DataBaseModels.Interfaces;

namespace Household.DataBaseModels
{
    internal class Menu : IDataBaseItem
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public List<DishInMenu> DishesInMenu { get; set; }

        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
    }
}
