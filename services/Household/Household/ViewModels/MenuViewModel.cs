using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Household.DataBaseModels;

namespace Household.ViewModels
{
    public class MenuViewModel
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public List<int> DishIds { get; set; }
    }
}
