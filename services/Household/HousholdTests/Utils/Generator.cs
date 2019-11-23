using System;
using System.Collections.Generic;
using System.Linq;
using Household.ViewModels;

namespace HouseholdTests.Utils
{
    public static class Generator
    {
        private static readonly Random random = new Random();

        public static ProductView GetRandomProduct()
        {
            var product = new ProductView
            {
                Name = GetRandomString(),
                Protein = random.Next(100)
            };
            product.Fat = random.Next(100 - (int) product.Protein);
            product.Carbohydrate = random.Next(100 - (int) product.Protein - (int) product.Fat);
            product.Calories = 4 * (product.Protein + product.Carbohydrate) + 9 * product.Fat;
            return product;
        }

        public static DishViewCook GetRandomDish(ProductView[] registeredProducts)
        {
            var dish = new DishViewCook
            {
                Name = GetRandomString(),
                Description = GetRandomString(100),
                Recipe = GetRandomString(500),
                PortionWeight = random.Next(50, 500)
            };

            var ingredientsCount = random.Next(1, registeredProducts.Length);
            var someProducts = registeredProducts
                .OrderBy(x => random.Next())
                .Take(ingredientsCount);

            var ingredients = new List<IngredientView>();
            foreach (var product in someProducts)
            {
                ingredients.Add(new IngredientView
                {
                    ProductId = product.Id,
                    Weight = random.Next(1000)
                });
            }

            dish.Ingredients = ingredients.ToArray();
            return dish;
        }

        public static string GetRandomString(int length = 10)
        {
            var buffer = new byte[length * 2];
            random.NextBytes(buffer);
            return Convert.ToBase64String(buffer).Substring(0, length);
        }
    }
}
