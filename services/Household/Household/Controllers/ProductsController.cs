using System;
using System.Linq;
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
        public async Task<ActionResult<Page<ProductView>>> GetProducts(int skip = 0, int take = 100)
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

            var page = new Page<ProductView>
            {
                Skip = skip,
                Take = take,
                TotalCount = totalCount,
                Items = items.Select(GetViewModel).ToArray()
            };
            return page;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductView>> GetProduct(int id)
        {
            var product = await dataBase.Products.FindAsync(id);

            if (product == null || product.CreatedBy != CurrentUser.Id)
            {
                return NotFound();
            }

            return GetViewModel(product);
        }

        [HttpPost]
        public async Task<ActionResult<ProductView>> PostProduct(ProductView productViewModel)
        {
            if (CurrentUser.Role != Role.Cook)
                return NotAllowed();

            var product = GetDataModel(productViewModel);
            Clear(product);

            dataBase.Products.Add(product);

            var saveResult = await dataBase.SaveChanges();
            if (saveResult.IsFail)
                return ResponseFromApiResult(saveResult);

            var createdProduct = (await GetProduct(product.Id)).Value;

            return CreatedAtAction("GetProduct", new
            {
                id = product.Id
            }, createdProduct);
        }

        [HttpPost]
        [Route("import")]
        public async Task<ActionResult<Page<ProductView>>> Import()
        {
            if (CurrentUser.Role != Role.Cook)
                return NotAllowed();

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

            var products = processImportResult.Value
                .Select(GetDataModel)
                .Select(Clear)
                .ToList();

            dataBase.Products.AddRange(products);

            var saveResult = await dataBase.SaveChanges();
            if (saveResult.IsFail)
                return ResponseFromApiResult(saveResult);

            var totalCount = await dataBase.Products
                .Where(p => p.CreatedBy == CurrentUser.Id)
                .CountAsync();

            var page = new Page<ProductView>
            {
                Skip = -1,
                Take = products.Count,
                TotalCount = totalCount,
                Items = products.Select(GetViewModel).ToArray()
            };

            return Ok(page);
        }

        private ProductView GetViewModel(Product product)
        {
            var productView = mapper.Map<ProductView>(product);
            return productView;
        }

        private Product GetDataModel(ProductView productView)
        {
            var product = mapper.Map<Product>(productView);
            product.CreatedBy = CurrentUser.Id;

            return product;
        }

        private Product GetDataModel(ProductImportModel productImportModel)
        {
            var product = mapper.Map<Product>(productImportModel);
            product.CreatedBy = CurrentUser.Id;

            return product;
        }

        private Product Clear(Product product)
        {
            product.Id = 0;
            return product;
        }
    }
}
