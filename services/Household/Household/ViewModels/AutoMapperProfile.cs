using AutoMapper;
using Household.DataBaseModels;

namespace Household.ViewModels
{
    internal class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            //CreateMap<ApplicationUser, UserViewModel>()
            //    .ForMember(d => d.Roles, map => map.Ignore());
            //CreateMap<UserViewModel, ApplicationUser>()
            //    .ForMember(d => d.Roles, map => map.Ignore())
            //    .ForMember(d => d.Id, map => map.Condition(src => src.Id != null));

            //CreateMap<ApplicationUser, UserEditViewModel>()
            //    .ForMember(d => d.Roles, map => map.Ignore());
            //CreateMap<UserEditViewModel, ApplicationUser>()
            //    .ForMember(d => d.Roles, map => map.Ignore())
            //    .ForMember(d => d.Id, map => map.Condition(src => src.Id != null));

            //CreateMap<ApplicationUser, UserPatchViewModel>()
            //    .ReverseMap();

            //CreateMap<ApplicationRole, RoleViewModel>()
            //    .ForMember(d => d.Permissions, map => map.MapFrom(s => s.Claims))
            //    .ForMember(d => d.UsersCount, map => map.MapFrom(s => s.Users != null ? s.Users.Count : 0))
            //    .ReverseMap();
            //CreateMap<RoleViewModel, ApplicationRole>()
            //    .ForMember(d => d.Id, map => map.Condition(src => src.Id != null));

            //CreateMap<IdentityRoleClaim<string>, ClaimViewModel>()
            //    .ForMember(d => d.Type, map => map.MapFrom(s => s.ClaimType))
            //    .ForMember(d => d.Value, map => map.MapFrom(s => s.ClaimValue))
            //    .ReverseMap();

            //CreateMap<ApplicationPermission, PermissionViewModel>()
            //    .ReverseMap();

            //CreateMap<IdentityRoleClaim<string>, PermissionViewModel>()
            //    .ConvertUsing(s => (PermissionViewModel) ApplicationPermissions.GetPermissionByValue(s.ClaimValue));

            //CreateMap<Customer, CustomerViewModel>()
            //    .ReverseMap();

            CreateMap<Product, ProductViewModel>();
            CreateMap<ProductViewModel, Product>();

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

            //CreateMap<Order, OrderViewModel>()
            //    .ReverseMap();
        }
    }
}
