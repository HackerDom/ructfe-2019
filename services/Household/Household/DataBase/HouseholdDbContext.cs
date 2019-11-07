using Household.DataBaseModels;
using IdentityServer4.EntityFramework.Options;
using Microsoft.AspNetCore.ApiAuthorization.IdentityServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Household.DataBase
{
    public class HouseholdDbContext : ApiAuthorizationDbContext<ApplicationUser>
    {
        public HouseholdDbContext(DbContextOptions<HouseholdDbContext> options,
            IOptions<OperationalStoreOptions> operationalStoreOptions) : base(options, operationalStoreOptions)
        {
            //Database.EnsureDeleted();
            Database.EnsureCreated(); // создаем бд с новой схемой
        }


        public DbSet<Product> Products { get; set; }
        public DbSet<Dish> Dishes { get; set; }


        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<Ingredient>()
                .HasKey(t => new {t.DishId, t.ProductId});

            builder.Entity<Ingredient>()
                .HasOne(i => i.Product)
                .WithMany(p => p.Ingredients)
                .HasForeignKey(i => i.ProductId);

            builder.Entity<Ingredient>()
                .HasOne(i => i.Dish)
                .WithMany(d => d.Ingredients)
                .HasForeignKey(i => i.DishId);

            base.OnModelCreating(builder);
        }
    }
}
