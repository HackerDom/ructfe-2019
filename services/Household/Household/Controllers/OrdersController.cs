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
            /// todo: list orders for cooker

            if (take < 1)
                return BadRequest("Parameter take should be greater then 0");
            if (skip < 0)
                return BadRequest("Parameter skip should be greater or equal to 0");
            take = Math.Min(take, 100);

            var items = await dataBase.Orders
                .Where(p => p.CreatedBy == CurrentUser.Id)
                .Include(m => m.DishesInOrder)
                .ThenInclude(dishInOrder => dishInOrder.Dish)
                .Include(o => o.Menu)
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
                Items = items.Select(GetViewModel).ToArray()
            };
            return page;
        }

        [HttpGet("{id}")]
        public ActionResult<OrderView> GetOrder(int id)
        {
            var order = dataBase.Orders
                .Include(o => o.DishesInOrder)
                .ThenInclude(dishInOrder => dishInOrder.Dish)
                .Include(o => o.Menu)
                .FirstOrDefault(o => o.Id == id);

            if (order == null)
            {
                return NotFound();
            }

            if (order.CreatedBy != CurrentUser.Id && order.Menu.CreatedBy != CurrentUser.Id)
            {
                return NotFound();
            }

            return GetViewModel(order);
        }

        [HttpPost]
        public async Task<ActionResult<OrderView>> PostOrder(OrderView orderView)
        {
            var order = GetDataModel(orderView);
            Clear(order);

            var menu = dataBase.Menus
                .Include(m => m.DishesInMenu)
                .FirstOrDefault(m => m.Id == order.MenuId);

            if (menu == null)
                return BadRequest($"Menu {order.MenuId} not found");

            var dishesInMenu = menu.DishesInMenu.Select(d => d.DishId).ToArray();
            var dishesInOrder = order.DishesInOrder.Select(d => d.DishId).ToArray();

            var unknownDishes = dishesInOrder.Where(dishId => !dishesInMenu.Contains(dishId)).ToArray();

            if (unknownDishes.Length != 0)
                return BadRequest($"Selected menu does not contain dishes: {string.Join(", ", unknownDishes)}");

            dataBase.Orders.Add(order);

            var saveResult = await dataBase.SaveChanges();
            if (saveResult.IsFail)
                return ResponseFromApiResult(saveResult);

            var createdOrder = GetOrder(order.Id).Value;

            return CreatedAtAction("GetOrder", new
            {
                id = order.Id
            }, createdOrder);
        }

        private OrderView GetViewModel(Order order)
        {
            var orderView = mapper.Map<OrderView>(order);
            return orderView;
        }

        private Order GetDataModel(OrderView orderView)
        {
            var order = mapper.Map<Order>(orderView);
            order.CreatedBy = CurrentUser.Id;

            return order;
        }

        private void Clear(Order order)
        {
            order.Id = 0;
        }
    }
}
