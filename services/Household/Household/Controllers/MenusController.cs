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
    public class MenusController : ControllerBase
    {
        private readonly HouseholdDbContext dataBase;
        private readonly IMapper mapper;

        public MenusController(HouseholdDbContext dataBase, IMapper mapper)
        {
            this.dataBase = dataBase;
            this.mapper = mapper;
        }

        // GET: api/Menus
        [HttpGet]
        public async Task<ActionResult<Page<MenuViewModel>>> GetMenus(int skip = 0, int take = 100)
        {
            if (take < 1)
                return BadRequest("Parameter take should be greater then 0");
            if (skip < 0)
                return BadRequest("Parameter skip should be greater or equal to 0");
            take = Math.Min(take, 100);

            var items = await dataBase.Menus
                .Include(m => m.DishesInMenu)
                .Skip(skip).Take(take)
                .ToArrayAsync().ConfigureAwait(false);

            var totalCount = await dataBase.Menus.CountAsync().ConfigureAwait(false);

            var page = new Page<MenuViewModel>
            {
                Skip = skip,
                Take = take,
                TotalCount = totalCount,
                Items = items.Select(mapper.Map<MenuViewModel>).ToArray()
            };
            return page;
        }

        // GET: api/Menus/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MenuViewModel>> GetMenu(int id)
        {
            var menu = await dataBase.Menus.FindAsync(id);

            if (menu == null)
            {
                return NotFound();
            }

            return mapper.Map<MenuViewModel>(menu);
        }

        // POST: api/Menus
        [HttpPost]
        public async Task<ActionResult<MenuViewModel>> PostMenu(MenuViewModel menuViewModel)
        {
            var menu = mapper.Map<Menu>(menuViewModel);
            dataBase.Menus.Add(menu);
            await dataBase.SaveChangesAsync();

            return CreatedAtAction("GetMenu", new {id = menu.Id}, mapper.Map<MenuViewModel>(menu));
        }
    }
}
