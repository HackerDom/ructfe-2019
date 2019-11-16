using System;
using System.IO;
using System.Xml.Serialization;
using Household.Controllers;
using Household.ViewModels;
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
            //var s = new XmlSerializer(typeof(ProductImportModel[]), new XmlRootAttribute("product"));
            //var dd = (ProductImportModel)s.Deserialize(data);

            var serializer = new XmlSerializer(typeof(ProductsImportList));
            try
            {
                var d = (ProductsImportList) serializer.Deserialize(data);
                return ApiResult<ProductImportModel[]>.Success(d.Product);
            }
            catch (Exception e)
            {
                log.LogError(e, "Something went wrong while parsing products list");
                return ApiResult<ProductImportModel[]>.Failure(e.Message);
            }
        }
    }
}
