import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { CatalogService, ProductSearchParams } from '../../core/api/catalog.service';
import { Page, Product } from '../../core/api/models';

export interface CatalogState {
  page: Page<Product> | null;
  loading: boolean;
  error: string | null;
  brands: string[];
}

export const CatalogStore = signalStore(
  { providedIn: 'root' },

  withState<CatalogState>({ page: null, loading: false, error: null, brands: [] }),

  withComputed((state) => ({
    products: computed(() => state.page()?.content ?? []),
    totalPages: computed(() => state.page()?.totalPages ?? 0),
    totalElements: computed(() => state.page()?.totalElements ?? 0),
  })),

  withMethods((state) => {
    const api = inject(CatalogService);
    let requestId = 0; // ignore les réponses d'une recherche déjà remplacée

    return {
      load(params: ProductSearchParams) {
        const id = ++requestId;
        patchState(state, { loading: true, error: null });
        api.search(params).subscribe({
          next: (page) => {
            if (id === requestId) patchState(state, { page, loading: false });
          },
          error: () => {
            if (id === requestId) {
              patchState(state, { loading: false, error: "Impossible de charger les produits. Réessayez dans un instant." });
            }
          },
        });
      },

      /** Les marques disponibles sont déduites du catalogue (pas d'endpoint dédié pour l'instant). */
      loadBrands() {
        api.search({ size: 200 }).subscribe({
          next: (p) => patchState(state, {
            brands: [...new Set(p.content.map((x) => x.brand).filter((b): b is string => !!b))].sort(),
          }),
          error: () => { /* filtre marque simplement absent */ },
        });
      },
    };
  })
);
