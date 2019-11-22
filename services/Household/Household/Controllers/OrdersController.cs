using System;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Household.DataBase;
using Household.DataBaseModels;
using Household.ViewModels;

namespace Household.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : HouseholdControllerBase
    {
        private readonly HouseholdDbContext dataBase;
        private readonly IMapper mapper;

        public OrdersController(HouseholdDbContext dataBase, IMapper mapper) : base(dataBase)
        {
            this.dataBase = dataBase;
            this.mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<Page<OrderView>>> GetOrders(int skip = 0, int take = 100)
        {
            if (take < 1)
                return BadRequest("Parameter take should be greater then 0");
            if (skip < 0)
                return BadRequest("Parameter skip should be greater or equal to 0");
            take = Math.Min(take, 100);

            var items = await dataBase.Orders
                .Where(p => p.CreatedBy == CurrentUser.Id)
                .Include(m => m.DishesInOrder)
                .Skip(skip).Take(take)
                .ToArrayAsync();

            var totalCount = await dataBase.Orders
                .Where(p => p.CreatedBy == CurrentUser.Id)
                .CountAsync();

            var page = new Page<OrderView>
            {
                Skip = skip,
                Take = take,
                TotalCount = totalCount,
                Items = items.Select(mapper.Map<OrderView>).ToArray()
            };
            return page;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OrderView>> GetOrder(int id)
        {
            var order = await dataBase.Orders.FindAsync(id);
            /// todo: full order? with dishes

            if (order == null)
            {
                return NotFound();
            }

            if (order.CreatedBy != CurrentUser.Id && order.Menu.CreatedBy != CurrentUser.Id)
            {
                return NotFound();
            }

            return mapper.Map<OrderView>(order);
        }

        [HttpPost]
        public async Task<ActionResult<OrderView>> PostOrder(OrderView orderView)
        {
            var order = mapper.Map<Order>(orderView);

            /// todo: check dishes are from menu

            dataBase.Orders.Add(order);

            var saveResult = await dataBase.SaveChanges();
            if (saveResult.IsFail)
                return ResponseFromApiResult(saveResult);

            var createdOrder = (await GetOrder(order.Id)).Value;

            return CreatedAtAction("GetOrder", new
            {
                id = order.Id
            }, createdOrder);
        }
    }
}