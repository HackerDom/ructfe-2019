using Microsoft.Extensions.Configuration;

namespace Household.Utils
{
    public class HouseholdConfiguration
    {
        private readonly IConfiguration configuration;

        public HouseholdConfiguration(IConfiguration configuration)
        {
            this.configuration = configuration;
        }

        public string SaveFilePath => configuration.GetSection("SaveFilePath").Value;
    }
}
