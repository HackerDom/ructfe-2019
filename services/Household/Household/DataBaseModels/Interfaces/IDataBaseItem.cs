using System;

namespace Household.DataBaseModels.Interfaces
{
    public interface IDataBaseItem
    {
        string CreatedBy { get; set; }
        string UpdatedBy { get; set; }
        DateTime CreatedDate { get; set; }
        DateTime UpdatedDate { get; set; }
    }
}