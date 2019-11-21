﻿using System;
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

        public DishesController(HouseholdDbContext dataBase, IMapper mapper)
        {
            this.dataBase = dataBase;
            this.mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<Page<DishViewModel>>> GetDishes(int skip = 0, int take = 100)
        {
            if (take < 1)
                return BadRequest("Parameter take should be greater then 0");
            if (skip < 0)
                return BadRequest("Parameter skip should be greater or equal to 0");
            take = Math.Min(take, 100);

            var userId = GetUserId();

            var items = await dataBase.Dishes
                .Where(p => p.CreatedBy == userId)
                .Include(d => d.Ingredients)
                .ThenInclude(ing => ing.Product)
                .Skip(skip).Take(take)
                .ToArrayAsync()
                .ConfigureAwait(false);

            var totalCount = await dataBase.Dishes
                .Where(p => p.CreatedBy == userId)
                .CountAsync()
                .ConfigureAwait(false);

            var page = new Page<DishViewModel>
            {
                Skip = skip,
                Take = take,
                TotalCount = totalCount,
                Items = items.Select(GetViewModel).ToArray()
            };
            return page;
        }

        [HttpGet("{id}")]
        public ActionResult<DishViewModel> GetDish(int id)
        {
            var dish = dataBase.Dishes
                .Include(d => d.Ingredients)
                .ThenInclude(ing => ing.Product)
                .FirstOrDefault(d => d.Id == id);

            if (dish == null)
            {
                return NotFound();
            }

            if (dish.CreatedBy != GetUserId())
            {
                return Unauthorized();
            }

            return GetViewModel(dish);
        }

        [HttpPost]
        public async Task<ActionResult<DishViewModel>> PostDish(DishViewModel dishViewModel)
        {
            var dish = GetDataModel(dishViewModel);
            dataBase.Dishes.Add(dish);

            var saveResult = await dataBase.SaveChanges();
            if (saveResult.IsFail)
                return ResponseFromApiResult(saveResult);

            return CreatedAtAction("GetDish", new
            {
                id = dish.Id
            }, GetViewModel(dish));
        }

        private DishViewModel GetViewModel(Dish dishDataModel)
        {
            var dishViewModel = mapper.Map<DishViewModel>(dishDataModel);
            return dishViewModel;
        }

        private Dish GetDataModel(DishViewModel dishViewModel)
        {
            var dishDataModel = mapper.Map<Dish>(dishViewModel);
            dishDataModel.CreatedBy = GetUserId();

            return dishDataModel;
        }
    }
}