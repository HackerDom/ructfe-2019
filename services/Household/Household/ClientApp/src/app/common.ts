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
