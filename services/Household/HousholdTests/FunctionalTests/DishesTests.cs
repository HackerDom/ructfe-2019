using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using FluentAssertions;
using Household.ViewModels;
using HouseholdTests.Infrastructure;
using HouseholdTests.Utils;
using NUnit.Framework;

namespace HouseholdTests.FunctionalTests
{
    public class DishesTests
    {
        private TestEnvironment env;

        [OneTimeSetUp]
        public void OneTimeSetUp()
        {
            env = new TestEnvironment();
        }

        [Test]
        public async Task Should_create_dish_and_retrieve_it()
        {
            // arrange
            var user = await env.RegisterNewUser();

            var products = new[]
            {
                new ProductViewModel {Name = "Яблоко", Calories = 42, Carbohydrate = 10, Fat = 1, Protein = 1},
                new ProductViewModel {Name = "Яйцо куриное", Calories = 42, Carbohydrate = 10, Fat = 1, Protein = 1},
                new ProductViewModel {Name = "Мука", Calories = 42, Carbohydrate = 10, Fat = 1, Protein = 1},
                new ProductViewModel {Name = "Сахар", Calories = 42, Carbohydrate = 10, Fat = 1, Protein = 1}
            };
            await RegisterProducts(user.Client, products);

            var ingredients = new[]
            {
                new IngredientViewModel {Weight = 400, ProductId = products[0].Id},
                new IngredientViewModel {Weight = 65, ProductId = products[1].Id},
                new IngredientViewModel {Weight = 100, ProductId = products[2].Id},
                new IngredientViewModel {Weight = 40, ProductId = products[3].Id}
            };

            var newDish = new DishViewModel
            {
                Description = "Ароматные, нежные, кисло-сладкие оладушки с ярким вкусом печеного яблочка",
                Name = "Яблочные оладьи",
                PortionWeight = 150,
                Ingredients = ingredients
            };

            // act
            var createResult = await user.Client.Post("/api/Dishes", newDish);
            createResult.EnsureStatusCode(HttpStatusCode.Created);

            var getResult = await user.Client.Get<DishViewModel>($"/api/Dishes/{createResult.Value.Id}");
            getResult.EnsureStatusCode(HttpStatusCode.OK);

            // assert
            getResult.Value.Should()
                .BeEquivalentTo(newDish, options => options
                    .Excluding(dish => dish.Id)
                    .Excluding(dish => dish.PortionCalories)
                    .Excluding(dish => dish.PortionProtein)
                    .Excluding(dish => dish.PortionFat)
                    .Excluding(dish => dish.PortionCarbohydrate));
        }

        [Test]
        public async Task Should_calculate_correct_nutritional_values()
        {
            // arrange
            var user = await env.RegisterNewUser();

            var products = new[]
            {
                new ProductViewModel {Protein = 20, Fat = 2, Carbohydrate = 8, Calories = 130},
                new ProductViewModel {Protein = 10, Fat = 5, Carbohydrate = 15, Calories = 145},
            };
            await RegisterProducts(user.Client, products);

            var ingredients = new[]
            {
                new IngredientViewModel {ProductId = products[0].Id, Weight = 50},
                new IngredientViewModel {ProductId = products[1].Id, Weight = 100}
            };

            var newDish = new DishViewModel
            {
                PortionWeight = 300,
                Ingredients = ingredients
            };

            // act
            var createResult = await user.Client.Post("/api/Dishes", newDish);
            createResult.EnsureStatusCode(HttpStatusCode.Created);

            var getResult = await user.Client.Get<DishViewModel>($"/api/Dishes/{createResult.Value.Id}");
            getResult.EnsureStatusCode(HttpStatusCode.OK);
            var dish = getResult.Value;

            // assert
            dish.PortionWeight.Should().Be(newDish.PortionWeight);
            dish.PortionProtein.Should().Be(40);
            dish.PortionFat.Should().Be(12);
            dish.PortionCarbohydrate.Should().Be(38);
            dish.PortionCalories.Should().Be(420);
        }

        [Test]
        public async Task Should_get_list_of_dishes()
        {
            // arrange
            var user = await env.RegisterNewUser();

            var getPreviousProducts = await user.Client.Get<Page<DishViewModel>>("api/Dishes").ConfigureAwait(false);
            getPreviousProducts.EnsureStatusCode(HttpStatusCode.OK);
            var previousDishes = getPreviousProducts.Value;

            var products = Enumerable.Range(0, 10).Select(a => Generator.GetRandomProduct()).ToArray();
            await RegisterProducts(user.Client, products);

            var dishes = Enumerable.Range(0, 5).Select(a => Generator.GetRandomDish(products)).ToArray();
            foreach (var dish in dishes)
            {
                var createResult = await user.Client.Post("/api/Dishes", dish);
                createResult.EnsureStatusCode(HttpStatusCode.Created);
                dish.Id = createResult.Value.Id;
            }

            // act
            var getDishes = await user.Client.Get<Page<DishViewModel>>(
                $"api/Dishes?skip={previousDishes.TotalCount}").ConfigureAwait(false);
            getDishes.EnsureStatusCode(HttpStatusCode.OK);
            var productsList = getDishes.Value;

            // assert
            productsList.Skip.Should().Be(previousDishes.TotalCount);
            productsList.Take.Should().Be(100);
            productsList.TotalCount.Should().Be(previousDishes.TotalCount + dishes.Length);
            productsList.Items.Should().BeEquivalentTo(dishes,
                options => options
                    .Excluding(dish => dish.Id)
                    .Excluding(dish => dish.PortionCalories)
                    .Excluding(dish => dish.PortionProtein)
                    .Excluding(dish => dish.PortionFat)
                    .Excluding(dish => dish.PortionCarbohydrate));
        }

        private static async Task RegisterProducts(TestApiClient client, IEnumerable<ProductViewModel> products)
        {
            foreach (var product in products)
            {
                var createResult = await client.Post("/api/Products", product);
                createResult.EnsureStatusCode(HttpStatusCode.Created);
                product.Id = createResult.Value.Id;
            }
        }
    }
}
