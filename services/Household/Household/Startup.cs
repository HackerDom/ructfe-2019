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
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Logging;
using Microsoft.IdentityModel.Tokens;

namespace Household
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }
        public HouseholdConfiguration HouseholdConfiguration => new HouseholdConfiguration(Configuration);

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            IdentityModelEventSource.ShowPII = true;
            services.AddTransient(p => new HouseholdConfiguration(p.GetService<IConfiguration>()));
            services.AddTransient(p => new ProductsImportHandler(p.GetService<ILogger<ProductsImportHandler>>()));

            services.AddDbContext<HouseholdDbContext>(DefineSqlServer);

            services.AddDefaultIdentity<ApplicationUser>()
                .AddEntityFrameworkStores<HouseholdDbContext>();
            services.Configure<IdentityOptions>(options =>
            {
                options.Password.RequireDigit = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireNonAlphanumeric = false;
            });

           var credential = new SigningCredentials(
                CertificateLoader.GetECDsaSecurityKey("12345"),
                IdentityServerConstants.ECDsaSigningAlgorithm.ES512.ToString());
            services.AddIdentityServer()
                .AddApiAuthorization<ApplicationUser, HouseholdDbContext>(
                    options => { options.SigningCredential = credential; });

            services.AddAuthentication()
                .AddIdentityServerJwt();

            services.AddCors();
            services.AddControllersWithViews();

            // In production, the Angular files will be served from this directory
            services.AddSpaStaticFiles(configuration => { configuration.RootPath = "ClientApp/dist"; });

            services.AddRazorPages();

            services.AddAutoMapper(typeof(Startup));
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseDatabaseErrorPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                //app.UseHsts(); // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
            }

            app.UseRouting(); // 1

            app.UseStaticFiles(); // not secure 
            if (!env.IsDevelopment())
            {
                app.UseSpaStaticFiles();
            }

            // 2
            // The authentication middleware that is responsible for validating
            // the request credentials and setting the user on the request context
            app.UseAuthentication();

            // 3
            app.UseAuthorization();

            // 3.5? The IdentityServer middleware that exposes the Open ID Connect endpoints
            app.UseIdentityServer();

            app.UseEndpoints(endpoints => // 4
            {
                endpoints.MapControllerRoute(name: "default", pattern: "{controller}/{action=Index}/{id?}");
                endpoints.MapRazorPages();
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp"; // To learn more about options for serving an Angular SPA from ASP.NET Core, see https://go.microsoft.com/fwlink/?linkid=864501
                if (env.IsDevelopment())
                {
                    spa.UseAngularCliServer(npmScript: "start");
                }
            });
        }

        private void DefineSqlServer(DbContextOptionsBuilder options)
        {
            var type = HouseholdConfiguration.DataBaseSystem;
            switch (type)
            {
                //case "MSSQL":
                //    options.UseSqlServer(Configuration.GetConnectionString("DataBaseContext"));
                //    break;
                case "PostgreSQL":
                    options.UseNpgsql(Configuration.GetConnectionString("DataBaseContext"));
                    break;
            }
        }
    }
}
