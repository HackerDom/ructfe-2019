using System;
using System.Collections.Generic;

namespace Household.ViewModels
{
    public class OrderView
    {
        public int Id { get; set; }
        public int MenuId { get; set; }
        public int[] DishIds { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
