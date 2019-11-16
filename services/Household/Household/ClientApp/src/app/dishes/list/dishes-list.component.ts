import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Page, Dish } from '../../common';

@Component({
  selector: 'app-dishes',
  templateUrl: './dishes-list.component.html'
})
export class DishesListComponent {
  public dishes: Dish[];
  public totalCount: number;

  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    http.get<Page<Dish>>(baseUrl + 'api/dishes').subscribe(result => {
        this.dishes = result.items;
        this.totalCount = result.totalCount;
      },
      error => console.error(error));
  }
}
