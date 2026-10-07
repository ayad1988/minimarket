import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { AdminService, NEXT_STATUSES, STATUS_LABELS } from '../../core/api/admin.service';
import { OrderResponse, OrderStatus, Page } from '../../core/api/models';
import { MoneyPipe } from '../../shared/money.pipe';
import { Pagination } from '../../shared/pagination/pagination';

@Component({
  selector: 'app-orders-admin-page',
  standalone: true,
  imports: [MoneyPipe, DatePipe, Pagination],
  templateUrl: './orders-admin-page.html',
  styleUrl: './orders-admin-page.scss',
})
export class OrdersAdminPage implements OnInit {
  private admin = inject(AdminService);

  page = signal<Page<OrderResponse> | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  expanded = signal<string | null>(null);
  pendingCancel = signal<string | null>(null);
  busyId = signal<string | null>(null);
  names = signal<Map<string, string>>(new Map());

  status: OrderStatus | '' = '';
  pageIndex = 0;

  readonly labels = STATUS_LABELS;
  readonly tabs: { value: OrderStatus | ''; label: string }[] = [
    { value: '', label: 'Toutes' },
    ...(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => ({ value: s, label: STATUS_LABELS[s] })),
  ];
  next = (s: OrderStatus) => NEXT_STATUSES[s];

  ngOnInit() {
    this.load();
    this.admin.productNames.subscribe({ next: (m) => this.names.set(m), error: () => undefined });
  }

  load() {
    this.loading.set(true);
    this.admin.orders(this.status, this.pageIndex).subscribe({
      next: (p) => { this.page.set(p); this.loading.set(false); this.error.set(null); },
      error: () => { this.loading.set(false); this.error.set('Impossible de charger les commandes.'); },
    });
  }

  setTab(s: OrderStatus | '') {
    this.status = s;
    this.pageIndex = 0;
    this.expanded.set(null);
    this.load();
  }

  goTo(p: number) {
    this.pageIndex = p;
    this.load();
  }

  toggle(id: string) {
    this.expanded.set(this.expanded() === id ? null : id);
  }

  move(o: OrderResponse, status: OrderStatus) {
    this.busyId.set(o.id);
    this.error.set(null);
    this.admin.setStatus(o.id, status).subscribe({
      next: () => {
        this.busyId.set(null);
        this.pendingCancel.set(null);
        this.load(); // le filtre actif peut ne plus contenir la commande
      },
      error: (e: HttpErrorResponse) => {
        this.busyId.set(null);
        this.error.set(e.status === 409
          ? 'Cette transition de statut n\'est pas autorisée (la commande a peut-être déjà changé).'
          : 'Le changement de statut a échoué.');
        this.load();
      },
    });
  }

  actionLabel(s: OrderStatus): string {
    return s === 'PAID' ? 'Marquer payée' : s === 'SHIPPED' ? 'Expédier' : 'Annuler';
  }

  productName(id: string) {
    return this.names().get(id) ?? `Produit ${id.slice(0, 8)}…`;
  }

  itemCount(o: OrderResponse) {
    return o.items.reduce((n, i) => n + i.quantity, 0);
  }
}
