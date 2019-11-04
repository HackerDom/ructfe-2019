using Microsoft.AspNetCore.Hosting;


[assembly: HostingStartup(typeof(Household.Areas.Identity.IdentityHostingStartup))]

namespace Household.Areas.Identity
{
    public class IdentityHostingStartup : IHostingStartup
    {
        public void Configure(IWebHostBuilder builder)
        {
            builder.ConfigureServices((context, services) => { });
        }
    }
}
