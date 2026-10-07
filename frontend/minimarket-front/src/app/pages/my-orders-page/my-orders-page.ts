import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { STATUS_LABELS } from '../../core/api/admin.service';
import { OrderResponse } from '../../core/api/models';
import { OrderService } from '../../core/api/order.service';
import { MoneyPipe } from '../../shared/money.pipe';

@Component({
  selector: 'app-my-orders-page',
  standalone: true,
  imports: [RouterLink, DatePipe, MoneyPipe],
  template: `
    <div class="container">
      <nav class="crumbs"><a routerLink="/account">Mon compte</a> › <span>Mes commandes</span></nav>
      <h1>Mes commandes</h1>

      @if (error()) {
        <div class="panel err" role="alert">Impossible de charger vos commandes.
          <button type="button" class="btn secondary" (click)="load()">Réessayer</button></div>
      } @else if (loading()) {
        <div class="panel muted">Chargement…</div>
      } @else if (orders().length === 0) {
        <div class="panel empty">
          <p>Vous n'avez pas encore passé de commande.</p>
          <a class="btn" routerLink="/search">Découvrir le catalogue</a>
        </div>
      } @else {
        @for (o of orders(); track o.id) {
          <article class="panel order">
            <header>
              <div><small>Commande passée le</small><strong>{{ o.createdAt | date: 'dd/MM/yyyy' }}</strong></div>
              <div><small>Total</small><strong>{{ o.totalAmount | money }}</strong></div>
              <div><small>N°</small><code>{{ o.id.slice(0, 8) }}</code></div>
              <span class="adm-badge" [class]="'adm-badge ' + o.status">{{ labels[o.status] }}</span>
            </header>
            <ul>
              @for (i of o.items; track $index) {
                <li><span>{{ i.quantity }} × {{ i.unitPrice | money }}</span><span class="muted">Produit {{ i.productId.slice(0, 8) }}</span></li>
              }
            </ul>
          </article>
        }
      }
    </div>
  `,
  styles: `
    h1 { font-weight: 400; margin: 8px 0 16px; }
    .crumbs { font-size: 13px; color: var(--mm-muted); a { color: var(--mm-link); text-decoration: none; } }
    .order { margin-bottom: 12px; }
    header { display: flex; gap: 28px; flex-wrap: wrap; align-items: center; padding-bottom: 10px; border-bottom: 1px solid var(--mm-border);
      div { display: flex; flex-direction: column; } small { color: var(--mm-muted); font-size: 12px; } .adm-badge { margin-left: auto; } }
    code { background: #f0f2f2; padding: 1px 6px; border-radius: 4px; }
    ul { list-style: none; margin: 10px 0 0; padding: 0; display: flex; flex-direction: column; gap: 6px; li { display: flex; justify-content: space-between; gap: 12px; } }
    .muted { color: var(--mm-muted); }
    .empty { text-align: center; padding: 40px 16px; }
    .err { color: var(--mm-red); display: flex; justify-content: space-between; align-items: center; gap: 12px; }
  `,
})
export class MyOrdersPage implements OnInit {
  private api = inject(OrderService);

  orders = signal<OrderResponse[]>([]);
  loading = signal(true);
  error = signal(false);
  readonly labels = STATUS_LABELS;

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(false);
    this.api.mine().subscribe({
      next: (o) => { this.orders.set(o); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }
}
