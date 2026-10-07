import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, STATUS_LABELS } from '../../core/api/admin.service';
import { CatalogService } from '../../core/api/catalog.service';
import { AdminStats, OrderStatus } from '../../core/api/models';
import { MoneyPipe } from '../../shared/money.pipe';

const STATUS_ORDER: OrderStatus[] = ['CREATED', 'PAID', 'SHIPPED', 'CANCELLED'];

// Graphique: une seule série -> une seule teinte; géométrie du viewBox (unités SVG).
const W = 640, H = 220, PAD = { l: 44, r: 8, t: 12, b: 28 };

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [MoneyPipe, DecimalPipe, RouterLink],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage implements OnInit {
  private admin = inject(AdminService);
  private catalog = inject(CatalogService);

  stats = signal<AdminStats | null>(null);
  productCount = signal<number | null>(null);
  inactiveCount = signal<number | null>(null);
  names = signal<Map<string, string>>(new Map());
  error = signal<string | null>(null);
  showTable = signal(false);
  hover = signal<number | null>(null);

  readonly W = W;
  readonly H = H;
  readonly labels = STATUS_LABELS;
  readonly statusOrder = STATUS_ORDER;

  statuses = computed(() => {
    const s = this.stats();
    if (!s) return [];
    const max = Math.max(1, ...STATUS_ORDER.map((k) => s.byStatus[k] ?? 0));
    return STATUS_ORDER.map((k) => ({ key: k, count: s.byStatus[k] ?? 0, pct: ((s.byStatus[k] ?? 0) / max) * 100 }));
  });

  /** Barres: échelle sur le max (arrondi à une valeur lisible), jamais tronquée. */
  chart = computed(() => {
    const days = this.stats()?.last14Days ?? [];
    const rawMax = Math.max(0, ...days.map((d) => d.revenue));
    const max = niceMax(rawMax);
    const innerW = W - PAD.l - PAD.r;
    const innerH = H - PAD.t - PAD.b;
    const slot = innerW / Math.max(1, days.length);
    const bw = Math.min(26, slot * 0.6);
    return {
      max,
      ticks: [0, 0.5, 1].map((f) => ({ value: max * f, y: PAD.t + innerH * (1 - f) })),
      bars: days.map((d, i) => {
        const h = max ? (d.revenue / max) * innerH : 0;
        return {
          ...d,
          x: PAD.l + slot * i + (slot - bw) / 2,
          y: PAD.t + innerH - h,
          w: bw,
          h,
          cx: PAD.l + slot * i + slot / 2,
          label: shortDay(d.day),
          showLabel: (days.length - 1 - i) % 2 === 0 || days.length <= 7, // toujours le dernier jour, puis un sur deux
        };
      }),
      baseline: PAD.t + innerH,
      left: PAD.l,
      right: W - PAD.r,
    };
  });

  hovered = computed(() => {
    const i = this.hover();
    return i === null ? null : this.chart().bars[i] ?? null;
  });

  ngOnInit() {
    this.admin.stats().subscribe({
      next: (s) => this.stats.set(s),
      error: () => this.error.set('Impossible de charger les statistiques.'),
    });
    this.catalog.search({ size: 1 }).subscribe({ next: (p) => this.productCount.set(p.totalElements) });
    this.catalog.search({ size: 1, active: false }).subscribe({ next: (p) => this.inactiveCount.set(p.totalElements) });
    this.admin.productNames.subscribe({ next: (m) => this.names.set(m) });
  }

  productName(id: string) {
    return this.names().get(id) ?? `Produit ${id.slice(0, 8)}…`;
  }

  maxTop = computed(() => Math.max(1, ...(this.stats()?.topProducts ?? []).map((t) => t.quantity)));
}

function niceMax(v: number): number {
  if (v <= 0) return 100;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

function shortDay(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}
