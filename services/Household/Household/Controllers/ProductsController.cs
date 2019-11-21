using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using Household.DataBase;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Household.DataBaseModels;
using Household.Utils;
using Household.ViewModels;
using IdentityServer4.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Net.Http.Headers;

namespace Household.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : HouseholdControllerBase
    {
        private readonly HouseholdDbContext dataBase;
        private readonly IMapper mapper;
        private readonly ProductsImportHandler importHandler;

        public ProductsController(
            HouseholdDbContext dataBase,
            IMapper mapper,
            ProductsImportHandler importHandler) : base(dataBase)
        {
            this.dataBase = dataBase;
            this.mapper = mapper;
            this.importHandler = importHandler;
        }

        [HttpGet]
        public async Task<ActionResult<Page<ProductViewModel>>> GetProducts(int skip = 0, int take = 100)
        {
            if (take < 1)
                return BadRequest("Parameter take should be greater then 0");
            if (skip < 0)
                return BadRequest("Parameter skip should be greater or equal to 0");
            take = Math.Min(take, 100);

            var items = await dataBase.Products
                .Where(p => p.CreatedBy == CurrentUser.Id)
                .Skip(skip).Take(take)
                .ToArrayAsync();

            var totalCount = await dataBase.Products
                .Where(p => p.CreatedBy == CurrentUser.Id)
                .CountAsync();

            var page = new Page<ProductViewModel>
            {
                Skip = skip,
                Take = take,
                TotalCount = totalCount,
                Items = items.Select(GetViewModel).ToArray()
            };
            return page;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductViewModel>> GetProduct(int id)
        {
            var product = await dataBase.Products.FindAsync(id);

            if (product == null)
            {
                return NotFound();
            }

            if (product.CreatedBy != CurrentUser.Id)
            {
                return Unauthorized();
            }

            return GetViewModel(product);
        }

        [HttpPost]
        public async Task<ActionResult<ProductViewModel>> PostProduct(ProductViewModel productViewModel)
        {
            var product = GetDataModel(productViewModel);
            dataBase.Products.Add(product);

            var saveResult = await dataBase.SaveChanges();
            if (saveResult.IsFail)
                return ResponseFromApiResult(saveResult);

            return CreatedAtAction("GetProduct", new
            {
                id = product.Id
            }, GetViewModel(product));
        }

        [HttpPost]
        [Route("import")]
        public async Task<ActionResult<Page<ProductViewModel>>> Import()
        {
            var loadResult = await LoadFile();
            if (loadResult.IsFail)
            {
                if (!loadResult.Message.IsNullOrEmpty())
                    ModelState.AddModelError("File", loadResult.Message);
                return BadRequest(ModelState);
            }

            var (streamedFileContent, _) = loadResult.Value;

            var processImportResult = importHandler.ProcessImport(streamedFileContent);

            if (processImportResult.IsFail)
                return ResponseFromApiResult(processImportResult);

            var products = processImportResult.Value.Select(GetDataModel).ToList();
            dataBase.Products.AddRange(products);

            var saveResult = await dataBase.SaveChanges();
            if (saveResult.IsFail)
                return ResponseFromApiResult(saveResult);

            var totalCount = await dataBase.Products
                .Where(p => p.CreatedBy == CurrentUser.Id)
                .CountAsync();

            var page = new Page<ProductViewModel>
            {
                Skip = -1,
                Take = products.Count,
                TotalCount = totalCount,
                Items = products.Select(GetViewModel).ToArray()
            };

            return Ok(page);
        }

        private async Task<ApiResult<(Stream FileContent, string FileName)>> LoadFile()
        {
            if (!MultipartRequestHelper.IsMultipartContentType(Request.ContentType))
            {
                return ApiResult<(Stream FileContent, string FileName)>.Failure(
                    $"The request couldn't be processed because of ContentType: {Request.ContentType}",
                    HttpStatusCode.BadRequest);
            }

            var boundary = MultipartRequestHelper.GetBoundary(MediaTypeHeaderValue.Parse(Request.ContentType)); //_defaultFormOptions.MultipartBoundaryLengthLimit);
            var reader = new MultipartReader(boundary, Request.Body);
            var section = await reader.ReadNextSectionAsync();

            var hasContentDispositionHeader = ContentDispositionHeaderValue.TryParse(section.ContentDisposition, out var contentDisposition);
            if (!hasContentDispositionHeader)
            {
                return ApiResult<(Stream FileContent, string FileName)>.Failure(
                    "The request couldn't be processed because of absent ContentDisposition",
                    HttpStatusCode.BadRequest);
            }

            // This check assumes that there's a file present without form data.
            // If form data is present, this method immediately fails and returns the model error.
            if (!MultipartRequestHelper.HasFileContentDisposition(contentDisposition))
            {
                return ApiResult<(Stream FileContent, string FileName)>.Failure(
                    $"The request couldn't be processed because of ContentDisposition {contentDisposition}",
                    HttpStatusCode.BadRequest);
            }

            var streamedFileContent = section.Body;
            if (!ModelState.IsValid)
                return ApiResult<(Stream FileContent, string FileName)>.Failure("", HttpStatusCode.BadRequest);

            return ApiResult<(Stream FileContent, string FileName)>
                .Success((streamedFileContent, contentDisposition.FileName.Value));
        }

        private ProductViewModel GetViewModel(Product productDataModel)
        {
            var productViewModel = mapper.Map<ProductViewModel>(productDataModel);
            return productViewModel;
        }

        private Product GetDataModel(ProductViewModel productViewModel)
        {
            var productDataModel = mapper.Map<Product>(productViewModel);
            productDataModel.CreatedBy = CurrentUser.Id;

            return productDataModel;
        }

        private Product GetDataModel(ProductImportModel productViewModel)
        {
            var productDataModel = mapper.Map<Product>(productViewModel);
            productDataModel.CreatedBy = CurrentUser.Id;

            return productDataModel;
        }
    }
}
