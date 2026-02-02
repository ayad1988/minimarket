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
 constructor(private http: HttpClient) {}

  search(params: ProductSearchParams): Observable<Page<Product>> {
    let httpParams = new HttpParams();

    // helper : ajoute seulement si valeur non vide
    const setIf = (key: string, value: any) => {
      if (value === undefined || value === null) return;
      if (typeof value === 'string' && value.trim() === '') return;
      httpParams = httpParams.set(key, String(value));
    };
    setIf('page', params.page ?? 0);
    setIf('size', params.size ?? 12);
    setIf('sort', params.sort ?? 'price,asc');

    setIf('q', params.q);
    setIf('category', params.category);
    setIf('brand', params.brand);
    setIf('active', params.active);       // true seulement si défini
    setIf('minPrice', params.minPrice);
    setIf('maxPrice', params.maxPrice);

    // adapte l'URL à ton gateway (/catalog/products ou /products)
    return this.http.get<Page<Product>>(`/api/catalog/products`, { params: httpParams });
  }
}
