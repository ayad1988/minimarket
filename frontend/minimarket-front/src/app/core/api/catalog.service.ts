import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page, Product, ProductPayload } from './models';

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
  private http = inject(HttpClient);

  search(params: ProductSearchParams): Observable<Page<Product>> {
    let httpParams = new HttpParams();

    // ajoute seulement si valeur non vide
    const setIf = (key: string, value: unknown) => {
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
    setIf('active', params.active);
    setIf('minPrice', params.minPrice);
    setIf('maxPrice', params.maxPrice);

    return this.http.get<Page<Product>>(`/api/catalog/products`, { params: httpParams });
  }

  getById(id: string): Observable<Product> {
    return this.http.get<Product>(`/api/catalog/products/${id}`);
  }

  // --- back-office (token admin ajouté par l'intercepteur) ---

  create(payload: ProductPayload): Observable<Product> {
    return this.http.post<Product>(`/api/catalog/products`, payload);
  }

  update(id: string, payload: Partial<ProductPayload>): Observable<Product> {
    return this.http.put<Product>(`/api/catalog/products/${id}`, payload);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`/api/catalog/products/${id}`);
  }
}
