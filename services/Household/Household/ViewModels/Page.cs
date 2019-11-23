namespace Household.ViewModels
{
    public class Page<T>
    {
        public int Skip { get; set; }
        public int Take { get; set; }
        public int TotalCount { get; set; }
        public T[] Items { get; set; }
    }
}
