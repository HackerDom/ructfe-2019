using System.Net;
using System.Threading.Tasks;
using FluentAssertions;
using Household.ViewModels;
using HouseholdTests.Infrastructure;
using HouseholdTests.Utils;
using NUnit.Framework;

namespace HouseholdTests.FunctionalTests
{
    [TestFixture]
    public class ProductsTests
    {
        private TestEnvironment env;

        [OneTimeSetUp]
        public void OneTimeSetUp()
        {
            env = new TestEnvironment();
        }

        [Test]
        public async Task Should_create_product_and_retrieve_it()
        {
            var user = await env.RegisterNewUser();

            var product = new ProductView
            {
                Name = "Морковь",
                Manufacturer = "Россия",
                Calories = 10,
                Carbohydrate = 10,
                Fat = 0,
                Protein = 0.1
            };

            var createResult = await user.Client.Post("/api/Products", product);
            createResult.EnsureStatusCode(HttpStatusCode.Created);

            var getResult = await user.Client.Get<ProductView>($"/api/Products/{createResult.Value.Id}");
            getResult.EnsureStatusCode(HttpStatusCode.OK);

            getResult.Value.Should().BeEquivalentTo(product,
                options => options
                    .WithStrictOrdering()
                    .Excluding(p => p.Id)
                    .Excluding(p => p.CreatedBy)
                    .Excluding(p => p.CreatedDate));
        }

        [Test]
        public async Task Should_return_bad_request_when_create_product_with_long_name()
        {
            var user = await env.RegisterNewUser();

            var product = new ProductView
            {
                Name = Generator.GetRandomString(200)
            };

            var createResult = await user.Client.Post("/api/Products", product);
            createResult.EnsureStatusCode(HttpStatusCode.BadRequest);
            createResult.Message.Should().Be("22001: значение не умещается в тип character varying(100)");
        }

        [Test]
        public async Task Should_create_several_product_and_retrieve_list()
        {
            var user = await env.RegisterNewUser();

            await PostTestProductsToServer(user);

            var getProducts = await user.Client.Get<Page<ProductView>>("api/products");
            getProducts.EnsureStatusCode(HttpStatusCode.OK);
            var productsList = getProducts.Value;

            productsList.Skip.Should().Be(0);
            productsList.Take.Should().Be(100);
            productsList.TotalCount.Should().Be(testProducts.Length);
            productsList.Items.Should().BeEquivalentTo(testProducts,
                options => options
                    .WithStrictOrdering()
                    .Excluding(p => p.Id)
                    .Excluding(p => p.CreatedBy)
                    .Excluding(p => p.CreatedDate));
        }

        [Test]
        public async Task Should_create_several_product_and_retrieve_as_list_with_skip_and_take()
        {
            var user = await env.RegisterNewUser();

            await PostTestProductsToServer(user);

            var getProducts = await user.Client.Get<Page<ProductView>>(
                $"api/products?skip={testProducts.Length - 2}&take={1}");
            getProducts.EnsureStatusCode(HttpStatusCode.OK);
            var productsList = getProducts.Value;

            productsList.Skip.Should().Be(testProducts.Length - 2);
            productsList.Take.Should().Be(1);
            productsList.TotalCount.Should().Be(testProducts.Length);
            productsList.Items.Should().ContainSingle().Which.Should().BeEquivalentTo(testProducts[^2],
                options => options
                    .WithStrictOrdering()
                    .Excluding(p => p.Id)
                    .Excluding(p => p.CreatedBy)
                    .Excluding(p => p.CreatedDate));
        }

        private readonly ProductView[] testProducts =
        {
            new ProductView
            {
                Name = "Помидор",
                Manufacturer = "Россия",
                Calories = 20,
                Carbohydrate = 10,
                Fat = 0,
                Protein = 0.1
            },
            new ProductView
            {
                Name = "Яйцо",
                Manufacturer = "Россия",
                Calories = 140,
                Carbohydrate = 2,
                Fat = 9,
                Protein = 11
            },
            new ProductView
            {
                Name = "Картофель",
                Manufacturer = "Россия",
                Calories = 80,
                Carbohydrate = 10,
                Fat = 0,
                Protein = 0.1
            },
            new ProductView
            {
                Name = "Лук",
                Manufacturer = "Россия",
                Calories = 30,
                Carbohydrate = 10,
                Fat = 0,
                Protein = 0
            }
        };

        private async Task PostTestProductsToServer(TestUser user)
        {
            foreach (var product in testProducts)
            {
                var createResult = await user.Client.Post("api/products", product);
                createResult.EnsureStatusCode(HttpStatusCode.Created);
            }
        }
    }
}
