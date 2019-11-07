namespace Household.DataBaseModels.Interfaces
{
    public interface IHaveNutritionalValue
    {
        double Protein { get; }
        double Fat { get; }
        double Carbohydrate { get; }
        double Calories { get; }
    }
}
