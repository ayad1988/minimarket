import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateOrderRequest, OrderResponse } from './models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);

  create(req: CreateOrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>('/api/orders', req);
  }

  /** Commandes du client connecté (le jeton est ajouté par l'intercepteur). */
  mine(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>('/api/orders/mine');
  }

  get(id: string): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`/api/orders/${id}`);
  }
}
