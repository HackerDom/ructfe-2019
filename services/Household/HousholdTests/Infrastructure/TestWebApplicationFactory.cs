using System.IO;
using Household;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace HouseholdTests.Infrastructure
{
    internal class TestWebApplicationFactory : WebApplicationFactory<Startup>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            // Add test server configuration
            var configPath = Path.Combine(Directory.GetCurrentDirectory(), "test_appsettings.json");
            builder.ConfigureAppConfiguration((context, conf) => { conf.AddJsonFile(configPath); });

            base.ConfigureWebHost(builder);
        }
    }
}
