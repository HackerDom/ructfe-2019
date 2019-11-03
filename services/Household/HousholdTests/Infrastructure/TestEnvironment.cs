using Household;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace HouseholdTests.Infrastructure
{
    public class TestEnvironment
    {
        private readonly TestWebApplicationFactory factory;
        public TestApiClient Client { get; }

        public TestEnvironment()
        {
            factory = new TestWebApplicationFactory();

            Client = new TestApiClient(factory.CreateDefaultClient());
        }

        private class TestWebApplicationFactory : WebApplicationFactory<Startup>
        {
            protected override void ConfigureWebHost(IWebHostBuilder builder)
            {
                builder = Program.CreateWebHostBuilder(null);
                base.ConfigureWebHost(builder);
            }
        }
    }
}
