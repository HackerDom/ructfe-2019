using AutoMapper;
using Household.DataBase;
using Household.DataBaseModels;
using Household.Utils;
using IdentityServer4;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Logging;

namespace Household
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }
        private HouseholdConfiguration HouseholdConfiguration => new HouseholdConfiguration(Configuration);

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddTransient(p => new HouseholdConfiguration(p.GetService<IConfiguration>()));
            services.AddTransient(p => new ProductsImportHandler(p.GetService<ILogger<ProductsImportHandler>>()));

            services.AddDbContext<HouseholdDbContext>(
                o => DatabaseSystemFeatures.DefineSqlServer(o, HouseholdConfiguration));

            services.AddDefaultIdentity<ApplicationUser>()
                .AddEntityFrameworkStores<HouseholdDbContext>();
            services.Configure<IdentityOptions>(options =>
            {
                options.Password.RequireDigit = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireNonAlphanumeric = false;
            });

            var key = CertificateLoader.LoadRsaSecurityKey(HouseholdConfiguration.KeyPath);

            services.AddIdentityServer()
                .AddAspNetIdentity<ApplicationUser>()
                .AddOperationalStore<HouseholdDbContext>()
                .AddIdentityResources()
                .AddSigningCredential(key, IdentityServerConstants.RsaSigningAlgorithm.PS512)
                .AddApiResources()
                .AddClients();

            services.AddAuthentication()
                .AddIdentityServerJwt();

            services.AddCors();
            services.AddControllersWithViews();

            // In production, the Angular files will be served from this directory
            services.AddSpaStaticFiles(configuration => { configuration.RootPath = "ClientApp/dist"; });

            services.AddRazorPages();

            services.AddAutoMapper(typeof(Startup));
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseDatabaseErrorPage();
                IdentityModelEventSource.ShowPII = true;
            }
            else
            {
                app.UseExceptionHandler("/Error");
                app.UseHsts();
            }

            app.UseRouting();

            app.UseStaticFiles();
            if (!env.IsDevelopment())
            {
                app.UseSpaStaticFiles();
            }

            // The authentication middleware that is responsible for validating the request credentials and setting the user on the request context
            app.UseAuthentication();

            // The IdentityServer middleware that exposes the Open ID Connect endpoints
            app.UseIdentityServer();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(name: "default", pattern: "{controller}/{action=Index}/{id?}");
                endpoints.MapRazorPages();
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";
                if (env.IsDevelopment())
                {
                    spa.UseAngularCliServer(npmScript: "start");
                }
            });
        }
    }
}
