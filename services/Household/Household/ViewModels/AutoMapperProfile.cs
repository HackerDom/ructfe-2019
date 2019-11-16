using System.Linq;
using AutoMapper;
using Household.DataBaseModels;
using Household.Utils;

namespace Household.ViewModels
{
    internal class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<Product, ProductViewModel>();
            CreateMap<ProductViewModel, Product>();
            CreateMap<ProductImportModel, Product>();

            CreateMap<Ingredient, IngredientViewModel>();
            CreateMap<IngredientViewModel, Ingredient>();

            CreateMap<Dish, DishViewModel>()
                .ForMember(dvm => dvm.PortionProtein,
                    map => map.MapFrom(dish => dish.Protein))
                .ForMember(dvm => dvm.PortionFat,
                    map => map.MapFrom(dish => dish.Fat))
                .ForMember(dvm => dvm.PortionCarbohydrate,
                    map => map.MapFrom(dish => dish.Carbohydrate))
                .ForMember(dvm => dvm.PortionCalories,
                    map => map.MapFrom(dish => dish.Calories));

            CreateMap<DishViewModel, Dish>();

            CreateMap<Menu, MenuViewModel>()
                .ForMember(mvm => mvm.DishIds,
                    map => map.MapFrom(menu =>
                        menu.DishesInMenu.Select(dishInMenu => dishInMenu.Dish.Id)));
            CreateMap<MenuViewModel, Menu>()
                .ForMember(mvm => mvm.DishesInMenu,
                    map => map.MapFrom(menu =>
                        menu.DishIds.Select(dish => new DishInMenu
                        {
                            DishId = dish
                        })));
        }
    }
}
