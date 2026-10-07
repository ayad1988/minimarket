import { Component, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService, ProductSearchParams } from '../../core/api/catalog.service';
import { Product } from '../../core/api/models';
import { ProductCard } from '../product-card/product-card';

/** Rangée horizontale de produits (page d'accueil), chargée à partir de critères de recherche. */
@Component({
  selector: 'app-product-rail',
  standalone: true,
  imports: [ProductCard, RouterLink],
  template: `
    @if (!failed() && (loading() || products().length)) {
      <section class="rail panel">
        <div class="head">
          <h2>{{ title() }}</h2>
          <a [routerLink]="'/search'" [queryParams]="linkParams()">Voir tout ›</a>
        </div>
        <div class="track">
          @if (loading()) {
            @for (_ of skeletons; track $index) { <div class="sk"></div> }
          } @else {
            @for (p of products(); track p.id) {
              <app-product-card [product]="p" />
            }
          }
        </div>
      </section>
    }
  `,
  styles: `
    .rail { margin-bottom: 16px; }
    .head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px; }
    h2 { margin: 0; font-size: 20px; }
    .head a { color: var(--mm-link); text-decoration: none; font-size: 14px; &:hover { text-decoration: underline; } }
    .track { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(200px, 220px); gap: 14px;
      overflow-x: auto; padding-bottom: 8px; scroll-snap-type: x proximity; }
    .track > * { scroll-snap-align: start; }
    .sk { height: 380px; border-radius: 8px; background: #eee; }
  `,
})
export class ProductRail implements OnInit {
  private api = inject(CatalogService);

  title = input.required<string>();
  params = input.required<ProductSearchParams>();
  linkParams = input<Record<string, string | number>>({});

  products = signal<Product[]>([]);
  loading = signal(true);
  failed = signal(false);
  skeletons = Array.from({ length: 6 });

  ngOnInit() {
    this.api.search({ size: 10, active: true, ...this.params() }).subscribe({
      next: (p) => { this.products.set(p.content); this.loading.set(false); },
      error: () => { this.failed.set(true); this.loading.set(false); },
    });
  }
}
