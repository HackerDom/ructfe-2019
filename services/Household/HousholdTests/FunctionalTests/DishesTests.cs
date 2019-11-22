using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using FluentAssertions;
using Household.DataBaseModels;
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
        public async Task Should_do_everything()
        {
            var cooker = await env.RegisterNewUser();

            var product = new ProductView
            {
                Name = "Яблоко",
                Calories = 42,
                Carbohydrate = 10,
                Fat = 1,
                Protein = 1
            };
            var createdProduct = await cooker.Client.Post("/api/products", product);
            product = createdProduct.Value;

            var dish = new DishViewCook
            {
                Name = "Варенье",
                Ingredients = new[]
                {
                    new IngredientView
                    {
                        ProductId = product.Id,
                        Weight = 150
                    }
                },
                PortionWeight = 200
            };
            var createdDish = await cooker.Client.Post("/api/dishes", dish);
            dish = createdDish.Value;

            var menu = new MenuView
            {
                Date = new DateTime(2019, 11, 22),
                DishIds = new List<int>
                {
                    dish.Id
                }
            };
            var createdMenu = await cooker.Client.Post("/api/menus", menu);
            menu = createdMenu.Value;

            var user = await env.RegisterNewUser(Role.Customer);
            var userMenu = user.Client.Get<MenuView>($"/api/menus/{menu.Id}");

            userMenu.Should().BeEquivalentTo(menu);

            var userDish = user.Client.Get<DishViewCustomer>($"/api/dishes/{menu.DishIds[0]}");

            var getProduct = user.Client.Get<ProductView>($"/api/products/{dish.Ingredients[0].ProductId}");

            var order = new OrderView
            {
                MenuId = userMenu.Id,
                DishIds = new[]
                {
                    userDish.Id
                }
            };

            var createdOrder = await cooker.Client.Post("/api/orders", order);
            order = createdOrder.Value;
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

            getResult.Value.Ingredients.Select(i => i.Product).Should()
                .BeEquivalentTo(products, o => o.WithStrictOrdering());
            foreach (var ingredient in getResult.Value.Ingredients) ingredient.Product = null;

            // assert
            getResult.Value.Should()
                .BeEquivalentTo(newDish, options => options
                    .WithStrictOrdering()
                    .Excluding(dish => dish.Id)
                    .Excluding(dish => dish.PortionCalories)
                    .Excluding(dish => dish.PortionProtein)
                    .Excluding(dish => dish.PortionFat)
                    .Excluding(dish => dish.PortionCarbohydrate)
                    .Excluding(dish => dish.CreatedBy)
                    .Excluding(dish => dish.CreatedDate));
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
                    Name = Generator.GetRandomString(),
                    Protein = 20,
                    Fat = 2,
                    Carbohydrate = 8,
                    Calories = 130
                },
                new ProductView
                {
                    Name = Generator.GetRandomString(),
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
                Name = Generator.GetRandomString(),
                PortionWeight = 300,
                Ingredients = ingredients
            };

            // act
            var createResult = await user.Client.Post("/api/Dishes", newDish);
            createResult.EnsureStatusCode(HttpStatusCode.Created);

            var getResult = await user.Client.Get<DishViewCook>($"/api/Dishes/{createResult.Value.Id}");
            getResult.EnsureStatusCode(HttpStatusCode.OK);

            var dish = getResult.Value;
            dish.Ingredients.Select(i => i.Product).Should()
                .BeEquivalentTo(products, o => o.WithStrictOrdering());

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
            var dishesList = getDishes.Value;

            foreach (var dish in dishesList.Items)
            foreach (var ingredient in dish.Ingredients)
                ingredient.Product = null;

            // assert
            dishesList.Skip.Should().Be(0);
            dishesList.Take.Should().Be(100);
            dishesList.TotalCount.Should().Be(dishes.Length);

            dishesList.Items.Should().BeEquivalentTo(dishes,
                options => options
                    .WithStrictOrdering()
                    .Excluding(dish => dish.Id)
                    .Excluding(dish => dish.PortionCalories)
                    .Excluding(dish => dish.PortionProtein)
                    .Excluding(dish => dish.PortionFat)
                    .Excluding(dish => dish.PortionCarbohydrate)
                    .Excluding(d => d.Ingredients) /// ???
                    .Excluding(dish => dish.CreatedBy)
                    .Excluding(dish => dish.CreatedDate));
        }

        private static async Task RegisterProducts(TestApiClient client, IEnumerable<ProductView> products)
        {
            foreach (var product in products)
            {
                var createResult = await client.Post("/api/Products", product);
                createResult.EnsureStatusCode(HttpStatusCode.Created);
                product.Id = createResult.Value.Id;
                product.CreatedBy = createResult.Value.CreatedBy;
                product.CreatedDate = createResult.Value.CreatedDate;
            }
        }
    }
}