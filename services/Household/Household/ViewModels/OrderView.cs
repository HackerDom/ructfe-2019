using System;
using System.Collections.Generic;

namespace Household.ViewModels
{
    public class OrderView
    {
        public int Id { get; set; }
        public int MenuId { get; set; }
        public List<int> DishIds { get; set; }
        public DateTime Created { get; set; }
    }
}
