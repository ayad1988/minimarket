import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/api/catalog.service';
import { Page, Product } from '../../core/api/models';
import { CATEGORY_LABELS, categoryLabel, productImage } from '../../core/util/product-meta';
import { MoneyPipe } from '../../shared/money.pipe';
import { Pagination } from '../../shared/pagination/pagination';

const PAGE_SIZE = 15;

@Component({
  selector: 'app-products-admin-page',
  standalone: true,
  imports: [RouterLink, MoneyPipe, Pagination],
  templateUrl: './products-admin-page.html',
  styleUrl: './products-admin-page.scss',
})
export class ProductsAdminPage implements OnInit {
  private api = inject(CatalogService);

  page = signal<Page<Product> | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  pendingDelete = signal<string | null>(null);
  busyId = signal<string | null>(null);

  q = '';
  category = '';
  active: '' | 'true' | 'false' = '';
  pageIndex = 0;

  categories = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));
  label = categoryLabel;
  thumb = (p: Product) => productImage(p, 80, 80);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.search({
      q: this.q, category: this.category, size: PAGE_SIZE, page: this.pageIndex, sort: 'name,asc',
      active: this.active === '' ? undefined : this.active === 'true',
    }).subscribe({
      next: (p) => { this.page.set(p); this.loading.set(false); this.error.set(null); },
      error: () => { this.loading.set(false); this.error.set('Impossible de charger les produits.'); },
    });
  }

  filter() {
    this.pageIndex = 0;
    this.load();
  }

  goTo(p: number) {
    this.pageIndex = p;
    this.load();
  }

  toggleActive(p: Product) {
    this.busyId.set(p.id);
    this.api.update(p.id, { active: !p.active }).subscribe({
      next: (updated) => {
        this.page.update((pg) => pg && { ...pg, content: pg.content.map((x) => (x.id === p.id ? updated : x)) });
        this.busyId.set(null);
      },
      error: () => { this.busyId.set(null); this.error.set('La modification a échoué (session expirée ?).'); },
    });
  }

  remove(p: Product) {
    this.busyId.set(p.id);
    this.api.remove(p.id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.pendingDelete.set(null);
        // si on vient de vider la dernière page, on recule d'une page
        if (this.page()?.content.length === 1 && this.pageIndex > 0) this.pageIndex--;
        this.load();
      },
      error: () => { this.busyId.set(null); this.error.set('La suppression a échoué.'); },
    });
  }
}
