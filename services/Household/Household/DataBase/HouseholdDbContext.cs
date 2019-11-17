using Household.DataBaseModels;
using Household.Utils;
using IdentityServer4.EntityFramework.Options;
using Microsoft.AspNetCore.ApiAuthorization.IdentityServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Household.DataBase
{
    public class HouseholdDbContext : ApiAuthorizationDbContext<ApplicationUser>
    {
        private readonly HouseholdConfiguration configuration;

        public HouseholdDbContext(
            DbContextOptions<HouseholdDbContext> options,
            IOptions<OperationalStoreOptions> operationalStoreOptions,
            HouseholdConfiguration configuration)
            : base(options, operationalStoreOptions)
        {
            this.configuration = configuration;
            //Database.EnsureDeleted();
            Database.EnsureCreated(); // создаем бд с новой схемой
        }

        internal DbSet<Product> Products { get; set; }
        internal DbSet<Dish> Dishes { get; set; }
        internal DbSet<Menu> Menus { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            // Product and Dish relation
            builder.Entity<Ingredient>()
                .HasKey(t => new
                {
                    t.ProductId,
                    t.DishId
                });

            builder.Entity<Ingredient>()
                .HasOne(i => i.Product)
                .WithMany(p => p.Ingredients)
                .HasForeignKey(i => i.ProductId);

            builder.Entity<Ingredient>()
                .HasOne(i => i.Dish)
                .WithMany(d => d.Ingredients)
                .HasForeignKey(i => i.DishId);

            // Dish and Menu relation
            builder.Entity<DishInMenu>()
                .HasKey(t => new
                {
                    t.DishId,
                    t.MenuId
                });

            builder.Entity<DishInMenu>()
                .HasOne(i => i.Dish)
                .WithMany(p => p.Menus)
                .HasForeignKey(i => i.DishId);

            builder.Entity<DishInMenu>()
                .HasOne(i => i.Menu)
                .WithMany(d => d.DishesInMenu)
                .HasForeignKey(i => i.MenuId);

            builder.Entity<Product>()
                .Property(b => b.CreatedDate)
                .HasDefaultValueSql(SqlGetDate());
            builder.Entity<Ingredient>()
                .Property(b => b.CreatedDate)
                .HasDefaultValueSql(SqlGetDate());
            builder.Entity<Dish>()
                .Property(b => b.CreatedDate)
                .HasDefaultValueSql(SqlGetDate());
            builder.Entity<DishInMenu>()
                .Property(b => b.CreatedDate)
                .HasDefaultValueSql(SqlGetDate());
            builder.Entity<Menu>()
                .Property(b => b.CreatedDate)
                .HasDefaultValueSql(SqlGetDate());

            base.OnModelCreating(builder);
        }

        private string SqlGetDate()
        {
            switch (configuration.DataBaseSystem)
            {
                case "MSSQL":
                    return "getdate()";
                case "PostgreSQL":
                    return "(now() at time zone 'utc')";
            }

            return null;
        }
    }
}
