//using System.Linq;
//using System.Threading.Tasks;
//using AutoMapper;
//using FluentAssertions;
//using Household.Controllers;
//using Household.DataBase;
//using Household.DataBaseModels;
//using Household.ViewModels;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;
//using NUnit.Framework;

//namespace HouseholdTests.ProductsTests
//{
//    [TestFixture]
//    internal class ProductsControllerTests
//    {
//        private readonly string connectionString = "Server=(localdb)\\MSSQLLocalDB;" +
//                                                   "Database=TestHouseholdDatabase;" +
//                                                   "Trusted_Connection=True;" +
//                                                   "MultipleActiveResultSets=true";

//        private ProductsController productsController;
//        private HouseholdDbContext testDbContext;

//        [SetUp]
//        public void SetUp()
//        {
//            var optionBuilder = new DbContextOptionsBuilder<HouseholdDbContext>().UseSqlServer(connectionString);

//            testDbContext = new HouseholdDbContext(optionBuilder.Options);
//            productsController = new ProductsController(testDbContext, new Mapper(new MapperConfiguration(c => { })));
//        }

//        [TearDown]
//        public void TearDown()
//        {
//            testDbContext.Database.EnsureDeleted();
//        }

//        [Test]
//        public async Task Should_create_product_and_retrieve_it()
//        {
//            var product = new ProductViewModel
//            {
//                Name = "Морковь",
//                Calories = 10,
//                Carbohydrate = 10,
//                Fat = 0,
//                Protein = 0.1
//            };

//            var createdResult = (await productsController.PostProduct(product).ConfigureAwait(false))
//                .Result as CreatedAtActionResult;
//            createdResult.StatusCode.Should().Be(201);

//            var retrievedResult = await productsController.GetProduct((createdResult.Value as Product).Id)
//                .ConfigureAwait(false);
//            //retrievedResult.Value.Should().BeEquivalentTo(product);
//        }


//        [Test]
//        public async Task Should_create_several_product_and_retrieve_list()
//        {
//            await PostTestProductsToServer();

//            var productList = await productsController.GetProducts().ConfigureAwait(false);
//            productList.Value.Skip.Should().Be(0);
//            productList.Value.Take.Should().Be(100);
//            productList.Value.TotalCount.Should().Be(testProducts.Length);
//            productList.Value.Items.Should().BeEquivalentTo(testProducts);
//        }

//        [Test]
//        public async Task Should_create_several_product_and_retrieve_last_as_list()
//        {
//            await PostTestProductsToServer();

//            var productList = await productsController.GetProducts(skip: testProducts.Length - 1).ConfigureAwait(false);

//            productList.Value.Skip.Should().Be(testProducts.Length - 1);
//            productList.Value.Take.Should().Be(100);
//            productList.Value.TotalCount.Should().Be(testProducts.Length);
//            productList.Value.Items.Should().ContainSingle().Which.Should().BeEquivalentTo(testProducts.Last());
//        }

//        private readonly ProductViewModel[] testProducts = new[]
//        {
//            new ProductViewModel()
//            {
//                Name = "Помидор", Calories = 20, Carbohydrate = 10, Fat = 0, Protein = 0.1
//            },
//            new ProductViewModel()
//            {
//                Name = "Яйцо", Calories = 140, Carbohydrate = 2, Fat = 9, Protein = 11
//            },
//            new ProductViewModel()
//            {
//                Name = "Картофель", Calories = 80, Carbohydrate = 10, Fat = 0, Protein = 0.1
//            },
//            new ProductViewModel()
//            {
//                Name = "Лук", Calories = 30, Carbohydrate = 10, Fat = 0, Protein = 0
//            }
//        };

//        private async Task PostTestProductsToServer()
//        {
//            var d = await testDbContext.Products.ToArrayAsync().ConfigureAwait(false);
//            foreach (var product in testProducts)
//            {
//                var createdResult = await productsController.PostProduct(product).ConfigureAwait(false);
//                //createdResult.EnsureResponseCode(HttpStatusCode.Created);
//            }
//        }
//    }
//}
