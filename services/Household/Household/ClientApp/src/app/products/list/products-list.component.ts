import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Page, Product } from '../../common';

@Component({
  selector: 'app-products',
  templateUrl: './products-list.component.html'
})
export class ProductsListComponent {
  public products: Product[];
  public totalCount: number;

  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    http.get<Page<Product>>(baseUrl + 'api/products').subscribe(result => {
        this.products = result.items;
        this.totalCount = result.totalCount;
      },
      error => console.error(error));
  }
}
