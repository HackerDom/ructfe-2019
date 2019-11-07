using System.Collections.Generic;
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
    public class DishesController : ControllerBase
    {
        private readonly HouseholdDbContext context;
        private readonly IMapper mapper;

        public DishesController(HouseholdDbContext context, IMapper mapper)
        {
            this.context = context;
            this.mapper = mapper;
        }

        //// GET: api/Dishes
        //[HttpGet]
        //public async Task<ActionResult<IEnumerable<DishViewModel>>> GetDishes()
        //{
        //    return await context.Dishes.ToListAsync();
        //}

        // GET: api/Dishes/5
        [HttpGet("{id}")]
        public ActionResult<DishViewModel> GetDish(int id)
        {
            var dish = context.Dishes
                .Include(d => d.Ingredients)
                .ThenInclude(ing => ing.Product)
                .FirstOrDefault(d => d.Id == id);

            if (dish == null)
            {
                return NotFound();
            }

            return GetViewModel(dish);
        }

        // POST: api/Dishes
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see https://aka.ms/RazorPagesCRUD.
        [HttpPost]
        public async Task<ActionResult<DishViewModel>> PostDish(DishViewModel dishViewModel)
        {
            var dish = GetDataModel(dishViewModel);
            context.Dishes.Add(dish);
            await context.SaveChangesAsync();

            return CreatedAtAction("GetDish", new {id = dish.Id}, GetViewModel(dish));
        }

        private DishViewModel GetViewModel(Dish dishDataModel)
        {
            var dishViewModel = mapper.Map<DishViewModel>(dishDataModel);
            return dishViewModel;
        }

        private Dish GetDataModel(DishViewModel dishViewModel)
        {
            var dishDataModel = mapper.Map<Dish>(dishViewModel);
            return dishDataModel;
        }
    }
}
