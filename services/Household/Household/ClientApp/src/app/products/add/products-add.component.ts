import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Page, Product } from '../../common';

@Component({
  selector: 'app-products',
  templateUrl: './products-add.component.html'
})
export class ProductsAddComponent {
  public product: Product;
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
    this.product = null;
  }

    addProduct(name: string, manufacturer: string, calories: number, protein: number, fat: number, carbohydrate: number) {
    this.loading = true;
    this.product = null;
    this.error = null;

    let newProduct = new Product(name, manufacturer, calories, protein, fat, carbohydrate);

    this.http.post<Product>(this.baseUrl + 'api/products', newProduct).subscribe(result => {
        this.loading = false;
        this.product = result;
      },
      error => {
        console.error(error);
        this.loading = false;
        this.error = error.error;
      });
  }
}
