using System;
using System.IO;
using System.Net;
using System.Xml;
using System.Xml.Serialization;
using Microsoft.Extensions.Logging;

namespace Household.Utils
{
    public class ProductsImportHandler
    {
        private readonly ILogger<ProductsImportHandler> log;

        public ProductsImportHandler(ILogger<ProductsImportHandler> log)
        {
            this.log = log;
        }

        public ApiResult<ProductImportModel[]> ProcessImport(Stream data)
        {
            var serializer = new XmlSerializer(typeof(ProductsImportList));
            var settings = new XmlReaderSettings
            {
                DtdProcessing = DtdProcessing.Parse,
                XmlResolver = new XmlUrlResolver()
            };

            using var reader = XmlReader.Create(data, settings);

            try
            {
                var serializedData = serializer.Deserialize(reader) as ProductsImportList;
                return ApiResult<ProductImportModel[]>.Success(serializedData?.Product);
            }
            catch (Exception e)
            {
                log.LogError(e, "Something went wrong while parsing products list");
                return ApiResult<ProductImportModel[]>.Failure(
                    "Something went wrong while parsing products list. There is error in XML document",
                    HttpStatusCode.BadRequest);
            }
        }
    }
}
