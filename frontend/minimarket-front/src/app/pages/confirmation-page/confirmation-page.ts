import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../core/api/order.service';
import { OrderResponse } from '../../core/api/models';
import { MoneyPipe } from '../../shared/money.pipe';

@Component({
  selector: 'app-confirmation-page',
  standalone: true,
  imports: [RouterLink, MoneyPipe],
  template: `
    <div class="container">
      <div class="panel box">
        <span class="material-icons ok">check_circle</span>
        <h1>Merci pour votre commande !</h1>
        @if (order(); as o) {
          <p>Un e-mail de confirmation est envoyé à <strong>{{ o.customerEmail }}</strong>.</p>
          <dl>
            <dt>N° de commande</dt><dd>{{ o.id }}</dd>
            <dt>Statut</dt><dd>{{ o.status }}</dd>
            <dt>Articles</dt><dd>{{ count(o) }}</dd>
            <dt>Total articles</dt><dd>{{ o.totalAmount | money }}</dd>
          </dl>
        } @else if (failed()) {
          <p>Votre commande est bien enregistrée (n° <strong>{{ id }}</strong>), mais ses détails sont momentanément indisponibles.</p>
        } @else {
          <p>Chargement du détail…</p>
        }
        <a class="btn" routerLink="/">Continuer mes achats</a>
      </div>
    </div>
  `,
  styles: `
    .box { max-width: 560px; margin: 24px auto; text-align: center; }
    .ok { font-size: 64px; color: var(--mm-green); }
    h1 { margin: 8px 0 12px; font-weight: 500; }
    dl { display: grid; grid-template-columns: auto 1fr; gap: 6px 16px; text-align: left; margin: 20px 0; word-break: break-all;
      dt { color: var(--mm-muted); } dd { margin: 0; font-weight: 500; } }
  `,
})
export class ConfirmationPage implements OnInit {
  private orders = inject(OrderService);
  id = inject(ActivatedRoute).snapshot.paramMap.get('id')!;

  order = signal<OrderResponse | null>(null);
  failed = signal(false);

  ngOnInit() {
    this.orders.get(this.id).subscribe({
      next: (o) => this.order.set(o),
      error: () => this.failed.set(true),
    });
  }

  count(o: OrderResponse) {
    return o.items.reduce((n, i) => n + i.quantity, 0);
  }
}
