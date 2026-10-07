import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CatalogService } from '../../core/api/catalog.service';
import { Product } from '../../core/api/models';
import { CartStore, MAX_CART_QTY } from '../../core/cart/cart.store';
import { categoryLabel, productImage, productMeta } from '../../core/util/product-meta';
import { MoneyPipe } from '../../shared/money.pipe';
import { Stars } from '../../shared/stars/stars';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [RouterLink, MoneyPipe, Stars],
  templateUrl: './product-page.html',
  styleUrl: './product-page.scss',
})
export class ProductPage {
  private api = inject(CatalogService);
  private cart = inject(CartStore);
  private router = inject(Router);
  private params = toSignal(inject(ActivatedRoute).paramMap, { requireSync: true });

  product = signal<Product | null>(null);
  loading = signal(true);
  notFound = signal(false);
  quantity = signal(1);
  selected = signal(0);
  added = signal(false);

  qtyOptions = Array.from({ length: MAX_CART_QTY }, (_, i) => i + 1);

  meta = computed(() => (this.product() ? productMeta(this.product()!) : null));
  category = computed(() => categoryLabel(this.product()?.category ?? ''));

  /** Galerie: images du produit si présentes, sinon visuels générés à partir de l'id. */
  gallery = computed(() => {
    const p = this.product();
    return p ? [0, 1, 2, 3].map((i) => productImage({ ...p, id: `${p.id}-${i}` }, 700, 700)) : [];
  });

  constructor() {
    effect(() => {
      const id = this.params().get('id')!;
      this.loading.set(true);
      this.notFound.set(false);
      this.quantity.set(1);
      this.selected.set(0);
      this.api.getById(id).subscribe({
        next: (p) => { this.product.set(p); this.loading.set(false); },
        error: () => { this.product.set(null); this.notFound.set(true); this.loading.set(false); },
      });
    });
  }

  addToCart() {
    const p = this.product();
    if (!p) return;
    this.cart.add(p, this.quantity());
    this.added.set(true);
    setTimeout(() => this.added.set(false), 2000);
  }

  buyNow() {
    this.addToCart();
    this.router.navigate(['/cart']);
  }
}
