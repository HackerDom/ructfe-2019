export interface Page<T> {
  skip: number;
  take: number;
  totalCount: number;
  items: T[];
}


export class Product {
  name: string;
  manufacturer: string;
  protein: number;
  fat: number;
  carbohydrate: number;
  calories: number;

  constructor(name: string,
    manufacturer: string,
    calories: number,
    protein: number,
    fat: number,
    carbohydrate: number) {
    this.name = name;
    this.manufacturer = manufacturer
    this.calories = calories;
    this.protein = protein;
    this.fat = fat;
    this.carbohydrate = carbohydrate;
  }
}


export class Order {
  menuId: number;
  dishesIds: Array<number>;

  constructor(menuId: number, dishesIds: Array<number>) {
    this.menuId = menuId;
    this.dishesIds = dishesIds;
  }
}

export class Dish {
  constructor(name: string,
    description: string,
    recipe: string,
    weight: number) {
    this.name = name;
    this.description = description;
    this.recipe = recipe;
    this.portionWeight = weight;
    this.portionCalories = 0;
    this.portionProtein = 0;
    this.portionFat = 0;
    this.portionCarbohydrate = 0;
  }

  name: string;
  description: string;
  recipe: string;
  portionWeight: number;
  portionProtein: number;
  portionFat: number;
  portionCarbohydrate: number;
  portionCalories: number;
}
