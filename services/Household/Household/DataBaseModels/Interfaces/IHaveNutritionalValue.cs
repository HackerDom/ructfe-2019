namespace Household.DataBaseModels.Interfaces
{
    internal interface IHaveNutritionalValue
    {
        double Protein { get; }
        double Fat { get; }
        double Carbohydrate { get; }
        double Calories { get; }
    }
}
