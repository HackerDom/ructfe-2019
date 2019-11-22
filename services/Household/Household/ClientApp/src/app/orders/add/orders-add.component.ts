import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Page, Order } from '../../common';

@Component({
  selector: 'app-orders',
  templateUrl: './orders-add.component.html'
})
export class OrdersAddComponent {
  public order: Order;
  public uploadedCount: number;
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
    this.order = null;
  }

  addOrder(menuId: number, dishesIds: Array<number>) {
    this.loading = true;
    this.order = null;
    this.error = null;

    let newOrder = new Order(menuId, dishesIds);

    this.http.post<Order>(this.baseUrl + 'api/orders', newOrder).subscribe(result => {
        this.loading = false;
        this.order = result;
      },
      error => {
        console.error(error);
        this.loading = false;
        this.error = error.error;
      });
  }
}
