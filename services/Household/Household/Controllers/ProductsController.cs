using System.Linq;
using System.Threading.Tasks;
using Household.DataBase;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Household.DataBaseModels;
using Household.ViewModels;
#pragma warning disable 1591

namespace Household.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly DataBaseContext dataBase;

        public ProductsController(DataBaseContext dataBase)
        {
            this.dataBase = dataBase;
        }

        /// <summary>
        /// Список доступных продуктов
        /// </summary>
        /// <param name="skip"></param>
        /// <param name="take"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult<Page<Product>>> GetProducts(int skip = 0, int take = 100)
        {
            // TODO: проверка параметров
            if (take < 1)
                return BadRequest("Parameter take should be greater then 0");


            var items = await dataBase.Products.Skip(skip).Take(take).ToArrayAsync().ConfigureAwait(false);
            var totalCount = await dataBase.Products.CountAsync().ConfigureAwait(false);

            var page = new Page<Product>
            {
                Skip = skip,
                Take = take,
                TotalCount = totalCount,
                Items = items
            };
            return page;
        }

        // GET: api/Products/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await dataBase.Products.FindAsync(id).ConfigureAwait(false);

            if (product == null)
            {
                return NotFound();
            }

            return product;
        }

        // PUT: api/Products/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see https://aka.ms/RazorPagesCRUD.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduct(int id, Product product)
        {
            if (id != product.Id)
            {
                return BadRequest();
            }

            dataBase.Entry(product).State = EntityState.Modified;

            try
            {
                await dataBase.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Products
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see https://aka.ms/RazorPagesCRUD.
        [HttpPost]
        public async Task<ActionResult<Product>> PostProduct(Product product)
        {
            dataBase.Products.Add(product);
            await dataBase.SaveChangesAsync().ConfigureAwait(false);

            return CreatedAtAction("GetProduct", new {id = product.Id}, product);
            // return await GetProduct(product.Id).ConfigureAwait(false);
        }

        // DELETE: api/Products/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<Product>> DeleteProduct(int id)
        {
            var product = await dataBase.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            dataBase.Products.Remove(product);
            await dataBase.SaveChangesAsync();

            return product;
        }

        private bool ProductExists(int id)
        {
            return dataBase.Products.Any(e => e.Id == id);
        }
    }
}