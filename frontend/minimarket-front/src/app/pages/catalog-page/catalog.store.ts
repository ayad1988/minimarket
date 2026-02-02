import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { CatalogService, ProductSearchParams } from '../../core/api/catalog.service';
import { Page, Product } from '../../core/api/models';

export interface CatalogState {
  params: ProductSearchParams;
  page: Page<Product> | null;
  loading: boolean;
  error: string | null;

  categories: string[];
  brands: string[];
}

const initialState: CatalogState = {
  params: { page: 0, size: 12, sort: 'price,asc' },
  page: null,
  loading: false,
  error: null,

  // départ simple (plus tard: endpoint backend)
  categories: ['ELECTRONICS', 'COMPUTERS', 'OFFICE', 'HOME', 'SPORT', 'FASHION'],
  brands: ['CompTech', 'Amazio', 'TechNova', 'OfficePro', 'HomeZen']
};

export const CatalogStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((state) => ({
    products: computed(() => state.page()?.content ?? []),
    pageNumber: computed(() => state.page()?.number ?? 0),
    totalPages: computed(() => state.page()?.totalPages ?? 0),
    totalElements: computed(() => state.page()?.totalElements ?? 0),

    canPrev: computed(() => (state.page()?.number ?? 0) > 0),
    canNext: computed(() => {
      const p = state.page();
      return p ? p.number + 1 < p.totalPages : false;
    })
  })),

  withMethods((state) => {
    const api = inject(CatalogService);

    const load = () => {
      patchState(state, { loading: true, error: null });

      api.search(state.params()).subscribe({
        next: (page) => patchState(state, { page }),
        error: (e) => patchState(state, { error: e?.message ?? 'Erreur API', loading: false }),
        complete: () => patchState(state, { loading: false })
      });
    };

    const applyFilters = (filters: Partial<ProductSearchParams>) => {
      patchState(state, { params: { ...state.params(), ...filters, page: 0 } });
      load();
    };

    const reset = () => {
      patchState(state, { params: { page: 0, size: 12, sort: 'price,asc' } });
      load();
    };

    const prev = () => {
      const p = state.page();
      if (!p || p.number <= 0) return;
      patchState(state, { params: { ...state.params(), page: p.number - 1 } });
      load();
    };

    const next = () => {
      const p = state.page();
      if (!p || p.number + 1 >= p.totalPages) return;
      patchState(state, { params: { ...state.params(), page: p.number + 1 } });
      load();
    };

    return { load, applyFilters, reset, prev, next };
  })
);
