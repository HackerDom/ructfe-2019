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
            // ReSharper disable once VirtualMemberCallInConstructor
            Database.EnsureCreated();
        }

        internal DbSet<Product> Products { get; set; }
        internal DbSet<Dish> Dishes { get; set; }
        internal DbSet<Menu> Menus { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<Product>()
                .Property(product => product.Name)
                .HasMaxLength(100);
            builder.Entity<Dish>()
                .Property(dish => dish.Name)
                .HasMaxLength(100);
            builder.Entity<Menu>()
                .Property(menu => menu.Name)
                .HasMaxLength(100);

            // Product and Dish relation
            builder.Entity<Ingredient>()
                .HasKey(ingredient => new
                {
                    ingredient.ProductId,
                    ingredient.DishId
                });

            builder.Entity<Ingredient>()
                .HasOne(item => item.Product)
                .WithMany(product => product.Ingredients)
                .HasForeignKey(item => item.ProductId);

            builder.Entity<Ingredient>()
                .HasOne(item => item.Dish)
                .WithMany(dish => dish.Ingredients)
                .HasForeignKey(item => item.DishId);

            // Dish and Menu relation
            builder.Entity<DishInMenu>()
                .HasKey(dishInMenu => new
                {
                    dishInMenu.DishId,
                    dishInMenu.MenuId
                });

            builder.Entity<DishInMenu>()
                .HasOne(item => item.Dish)
                .WithMany(dish => dish.Menus)
                .HasForeignKey(item => item.DishId);

            builder.Entity<DishInMenu>()
                .HasOne(item => item.Menu)
                .WithMany(m => m.DishesInMenu)
                .HasForeignKey(item => item.MenuId);

            var getDateExpression = DatabaseSystemFeatures.SqlGetDate(configuration);
            builder.Entity<Product>()
                .Property(product => product.CreatedDate)
                .HasDefaultValueSql(getDateExpression);
            builder.Entity<Ingredient>()
                .Property(ingredient => ingredient.CreatedDate)
                .HasDefaultValueSql(getDateExpression);
            builder.Entity<Dish>()
                .Property(dish => dish.CreatedDate)
                .HasDefaultValueSql(getDateExpression);
            builder.Entity<DishInMenu>()
                .Property(dishInMenu => dishInMenu.CreatedDate)
                .HasDefaultValueSql(getDateExpression);
            builder.Entity<Menu>()
                .Property(menu => menu.CreatedDate)
                .HasDefaultValueSql(getDateExpression);

            base.OnModelCreating(builder);
        }
    }
}
