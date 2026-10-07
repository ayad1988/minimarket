import { Component, input } from '@angular/core';
import { Product } from '../../core/api/models';
import { ProductCard } from '../product-card/product-card';

/** Grille responsive de cartes produit, avec squelettes pendant le chargement. */
@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [ProductCard],
  template: `
    <div class="grid">
      @if (loading()) {
        @for (_ of skeletons; track $index) {
          <div class="sk"><div class="sk-img"></div><div class="sk-line"></div><div class="sk-line short"></div></div>
        }
      } @else {
        @for (p of products(); track p.id) {
          <app-product-card [product]="p" />
        }
      }
    </div>
  `,
  styles: `
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
    .sk { background: #fff; border: 1px solid var(--mm-border); border-radius: 8px; padding: 12px; }
    .sk-img, .sk-line { background: linear-gradient(90deg, #eee 25%, #f7f7f7 50%, #eee 75%);
      background-size: 200% 100%; animation: sh 1.2s infinite; border-radius: 4px; }
    .sk-img { aspect-ratio: 1; margin-bottom: 12px; }
    .sk-line { height: 14px; margin-top: 8px; &.short { width: 55%; } }
    @keyframes sh { to { background-position: -200% 0; } }
  `,
})
export class ProductGrid {
  products = input<Product[]>([]);
  loading = input(false);
  skeletons = Array.from({ length: 8 });
}
