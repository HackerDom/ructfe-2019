import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Page, Order } from '../../common';

@Component({
  selector: 'app-orders',
  templateUrl: './orders-list.component.html'
})
export class OrdersListComponent {
  public orders: Order[];
  public totalCount: number;

  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    http.get<Page<Order>>(baseUrl + 'api/orders').subscribe(result => {
        this.orders = result.items;
        this.totalCount = result.totalCount;
      },
      error => console.error(error));
  }
}
