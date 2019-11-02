using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Mime;
using System.Text;
using System.Threading.Tasks;
using FluentAssertions;
using Household;
using Household.DataBaseModels;
using Household.ViewModels;
using Microsoft.AspNetCore.Http.Headers;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Testing;
using Newtonsoft.Json;
using NUnit.Framework;


namespace HouseholdTests.ProductsTests
{
    public class TestWebApplication
    {
        private readonly WebApplicationFactory<Startup> factory;
        public TestClient Client { get; }

        public TestWebApplication()
        {
            factory = new WebApplicationFactory<Startup>();
            Client = new TestClient(factory.CreateDefaultClient());
        }

        public class TestClient
        {
            private readonly HttpClient innerClient;

            public TestClient(HttpClient innerClient)
            {
                this.innerClient = innerClient;
            }

            public async Task<T> Get<T>(string uri)
            {
                var response = await innerClient.GetAsync(uri);

                var r = await response.Content.ReadAsStringAsync();
                return JsonConvert.DeserializeObject<T>(r);
            }

            public async Task<T> Post<T>(string uri, T content)
            {
                var c = JsonConvert.SerializeObject(content);

                var request = new StringContent(c, Encoding.UTF8, MediaTypeNames.Application.Json);
                var response = await innerClient.PostAsync(uri, request);

                var r = await response.Content.ReadAsStringAsync();
                return JsonConvert.DeserializeObject<T>(r);
            }
        }
    }

    [TestFixture]
    public class ProductControllerFunctionalTests
    {
        private TestWebApplication env;

        [OneTimeSetUp]
        public void OneTimeSetUp()
        {
            env = new TestWebApplication();
        }


        [Test]
        public async Task Should_create_product_and_retrieve_it()
        {
            var product = new Product
            {
                Name = "Морковь",
                Calories = 10,
                Carbohydrate = 10,
                Fat = 0,
                Protein = 0.1
            };

            var createdResult = await env.Client.Post("/api/Products", product).ConfigureAwait(false);
            var retrievedResult =
                await env.Client.Get<Product>($"/api/Products/{createdResult.Id}").ConfigureAwait(false);

            retrievedResult.Should().BeEquivalentTo(product, options => options.Excluding(p => p.Id));
        }


        [Test]
        public async Task Should_create_several_product_and_retrieve_list()
        {
            var oldProducts = await env.Client.Get<Page<Product>>("api/products").ConfigureAwait(false);

            await PostTestProductsToServer();

            var productList = await env.Client.Get<Page<Product>>($"api/products?skip={oldProducts.TotalCount}")
                .ConfigureAwait(false);

            productList.Skip.Should().Be(oldProducts.TotalCount);
            productList.Take.Should().Be(100);
            productList.TotalCount.Should().Be(oldProducts.TotalCount + testProducts.Length);
            productList.Items.Should().BeEquivalentTo(testProducts, options => options.Excluding(p => p.Id));
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

        private readonly Product[] testProducts = new[]
        {
            new Product
            {
                Name = "Помидор", Calories = 20, Carbohydrate = 10, Fat = 0, Protein = 0.1
            },
            new Product
            {
                Name = "Яйцо", Calories = 140, Carbohydrate = 2, Fat = 9, Protein = 11
            },
            new Product
            {
                Name = "Картофель", Calories = 80, Carbohydrate = 10, Fat = 0, Protein = 0.1
            },
            new Product
            {
                Name = "Лук", Calories = 30, Carbohydrate = 10, Fat = 0, Protein = 0
            }
        };


        private async Task PostTestProductsToServer()
        {
            foreach (var product in testProducts)
            {
                var createdResult = await env.Client.Post("api/products", product).ConfigureAwait(false);
                //createdResult.EnsureResponseCode(HttpStatusCode.Created);
            }
        }
    }
}