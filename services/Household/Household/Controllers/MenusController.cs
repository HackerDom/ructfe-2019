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
    public class MenusController : HouseholdControllerBase
    {
        private readonly HouseholdDbContext dataBase;
        private readonly IMapper mapper;

        public MenusController(HouseholdDbContext dataBase, IMapper mapper) : base(dataBase)
        {
            this.dataBase = dataBase;
            this.mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<Page<MenuView>>> GetMenus(int skip = 0, int take = 100)
        {
            if (take < 1)
                return BadRequest("Parameter take should be greater then 0");
            if (skip < 0)
                return BadRequest("Parameter skip should be greater or equal to 0");
            take = Math.Min(take, 100);

            var items = await dataBase.Menus
                .Include(m => m.DishesInMenu)
                .Skip(skip).Take(take)
                .ToArrayAsync();

            var totalCount = await dataBase.Menus
                .CountAsync();

            var page = new Page<MenuView>
            {
                Skip = skip,
                Take = take,
                TotalCount = totalCount,
                Items = items.Select(mapper.Map<MenuView>).ToArray()
            };
            return page;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MenuView>> GetMenu(int id)
        {
            var menu = await dataBase.Menus.FindAsync(id);

            if (menu == null)
            {
                return NotFound();
            }

            return mapper.Map<MenuView>(menu);
        }

        [HttpPost]
        public async Task<ActionResult<MenuView>> PostMenu(MenuView menuViewModel)
        {
            if (CurrentUser.Role != Role.Cook)
                return NotAllowed();

            var menu = mapper.Map<Menu>(menuViewModel);
            dataBase.Menus.Add(menu);

            var saveResult = await dataBase.SaveChanges();
            if (saveResult.IsFail)
                return ResponseFromApiResult(saveResult);

            var createdMenu = (await GetMenu(menu.Id)).Value;

            return CreatedAtAction("GetMenu", new
            {
                id = menu.Id
            }, createdMenu);
        }
    }
}