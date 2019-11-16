using System.IO;
using FluentAssertions;
using Household.Utils;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using NUnit.Framework;

namespace HouseholdTests.UnitTests
{
    [TestFixture]
    public class ProductsImportHandlerTests
    {
        private ProductsImportHandler importHandler;

        [OneTimeSetUp]
        public void OneTimeSetUp()
        {
            var serviceProvider = new ServiceCollection()
                .AddLogging() //b => { b.AddDebug(); })
                .BuildServiceProvider();

            var factory = serviceProvider.GetService<ILoggerFactory>();

            var logger = factory.CreateLogger<ProductsImportHandler>();
            importHandler = new ProductsImportHandler(logger);
        }

        [Test]
        public void Should_parse_simple_correct_list()
        {
            var xmlStream = File.OpenRead(xmlFilePath);
            var products = importHandler.ProcessImport(xmlStream);
            products.IsSuccess.Should().BeTrue();
            products.Value.Should().HaveCount(3);
        }

        private readonly string xmlFilePath = "TestData/products.xml";
    }
}
