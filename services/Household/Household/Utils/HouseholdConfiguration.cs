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

        public string ConnectionString => configuration.GetConnectionString("DataBaseContext");
        public string DataBaseSystem => configuration.GetSection("DataBaseSystem").Value;
        public string SaveFilePath => configuration.GetSection("SaveFilePath").Value;
        public string KeyPath => configuration.GetSection("KeyPath").Value;
    }
}
