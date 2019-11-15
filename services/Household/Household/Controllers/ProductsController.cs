using System;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Household.DataBase;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Household.DataBaseModels;
using Household.ViewModels;
using Microsoft.AspNetCore.Authorization;

#pragma warning disable 1591

namespace Household.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly HouseholdDbContext dataBase;
        private readonly IMapper mapper;

        public ProductsController(
            HouseholdDbContext dataBase,
            IMapper mapper)
        {
            this.dataBase = dataBase;
            this.mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<Page<ProductViewModel>>> GetProducts(int skip = 0, int take = 100)
        {
            if (take < 1)
                return BadRequest("Parameter take should be greater then 0");
            if (skip < 0)
                return BadRequest("Parameter skip should be greater or equal to 0");
            take = Math.Min(take, 100);

            var userId = GetUserId();
            var items = await dataBase.Products
                .Where(p => p.CreatedBy == userId)
                .Skip(skip).Take(take)
                .ToArrayAsync()
                .ConfigureAwait(false);

            var totalCount = await dataBase.Products
                .Where(p => p.CreatedBy == userId)
                .CountAsync()
                .ConfigureAwait(false);

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
            var product = await dataBase.Products.FindAsync(id).ConfigureAwait(false);

            if (product == null)
            {
                return NotFound();
            }

            if (product.CreatedBy != GetUserId())
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
            await dataBase.SaveChangesAsync();

            return CreatedAtAction("GetProduct", new
            {
                id = product.Id
            }, GetViewModel(product));
        }

        private ProductViewModel GetViewModel(Product productDataModel)
        {
            var productViewModel = mapper.Map<ProductViewModel>(productDataModel);
            return productViewModel;
        }

        private Product GetDataModel(ProductViewModel productViewModel)
        {
            var productDataModel = mapper.Map<Product>(productViewModel);
            productDataModel.CreatedBy = GetUserId();

            return productDataModel;
        }

        private string GetUserId()
        {
            return User.Claims.ToArray()[5].Value;
        }
    }
}
