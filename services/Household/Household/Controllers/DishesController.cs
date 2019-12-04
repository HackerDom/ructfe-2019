using System;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;        
using Household.DataBase;
using Household.DataBaseModels;
using Household.ViewModels;
using Microsoft.AspNetCore.Authorization;

namespace Household.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DishesController : HouseholdControllerBase
    {
        private readonly HouseholdDbContext dataBase;
        private readonly IMapper mapper;

        public DishesController(HouseholdDbContext dataBase, IMapper mapper) : base(dataBase)
        {
            this.dataBase = dataBase;
            this.mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<Page<DishViewCook>>> GetDishes(int skip = 0, int take = 100)
        {
            if (take < 1)
                return BadRequest("Parameter take should be greater then 0");
            if (skip < 0)
                return BadRequest("Parameter skip should be greater or equal to 0");
            take = Math.Min(take, 100);

            var items = await dataBase.Dishes
                .Where(p => p.CreatedBy == CurrentUser.Id)
                .Include(d => d.Ingredients)
                .ThenInclude(ing => ing.Product)
                .Skip(skip).Take(take)
                .ToArrayAsync();

            var totalCount = await dataBase.Dishes
                .Where(p => p.CreatedBy == CurrentUser.Id)
                .CountAsync();

            var page = new Page<DishViewCook>
            {
                Skip = skip,
                Take = take,
                TotalCount = totalCount,
                Items = items.Select(GetViewCook).ToArray()
            };
            return page;
        }

        [HttpGet("{id}")]
        public ActionResult<DishView> GetDish(int id)
        {
            var dish = dataBase.Dishes
                .Include(d => d.Ingredients)
                .ThenInclude(ing => ing.Product)
                .FirstOrDefault(d => d.Id == id);

            if (dish == null)
            {
                return NotFound();
            }

            if (dish.CreatedBy != CurrentUser.Id)
            {
                return GetViewCustomer(dish);
            }

            return GetViewCook(dish);
        }

        [HttpPost]
        public async Task<ActionResult<DishViewCook>> PostDish(DishViewCook dishView)
        {
            if (CurrentUser.Role != Role.Cook)
                return NotAllowed();

            var dish = GetDataModel(dishView);
            Clear(dish);

            dataBase.Dishes.Add(dish);

            var saveResult = await dataBase.SaveChanges();
            if (saveResult.IsFail)
                return ResponseFromApiResult(saveResult);

            var createdDish = GetDish(dish.Id).Value;

            return CreatedAtAction("GetDish", new
            {
                id = dish.Id
            }, createdDish);
        }

        private DishViewCook GetViewCook(Dish dishDataModel)
        {
            var dishViewModel = mapper.Map<DishViewCook>(dishDataModel);
            return dishViewModel;
        }

        private DishViewCustomer GetViewCustomer(Dish dishDataModel)
        {
            var dishViewModel = mapper.Map<DishViewCustomer>(dishDataModel);
            return dishViewModel;
        }

        private Dish GetDataModel(DishViewCook dishView)
        {
            var dishDataModel = mapper.Map<Dish>(dishView);
            dishDataModel.CreatedBy = CurrentUser.Id;

            return dishDataModel;
        }

        private void Clear(Dish dish)
        {
            dish.Id = 0;
        }
    }
}
