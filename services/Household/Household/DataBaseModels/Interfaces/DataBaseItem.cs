using System;

namespace Household.DataBaseModels.Interfaces
{
    abstract class DataBaseItem
    {
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
