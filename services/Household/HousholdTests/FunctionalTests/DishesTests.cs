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
                new ProductView
                {
                    Name = "Яблоко",
                    Calories = 42,
                    Carbohydrate = 10,
                    Fat = 1,
                    Protein = 1
                },
                new ProductView
                {
                    Name = "Яйцо куриное",
                    Calories = 42,
                    Carbohydrate = 10,
                    Fat = 1,
                    Protein = 1
                },
                new ProductView
                {
                    Name = "Мука",
                    Calories = 42,
                    Carbohydrate = 10,
                    Fat = 1,
                    Protein = 1
                },
                new ProductView
                {
                    Name = "Сахар",
                    Calories = 42,
                    Carbohydrate = 10,
                    Fat = 1,
                    Protein = 1
                }
            };
            await RegisterProducts(user.Client, products);

            var ingredients = new[]
            {
                new IngredientView
                {
                    Weight = 400,
                    ProductId = products[0].Id
                },
                new IngredientView
                {
                    Weight = 65,
                    ProductId = products[1].Id
                },
                new IngredientView
                {
                    Weight = 100,
                    ProductId = products[2].Id
                },
                new IngredientView
                {
                    Weight = 40,
                    ProductId = products[3].Id
                }
            };

            var newDish = new DishViewCook
            {
                Name = "Яблочные оладьи",
                PortionWeight = 150,
                Ingredients = ingredients,
                Description = "Ароматные, нежные, кисло-сладкие оладушки с ярким вкусом печеного яблочка",
                Recipe = "1. Яблоко очистите от кожуры и натрите на мелкой тёрке.\r\n2. Кефир взбейте с яйцами." +
                         "\r\n3. Добавьте муку, соль, сахар и соду. Перемешайте, чтобы масса получилась без комков." +
                         "\r\n4. Засыпьте тёртое яблоко. Снова хорошо размешайте.\r\n5. В сковороде разогрейте масло " +
                         "на среднем огне. Сформируйте оладьи и обжаривайте по 2–4 минуты с каждой стороны."
            };

            // act
            var createResult = await user.Client.Post("/api/Dishes", newDish);
            createResult.EnsureStatusCode(HttpStatusCode.Created);

            var getResult = await user.Client.Get<DishViewCook>($"/api/Dishes/{createResult.Value.Id}");
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
                new ProductView
                {
                    Protein = 20,
                    Fat = 2,
                    Carbohydrate = 8,
                    Calories = 130
                },
                new ProductView
                {
                    Protein = 10,
                    Fat = 5,
                    Carbohydrate = 15,
                    Calories = 145
                },
            };
            await RegisterProducts(user.Client, products);

            var ingredients = new[]
            {
                new IngredientView
                {
                    ProductId = products[0].Id,
                    Weight = 50
                },
                new IngredientView
                {
                    ProductId = products[1].Id,
                    Weight = 100
                }
            };

            var newDish = new DishViewCook
            {
                PortionWeight = 300,
                Ingredients = ingredients
            };

            // act
            var createResult = await user.Client.Post("/api/Dishes", newDish);
            createResult.EnsureStatusCode(HttpStatusCode.Created);

            var getResult = await user.Client.Get<DishViewCook>($"/api/Dishes/{createResult.Value.Id}");
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
            var getDishes = await user.Client.Get<Page<DishViewCook>>("api/Dishes");
            getDishes.EnsureStatusCode(HttpStatusCode.OK);
            var productsList = getDishes.Value;

            // assert
            productsList.Skip.Should().Be(0);
            productsList.Take.Should().Be(100);
            productsList.TotalCount.Should().Be(dishes.Length);
            productsList.Items.Should().BeEquivalentTo(dishes,
                options => options
                    .Excluding(dish => dish.Id)
                    .Excluding(dish => dish.PortionCalories)
                    .Excluding(dish => dish.PortionProtein)
                    .Excluding(dish => dish.PortionFat)
                    .Excluding(dish => dish.PortionCarbohydrate));
        }

        private static async Task RegisterProducts(TestApiClient client, IEnumerable<ProductView> products)
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
