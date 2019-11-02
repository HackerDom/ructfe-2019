import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-products',
    templateUrl: './products.component.html'
})
export class ProductsComponent {
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

interface Page<T> {
    skip: number;
    take: number;
    totalCount: number;
    items: T[];
}

interface Product {
    name: string;
    protein: number;
    fat: number;
    carbohydrate: number;
    calories: number;
}
