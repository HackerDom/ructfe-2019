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
            var getPreviousProducts = await env.Client.Get<Page<ProductViewModel>>("api/products").ConfigureAwait(false);
            getPreviousProducts.EnsureStatusCode(HttpStatusCode.OK);
            var previousProducts = getPreviousProducts.Value;

            await PostTestProductsToServer();

            var getProducts = await env.Client.Get<Page<ProductViewModel>>($"api/products?skip={previousProducts.TotalCount}").ConfigureAwait(false);
            getProducts.EnsureStatusCode(HttpStatusCode.OK);
            var productsList = getProducts.Value;

            productsList.Skip.Should().Be(previousProducts.TotalCount);
            productsList.Take.Should().Be(100);
            productsList.TotalCount.Should().Be(previousProducts.TotalCount + testProducts.Length);
            productsList.Items.Should().BeEquivalentTo(testProducts, options => options.Excluding(p => p.Id));
        }

        //[Test]
        //public async Task Should_create_several_product_and_retrieve_last_as_list()
        //{
        //    await PostTestProductsToServer();

        //    var productList = await productsController.GetProducts(skip: testProducts.Length - 1).ConfigureAwait(false);

        //    productList.Value.Skip.Should().Be(testProducts.Length - 1);
        //    productList.Value.Take.Should().Be(100);
        //    productList.Value.TotalCount.Should().Be(testProducts.Length);
        //    productList.Value.Items.Should().ContainSingle().Which.Should().BeEquivalentTo(testProducts.Last());

        //}

        private readonly ProductViewModel[] testProducts = new[]
        {
            new ProductViewModel
            {
                Name = "Помидор", Calories = 20, Carbohydrate = 10, Fat = 0, Protein = 0.1
            },
            new ProductViewModel
            {
                Name = "Яйцо", Calories = 140, Carbohydrate = 2, Fat = 9, Protein = 11
            },
            new ProductViewModel
            {
                Name = "Картофель", Calories = 80, Carbohydrate = 10, Fat = 0, Protein = 0.1
            },
            new ProductViewModel
            {
                Name = "Лук", Calories = 30, Carbohydrate = 10, Fat = 0, Protein = 0
            }
        };

        private async Task PostTestProductsToServer()
        {
            foreach (var product in testProducts)
            {
                var createResult = await env.Client.Post("api/products", product).ConfigureAwait(false);
                createResult.EnsureStatusCode(HttpStatusCode.Created);
            }
        }
    }
}
