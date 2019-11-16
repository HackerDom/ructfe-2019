export interface Page<T> {
  skip: number;
  take: number;
  totalCount: number;
  items: T[];
}


export interface Product {
  name: string;
  protein: number;
  fat: number;
  carbohydrate: number;
  calories: number;
}


export interface Dish {
  name: string;
  description: string,
  image: string;
  portionWeight: number,
  //public IngredientViewModel[] Ingredients { get; set; }
  portionProtein: number;
  portionFat: number;
  portionCarbohydrate: number;
  portionCalories: number;
}
