using System.Diagnostics;
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
                .AddLogging()
                .BuildServiceProvider();

            var factory = serviceProvider.GetService<ILoggerFactory>();

            var logger = factory.CreateLogger<ProductsImportHandler>();
            importHandler = new ProductsImportHandler(logger);
        }

        private const string goodXmlFilePath = "TestData/products.xml";
        private const string xxePath_ShortLocalFile = "TestData/products_xxe_short_local_file.xml";
        private const string xxePath_LongLocalFile = "TestData/products_xxe_long_local_file.xml";

        private const string xxePath_ExternalGetWithoutPayload = "TestData/products_xee_without_payload.xml";
        private const string externalServerSimpleTextPath = "PythonExternalServer/server_simple_get.py";

        private const string xxePath_ExternalGetWithPayload = "TestData/products_xee_with_payload.xml";
        private const string externalServerXxePath = "PythonExternalServer/server_get_with_payload.py";

        [Test]
        public void Should_parse_simple_correct_list()
        {
            var xmlStream = File.OpenRead(goodXmlFilePath);
            var products = importHandler.ProcessImport(xmlStream);
            products.IsSuccess.Should().BeTrue();
            products.Value.Should().HaveCount(3);
        }

        [Test]
        public void Should_do_short_server_file_xxe()
        {
            var xmlStream = File.OpenRead(xxePath_ShortLocalFile);
            var products = importHandler.ProcessImport(xmlStream);
            products.IsSuccess.Should().BeTrue();
            products.Value.Should().HaveCount(3);
            products.Value[0].Name.Should().Be("secret_in_local_file");
            products.Value[1].Name.Should().Be("Cherry");
            products.Value[2].Name.Should().Be("Avocado");
        }

        [Test]
        [Ignore("don't work because there are no DB and no length error from DB")]
        public void Should_not_work_with_long_server_file_xxe()
        {
            var xmlStream = File.OpenRead(xxePath_LongLocalFile);
            var products = importHandler.ProcessImport(xmlStream);
            products.IsSuccess.Should().BeFalse();
            products.Value.Should().BeNull();
        }

        [Test]
        public void Should_do_xxe_with_simple_get_from_external_service()
        {
            var port = 12321; // should be same with url in xee file
            var pythonProcess = Process.Start(
                "python",
                $"{externalServerSimpleTextPath} {port}");

            try
            {
                var xmlStream = File.OpenRead(xxePath_ExternalGetWithoutPayload);
                var products = importHandler.ProcessImport(xmlStream);
                products.IsSuccess.Should().BeTrue();
                products.Value.Should().HaveCount(3);
                products.Value[0].Name.Should().Be("data_loaded_from_external_server");
                products.Value[1].Name.Should().Be("Cherry");
                products.Value[2].Name.Should().Be("Avocado");
            }
            finally
            {
                pythonProcess?.Kill();
            }
        }

        [Test]
        public void Should_do_xxe_payload_in_get_query() // with running python localhost server
        {
            var port = 30000; // should be same with url in xee file
            var folder = Directory.GetCurrentDirectory();
            var pythonProcess = Process.Start("python", $"{externalServerXxePath} {port} {folder}");

            try
            {
                var xmlStream = File.OpenRead(xxePath_ExternalGetWithPayload);
                var products = importHandler.ProcessImport(xmlStream);
                products.IsSuccess.Should().BeTrue();
                products.Value.Should().HaveCount(3);
                products.Value[0].Name.Should().Be("nikakoi_ne_secretik_with_len=1746_/?p=-----BEGIN%20RSA%20PRIVATE%20KEY-----%0AMIIEpA");
                products.Value[1].Name.Should().Be("Cherry");
                products.Value[2].Name.Should().Be("Avocado");
            }
            finally
            {
                pythonProcess?.Kill();
            }
        }
    }
}
