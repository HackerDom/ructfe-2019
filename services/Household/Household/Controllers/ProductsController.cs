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
    //[Authorize]
    [Route("api/[controller]")]
    [ApiController]
    [IgnoreAntiforgeryToken(Order = 1001)]
    public class ProductsController : ControllerBase
    {
        private readonly HouseholdDbContext dataBase;
        private readonly IMapper mapper;

        public ProductsController(HouseholdDbContext dataBase, IMapper mapper)
        {
            this.dataBase = dataBase;
            this.mapper = mapper;
        }

        /// <summary>
        /// Список доступных продуктов
        /// </summary>
        /// <param name="skip"></param>
        /// <param name="take"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult<Page<ProductViewModel>>> GetProducts(int skip = 0, int take = 100)
        {
            if (take < 1)
                return BadRequest("Parameter take should be greater then 0");
            if (skip < 0)
                return BadRequest("Parameter skip should be greater or equal to 0");
            take = Math.Min(take, 100);

            var items = await dataBase.Products.Skip(skip).Take(take).ToArrayAsync().ConfigureAwait(false);
            var totalCount = await dataBase.Products.CountAsync().ConfigureAwait(false);

            var page = new Page<ProductViewModel>
            {
                Skip = skip,
                Take = take,
                TotalCount = totalCount,
                Items = items.Select(GetViewModel).ToArray()
            };
            return page;
        }

        // GET: api/Products/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductViewModel>> GetProduct(int id)
        {
            var product = await dataBase.Products.FindAsync(id).ConfigureAwait(false);

            if (product == null)
            {
                return NotFound();
            }

            return GetViewModel(product);
        }

        // POST: api/Products
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see https://aka.ms/RazorPagesCRUD.
        [HttpPost]
        public async Task<ActionResult<ProductViewModel>> PostProduct(ProductViewModel productViewModel)
        {
            var product = GetDataModel(productViewModel);
            dataBase.Products.Add(product);
            await dataBase.SaveChangesAsync();

            return CreatedAtAction("GetProduct", new {id = product.Id}, GetViewModel(product));
        }


        private ProductViewModel GetViewModel(Product productDataModel)
        {
            var productViewModel = mapper.Map<ProductViewModel>(productDataModel);
            return productViewModel;
        }

        private Product GetDataModel(ProductViewModel productViewModel)
        {
            var productDataModel = mapper.Map<Product>(productViewModel);
            return productDataModel;
        }
    }
}
