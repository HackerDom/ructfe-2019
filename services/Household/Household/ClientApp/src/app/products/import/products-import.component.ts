import { Component, Inject } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Page, Product } from '../../common';

@Component({
  selector: 'app-products',
  templateUrl: './products-import.component.html'
})
export class ProductsImportComponent {
  public products: Product[];
  public totalCount: number;
  public uploadedCount: number;
  public error: string;
  public loading: boolean;
  http: HttpClient;
  baseUrl: string;
  selectedFile: File = null;

  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    this.http = http;
    this.baseUrl = baseUrl;
    this.loading = false;
  }

  onFileSelected(event) {
    this.selectedFile = <File>event.target.files[0];
  }

  onUpload() {
    this.clear();
    this.loading = true;

    const fd = new FormData();
    fd.append('file', this.selectedFile);

    this.http.post<Page<Product>>(this.baseUrl + 'api/products/import', fd)
      .subscribe(result => {
          this.loading = false;

          this.products = result.items;
          this.totalCount = result.totalCount;
          this.uploadedCount = result.take;
        },
        error => {
          console.error(error);
          this.loading = false;
          this.error = error.error;
        });
  }

  clear() {
    this.products = null;
    this.totalCount = null;
    this.uploadedCount = null;
    this.error = null;
  }
}
