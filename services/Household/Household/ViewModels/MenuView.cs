using System;
using System.Collections.Generic;

namespace Household.ViewModels
{
    public class MenuView
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public List<int> DishIds { get; set; }
    }
}
