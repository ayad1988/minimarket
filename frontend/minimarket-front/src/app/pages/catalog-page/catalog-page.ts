import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductSearchParams } from '../../core/api/catalog.service';
import { categoryLabel, CATEGORY_LABELS } from '../../core/util/product-meta';
import { Pagination } from '../../shared/pagination/pagination';
import { ProductGrid } from '../../shared/product-grid/product-grid';
import { CatalogStore } from './catalog.store';

const PAGE_SIZE = 12;

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [ProductGrid, Pagination],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.scss',
})
export class CatalogPage implements OnInit {
  store = inject(CatalogStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private query = toSignal(this.route.queryParamMap, { requireSync: true });

  categories = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

  /** L'URL est la source de vérité: les filtres sont partageables et le bouton retour fonctionne. */
  params = computed<ProductSearchParams>(() => {
    const q = this.query();
    const num = (k: string) => (q.get(k) !== null && q.get(k) !== '' && !isNaN(+q.get(k)!) ? +q.get(k)! : undefined);
    return {
      q: q.get('q') ?? undefined,
      category: q.get('category') ?? undefined,
      brand: q.get('brand') ?? undefined,
      minPrice: num('minPrice'),
      maxPrice: num('maxPrice'),
      active: q.get('active') === 'true' ? true : undefined,
      sort: q.get('sort') ?? 'price,asc',
      page: num('page') ?? 0,
      size: PAGE_SIZE,
    };
  });

  title = computed(() => {
    const p = this.params();
    if (p.q) return `Résultats pour « ${p.q} »`;
    if (p.category) return categoryLabel(p.category);
    return 'Tous les produits';
  });

  hasFilters = computed(() => {
    const p = this.params();
    return !!(p.q || p.category || p.brand || p.minPrice !== undefined || p.maxPrice !== undefined || p.active);
  });

  constructor() {
    effect(() => this.store.load(this.params()));
  }

  ngOnInit() {
    this.store.loadBrands();
  }

  setParam(changes: Record<string, string | number | boolean | null>) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParamsHandling: 'merge',
      queryParams: { page: null, ...changes },
    });
  }

  applyPrice(min: string, max: string) {
    this.setParam({ minPrice: min.trim() || null, maxPrice: max.trim() || null });
  }

  goToPage(page: number) {
    this.router.navigate([], { relativeTo: this.route, queryParamsHandling: 'merge', queryParams: { page } });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearAll() {
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }
}
