using System.Net;
using System.Threading.Tasks;
using FluentAssertions;
using Household.ViewModels;
using HouseholdTests.Infrastructure;
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
            var user = await env.RegisterNewUser().ConfigureAwait(false);

            var product = new ProductViewModel
            {
                Name = "Морковь",
                Calories = 10,
                Carbohydrate = 10,
                Fat = 0,
                Protein = 0.1
            };

            var createResult = await user.Client.Post("/api/Products", product).ConfigureAwait(false);
            createResult.EnsureStatusCode(HttpStatusCode.Created);

            var getResult = await user.Client.Get<ProductViewModel>($"/api/Products/{createResult.Value.Id}").ConfigureAwait(false);
            getResult.EnsureStatusCode(HttpStatusCode.OK);

            getResult.Value.Should().BeEquivalentTo(product, options => options.Excluding(p => p.Id));
        }

        [Test]
        public async Task Should_create_several_product_and_retrieve_list()
        {
            var user = await env.RegisterNewUser().ConfigureAwait(false);

            await PostTestProductsToServer(user);

            var getProducts = await user.Client.Get<Page<ProductViewModel>>("api/products").ConfigureAwait(false);
            getProducts.EnsureStatusCode(HttpStatusCode.OK);
            var productsList = getProducts.Value;

            productsList.Skip.Should().Be(0);
            productsList.Take.Should().Be(100);
            productsList.TotalCount.Should().Be(testProducts.Length);
            productsList.Items.Should().BeEquivalentTo(testProducts, options => options.Excluding(p => p.Id));
        }

        [Test]
        public async Task Should_create_several_product_and_retrieve_as_list_with_skip_and_take()
        {
            var user = await env.RegisterNewUser().ConfigureAwait(false);

            await PostTestProductsToServer(user);

            var getProducts = await user.Client.Get<Page<ProductViewModel>>(
                $"api/products?skip={testProducts.Length - 2}&take={1}").ConfigureAwait(false);
            getProducts.EnsureStatusCode(HttpStatusCode.OK);
            var productsList = getProducts.Value;

            productsList.Skip.Should().Be(testProducts.Length - 2);
            productsList.Take.Should().Be(1);
            productsList.TotalCount.Should().Be(testProducts.Length);
            productsList.Items.Should().ContainSingle().Which.Should().BeEquivalentTo(testProducts[^2], options => options.Excluding(p => p.Id));
        }

        private readonly ProductViewModel[] testProducts = new[]
        {
            new ProductViewModel
            {
                Name = "Помидор",
                Calories = 20,
                Carbohydrate = 10,
                Fat = 0,
                Protein = 0.1
            },
            new ProductViewModel
            {
                Name = "Яйцо",
                Calories = 140,
                Carbohydrate = 2,
                Fat = 9,
                Protein = 11
            },
            new ProductViewModel
            {
                Name = "Картофель",
                Calories = 80,
                Carbohydrate = 10,
                Fat = 0,
                Protein = 0.1
            },
            new ProductViewModel
            {
                Name = "Лук",
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
                var createResult = await user.Client.Post("api/products", product).ConfigureAwait(false);
                createResult.EnsureStatusCode(HttpStatusCode.Created);
            }
        }
    }
}
