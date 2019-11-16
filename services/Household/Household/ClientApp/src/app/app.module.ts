import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { CounterComponent } from './counter/counter.component';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { ProductsAddComponent } from './products/add/products-add.component';
import { ProductsImportComponent } from './products/import/products-import.component';
import { ProductsListComponent } from './products/list/products-list.component';
import { DishesAddComponent } from './dishes/add/dishes-add.component';
import { DishesListComponent } from './dishes/list/dishes-list.component';
import { ApiAuthorizationModule } from 'src/api-authorization/api-authorization.module';
import { AuthorizeGuard } from 'src/api-authorization/authorize.guard';
import { AuthorizeInterceptor } from 'src/api-authorization/authorize.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    CounterComponent,
    FetchDataComponent,
    ProductsAddComponent,
    ProductsImportComponent,
    ProductsListComponent,
    DishesAddComponent,
    DishesListComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    ApiAuthorizationModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'counter', component: CounterComponent },
      { path: 'fetch-data', component: FetchDataComponent, canActivate: [AuthorizeGuard] },
      { path: 'products/add', component: ProductsAddComponent, canActivate: [AuthorizeGuard] },
      { path: 'products/import', component: ProductsImportComponent, canActivate: [AuthorizeGuard] },
      { path: 'products/list', component: ProductsListComponent, canActivate: [AuthorizeGuard] },
      { path: 'dishes/add', component: DishesAddComponent, canActivate: [AuthorizeGuard] },
      { path: 'dishes/list', component: DishesListComponent, canActivate: [AuthorizeGuard] },
    ])
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthorizeInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
