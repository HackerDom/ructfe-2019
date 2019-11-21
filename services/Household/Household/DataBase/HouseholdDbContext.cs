using System.Net;
using Household.DataBaseModels;
using Household.Utils;
using IdentityServer4.EntityFramework.Options;
using Microsoft.AspNetCore.ApiAuthorization.IdentityServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Threading.Tasks;

namespace Household.DataBase
{
    public class HouseholdDbContext : ApiAuthorizationDbContext<ApplicationUser>
    {
        private readonly HouseholdConfiguration configuration;
        private readonly ILogger<HouseholdDbContext> logger;

        public HouseholdDbContext(
            DbContextOptions<HouseholdDbContext> options,
            IOptions<OperationalStoreOptions> operationalStoreOptions,
            HouseholdConfiguration configuration,
            ILogger<HouseholdDbContext> logger)
            : base(options, operationalStoreOptions)
        {
            this.configuration = configuration;
            this.logger = logger;

            // ReSharper disable once VirtualMemberCallInConstructor
            Database.EnsureCreated();
        }

        internal DbSet<Product> Products { get; set; }
        internal DbSet<Dish> Dishes { get; set; }
        internal DbSet<Menu> Menus { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
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
                .WithMany(menu => menu.DishesInMenu)
                .HasForeignKey(item => item.MenuId);

            // Dish and Order relation
            builder.Entity<DishInOrder>()
                .HasKey(dishInMenu => new
                {
                    dishInMenu.DishId,
                    dishInMenu.OrderId
                });

            builder.Entity<DishInOrder>()
                .HasOne(item => item.Dish)
                .WithMany(dish => dish.Orders)
                .HasForeignKey(item => item.DishId);

            builder.Entity<DishInOrder>()
                .HasOne(item => item.Order)
                .WithMany(order => order.DishesInOrder)
                .HasForeignKey(item => item.OrderId);

            //// Menu and Order relation
            //builder.Entity<Order>()
            //    .HasOne(order => order.Menu)
            //    .WithMany(menu => menu.Orders)
            //    .HasForeignKey(order => order.MenuId);

            SetSizeConstraint(builder);
            SetDefaultCreatedDate(builder);

            base.OnModelCreating(builder);
        }

        private void SetSizeConstraint(ModelBuilder builder)
        {
            builder.Entity<Product>()
                .Property(product => product.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Entity<Dish>()
                .Property(dish => dish.Name)
                .IsRequired()
                .HasMaxLength(100);
            builder.Entity<Dish>()
                .Property(dish => dish.Description)
                .HasMaxLength(200);
            builder.Entity<Dish>()
                .Property(dish => dish.Recipe)
                .HasMaxLength(500);

            builder.Entity<Menu>()
                .Property(menu => menu.Name)
                .HasMaxLength(100);
            builder.Entity<Menu>()
                .Property(menu => menu.Description)
                .HasMaxLength(100);
        }

        private void SetDefaultCreatedDate(ModelBuilder builder)
        {
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
        }

        public new async Task<ApiResult<int>> SaveChanges()
        {
            try
            {
                var savedCount = await base.SaveChangesAsync();
                return ApiResult<int>.Success(savedCount);
            }

            catch (DbUpdateConcurrencyException e)
            {
                logger.LogError(e, "Concurrency error while updating database");
                return ApiResult<int>.Failure("Concurrency error while updating database", HttpStatusCode.InternalServerError);
            }
            catch (DbUpdateException e)
            {
                logger.LogError(e, "Error while updating database");
                return ApiResult<int>.Failure(e.InnerException?.Message, HttpStatusCode.BadRequest);
            }
        }
    }
}
