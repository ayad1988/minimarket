import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { CatalogService } from './catalog.service';
import { AdminStats, OrderResponse, OrderStatus, Page } from './models';

/** Transitions autorisées, miroir de OrderStatus.canGoTo côté order-service. */
export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  CREATED: ['PAID', 'CANCELLED'],
  PAID: ['SHIPPED', 'CANCELLED'],
  SHIPPED: [],
  CANCELLED: [],
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  CREATED: 'Nouvelle',
  PAID: 'Payée',
  SHIPPED: 'Expédiée',
  CANCELLED: 'Annulée',
};

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private catalog = inject(CatalogService);

  stats(): Observable<AdminStats> {
    return this.http.get<AdminStats>('/api/admin/stats');
  }

  orders(status: OrderStatus | '', page: number, size = 20): Observable<Page<OrderResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<Page<OrderResponse>>('/api/admin/orders', { params });
  }

  setStatus(id: string, status: OrderStatus): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(`/api/admin/orders/${id}/status`, { status });
  }

  /** id produit -> nom, pour afficher des noms plutôt que des UUID (pas de nom stocké dans les commandes). */
  productNames = this.catalog.search({ size: 200, sort: 'name,asc' }).pipe(
    map((p) => new Map(p.content.map((x) => [x.id, x.name] as const))),
    shareReplay({ bufferSize: 1, refCount: false }),
  );
}
