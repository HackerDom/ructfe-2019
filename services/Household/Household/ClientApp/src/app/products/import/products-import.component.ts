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
  http: HttpClient;
  baseUrl: string;
  selectedFile: File = null;

  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    this.http = http;
    this.baseUrl = baseUrl;
  }

  onFileSelected(event) {
    this.selectedFile = <File>event.target.files[0];
  }

  onUpload() {
    const fd = new FormData();
    fd.append('file', this.selectedFile);

    this.http.post<Page<Product>>(this.baseUrl + 'api/products/import', fd)
      .subscribe(result => {
          this.products = result.items;
          this.totalCount = result.totalCount;
          this.uploadedCount = result.take;
        },
        error => console.error(error));
    // II
    // если ваш сервер поддерживает прием бинарных файлов, то вы можете отправить файл следующим образом:
    // this.http.post('./api/test-api-for-upload', this.selectedFile)

  }

  onUpload2() {
    const fd = new FormData();
    fd.append('file', this.selectedFile);

    // еще больше:
    // давайте сконфигурируем объект request, чтобы следить за прогрессом загрузки

    this.http.post<Page<Product>>(this.baseUrl + 'api/products/import',
        fd,
        {
          reportProgress: true,
          observe: 'events'
        })
      .subscribe(event => {
          // подключим HttpEventType
          // import { HttpClient, HttpEventType } from '@angular/common/http';
          // и далее мы можем сделать проверку
          if (event.type == HttpEventType.UploadProgress) {
            console.log('Upload Progress: ', Math.round(event.loaded / event.total * 100) + '%');
          } else (event.type == HttpEventType.Response)
          {
            console.log(event);
          }
        },
        error => console.error(error))
    //.subscribe(result => {
    //    this.products = result.items;
    //    this.totalCount = result.totalCount;
    //  },
    //  error => console.error(error));

    // II
    // если ваш сервер поддерживает прием бинарных файлов, то вы можете отправить файл следующим образом:
    // this.http.post('./api/test-api-for-upload', this.selectedFile)

  }
}
