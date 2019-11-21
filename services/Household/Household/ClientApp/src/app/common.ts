export interface Page<T> {
  skip: number;
  take: number;
  totalCount: number;
  items: T[];
}


export class Product {
  name: string;
  protein: number;
  fat: number;
  carbohydrate: number;
  calories: number;

  constructor(name: string, calories: number, protein: number, fat: number, carbohydrate: number) {
    this.name = name;
    this.calories = calories;
    this.protein = protein;
    this.fat = fat;
    this.carbohydrate = carbohydrate;
  }
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