using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Household.ViewModels
{
    public abstract class DishView
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public double PortionWeight { get; set; }
        public double PortionProtein { get; set; }
        public double PortionFat { get; set; }
        public double PortionCarbohydrate { get; set; }
        public double PortionCalories { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
