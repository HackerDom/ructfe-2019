import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Dish } from '../../common';

@Component({
  selector: 'app-dishes',
  templateUrl: './dishes-add.component.html'
})
export class DishesAddComponent {
  public dish: Dish;
  public error: string;
  public loading: boolean;
  http: HttpClient;
  baseUrl: string;

  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    this.http = http;
    this.baseUrl = baseUrl;
    this.loading = false;
  }

  addNew() {
    this.dish = null;
  }

  addDish(name: string, description: string, recipe: string, weight: number) {
    this.loading = true;
    this.dish = null;
    this.error = null;

    let newDish = new Dish(name, description, recipe, weight);

    this.http.post<Dish>(this.baseUrl + 'api/dishes', newDish).subscribe(result => {
        this.loading = false;
        this.dish = result;
      },
      error => {
        console.error(error);
        this.loading = false;
        this.error = error.error;
      });
  }
}
