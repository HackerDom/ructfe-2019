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
            CreateMap<Product, ProductView>();
            CreateMap<ProductView, Product>();
            CreateMap<ProductImportModel, Product>();

            CreateMap<Ingredient, IngredientView>();
            CreateMap<IngredientView, Ingredient>();

            CreateMap<Dish, DishViewCook>()
                .ForMember(dvm => dvm.PortionProtein,
                    map => map.MapFrom(dish => dish.Protein))
                .ForMember(dvm => dvm.PortionFat,
                    map => map.MapFrom(dish => dish.Fat))
                .ForMember(dvm => dvm.PortionCarbohydrate,
                    map => map.MapFrom(dish => dish.Carbohydrate))
                .ForMember(dvm => dvm.PortionCalories,
                    map => map.MapFrom(dish => dish.Calories));

            CreateMap<Dish, DishViewCustomer>()
                .ForMember(dvm => dvm.PortionProtein,
                    map => map.MapFrom(dish => dish.Protein))
                .ForMember(dvm => dvm.PortionFat,
                    map => map.MapFrom(dish => dish.Fat))
                .ForMember(dvm => dvm.PortionCarbohydrate,
                    map => map.MapFrom(dish => dish.Carbohydrate))
                .ForMember(dvm => dvm.PortionCalories,
                    map => map.MapFrom(dish => dish.Calories))
                .ForMember(dvm => dvm.Ingredients,
                    map => map.MapFrom(dish => dish
                        .Ingredients.Select(ingredient => ingredient.Product.Name)));

            CreateMap<DishViewCook, Dish>();

            CreateMap<Menu, MenuView>()
                .ForMember(mvm => mvm.DishIds,
                    map => map.MapFrom(menu =>
                        menu.DishesInMenu.Select(dishInMenu => dishInMenu.Dish.Id)));
            CreateMap<MenuView, Menu>()
                .ForMember(mvm => mvm.DishesInMenu,
                    map => map.MapFrom(menu =>
                        menu.DishIds.Select(dish => new DishInMenu
                        {
                            DishId = dish
                        })));
        }
    }
}
