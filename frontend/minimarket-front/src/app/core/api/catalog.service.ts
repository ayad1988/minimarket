import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page, Product } from './models';

export interface ProductSearchParams {
  page?: number;
  size?: number;
  sort?: string;      // ex: "price,desc"
  category?: string;
  brand?: string;
  active?: boolean;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly baseUrl = '/api/catalog/products';

  constructor(private http: HttpClient) {}

  search(params: ProductSearchParams): Observable<Page<Product>> {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        httpParams = httpParams.set(k, String(v));
      }
    });

    return this.http.get<Page<Product>>(this.baseUrl, { params: httpParams });
  }
}
